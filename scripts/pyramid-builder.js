import { MODULE_ID, ACTIVATION_MAP } from "./config.js";

/**
 * Organizes actor items into a grid structure for the pyramid template.
 */
export function buildPyramidData(actor) {
    const allTalents = actor.items.filter(i => i.type === "talent");
    allTalents.sort((a, b) => a.id.localeCompare(b.id));

    const groupedTalents = {};
    allTalents.forEach(item => {
        const sourceKey = item.flags?.core?.sourceId || item.name;
        if (!groupedTalents[sourceKey]) groupedTalents[sourceKey] = [];
        groupedTalents[sourceKey].push(item);
    });

    const tierItems = { 1: [], 2: [], 3: [], 4: [], 5: [] };

    for (const [key, items] of Object.entries(groupedTalents)) {
        const totalRanks = items.length;
        items.forEach((item, index) => {
            const baseTier = Number(item.system.tier) || 1;
            const effectiveTier = baseTier + index;

            // Logic: Ranked
            const isRanked = item.system.ranks.ranked;
            //const isRanked = (val === true || val === "Yes" || val === "true");
            
            // Logic: Delete
            const canDelete = index === (totalRanks - 1);

            // Logic: Activation
            const activationFull = item.system.activation?.value || "";
            const activationAbbrev = ACTIVATION_MAP[activationFull] || "";

            // Logic: Descriptions
            const shortDesc = item.system.description || "";
            const longDesc = item.system.longDesc || "";

            let cardDescription = shortDesc;
            let popupDescription = shortDesc;
            let hasBoth = false;

            if (longDesc !== "") {
                popupDescription = longDesc; // Priority to long for popup
                if (shortDesc === "") {
                    // Fallback logic: If short is empty but long exists, card shows long
                    cardDescription = longDesc; 
                } else {
                    // Both exist
                    hasBoth = true;
                }
            }

            if (effectiveTier <= 5) {
                tierItems[effectiveTier].push({
                    itemId: item.id,
                    name: item.name,
                    tier: effectiveTier,
                    rank: index + 1,
                    isRanked,
                    canDelete,
                    activation: activationFull,
                    activationAbbrev,
                    // Description Fields
                    cardDescription,
                    popupDescription,
                    hasBoth
                });
            }
        });
    }

    let maxRowIndex = 4;
    for (let t = 1; t <= 5; t++) {
        const endRow = (t - 1) + tierItems[t].length;
        if (endRow > maxRowIndex) maxRowIndex = endRow;
    }

    const rows = [];
    for (let r = 0; r <= maxRowIndex; r++) {
        const cells = [];
        for (let c = 1; c <= 5; c++) {
            if (r < (c - 1)) {
                cells.push({ type: "void" });
            } else {
                const itemIndex = r - (c - 1);
                const item = tierItems[c][itemIndex];
                if (item) {
                    cells.push({ type: "item", ...item });
                } else {
                    cells.push({ type: "placeholder", tier: c });
                }
            }
        }
        rows.push({ cells });
    }
    return rows;
}