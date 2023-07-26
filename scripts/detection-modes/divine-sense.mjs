/**
 * The detection mode for Divine Sense.
 */
export class DetectionModeDivineSense extends DetectionMode {
    sourceType = "sight";
    wallDirectionMode = PointSourcePolygon.WALL_DIRECTION_MODES.NORMAL;
    useThreshold = false;
    imprecise = true;
    important = true;
    priority = -3000;

    constructor() {
        super({
            id: "divineSense",
            label: "VISION5E.DivineSense",
            type: DetectionMode.DETECTION_TYPES.OTHER,
            walls: true,
            angle: false
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= GlowOverlayFilter.create({
            glowColor: [1, 1, 0, 1]
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (!(target instanceof Token)) return false;
        const source = visionSource.object;
        if (target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROW)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
            && !(source instanceof Token && source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL))) {
            return true;
        }
        const actor = target.actor;
        if (!(actor && actor.type === "npc")) return false;
        const type = actor.system.details.type.value;
        return type === "celestial"
            || type === "fiend"
            || type === "undead";
    }

    /** @override */
    _testLOS(visionSource, mode, target, test) {
        if (!this._testAngle(visionSource, mode, target, test)) return false;
        if (!this.walls) return true;
        return !CONFIG.Canvas.polygonBackends.sight.testCollision(
            { x: visionSource.x, y: visionSource.y },
            test.point,
            {
                type: "sight",
                mode: "any",
                source: visionSource,
                wallDirectionMode: this.wallDirectionMode,
                useThreshold: this.useThreshold
            }
        );
    }
}
