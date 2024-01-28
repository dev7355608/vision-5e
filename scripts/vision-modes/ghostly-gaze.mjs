/**
 * The vision mode for Ghostly Gaze.
 */
export class VisionModeGhostlyGaze extends VisionMode {
    detectionMode = "ghostlyGaze";
    neutralIfGlobalLight = true;

    constructor() {
        super({
            id: "ghostlyGaze",
            label: "VISION5E.GhostlyGaze",
            canvas: {
                shader: ColorAdjustmentsSamplerShader,
                uniforms: { contrast: 0, saturation: -1, exposure: 0 }
            },
            lighting: {
                background: { visibility: VisionMode.LIGHTING_VISIBILITY.REQUIRED }
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { attenuation: 0, contrast: 0, saturation: -1, brightness: 0.1 }
            }
        });
    }
}
