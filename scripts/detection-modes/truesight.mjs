/**
 * The detection mode for Truesight.
 */
export class DetectionModeTruesight extends DetectionMode {
    priority = 1000;

    constructor() {
        super({
            id: "seeAll",
            label: "ED4.SenseTruesight",
            type: DetectionMode.DETECTION_TYPES.SIGHT,
            walls: true,
            angle: true
        });
    }

    /** @override */
    static getDetectionFilter(basic) {
        if (basic) return;
        return this._detectionFilter ??= OutlineOverlayFilter.create({
            outlineColor: [1, 1, 1, 1],
            knockout: true
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;
        return !(source instanceof Token && source.document.hasStatusEffect(CONFIG.specialStatusEffects.BLIND));
    }
}
