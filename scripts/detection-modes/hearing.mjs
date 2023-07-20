/**
 * The detection mode for hearing.
 */
export class DetectionModeHearing extends DetectionMode {
    sourceType = "sound";
    wallDirectionMode = PointSourcePolygon.WALL_DIRECTION_MODES.REVERSED;
    useThreshold = true;
    imprecise = true;
    priority = -2000;

    constructor() {
        super({
            id: "hearing",
            label: "VISION5E.Hearing",
            type: DetectionMode.DETECTION_TYPES.SOUND,
            walls: true,
            angle: false
        });
    }

    /** @override */
    static getDetectionFilter() {
        let filter = this._detectionFilter ??= OutlineOverlayFilter.create({
            outlineColor: [1, 1, 1, 1],
            knockout: true,
            wave: true
        });
        filter.thickness = game.settings.get("vision-5e", "defaultOutlineThickness");
        return filter;
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (!(target instanceof Token)) return false;
        const source = visionSource.object;
        return !(source instanceof Token && source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEAF))
            && !(target.document.hasStatusEffect(CONFIG.specialStatusEffects.INAUDIBLE)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED));
    }

    /** @override */
    _testLOS(visionSource, mode, target, test) {
        return !CONFIG.Canvas.polygonBackends.sound.testCollision(
            { x: visionSource.x, y: visionSource.y },
            test.point,
            {
                type: this.sourceType,
                mode: "any",
                source: visionSource,
                wallDirectionMode: this.wallDirectionMode,
                useThreshold: this.useThreshold
            }
        );
    }
}
