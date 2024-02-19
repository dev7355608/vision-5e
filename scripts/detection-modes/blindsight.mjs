import { createNameRegExp } from "../utils.js";

/**
 * The detection mode for Blindsight.
 */
export class DetectionModeBlindsight extends DetectionMode {
    sourceType = "sight";
    wallDirectionMode = PointSourcePolygon.WALL_DIRECTION_MODES.NORMAL;
    useThreshold = false;
    priority = 500;

    constructor(data = {}, options = {}) {
        super(foundry.utils.mergeObject({
            id: "blindsight",
            label: "DND5E.SenseBlindsight",
            type: DetectionMode.DETECTION_TYPES.OTHER,
            walls: true,
            angle: false
        }, data), options);
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= OutlineOverlayFilter.create({
            outlineColor: [1, 1, 1, 1],
            knockout: true,
            wave: true
        });
    }

    #ignoreDeafness(visionSource) {
        if (this.id === "echolocation") return false;
        const source = visionSource.object;
        if (source instanceof Token) {
            const actor = source.actor;
            if (actor && (actor.type === "character" || actor.type === "npc")) {
                for (const item of actor.items) {
                    if (item.type === "feat" && ECHOLOCATION_OR_BLIND_SENSES_FEAT.test(item.name)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;
        return !(source instanceof Token && source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEAF) && !this.#ignoreDeafness(visionSource))
            && !(target instanceof Token && (target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROW)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
                && !(source instanceof Token && source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL))));
    }

    _applyBlindness(visionSource) {
        return visionSource.data.deafened && !this.#ignoreDeafness(visionSource);
    }

    /** @override */
    _testLOS(visionSource, mode, target, test) {
        if (!this._testAngle(visionSource, mode, target, test)) return false;
        if (!this.walls) return true;
        return !CONFIG.Canvas.polygonBackends.sight.testCollision(
            { x: visionSource.x, y: visionSource.y },
            test.point,
            {
                type: this.sourceType,
                mode: "any",
                source: visionSource,
                wallDirectionMode: this.wallDirectionMode,
                // Blindsight is restricted by total cover and therefore cannot see
                // through windows. So we do not want blindsight to see through
                // a window as we get close to it. That's why we ignore thresholds.
                // We make the assumption that all windows are configured as threshold
                // walls. A move-based visibility check would also be an option to check
                // for total cover, but this would have the undesirable side effect that
                // blindsight wouldn't work through fences, portcullises, etc.
                useThreshold: this.useThreshold
            }
        );
    }
}

const ECHOLOCATION_OR_BLIND_SENSES_FEAT = createNameRegExp({
    en: ["Echolocation", "Blind Senses"],
    de: ["Echolot", "Blinde Sinne"],
    fr: ["Écholocalisation", "Écholocation", "Sens aveugles"],
    es: ["Ecolocalización", "Sentidos de ciego"],
    pt_BR: ["Ecolocalização", "Percepção às Cegas"],
});
