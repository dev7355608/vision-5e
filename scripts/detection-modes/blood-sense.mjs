import DetectionMode from "./base.mjs";

/**
 * The detection mode for Blood Sense.
 */
export default class DetectionModeBloodSense extends DetectionMode {
    constructor() {
        super({
            id: "bloodSense",
            label: "VISIONGURPS.BloodSense",
            type: DetectionMode.DETECTION_TYPES.OTHER,
            walls: false,
            angle: false,
            important: true,
            imprecise: true,
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= CONFIG.Canvas.detectionModes.lifeSense.constructor.getDetectionFilter();
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;

        if (!(target instanceof Token)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
            && !source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)) {
            return false;
        }

        if (source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)) {
            return false;
        }

        if (target.document.hasStatusEffect(CONFIG.specialStatusEffects.BLEEDING)) {
            return true;
        }

        if (!target.actor?.system.details?.type
            || target.actor.system.traits?.ci?.value.has(CONFIG.specialStatusEffects.BLEEDING)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.OBJECT)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)) {
            return false;
        }

        const type = target.actor.system.details.type.value;

        return type !== "construct"
            && type !== "elemental"
            && type !== "ooze"
            && type !== "plant"
            && type !== "undead";
    }
}
