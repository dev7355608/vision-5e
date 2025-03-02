import DetectionMode from "./base.mjs";

/**
 * The detection mode for Life Sense.
 */
export default class DetectionModeLifeSense extends DetectionMode {
    constructor() {
        super({
            id: "lifeSense",
            label: "VISIONGURPS.LifeSense",
            type: DetectionMode.DETECTION_TYPES.OTHER,
            walls: false,
            angle: false,
            important: true,
            imprecise: true,
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= GlowOverlayFilter.create({
            glowColor: [1, 0, 0, 1],
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;

        if (!(target instanceof Token)
            || !target.actor?.system.details?.type
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
            && !source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
            && !target.document.hasStatusEffect(CONFIG.specialStatusEffects.MATERIAL)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.OBJECT)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)) {
            return false;
        }

        const type = target.actor.system.details.type.value;

        if (type === "construct" || type === "undead") {
            return false;
        }

        if (source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)) {
            return false;
        }

        return true;
    }
}
