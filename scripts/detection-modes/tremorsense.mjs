import DetectionMode from "./base.mjs";

/**
 * The detection mode for Tremorsense.
 */
export default class DetectionModeTremorsense extends DetectionMode {
    constructor() {
        super({
            id: "feelTremor",
            label: "GURPS.SenseTremorsense",
            type: DetectionMode.DETECTION_TYPES.MOVE,
            walls: false,
            angle: false,
            imprecise: true,
            priority: 3,
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= CONFIG.Canvas.detectionModes.hearing.constructor.getDetectionFilter();
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;

        // TODO: incorporeal creatures should not be detected
        if (!(target instanceof Token)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
            && !source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.FLYING)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.HOVERING)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.OBJECT)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)) {
            return false;
        }

        if (source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.FLYING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.HOVERING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)) {
            return false;
        }

        return true;
    }
}
