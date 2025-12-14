import { MODULE_ID } from "./config.js";

export function registerSettings() {
    // --- GM ONLY ---
    game.settings.register(MODULE_ID, "HideStockTalentList", {
        name: game.i18n.localize("LGS.Settings.HideStock.Name"),
        hint: game.i18n.localize("LGS.Settings.HideStock.Hint"),
        scope: "world",
        config: true,
        restricted: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "EnforceTierPurchase", {
        name: game.i18n.localize("LGS.Settings.Enforce.Name"),
        hint: game.i18n.localize("LGS.Settings.Enforce.Hint"),
        scope: "world",
        config: true,
        restricted: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "ModifyXP", {
        name: game.i18n.localize("LGS.Settings.ModifyXP.Name"),
        hint: game.i18n.localize("LGS.Settings.ModifyXP.Hint"),
        scope: "world",
        config: true,
        restricted: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "PreventXPDebt", {
        name: game.i18n.localize("LGS.Settings.PreventDebt.Name"),
        hint: game.i18n.localize("LGS.Settings.PreventDebt.Hint"),
        scope: "world",
        config: true,
        restricted: true,
        type: Boolean,
        default: false
    });

    // --- CLIENT ---
    game.settings.register(MODULE_ID, "HoverEnabled", {
        name: game.i18n.localize("LGS.Settings.HoverEnabled.Name"),
        hint: game.i18n.localize("LGS.Settings.HoverEnabled.Hint"),
        scope: "client",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "HoverPosition", {
        name: game.i18n.localize("LGS.Settings.HoverPos.Name"),
        scope: "client",
        config: true,
        type: String,
        choices: {
            "UL": game.i18n.localize("LGS.Settings.HoverPos.UL"),
            "UR": game.i18n.localize("LGS.Settings.HoverPos.UR"),
            "LL": game.i18n.localize("LGS.Settings.HoverPos.LL"),
            "LR": game.i18n.localize("LGS.Settings.HoverPos.LR")
        },
        default: "UR"
    });

    game.settings.register(MODULE_ID, "HoverDelay", {
        name: game.i18n.localize("LGS.Settings.HoverDelay.Name"),
        hint: game.i18n.localize("LGS.Settings.HoverDelay.Hint"),
        scope: "client",
        config: true,
        type: Number,
        default: 3
    });

    game.settings.register(MODULE_ID, "PopupTextScale", {
        name: game.i18n.localize("LGS.Settings.TextScale.Name"),
        hint: game.i18n.localize("LGS.Settings.TextScale.Hint"),
        scope: "client",
        config: true,
        type: Number,
        range: { min: 0, max: 5, step: 0.5 },
        default: 0
    });

    game.settings.register(MODULE_ID, "PopupWidthAdd", {
        name: game.i18n.localize("LGS.Settings.WidthAdd.Name"),
        hint: game.i18n.localize("LGS.Settings.WidthAdd.Hint"),
        scope: "client",
        config: true,
        type: Number,
        range: { min: 0, max: 600, step: 20 },
        default: 0
    });
}