import { DetectColorationVisionShader } from "./shaders/detect.mjs";
import { VoidBackgroundVisionShader, VoidIlluminationVisionShader, VoidSamplerShader } from "./shaders/void.mjs";

/**
 * The vision mode for Detect Poison and Disease.
 */
export class VisionModeDetectPoisonAndDisease extends VisionMode {
    detectionMode = "detectPoisonAndDisease"

    constructor() {
        super({
            id: "detectPoisonAndDisease",
            label: "VISION5E.DetectPoisonAndDisease",
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
                    shader: class DetectPoisonAndDiseaseColorationVisionShader extends DetectColorationVisionShader {
                        /** @override */
                        static defaultUniforms = { ...super.defaultUniforms, colorDetection: [0, 1, 0] };
                    }
                }
            }
        }, { animated: true });
    }
}
