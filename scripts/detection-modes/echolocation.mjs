import { DetectionModeBlindsight } from "./blindsight.mjs";

/**
 * The detection mode for Echolocation.
 */
export class DetectionModeEcholocation extends DetectionModeBlindsight {
    priority = 499;

    constructor() {
        super({
            id: "echolocation",
            label: "VISION5E.Echolocation",
            tokenConfig: false,
            type: DetectionMode.DETECTION_TYPES.SOUND,
            angle: true
        });
    }
}
