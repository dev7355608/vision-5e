export class VoidSamplerShader extends BaseSamplerShader {
    /** @override */
    static classPluginName = null;

    /** @override */
    static fragmentShader = `\
        precision ${PIXI.settings.PRECISION_FRAGMENT} float;
        void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }`;
}

export class VoidBackgroundVisionShader extends BackgroundVisionShader {
    /** @override */
    static fragmentShader = `
        precision ${PIXI.settings.PRECISION_FRAGMENT} float;
        varying float vDepth;
        void main() {
            float depth = smoothstep(0.0, 1.0, vDepth);
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) * depth;
        }`;


    /** @override */
    get isRequired() {
        return true;
    }
}

export class VoidIlluminationVisionShader extends IlluminationVisionShader {
    /** @override */
    static fragmentShader = `
        precision ${PIXI.settings.PRECISION_FRAGMENT} float;
        varying float vDepth;
        void main() {
            float depth = smoothstep(0.0, 1.0, vDepth);
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) * depth;
        }`;

    /** @override */
    get isRequired() {
        return false;
    }
}
