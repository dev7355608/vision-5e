/**
 * The vision mode for Echolocation.
 */
export class VisionModeEcholocation extends VisionMode {
    detectionMode = "echolocation";

    constructor() {
        super({
            id: "echolocation",
            label: "VISION5E.Echolocation",
            canvas: {
                shader: ColorAdjustmentsSamplerShader,
                uniforms: { contrast: 0.5, saturation: -1, exposure: 0 }
            },
            lighting: {
                background: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
                illumination: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
                coloration: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED }
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { attenuation: 0, contrast: 0.3, saturation: -1, brightness: 1 },
                coloration: {
                    shader: WaveColorationVisionShader,
                    uniforms: { colorEffect: [1, 1, 1] }
                }
            }
        }, { animated: true });
    }
}
