/**
 * The vision mode for Truesight.
 */
export default class VisionModeTruesight extends VisionMode {
    constructor() {
        super({
            id: "truesight",
            label: "GURPS.SenseTruesight",
            vision: {
                darkness: { adaptive: false },
                defaults: { contrast: 0, saturation: 0, brightness: 1 },
            },
        });
    }
}
