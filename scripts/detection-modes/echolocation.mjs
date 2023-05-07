import { DetectionModeBlindsight } from "./blindsight.mjs";

/**
 * The detection mode for Echolocation.
 */
export class DetectionModeEcholocation extends DetectionModeBlindsight {
    priority = 499;

    // Echolocation is directional and therefore limited by the vision angle.
    _ingoreVisionAngle = false;
    _wallDirectionMode = PointSourcePolygon.WALL_DIRECTION_MODES.BOTH;

    constructor() {
        super({
            id: "echolocation",
            label: "VISION5E.Echolocation",
            type: DetectionMode.DETECTION_TYPES.SOUND
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        // Echolocation doesn't work while deafened.
        const source = visionSource.object;
        return !(source instanceof Token && source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEAF)
            && super._canDetect(visionSource, target));
    }
}
