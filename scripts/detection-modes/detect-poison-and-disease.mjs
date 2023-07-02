import { DetectionModeDetect } from "./detect.mjs";

/**
 * The detection mode for Detect Poison and Disease.
 */
export class DetectionModeDetectPoisonAndDisease extends DetectionModeDetect {
    constructor() {
        super({
            id: "detectPoisonAndDisease",
            label: "VISION5E.DetectPoisonAndDisease"
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= GlowOverlayFilter.create({
            glowColor: [0, 1, 0, 1]
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (!super._canDetect(visionSource, target)) return false;

        if (target.document.hasStatusEffect(CONFIG.specialStatusEffects.POISON)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.DISEASE)) {
            return true;
        }

        const actor = target.actor;

        // A poisonous creature is a creature that has a poisonous natural weapon attack.
        if (actor && (actor.type === "character" || actor.type === "npc")) {
            for (const item of actor.items) {
                if (item.type === "weapon" && item.system.weaponType === "natural"
                    && (item.system.damage.parts.some(part => part[1] === "poison")
                        || [
                            item.system.critical.damage,
                            item.system.damage.versatile,
                            item.system.formula
                        ].some(formula => /\[\s*poison\s*\]/i.test(formula)))) {
                    return true;
                }
            }
        }

        return false;
    }
}
