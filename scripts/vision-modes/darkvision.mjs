/**
 * The vision mode for Darkvision.
 */
export default class VisionModeDarkvision extends foundry.canvas.perception.VisionMode {
    constructor() {
        super({
            id: "darkvision",
            label: "DND5E.SenseDarkvision",
            canvas: {
                shader: foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader,
                uniforms: { contrast: 0, saturation: -1, exposure: 0 },
            },
            lighting: {
                background: { visibility: foundry.canvas.perception.VisionMode.LIGHTING_VISIBILITY.REQUIRED },
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { contrast: 0, saturation: -1, brightness: 0.1 },
            },
        });
    }
}
