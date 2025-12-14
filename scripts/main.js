import { MODULE_ID } from "./config.js";
import { registerSettings } from "./settings.js";
import { handleXPDeduction, handleXPRefund } from "./xp-logic.js";
import { buildPyramidData } from "./pyramid-builder.js";

let hoverTimer = null;

// --- INITIALIZATION ---
Hooks.once("init", () => {
    registerSettings();
});

Hooks.once('ready', () => {
    Handlebars.registerHelper('eq', function (a, b) {
        return a === b;
    });
});

// --- HOOKS ---

Hooks.on("getItemSheetHeaderButtons", (sheet, buttons) => {
    if (sheet.item.type !== "ability") return;
    if (!game.user.isGM) return;

    buttons.unshift({
        label: "$",
        class: "configure-xp",
        icon: "fas fa-dollar-sign",
        onclick: () => {
            const currentCost = sheet.item.getFlag(MODULE_ID, "xpCost") || 0;
            new Dialog({
                title: game.i18n.localize("LGS.Dialog.XPCostTitle"),
                content: `
                    <form>
                        <div class="form-group">
                            <label>XP</label>
                            <input type="number" name="xpCost" value="${currentCost}" style="width:100%"/>
                        </div>
                    </form>
                `,
                buttons: {
                    save: {
                        label: game.i18n.localize("LGS.Dialog.Save"),
                        callback: async (html) => {
                            const value = Number(html.find('[name="xpCost"]').val()) || 0;
                            await sheet.item.setFlag(MODULE_ID, "xpCost", value);
                        }
                    }
                },
                default: "save"
            }).render(true);
        }
    });
});

Hooks.on("renderActorSheet", async (app, html, data) => {
    const actor = app.actor;
    if (!actor || actor.type !== "character") return;

    if (game.settings.get(MODULE_ID, "HideStockTalentList")) {
        html.find(".talent-list").hide();
        html.find(".talents .headers").hide();
    }

    // Build Data
    const rows = buildPyramidData(actor);

    // Render Template
    const templatePath = `modules/${MODULE_ID}/templates/pyramid.hbs`;
    const renderedHtml = await renderTemplate(templatePath, { rows });

    // Inject
    html.find(".talent-pyramid-grid").remove();
    html.find(".tab.talents").prepend(renderedHtml);

    // Dynamic Height Observer
    const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
            const nameEl = entry.target;
            const desc = $(nameEl).parent().nextAll(".talent-description"); // Use nextAll because of hidden div

            const style = window.getComputedStyle(nameEl);
            const lineHeight = parseFloat(style.lineHeight);
            const height = entry.contentRect.height;

            if (lineHeight > 0 && height > 0) {
                const lines = Math.round(height / lineHeight);
                if (lines === 2) {
                    desc.css("height", "100px");
                } else if (lines >= 3) {
                    desc.css("height", "86px");
                } else {
                    desc.css("height", "113px");
                }
            }
        }
    });
    html.find(".talent-pyramid-grid .talent-name").each((i, el) => observer.observe(el));

    // --- LISTENERS ---

    // 1. Edit
    html.find(".item-edit").click(ev => {
        const itemId = $(ev.currentTarget).parents(".talent-card").data("itemId");
        actor.items.get(itemId)?.sheet.render(true);
    });

    // 2. Chat (Eyeball)
    html.find(".item-chat").click(ev => {
        const card = $(ev.currentTarget).parents(".talent-card");
        const name = card.data("name");
        const tier = card.data("tier");
        const rank = card.data("rank");
        const activation = card.data("activation") || "None";
        // Grab content from the hidden popup source
        const desc = card.find(".popup-desc-source").html();

        const content = `
            <div style="font-family: inherit;">
                <div style="font-weight: bold; border-bottom: 1px solid #777; margin-bottom: 5px;">${name}</div>
                <div style="font-size: 0.9em; color: #555; margin-bottom: 5px;">
                    <strong>${game.i18n.localize("LGS.UI.Tier")}:</strong> ${tier} | 
                    <strong>${game.i18n.localize("LGS.UI.Rank")}:</strong> ${rank} | 
                    <strong>${game.i18n.localize("LGS.UI.Activation")}:</strong> ${activation}
                </div>
                <div style="white-space: pre-wrap;">${desc}</div>
            </div>
        `;
        ChatMessage.create({ content, speaker: ChatMessage.getSpeaker({ actor }) });
    });

    // 3. Delete
    html.find(".item-delete").click(async ev => {
        if (!ev.ctrlKey) {
            ui.notifications.info(game.i18n.localize("LGS.Notifications.CtrlDelete"));
            return;
        }

        const card = $(ev.currentTarget).parents(".talent-card");
        const itemId = card.data("itemId");
        const name = card.data("name");
        const item = actor.items.get(itemId);

        if (item) {
            new Dialog({
                title: game.i18n.localize("LGS.Dialog.DeleteTitle"),
                content: game.i18n.format("LGS.Dialog.DeleteContent", { name }),
                buttons: {
                    yes: {
                        label: game.i18n.localize("LGS.Dialog.Delete"),
                        callback: async () => {
                            const sourceId = item.flags?.core?.sourceId || null;
                            const allTals = actor.items.filter(i => i.type === "talent");
                            let stack = sourceId 
                                ? allTals.filter(i => i.flags?.core?.sourceId === sourceId) 
                                : allTals.filter(i => i.name === item.name);
                            
                            stack.sort((a,b) => a.id.localeCompare(b.id));
                            const index = stack.findIndex(i => i.id === item.id);

                            if (index !== -1) {
                                const baseTier = Number(item.system.tier) || 1;
                                const effectiveTier = baseTier + index;
                                const cost = effectiveTier * 5;
                                await handleXPRefund(actor, item, cost, "talent", effectiveTier);
                            }
                            await item.delete();
                        }
                    },
                    no: { label: game.i18n.localize("LGS.Dialog.Cancel") }
                },
                default: "no"
            }).render(true);
        }
    });

    // 4. Hover
    html.find(".talent-card").mouseenter(ev => {
        if (!game.settings.get(MODULE_ID, "HoverEnabled")) return;
        const card = $(ev.currentTarget);
        const data = {
            name: card.data("name"),
            tier: card.data("tier"),
            rank: card.data("rank"),
            activation: card.data("activation"),
            // Grab content from the hidden popup source
            desc: card.find(".popup-desc-source").html()
        };
        const delay = game.settings.get(MODULE_ID, "HoverDelay") * 1000;
        hoverTimer = setTimeout(() => { showTalentPopup(data); }, delay);
    });

    html.find(".talent-card").mouseleave(() => {
        clearTimeout(hoverTimer);
        hideTalentPopup();
    });
});

