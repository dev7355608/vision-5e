export class PingDetectionFilter extends AbstractBaseFilter {
    /** @override */
    autoFit = false;

    /** @type {boolean} */
    animate = true;

    /** @override */
    static defaultUniforms = {
        color: [1, 1, 1],
        alpha: 1
    };

    /** @override */
    static vertexShader = `
        attribute vec2 aVertexPosition;

        uniform mat3 projectionMatrix;
        uniform vec4 inputSize;
        uniform vec4 outputFrame;

        varying vec2 vFilterCoord;

        void main() {
            vFilterCoord = aVertexPosition;
            vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;
            gl_Position = vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
        }`;

    /** @override */
    static fragmentShader = `
        varying vec2 vFilterCoord;

        uniform vec3 color;
        uniform float alpha;
        uniform float time;

        ${this.CONSTANTS}
        ${this.WAVE()}

        void main(void) {
            float dist = distance(vFilterCoord, vec2(0.5)) * 2.0;
            gl_FragColor = vec4(color, 1.0) * alpha * wcos(0.0, 1.0, dist * 75.0, -time * 0.01 + 3.0 * step(dist, 1.0)) * (1.0 - dist);
        }`;

    /** @override */
    apply(filterManager, input, output, clear) {
        this.uniforms.time = this.animate && !canvas.photosensitiveMode ? canvas.app.ticker.lastTime : 0;
        filterManager.applyFilter(this, input, output, clear);
    }
}
