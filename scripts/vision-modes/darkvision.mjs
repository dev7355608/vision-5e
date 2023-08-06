/**
 * The vision mode for Darkvision.
 */
export class VisionModeDarkvision extends VisionMode {
    constructor() {
        super({
            id: "darkvision",
            label: "DND5E.SenseDarkvision",
            canvas: {
                shader: ColorAdjustmentsSamplerShader,
                uniforms: { contrast: 0, saturation: -1, exposure: 0 }
            },
            lighting: {
                background: { visibility: VisionMode.LIGHTING_VISIBILITY.REQUIRED }
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { attenuation: 0, contrast: 0, saturation: -1, brightness: 0.1 }
            }
        });
    }
}