function showTalentPopup(data) {
    let popup = $("#talent-pyramid-popup");
    if (popup.length === 0) {
        $("body").append('<div id="talent-pyramid-popup"></div>');
        popup = $("#talent-pyramid-popup");
    }

    const pos = game.settings.get(MODULE_ID, "HoverPosition");
    const scaleVal = game.settings.get(MODULE_ID, "PopupTextScale");
    const widthAdd = game.settings.get(MODULE_ID, "PopupWidthAdd");
    
    const fontSize = 1 + (scaleVal * 0.1); 
    const finalWidth = 400 + widthAdd;

    popup.removeClass("popup-UL popup-UR popup-LL popup-LR").addClass(`popup-${pos}`);
    popup.css("font-size", `${fontSize}rem`);
    popup.css("max-width", `${finalWidth}px`);

    popup.html(`
        <div class="popup-header">${data.name}</div>
        <div class="popup-stats">
            ${game.i18n.localize("LGS.UI.Tier")}: ${data.tier} | 
            ${game.i18n.localize("LGS.UI.Rank")}: ${data.rank}
        </div>
        <div class="popup-stats" style="margin-top:2px;">
            ${game.i18n.localize("LGS.UI.Activation")}: ${data.activation || "None"}
        </div>
        <div class="popup-desc">${data.desc}</div>
    `);

    popup.css("display", "flex").hide().fadeIn(200);
}

function hideTalentPopup() {
    $("#talent-pyramid-popup").fadeOut(100);
}

