attribute float aScale;

uniform float uDevicePixelRatio;
uniform float uSize;
uniform float uTime;

void main () {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.y += aScale * 0.3 * sin(uTime + modelPosition.x * 100.0);

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    gl_PointSize = uSize * uDevicePixelRatio * aScale;
    gl_PointSize *= (1.0 / -viewPosition.z);
}
