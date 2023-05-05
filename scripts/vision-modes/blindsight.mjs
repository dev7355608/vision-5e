/**
 * The vision mode for Blindsight.
 */
export class VisionModeBlindsight extends VisionMode {
    detectionMode = "blindsight";

    constructor() {
        super({
            id: "blindsight",
            label: "DND5E.SenseBlindsight",
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