Hooks.on("preCreateItem", (item, data, options, userId) => {
    const actor = item.parent;
    if (!actor || actor.type !== "character") return;

    const checkPyramid = game.settings.get(MODULE_ID, "EnforceTierPurchase");
    const checkDebt = game.settings.get(MODULE_ID, "PreventXPDebt");
    const availXP = actor.system.experience.available;

    if (item.type === "ability") {
        if (!checkDebt) return true;
        const xpCost = item.getFlag(MODULE_ID, "xpCost") || 0;
        if (xpCost > 0 && availXP < xpCost) {
            ui.notifications.error(game.i18n.format("LGS.Notifications.InsufficientXP", { cost: xpCost, available: availXP }));
            return false;
        }
        return true;
    }

    if (item.type === "talent") {
        if (!checkPyramid && !checkDebt) return true;

        const existing = actor.items.filter(i => i.type === "talent");
        const sourceId = item.flags?.core?.sourceId || null;
        const rankIndex = sourceId 
            ? existing.filter(i => i.flags?.core?.sourceId === sourceId).length
            : existing.filter(i => i.name === item.name).length;

        const baseTier = Number(item.system.tier) || 1;
        const targetTier = baseTier + rankIndex;

        if (targetTier > 5) {
            ui.notifications.warn(game.i18n.localize("LGS.Notifications.MaxTier"));
            return false;
        }

        const cost = targetTier * 5;
        if (checkDebt && availXP < cost) {
            ui.notifications.error(game.i18n.format("LGS.Notifications.InsufficientXP", { cost, available: availXP }));
            return false;
        }

        if (checkPyramid && targetTier > 1) {
            const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            const grouped = {};
            existing.sort((a,b) => a.id.localeCompare(b.id)).forEach(i => {
                const k = i.flags?.core?.sourceId || i.name;
                if (!grouped[k]) grouped[k] = [];
                grouped[k].push(i);
            });
            for (const list of Object.values(grouped)) {
                list.forEach((itm, idx) => {
                    const t = (Number(itm.system.tier) || 1) + idx;
                    if (t <= 5) counts[t]++;
                });
            }

            const reqs = { 
                2: {1:2}, 
                3: {1:3, 2:2}, 
                4: {1:4, 2:3, 3:1}, 
                5: {1:5, 2:4, 3:3, 4:2} 
            };
            const specific = reqs[targetTier];
            let errors = [];
            if (specific) {
                for (const [rT, rC] of Object.entries(specific)) {
                    if (counts[rT] < rC) errors.push(`${game.i18n.localize("LGS.UI.Tier")} ${rT} (Have: ${counts[rT]}, Need: ${rC})`);
                }
            }

            if (errors.length) {
                ui.notifications.error(game.i18n.format("LGS.Notifications.MissingReq", { tier: targetTier, errors: errors.join("<br/>- ") }));
                return false;
            }
        }
    }
    return true;
});

Hooks.on("createItem", async (item, options, userId) => {
    if (userId !== game.user.id) return;
    const actor = item.parent;
    if (!actor || actor.type !== "character") return;

    if (item.type === "talent" || item.type === "ability") {
        ChatMessage.create({
            content: game.i18n.format("LGS.Chat.Purchased", { actor: actor.name, item: item.name })
        });
    }

    if (item.type === "talent") {
        const sourceId = item.flags?.core?.sourceId || null;
        const allTals = actor.items.filter(i => i.type === "talent");
        let stack = sourceId 
            ? allTals.filter(i => i.flags?.core?.sourceId === sourceId) 
            : allTals.filter(i => i.name === item.name);

        stack.sort((a,b) => a.id.localeCompare(b.id));
        const index = stack.findIndex(i => i.id === item.id);

        if (index !== -1) {
            const baseTier = Number(item.system.tier) || 1;
            const effectiveTier = baseTier + index;
            const cost = effectiveTier * 5;
            await handleXPDeduction(actor, item, cost, "talent", effectiveTier);
        }
    } else if (item.type === "ability") {
        const cost = item.getFlag(MODULE_ID, "xpCost") || 0;
        if (cost > 0) {
            await handleXPDeduction(actor, item, cost, "ability");
        }
    }
});

Hooks.on("deleteItem", async (item, options, userId) => {
    if (userId !== game.user.id) return;
    const actor = item.parent;
    if (!actor || actor.type !== "character") return;
    if (item.type !== "ability") return; 

    const cost = item.getFlag(MODULE_ID, "xpCost") || 0;
    if (cost > 0) {
        await handleXPRefund(actor, item, cost, "ability");
    }
});