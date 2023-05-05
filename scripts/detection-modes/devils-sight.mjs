/**
 * The detection mode for Devil's Sight.
 */
export class DetectionModeDevilsSight extends DetectionMode {
    priority = 2000;

    constructor() {
        super({
            id: "devilsSight",
            label: "VISION5E.DevilsSight",
            type: DetectionMode.DETECTION_TYPES.SIGHT,
            walls: true
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
}
