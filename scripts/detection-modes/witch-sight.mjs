import { createNameRegExp } from "../utils.js";

/**
 * The detection mode for Witch Sight.
 */
export class DetectionModeDetectWitchSight extends DetectionMode {
    imprecise = true;
    important = true;
    priority = -3000;

    constructor() {
        super({
            id: "witchSight",
            label: "VISION5E.WitchSight",
            type: DetectionMode.DETECTION_TYPES.SIGHT,
            walls: false,
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
        const actor = target.actor;
        if (!actor) return false;
        const type = actor.type;
        if (type !== "npc" && type !== "character") return false;
        const subtype = actor.system.details.type?.subtype;
        if (typeof subtype === "string" && SHAPECHANGER_SUBTYPE.test(subtype)) return true;
        for (const item of actor.items) {
            if (item.type === "feat" && SHAPECHANGER_FEAT.test(item.name)) {
                return true;
            }
        }
        return false;
    }

    /** @override */
    _testPoint(visionSource, mode, target, test) {
        if (!super._testPoint(visionSource, mode, target, test)) {
            return false;
        }

        const visionSources = this.#removeOtherVisionSources(visionSource);
        const detectionsModes = this.#removeNonSightDetectionModes(visionSource);

        // Test whether this vision source sees the target.
        const isVisible = canvas.effects.visibility.testVisibility(test.point, { tolerance: 0, object: target });

        this.#restoreOtherVisionSources(visionSources);
        this.#restoreNonSightDetectionModes(visionSource, detectionsModes);

        return isVisible;
    }

    /**
     * Temporarily remove other vision sources.
     * @param {VisionSource} visionSource             The vision source.
     * @returns {Collection<string, VisionSource>}    The vision sources that need to be restored later.
     */
    #removeOtherVisionSources(visionSource) {
        const visionSources = canvas.effects.visionSources;

        canvas.effects.visionSources = new foundry.utils.Collection();
        canvas.effects.visionSources.set("", visionSource);

        return visionSources;
    }

    /**
     * Restore the vision sources.
     * @param {Collection<string, VisionSource>} visionSources    The vision sources that need to be restored.
     */
    #restoreOtherVisionSources(visionSources) {
        canvas.effects.visionSources = visionSources;
    }

    /**
     * Temporarily remove all detection modes that are not sight-based from the source token.
     * @param {VisionSource} visionSource      The vision source.
     * @returns {TokenDetectionMode[]|null}    The detection modes that need to be restored later.
     */
    #removeNonSightDetectionModes(visionSource) {
        const object = visionSource.object;
        let detectionModes = null;

        if (object instanceof Token) {
            const document = object.document;

            detectionModes = document.detectionModes;
            document.detectionModes = detectionModes.filter(
                m => {
                    const mode = CONFIG.Canvas.detectionModes[m.id];
                    return mode && mode.type === DetectionMode.DETECTION_TYPES.SIGHT && mode.id !== this.id;
                }
            );
        }

        return detectionModes;
    }

    /**
     * Restore the detection modes.
     * @param {VisionSource} visionSource                   The vision source.
     * @param {TokenDetectionMode[]|null} detectionModes    The detection modes that need to be restored.
     */
    #restoreNonSightDetectionModes(visionSource, detectionModes) {
        if (detectionModes) {
            visionSource.object.document.detectionModes = detectionModes;
        }
    }
}

const shapechanger = {
    en: "Shapechanger",
    de: "Gestaltwandler",
    fr: "Métamorphe",
    es: "Cambiaformas",
    "pt-BR": "Metamorfo",
};
const SHAPECHANGER_FEAT = createNameRegExp(shapechanger, true);
const SHAPECHANGER_SUBTYPE = createNameRegExp(shapechanger, false);
