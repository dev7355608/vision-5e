/**
 * The vision mode for Blindsight.
 */
export default class VisionModeBlindsight extends VisionMode {
    constructor() {
        super({
            id: "blindsight",
            label: "GURPS.SenseBlindsight",
            canvas: {
                shader: ColorAdjustmentsSamplerShader,
                uniforms: { contrast: 0, saturation: -1, exposure: 0 },
            },
            lighting: {
                background: { visibility: VisionMode.LIGHTING_VISIBILITY.REQUIRED },
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { contrast: 0.3, saturation: -1, brightness: 0 },
            },
        }, { animated: true });
    }
}
