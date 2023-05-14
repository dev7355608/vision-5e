import { DetectColorationVisionShader } from "./shaders/detect.mjs";
import { VoidBackgroundVisionShader, VoidIlluminationVisionShader, VoidSamplerShader } from "./shaders/void.mjs";

/**
 * The vision mode for Detect Magic.
 */
export class VisionModeDetectMagic extends VisionMode {
    detectionMode = "detectMagic"

    constructor() {
        super({
            id: "detectMagic",
            label: "VISION5E.DetectMagic",
            canvas: {
                shader: VoidSamplerShader,
                uniforms: { contrast: 0, saturation: 0, exposure: 0 }
            },
            lighting: {
                background: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
                illumination: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
                coloration: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED }
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { attenuation: 1, contrast: 0, saturation: 0, brightness: 0 },
                background: { shader: VoidBackgroundVisionShader },
                illumination: { shader: VoidIlluminationVisionShader },
                coloration: {
                    shader: DetectColorationVisionShader,
                    uniforms: { colorDetection: [1, 0, 1] }
                }
            }
        }, { animated: true });
    }
}
