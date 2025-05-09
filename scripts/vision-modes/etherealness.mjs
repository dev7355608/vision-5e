/**
 * The vision mode for Etherealness.
 */
export default class VisionModeEtherealness extends foundry.canvas.perception.VisionMode {
    constructor() {
        super({
            id: "etherealness",
            tokenConfig: false,
            canvas: {
                shader: foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader,
                uniforms: { contrast: 0, saturation: -1, exposure: 0 },
            },
            lighting: {
                background: {
                    postProcessingModes: ["SATURATION"],
                    uniforms: { saturation: -1, tint: [1, 1, 1] },
                },
                illumination: {
                    postProcessingModes: ["SATURATION"],
                    uniforms: { saturation: -1, tint: [1, 1, 1] },
                },
                coloration: {
                    postProcessingModes: ["SATURATION"],
                    uniforms: { saturation: -1, tint: [1, 1, 1] },
                },
                darkness: {
                    postProcessingModes: ["SATURATION"],
                    uniforms: { saturation: -1, tint: [1, 1, 1] },
                },
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { color: null, contrast: 0, saturation: -1, brightness: 0 },
            },
        });
    }
}
