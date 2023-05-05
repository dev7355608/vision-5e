export class DetectColorationVisionShader extends ColorationVisionShader {
    /** @override */
    static fragmentShader = `
    ${this.SHADER_HEADER}
    ${this.PRNG}
    ${this.NOISE}
    ${this.FBM(4, 1.0)}
    uniform vec3 colorDetection;

    float wave(in float dist) {
        float sinWave = 0.5 * (sin(time * 6.0 + dist * 10.0 * intensity) + 1.0);
        return 0.55 * sinWave + 0.8;
    }

    void main() {
        ${this.FRAGMENT_BEGIN}
        finalColor = vec3(colorDetection) * wave(dist) * 0.25;
        ${this.FALLOFF}
        ${this.FRAGMENT_END}
    }`;

    /** @override */
    static defaultUniforms = { ...super.defaultUniforms, colorDetection: [1, 1, 1] };

    /** @override */
    get isRequired() {
        return true;
    }
}
