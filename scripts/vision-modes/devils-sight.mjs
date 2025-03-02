/**
 * The vision mode for Devil's Sight.
 */
export default class VisionModeDevilsSight extends VisionMode {
    constructor() {
        super({
            id: "devilsSight",
            label: "VISIONGURPS.DevilsSight",
            vision: {
                darkness: { adaptive: false },
                defaults: { contrast: 0, saturation: 0, brightness: 1 },
            },
        });
    }
}
