import { DetectColorationVisionShader } from "./shaders/detect.mjs";
import { TremorColorationVisionShader } from "./shaders/tremor.mjs";
import { VoidBackgroundVisionShader, VoidIlluminationVisionShader, VoidSamplerShader } from "./shaders/void.mjs";

/**
 * The vision mode for Tremorsense.
 */
export class VisionModeTremorsense extends VisionMode {
    detectionMode = "feelTremor"

    constructor() {
        super({
            id: "tremorsense",
            label: "ED4.SenseTremorsense",
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
                defaults: { attenuation: 0, contrast: 0, saturation: 0, brightness: 0 },
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
