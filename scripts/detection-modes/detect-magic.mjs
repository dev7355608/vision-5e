import DetectionModeDetect from "./detect.mjs";
import { DETECTION_LEVELS } from "../const.mjs";

/**
 * The detection mode for Detect Magic.
 */
export default class DetectionModeDetectMagic extends DetectionModeDetect {
    constructor() {
        super({
            id: "detectMagic",
            label: "VISIONGURPS.DetectMagic",
            imprecise: false,
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= GlowOverlayFilter.create({
            glowColor: [1, 0, 1, 1],
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (!super._canDetect(visionSource, target)) {
            return false;
        }

        return target.document.hasStatusEffect(CONFIG.specialStatusEffects.MAGICAL);
    }

    /** @override */
    _testPoint(visionSource, mode, target, test) {
        if (!super._testPoint(visionSource, mode, target, test)) {
            return false;
        }

        const visionSources = canvas.effects.visionSources;

        canvas.effects.visionSources = new foundry.utils.Collection();
        canvas.effects.visionSources.set(visionSource.sourceId, visionSource);

        const detectionModes = visionSource.object.document.detectionModes;
        const detectionLevel = target._detectionLevel;

        target._detectionLevel = DETECTION_LEVELS.NONE;

        visionSource.object.document.detectionModes = detectionModes.filter(
            ({ id }) => {
                const mode = CONFIG.Canvas.detectionModes[id];

                return mode && mode !== this && mode.type === DetectionMode.DETECTION_TYPES.SIGHT && !mode.imprecise;
            },
        );

        // Test whether this vision source sees the target
        const result = canvas.visibility.testVisibility(test.point, { tolerance: 0, object: target });

        target._detectionLevel = detectionLevel;
        visionSource.object.document.detectionModes = detectionModes;
        canvas.effects.visionSources = visionSources;

        return result;
    }
}
