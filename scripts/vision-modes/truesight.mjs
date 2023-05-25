/**
 * The vision mode for Truesight.
 */
export class VisionModeTruesight extends VisionMode {
    detectionMode = "seeAll";

    constructor() {
        super({
            id: "truesight",
            label: "ED4.SenseTruesight",
            canvas: {
                shader: ColorAdjustmentsSamplerShader,
                uniforms: { contrast: 0, saturation: 0, exposure: 0 }
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { attenuation: 0, contrast: 0, saturation: 0, brightness: 1 }
            }
        });
    }
}
