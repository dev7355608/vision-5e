/**
 * The vision mode for Truesight.
 */
export class VisionModeTruesight extends VisionMode {
    detectionMode = "seeAll";

    constructor() {
        super({
            id: "truesight",
            label: "DND5E.SenseTruesight",
            vision: {
                darkness: { adaptive: false },
                defaults: { attenuation: 0, contrast: 0, saturation: 0, brightness: 1 }
            }
        });
    }
}
