import { createNameRegExp } from "../utils.js";

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
        if (!actor) return false;
        const isCharacter = actor.type === "character";
        if (!isCharacter && actor.type !== "npc") return false;
        const type = actor.system.details.type?.value;
        if (type === "celestial" || type === "fiend" || type === "undead") return true;
        if (isCharacter) {
            for (const item of actor.items) {
                if (item.type === "feat" && HOLLOW_ONE_FEAT.test(item.name)) {
                    return true;
                }
            }
        }
        return false;
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

export const HOLLOW_ONE_FEAT = createNameRegExp({
    en: [
        [["Supernatural Gift"], ["s", ""], ":", "Hollow One"],
        "Hollow One",
    ],
    de: [
        [["Übernatürliche Gabe"], ["n", ""], ":", "Leerwandler"],
        "Leerwandler",
    ],
    fr: [
        [["Don surnaturel", "Dons surnaturels"], [":", " : "], "Celui-qui-est-creux"],
        "Celui-qui-est-creux",
    ],
    es: [
        [["Don supernatural", "Dones supernaturales"], ": Hollow One"],
        "Hollow One",
    ],
});
