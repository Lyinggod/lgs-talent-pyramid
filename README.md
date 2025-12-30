![Foundry v12](https://img.shields.io/badge/Foundry-v12-orange) ![System](https://img.shields.io/badge/System-Star_Wars_FFG-blue)

Add the Genesys talent pyramid to actor sheets. Optional XP tracking and tier enforcement. Also allows XP cost to be added to _Abilities_.

## Features

### 1. The Talent Pyramid
*   **Visual Layout:** Talents are organized into the standard 5-Tier pyramid structure.
*   **Ranked Talents:** The names of ranked talents are shown in **Blue** as a reminder.
*   **Pyramid Rule:** A GM setting option that enforces the pyramid purchase rules.
*   **XP Debt Prevention:** A GM setting option that prevents purchasing a talent insufficient XP.
*   **Automated XP Spending:** A GM setting option that automatically deducts XP upon purchase and refunds when deleted, updating the XP log.

### 2. Ability XP Costs
*   **Custom Costs:** GMs can assign XP costs to **Ability** items which treated in the same way as talent XP spends via the $ in the dialog header.

### 3. Rich UI Enhancements
*   **Hover Popups:** Hovering over a talent displays a customizable popup with Name, Tier, Rank, Activation, and Description. This is player configurable for location, font size, and popup width.
*   **Activation Abbreviations:** Adds abbreviation after talent name and a tooltip of the full activation name:
    *   `(A)` Active (Action)
    *   `(A-M)` Active (Maneuver)
    *   `(A-I)` Active (Incidental)
    *   `(AI-OOT)` Active (Incidental, Out of Turn)
    *   `(P)` Passive
*   **Dual Descriptions:** If a talent has both a short `Description` and a `Long Description`, the name is **underlined in red**. The card displays the short description, while the popup displays the long description.
*   **Chat Integration:** Click the "Eye" icon on any talent to send its details to the chat window.

---

## Usage Guide

### Managing Talents
1.  **Purchasing:** Drag a Talent item from a compendium or item list onto the character sheet.
    *   The module will check if you have the XP and the required lower-tier talents.
    *   If successful, the talent is added to the Pyramid and XP is deducted.
2.  **Deleting:** Hold **CTRL** and click the **Trash Can** icon on a talent.
    *   **Note:** You can only delete the highest rank of a stacked talent.
    *   A dialog will appear. Confirming the delete will remove the item and refund the XP.

### Managing Abilities
1.  **GM Configuration:**
    *   Open an **Ability** item sheet.
    *   Click the **$** icon in the window header.
    *   Enter the XP cost for this ability and click Save.
2.  **Purchasing:**
    *   Drag the Ability onto a character.
    *   If the character has enough XP, the cost is deducted and the item is added.

---

## Configuration Settings

### GM Settings
*   **Hide Stock Talent List:** Hides the default FFG system talent list to prevent clutter.
*   **Enforce Tier Purchase Order:** Strict enforcement of "Pyramid" rule
*   **Modify XP:** Toggles the automatic deduction and refunding of XP.
*   **Prevent XP Debt:** Blocks the creation of items if `Available XP` would drop below zero.

### Player / UI Settings
*   **Hover for Talent Description:** Toggles the popup window on/off.
*   **Hover Popup Position:** Choose which corner of the screen the popup appears (Upper Right, Lower Left, etc.).
*   **Hover Delay:** How many seconds to wait before the popup appears.
*   **Scale Popup Text:** Increase the font size of the popup window.
*   **Talent Popup Width:** Increase the maximum width of the popup window.

---

## Installation

1.  Open the Foundry VTT Setup screen.
2.  Go to **Add-on Modules**.
3.  Click **Install Module**.
4.  Paste the Manifest URL: `https://github.com/Lyinggod/lgs-talent-pyramid/releases/download/v1.0.0/module.json`
5.  Click **Install**.

## Compatibility
*   **Foundry VTT:** v12+
*   **System:** Star Wars FFG (starwarsffg)

## License
This project is licensed under the MIT License.
