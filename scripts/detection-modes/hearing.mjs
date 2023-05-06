/**
 * The detection mode for hearing.
 */
export class DetectionModeHearing extends DetectionMode {
    imprecise = true;
    priority = -3000;

    constructor() {
        super({
            id: "hearing",
            label: "VISION5E.Hearing",
            type: DetectionMode.DETECTION_TYPES.SOUND,
            walls: true
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= OutlineOverlayFilter.create({
            outlineColor: [1, 1, 1, 1],
            knockout: true,
            wave: true
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;
        return !(source instanceof Token && source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEAF))
            && target instanceof Token && !target.document.hasStatusEffect(CONFIG.specialStatusEffects.INAUDIBLE);
    }

    /** @override */
    _testLOS(visionSource, mode, target, test) {
        return !CONFIG.Canvas.polygonBackends.sound.testCollision(
            { x: visionSource.x, y: visionSource.y },
            test.point,
            {
                type: "sound",
                mode: "any",
                source: visionSource,
                wallDirectionMode: PointSourcePolygon.WALL_DIRECTION_MODES.REVERSED
            }
        );
    }
}
