uniform float uTime;

varying vec2 vUv;

// Функция для генерации шума Перлина
float random(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vUv = uv;

   float noise = random(vUv + uTime); 

    float turbulence = noise * 0.03;

    vec3 delta = normal * turbulence;
    vec3 newPosition = position + delta;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
