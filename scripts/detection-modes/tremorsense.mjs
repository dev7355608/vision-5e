/**
 * The detection mode for Tremorsense.
 */
export class DetectionModeTremorsense extends DetectionMode {
    imprecise = true;
    priority = -1000;

    constructor() {
        super({
            id: "feelTremor",
            label: "ED4.SenseTremorsense",
            type: DetectionMode.DETECTION_TYPES.MOVE,
            walls: false,
            angle: false
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= OutlineOverlayFilter.create({
            outlineColor: [1, 0, 1, 1],
            knockout: true,
            wave: true
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        return target instanceof Token && !target.document.hasStatusEffect(CONFIG.specialStatusEffects.FLY);
    }
}
