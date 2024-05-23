/**
 * The vision mode for Etherealness.
 */
export default class VisionModeEtherealness extends VisionMode {

    constructor() {
        super({
            id: "etherealness",
            tokenConfig: false,
            canvas: {
                shader: ColorAdjustmentsSamplerShader,
                uniforms: { contrast: 0, saturation: -1, exposure: 0 }
            },
            lighting: {
                background: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
                illumination: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
                coloration: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
                darkness: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED }
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { color: null, contrast: 0, saturation: -1, brightness: 1 }
            }
        });
    }

    /** @override */
    get perceivesLight() {
        return true;
    }
}
