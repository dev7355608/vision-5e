/**
 * Base class for Detect Magic, Thoughts, etc.
 * @abstract
 */
export class DetectionModeDetect extends DetectionMode {
    imprecise = true;
    important = true;
    priority = -3000;

    constructor(data = {}, options = {}) {
        super(foundry.utils.mergeObject({
            type: DetectionMode.DETECTION_TYPES.OTHER,
            walls: false,
            angle: false
        }, data), options);
    }

    /** @override */
    _canDetect(visionSource, target) {
        if (!(target instanceof Token)) return false;
    }
}
