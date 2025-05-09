/**
 * The vision mode for Blindsight.
 */
export default class VisionModeBlindsight extends foundry.canvas.perception.VisionMode {
    constructor() {
        super({
            id: "blindsight",
            label: "DND5E.SenseBlindsight",
            canvas: {
                shader: foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader,
                uniforms: { contrast: 0, saturation: -1, exposure: 0 },
            },
            lighting: {
                background: { visibility: foundry.canvas.perception.VisionMode.LIGHTING_VISIBILITY.REQUIRED },
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { contrast: 0.3, saturation: -1, brightness: 0 },
            },
        }, { animated: true });
    }
}
