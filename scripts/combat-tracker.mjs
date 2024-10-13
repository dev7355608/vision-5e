import { DETECTION_LEVELS } from "./const.mjs";

export default (CombatTracker) => class extends CombatTracker {
    /** @override */
    _onCombatantHoverIn(event) {
        event.preventDefault();

        if (!canvas.ready) {
            return;
        }

        const li = event.currentTarget;
        const combatant = this.viewed.combatants.get(li.dataset.combatantId);
        const token = combatant.token?.object;

        if (token?.detectionLevel === DETECTION_LEVELS.PRECISE) {
            if (!token.controlled) {
                token._onHoverIn(event, { hoverOutOthers: true });
            }

            this._highlighted = token;
        }
    }

    /** @override */
    hoverCombatant(combatant, hover) {
        const token = combatant.token.object;

        if (token.detectionLevel !== DETECTION_LEVELS.PRECISE) {
            hover = false;
        }

        const trackers = [this.element[0]];

        if (this._popout) {
            trackers.push(this._popout.element[0]);
        }

        for (const tracker of trackers) {
            const li = tracker.querySelector(`.combatant[data-combatant-id="${combatant.id}"]`);

            if (!li) {
                continue;
            }

            if (hover) {
                li.classList.add("hover");
            } else {
                li.classList.remove("hover");
            }
        }
    }
};
