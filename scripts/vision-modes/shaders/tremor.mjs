export class TremorColorationVisionShader extends ColorationVisionShader {
    /** @override */
    static fragmentShader = `
    ${this.SHADER_HEADER}
    ${this.WAVE()}
    ${this.PERCEIVED_BRIGHTNESS}
    uniform vec3 colorDetection;

    void main() {
        ${this.FRAGMENT_BEGIN}
        // Normalize vUvs and compute base time
        vec2 uvs = (2.0 * vUvs) - 1.0;
        float t = time * -8.0;

        // Rotate uvs
        float sinX = sin(t * 0.02);
        float cosX = cos(t * 0.02);
        mat2 rotationMatrix = mat2( cosX, -sinX, sinX, cosX);
        vec2 ruv = ((vUvs - 0.5) * rotationMatrix) + 0.5;

        // Prepare distance from 4 corners
        float dst[4];
        dst[0] = distance(vec2(0.0), ruv);
        dst[1] = distance(vec2(1.0), ruv);
        dst[2] = distance(vec2(1.0,0.0), ruv);
        dst[3] = distance(vec2(0.0,1.0), ruv);

        // Produce 4 arms smoothed to the edges
        float angle = atan(ruv.x * 2.0 - 1.0, ruv.y * 2.0 - 1.0) * INVTWOPI;
        float beam = fract(angle * 4.0);
        beam = smoothstep(0.3, 1.0, max(beam, 1.0 - beam));

        // Computing the 4 corner waves
        float multiWaves = 0.0;
        for ( int i = 0; i <= 3 ; i++) {
            multiWaves += smoothstep(0.6, 1.0, max(multiWaves, wcos(-10.0, 1.30 - dst[i], dst[i] * 120.0, t)));
        }
        // Computing the central wave
        multiWaves += smoothstep(0.6, 1.0, max(multiWaves, wcos(-10.0, 1.35 - dist, dist * 120.0, -t)));

        // Construct final color
        finalColor = vec3(mix(multiWaves, 0.0, sqrt(beam))) * colorDetection * 0.25;
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
