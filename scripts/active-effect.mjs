import { isMagicItem } from "./actor.mjs";

export default (ActiveEffect) => class extends ActiveEffect {
    /** @override */
    prepareDerivedData() {
        super.prepareDerivedData();

        if (!this.origin || this.origin.startsWith("Compendium.")) {
            return;
        }

        if (this.statuses.has(CONFIG.specialStatusEffects.CONCENTRATING)) {
            return;
        }

        const type = foundry.utils.parseUuid(this.origin).type;

        if (type != "ActiveEffect" && type !== "Item") {
            return;
        }

        const origin = fromUuidSync(this.origin);

        if (!origin) {
            return;
        }

        let item;

        if (type === "Item") {
            item = origin;
        } else {
            const effect = origin;

            if (effect.statuses.has(CONFIG.specialStatusEffects.CONCENTRATING)) {
                if (!effect.origin || effect.origin.startsWith("Compendium.")) {
                    return;
                }

                const type = foundry.utils.parseUuid(effect.origin).type;

                if (type !== "Item") {
                    return;
                }

                item = fromUuidSync(effect.origin);
            } else {
                if (!(effect.parent instanceof Item)) {
                    return;
                }

                item = effect.parent;
            }

            if (!item) {
                return;
            }
        }

        if (item.type === "spell" || isMagicItem(item)) {
            this.statuses.add(CONFIG.specialStatusEffects.MAGICAL);
        }
    }
};
