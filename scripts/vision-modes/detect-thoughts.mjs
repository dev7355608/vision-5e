import { DetectColorationVisionShader } from "./shaders/detect.mjs";
import { VoidBackgroundVisionShader, VoidIlluminationVisionShader, VoidSamplerShader } from "./shaders/void.mjs";

/**
 * The vision mode for Detect Thoughts.
 */
export class VisionModeDetectThoughts extends VisionMode {
    detectionMode = "detectThoughts"

    constructor() {
        super({
            id: "detectThoughts",
            label: "VISION5E.DetectThoughts",
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
                    // TODO
                    shader: class DetectThoughtsColorationVisionShader extends DetectColorationVisionShader {
                        /** @override */
                        static defaultUniforms = { ...super.defaultUniforms, colorDetection: [0, 1, 1] };
                    }
                }
            }
        }, { animated: true });
    }
}
