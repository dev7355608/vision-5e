/**
 * The vision mode for Devil's Sight.
 */
export class VisionModeDevilsSight extends VisionMode {
    detectionMode = "devilsSight";

    constructor() {
        super({
            id: "devilsSight",
            label: "VISION5E.DevilsSight",
            canvas: {
                shader: ColorAdjustmentsSamplerShader,
                uniforms: { contrast: -0.15, saturation: 0, exposure: 0 }
            },
            lighting: {
                background: { visibility: VisionMode.LIGHTING_VISIBILITY.REQUIRED }
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { attenuation: 0, contrast: -0.15, saturation: 0, brightness: 0.5 },
            }
        });
    }
}
