import { PingDetectionFilter } from "./filters/ping.mjs";

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
        return this._detectionFilter ??= PingDetectionFilter.create({
            color: [1, 1, 1],
            alpha: 0.75
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (!(target instanceof Token)) return false;
        const source = visionSource.object;
        return !(source instanceof Token && (source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEAF)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.SLEEP)))
            && !(target.document.hasStatusEffect(CONFIG.specialStatusEffects.INAUDIBLE)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
                && !(source instanceof Token && source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL))
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
