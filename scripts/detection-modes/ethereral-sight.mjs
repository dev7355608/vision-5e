/**
 * The detection mode for Ethereal Sight.
 */
export default class DetectionModeEtherealSight extends DetectionMode {

    constructor() {
        super({
            id: "etherealSight",
            label: "VISION5E.EtherealSight",
            type: DetectionMode.DETECTION_TYPES.OTHER,
            walls: false,
            angle: false
        });
    }

    /** @override */
    static getDetectionFilter() {
        return this._detectionFilter ??= GlowOverlayFilter.create({
            glowColor: [0, 0.60, 0.33, 1]
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        // Only ethereal tokens can be detected
        return !visionSource.object.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
            && target instanceof Token
            && target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL);
    }

    /** @override */
    _testPoint(visionSource, mode, target, test) {
        if (!super._testPoint(visionSource, mode, target, test)) {
            return false;
        }

        const visionSources = canvas.effects.visionSources;

        canvas.effects.visionSources = new foundry.utils.Collection();
        canvas.effects.visionSources.set("", visionSource);

        const detectionModes = visionSource.object.document.detectionModes;

        visionSource.object.document.detectionModes = detectionModes.filter(
            (mode) => CONFIG.Canvas.detectionModes[mode.id]?.type === DetectionMode.DETECTION_TYPES.SIGHT
        );

        target.document.actor.statuses.delete(CONFIG.specialStatusEffects.ETHEREAL);

        // Test whether this vision source sees the target without the ethereal status effect
        const result = canvas.visibility.testVisibility(test.point, { tolerance: 0, object: target });

        target.document.actor.statuses.add(CONFIG.specialStatusEffects.ETHEREAL);
        visionSource.object.document.detectionModes = detectionModes;
        canvas.effects.visionSources = visionSources;

        return result;
    }
}
