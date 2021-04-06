uniform sampler2D uWorldMap;

varying vec2 vUv;

void main () {
//    float valX = step(0.9, mod(vUv.x * 90.0, 1.0));
//    float valY = step(0.9, mod(vUv.y * 180.0, 1.0));
     vec4 color = texture2D(uWorldMap, vUv);
    // gl_FragColor = vec4(1.0, 1.0, 1.0, color.a);

    float val = step(0.5, color.a);
    gl_FragColor = vec4(1.0, 1.0, 1.0, val);
}
