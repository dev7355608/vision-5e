import { DetectionModeDetect } from "./detect.mjs";

/**
 * The detection mode for Detect Magic.
 */
export class DetectionModeDetectMagic extends DetectionModeDetect {
    constructor() {
        super({
            id: "detectMagic",
            label: "VISION5E.DetectMagic"
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= GlowOverlayFilter.create({
            glowColor: [1, 0, 1, 1]
        });
    }

    #counter = 0;

    #hooked = false;

    /** @override */
    testVisibility(visionSource, mode, config) {
        if (!mode.enabled) return false;

        if (!this.#hooked) {
            const hooks = {};
            const refreshVision = () => {
                canvas.perception.update({ refreshVision: true });
            };

            for (const hook of [
                "createItem",
                "updateItem",
                "deleteItem",
                "createActiveEffect",
                "updateActiveEffect",
                "deleteActiveEffect"
            ]) {
                hooks[hook] = Hooks.on(hook, refreshVision);
            }

            let counter = this.#counter;

            hooks.sightRefresh = Hooks.on("sightRefresh", () => {
                if (counter === this.#counter) {
                    // The detection mode hasn't been used since the last refresh.
                    for (const [hook, id] of Object.entries(hooks)) {
                        Hooks.off(hook, id);
                    }

                    this.#hooked = false;
                } else {
                    // The detection mode has been used.
                    counter = this.#counter;
                }
            });

            this.#hooked = true;
        }

        this.#counter++;

        return super.testVisibility(visionSource, mode, config);
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (!super._canDetect(visionSource, target)) return false;
        const actor = target.actor;
        if (!actor) return false;

        // Does the target carry a magical item?
        if (actor.items.some(isMagicItem)) {
            return true;
        }

        // Is the target affect by a spell?
        for (const effect of actor.appliedEffects) {
            const item = effect.origin && !effect.origin.startsWith("Compendium.")
                ? fromUuidSync(effect.origin) : null;
            if (item instanceof Item && (item.type === "spell" || isMagicItem(item))) {
                return true;
            }
        }

        return false;
    }
}

function isMagicItem(item) {
    const type = item.type;
    return (type === "consumable"
        || type === "container"
        || type === "equipment"
        || type === "loot"
        || type === "weapon"
        || type === "tool") && item.system.properties.has("mgc");
}

Hooks.once("init", () => {
    if (foundry.utils.isNewerVersion(game.system.version, 3)) {
        return;
    }

    isMagicItem = (item) => {
        const type = item.type;
        return (type === "consumable"
            || type === "container"
            || type === "equipment"
            || type === "loot"
            || type === "weapon"
            || type === "tool") && !!item.system.rarity && item.system.rarity !== "common"
            || type === "weapon" && item.system.properties.mgc;
    };
});
