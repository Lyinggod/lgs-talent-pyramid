import { MODULE_ID } from "./config.js";

/**
 * Handles XP deduction, log updating, and actor updates for Talents and Abilities.
 */
export async function handleXPDeduction(actor, item, cost, type, tier = null) {
    if (!game.settings.get(MODULE_ID, "ModifyXP")) return;

    const currentXP = actor.system.experience.available;
    const totalXP = actor.system.experience.total;
    const newAvailableXP = currentXP - cost;

    const date = new Date().toLocaleDateString();
    let logMsg = "";

    if (type === "talent") {
        logMsg = `<font color="talentRefund"><b>${date}</b>: spent <b>${cost}</b> XP for <b>Tier ${tier} talent ${item.name}</b> (${newAvailableXP} available, ${totalXP} total)</font>`;
        ui.notifications.info(game.i18n.format("LGS.Notifications.PurchaseInfo", { cost: cost, name: item.name, tier: tier }));
    } else {
        logMsg = `<font color="talentRefund"><b>${date}</b>: spent <b>${cost}</b> XP for <b>Ability ${item.name}</b> (${newAvailableXP} available, ${totalXP} total)</font>`;
        ui.notifications.info(game.i18n.format("LGS.Notifications.AbilityPurchase", { cost: cost, name: item.name }));
    }

    const currentLog = actor.flags.starwarsffg?.xpLog || [];
    const newLog = [logMsg, ...currentLog];

    await actor.update({
        "system.experience.available": newAvailableXP,
        "flags.starwarsffg.xpLog": newLog
    });
}

/**
 * Handles XP refunds when items are deleted.
 */
export async function handleXPRefund(actor, item, cost, type, tier = null) {
    if (!game.settings.get(MODULE_ID, "ModifyXP")) return;

    const currentXP = actor.system.experience.available;
    const totalXP = actor.system.experience.total;
    const newAvailableXP = currentXP + cost;
    const date = new Date().toLocaleDateString();
    let logMsg = "";

    if (type === "talent") {
        logMsg = `<span class="talentRefund"><b>${date}</b>: refunded <b>${cost}</b> XP on <b>Tier ${tier} ${item.name}</b> (${newAvailableXP} available, ${totalXP} total)</span>`;
        ui.notifications.info(game.i18n.format("LGS.Notifications.RefundInfo", { cost: cost, name: item.name }));
    } else {
        logMsg = `<span class="talentRefund"><b>${date}</b>: refunded <b>${cost}</b> XP on <b>Ability ${item.name}</b> (${newAvailableXP} available, ${totalXP} total)</span>`;
        ui.notifications.info(game.i18n.format("LGS.Notifications.AbilityRefund", { cost: cost, name: item.name }));
    }

    const currentLog = actor.flags.starwarsffg?.xpLog || [];
    const newLog = [logMsg, ...currentLog];

    await actor.update({
        "system.experience.available": newAvailableXP,
        "flags.starwarsffg.xpLog": newLog
    });
}