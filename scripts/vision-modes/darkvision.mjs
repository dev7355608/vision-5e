/**
 * The vision mode for Darkvision.
 */
export default class VisionModeDarkvision extends VisionMode {
    constructor() {
        super({
            id: "darkvision",
            label: "GURPS.SenseDarkvision",
            canvas: {
                shader: ColorAdjustmentsSamplerShader,
                uniforms: { contrast: 0, saturation: -1, exposure: 0 },
            },
            lighting: {
                background: { visibility: VisionMode.LIGHTING_VISIBILITY.REQUIRED },
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { contrast: 0, saturation: -1, brightness: 0.1 },
            },
        });
    }
}
