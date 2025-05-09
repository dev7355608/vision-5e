import DetectionModeDetect from "./detect.mjs";

/**
 * The detection mode for Detect Evil and Good.
 */
export default class DetectionModeDetectEvilAndGood extends DetectionModeDetect {
    constructor() {
        super({
            id: "detectEvilAndGood",
            label: "VISION5E.DetectEvilAndGood",
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= foundry.canvas.rendering.filters.GlowOverlayFilter.create({
            glowColor: [1, 1, 0, 1],
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (!super._canDetect(visionSource, target)) {
            return false;
        }

        if (!target.actor.system.details?.type
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.OBJECT)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)) {
            return false;
        }

        if (target.document.hasStatusEffect(CONFIG.specialStatusEffects.REVENANCE)) {
            return true;
        }

        const creatureType = target.actor.system.details.type.value;

        return creatureType === "aberration"
            || creatureType === "celestial"
            || creatureType === "elemental"
            || creatureType === "fey"
            || creatureType === "fiend"
            || creatureType === "undead";
    }
}
