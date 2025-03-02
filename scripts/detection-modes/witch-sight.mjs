import DetectionMode from "./base.mjs";
import { DETECTION_LEVELS } from "../const.mjs";

/**
 * The detection mode for Witch Sight.
 */
export default class DetectionModeWitchSight extends DetectionMode {
    constructor() {
        super({
            id: "witchSight",
            label: "VISIONGURPS.WitchSight",
            type: DetectionMode.DETECTION_TYPES.OTHER,
            walls: false,
            angle: false,
            important: true,
            priority: -1,
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= CONFIG.Canvas.detectionModes.detectEvilAndGood.constructor.getDetectionFilter();
    }

    /** @override */
    _canDetect(visionSource, target) {
        return !visionSource.object.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
            && target instanceof Token
            && target.document.hasStatusEffect(CONFIG.specialStatusEffects.SHAPECHANGER)
            && !target.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED);
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
