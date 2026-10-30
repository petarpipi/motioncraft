// Every slat is one instance of a single rounded box. Its pose is computed on
// the GPU from its index, so morphing 40 slats costs one draw call and no
// per-frame matrix uploads.

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uAssemble;
uniform float uCoil;
uniform float uSpin;
uniform float uImpulse;
uniform float uImpulseAt;
uniform vec2 uPointer;
attribute float aT;
attribute float aRand;
varying vec3 vNormal;
varying vec3 vView;
varying float vT;
varying float vEdge;

const float PI = 3.14159265;
const float TAU = 6.28318531;

mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }

void main() {
  float t = aT;
  float c = t - 0.5;
  // Each slat lags slightly behind the one below it, so morphs cascade.
  float lag = t * 0.35;
  float k1 = smoothstep(lag, lag + 0.65, uMorph);
  float k2 = smoothstep(1.0 + lag, 1.65 + lag, uMorph);
  // A travelling wave centred on the last pluck position.
  float wave = uImpulse * sin(t * 15.0 - uTime * 7.0) * exp(-abs(t - uImpulseAt) * 2.4);
  float focus = exp(-pow((t - (uPointer.y * 0.5 + 0.5)) * 3.2, 2.0));

  // Pose A — a coiled column with a lens-shaped silhouette.
  vec3 pA = vec3(0.0, c * 3.5, sin(uTime * 0.5 + t * 4.0) * 0.035);
  float xA = 0.0;
  float yA = t * uCoil + uSpin + uTime * 0.22 + sin(uTime * 0.7 + t * 6.0) * 0.1 + wave * 0.9 + uPointer.x * focus * 0.9;
  float zA = 0.0;
  float sA = 0.62 + 0.5 * sin(t * PI);

  // Pose B — a fanned deck around the view axis.
  vec3 pB = vec3(0.0, 0.0, c * 1.1);
  float xB = 0.35 + uPointer.y * 0.3;
  float yB = sin(uTime * 0.6 + t * 7.0) * 0.18 + wave * 0.6;
  float zB = c * PI * 1.7 + uTime * 0.12 + uSpin * 0.3;
  float sB = 1.1 + 0.08 * sin(t * TAU * 2.0 + uTime);

  // Pose C — louvred iris ring; the louvres open with the pointer and impulses.
  float a = t * TAU + uTime * 0.1 + uSpin * 0.2;
  vec3 pC = vec3(cos(a), sin(a), 0.0) * 1.65;
  float xC = 1.05 + 0.3 * sin(uTime * 0.8 + t * TAU * 2.0) + wave * 0.8 + length(uPointer) * 0.35;
  float yC = 0.0;
  float zC = a + PI * 0.5;
  float sC = 0.62;

  vec3 p = mix(mix(pA, pB, k1), pC, k2);
  float ex = mix(mix(xA, xB, k1), xC, k2);
  float ey = mix(mix(yA, yB, k1), yC, k2);
  float ez = mix(mix(zA, zB, k1), zC, k2);
  float sx = mix(mix(sA, sB, k1), sC, k2);

  // Intro: slats shuffle in from alternating sides, bottom first.
  float scatter = 1.0 - smoothstep(t * 0.45, t * 0.45 + 0.55, uAssemble);
  float side = aRand > 0.5 ? 1.0 : -1.0;
  p.x += side * scatter * 5.0;
  p.y += scatter * (aRand - 0.5) * 2.0;
  ey += scatter * side * 2.5;
  sx *= 1.0 - scatter * 0.6;

  mat3 R = rotZ(ez) * rotY(ey) * rotX(ex);
  vec3 scaleV = vec3(sx, 1.0, 1.0);
  vec3 world = R * (position * scaleV) + p;
  vec3 n = normalize(R * (normal / scaleV));
  vec4 mv = modelViewMatrix * vec4(world, 1.0);
  vNormal = normalize(normalMatrix * n);
  vView = -mv.xyz;
  vT = t;
  vEdge = abs(position.x) / 1.05;
  gl_Position = projectionMatrix * mv;
}
`

// An analytic studio: graduated sky, two softboxes, a vertical strip light and
// an acid rim. No environment textures, no PMREM pass, cheap to compile.
export const fragmentShader = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec3 uAcid;
varying vec3 vNormal;
varying vec3 vView;
varying float vT;
varying float vEdge;

void main() {
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(vView);
  vec3 R = reflect(-V, N);
  float sky = smoothstep(-0.45, 0.95, R.y);
  vec3 color = mix(vec3(0.045, 0.047, 0.052), vec3(0.6, 0.61, 0.64), sky);
  // Floor bounce keeps downward-facing faces from going fully black.
  color += vec3(0.11, 0.115, 0.12) * smoothstep(0.0, -0.9, R.y);
  float box1 = smoothstep(0.86, 0.975, dot(R, normalize(vec3(-0.55, 0.55, 0.62))));
  float box2 = smoothstep(0.9, 0.99, dot(R, normalize(vec3(0.72, 0.12, 0.68))));
  float strip = smoothstep(0.8, 0.99, 1.0 - abs(R.x + 0.18)) * smoothstep(0.1, 0.8, R.y);
  color += vec3(1.0) * box1 * 1.25 + vec3(0.93, 0.96, 1.0) * box2 * 0.8 + strip * 0.35;
  color += vec3(0.55) * smoothstep(0.035, 0.0, abs(R.y - 0.02)) * 0.45;
  // Alternate graphite and polished slats for rhythm.
  color *= mix(0.72, 1.06, step(0.5, fract(vT * 9.5)));
  // Acid is an accent: a travelling rim on grazing edges only.
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 6.0);
  float pulse = smoothstep(0.55, 1.0, sin(vT * 9.0 - uTime * 1.4));
  color = mix(color, uAcid, clamp(fresnel * (0.08 + 0.5 * pulse), 0.0, 1.0));
  gl_FragColor = vec4(color, 1.0);
}
`
