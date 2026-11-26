import * as THREE from 'three';
import { gsap } from 'gsap';
import { kelvinToRgb } from '../lib/light.js';

// The hero is a plaster wall at night with the name cut into it in relief. A pendant lamp hangs in
// front of it on a cord. The visitor carries the anchor along the ceiling track, grabs and swings the
// lamp, and clicks it on and off. The shade throws a cone (the classic wall scallop), the letters cast
// shadows, dust turns in the beam, and a window lets a little moonlight onto the wall.
// All distances are in units of the screen's short side, so the lamp keeps its size on a phone.

const vert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const frag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform vec2 uScale;
uniform sampler2D uMask;
uniform vec4 uBand0;
uniform vec4 uBand1;
uniform vec2 uReveal;
uniform vec3 uBulb;      // bulb centre, z = distance in front of the wall
uniform vec2 uAxis;      // the shade's axis in the wall plane (points out of the opening)
uniform vec2 uAnchor;    // where the cord meets the ceiling
uniform vec3 uColor;
uniform float uIntensity;
uniform float uRelief;
uniform float uTime;
uniform float uHover;
uniform float uLampSize;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a*noise(p); p *= 2.07; a *= 0.5; } return v; }

vec3 mask(vec2 uv){
  vec4 b = uBand0;
  if (uv.y >= b.y && uv.y <= b.w){
    float q = uv.y + (1.0 - uReveal.x) * (b.w - b.y) * 1.08;
    if (q > b.w) return vec3(0.0);
    return vec3(texture2D(uMask, vec2(uv.x, q)).rg, 0.0);
  }
  b = uBand1;
  if (uv.y >= b.y && uv.y <= b.w){
    float q = uv.y + (1.0 - uReveal.y) * (b.w - b.y) * 1.08;
    if (q > b.w) return vec3(0.0);
    return vec3(texture2D(uMask, vec2(uv.x, q)).rg, 1.0);
  }
  return vec3(0.0);
}

vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }

float segDist(vec2 p, vec2 a, vec2 b){
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// light reaching a point in front of the wall: cone of the shade times falloff
float coneAt(vec3 X, out vec3 l, out float dist){
  vec3 v = X - uBulb;
  dist = length(v);
  l = -v / dist;
  float ca = dot(v / dist, vec3(uAxis, 0.0));
  float cone = smoothstep(0.1, 0.55, ca);          // ~ 52° to 72° off axis: the scallop edge
  float spill = 0.035 + 0.04 * smoothstep(-0.2, 0.3, ca); // a little through the top and rim
  return max(cone, spill);
}

void main(){
  vec2 uv = vUv;
  vec2 P = uv * uScale;
  vec3 m = mask(uv);
  float h = m.x * uRelief;

  vec2 e = vec2(1.5) / uRes;
  float bx = mask(uv + vec2(e.x, 0.0)).y - mask(uv - vec2(e.x, 0.0)).y;
  float by = mask(uv + vec2(0.0, e.y)).y - mask(uv - vec2(0.0, e.y)).y;
  vec3 n = normalize(vec3(-bx * 2.2, -by * 2.2, 1.0));

  float g1 = fbm(P * 9.0);
  float gx = fbm(P * 9.0 + vec2(0.013, 0.0)) - g1;
  float gy = fbm(P * 9.0 + vec2(0.0, 0.013)) - g1;
  float grain = noise(P * 420.0) - 0.5;
  n = normalize(n + vec3(-gx * 5.0 + grain * 0.05, -gy * 5.0 + grain * 0.05, 0.0) * (1.0 - m.x * 0.85));

  vec3 S = vec3(P, h);
  vec3 l; float dist;
  float cone = coneAt(S, l, dist);
  float diff = max(dot(n, l), 0.0);
  float d2 = dist * dist;
  float att = uIntensity / (1.0 + 26.0 * d2 + 40.0 * d2 * d2);

  float sh = 1.0;
  vec3 ld = uBulb - S;
  if (diff > 0.0 && ld.z > 0.0 && cone > 0.05){
    float tmax = max(uRelief - S.z, 0.0) / ld.z;
    float j0 = hash(gl_FragCoord.xy + fract(uTime));
    for (int i = 0; i < 28; i++){
      float t = tmax * (float(i) + j0) / 28.0;
      vec3 pos = S + ld * t;
      float hm = mask(pos.xy / uScale).x * uRelief;
      float dd = pos.z - hm;
      if (t > 0.0005) sh = min(sh, clamp(0.5 + dd / (0.11 * t * dist + 0.0006), 0.0, 1.0));
    }
  }

  float paper = 0.3 + 0.14 * g1;
  vec3 wall = vec3(paper * 0.97, paper * 0.985, paper);
  vec3 alb = wall;
  if (m.x > 0.5) alb = (m.z < 0.5) ? vec3(0.95, 0.94, 0.91) : wall * 0.92;

  vec3 col = alb * uColor * diff * att * sh * cone;
  col += alb * uColor * att * 0.018;

  // moonlight through a window behind the viewer, cast on the wall at an angle
  vec2 w = P - vec2(0.12 * uScale.x, 0.08);
  w.x -= w.y * 0.42;
  vec2 ws = vec2(0.3, 0.56);
  float win = smoothstep(0.0, 0.025, w.x) * smoothstep(ws.x, ws.x - 0.025, w.x) * smoothstep(0.0, 0.025, w.y) * smoothstep(ws.y, ws.y - 0.025, w.y);
  float bars = smoothstep(0.004, 0.009, abs(w.x - ws.x * 0.5)) * smoothstep(0.004, 0.009, abs(w.y - ws.y * 0.52));
  vec3 moon = vec3(0.30, 0.40, 0.70) * 0.045 * win * bars * (0.85 + 0.3 * fbm(P * 3.0 + uTime * 0.02));
  col += alb * moon * (0.6 + 0.4 * n.z) * 2.2;
  col += alb * vec3(0.010, 0.013, 0.024) * (0.55 + 0.45 * n.z);

  vec3 hv = normalize(l + vec3(0.0, 0.0, 1.0));
  col += (m.z < 0.5 ? 1.0 : 0.0) * step(0.5, m.x) * uColor * pow(max(dot(n, hv), 0.0), 40.0) * att * sh * cone * 0.25;

  // the beam in the air: haze lit inside the cone, densest near the bulb
  vec2 q = P - uBulb.xy;
  float ql = length(q);
  float ca2 = dot(q / max(ql, 1e-4), uAxis);
  float beam = smoothstep(0.42, 0.75, ca2) * exp(-ql * 2.6) * smoothstep(0.0, 0.08, ql);
  col += uColor * beam * uIntensity * 0.006 * (0.7 + 0.3 * fbm(P * 6.0 - vec2(0.0, uTime * 0.05)));

  // dust turning in the beam
  for (int k = 0; k < 3; k++){
    float fk = float(k);
    float cell = 0.028 + fk * 0.016;
    vec2 dp = P + vec2(sin(uTime * 0.11 + fk) * 0.03, -uTime * (0.004 + fk * 0.003));
    vec2 id = floor(dp / cell);
    vec2 f = fract(dp / cell) - 0.5 - (vec2(hash(id + fk), hash(id + 7.0 + fk)) - 0.5) * 0.7;
    float dd = length(f) * cell;
    float r = 0.0011 + fk * 0.0007;
    float mote = smoothstep(r, r * 0.2, dd) * step(0.55, hash(id + 3.3 + fk));
    vec3 X = vec3(P, 0.05 + 0.2 * hash(id + 11.0));
    float dm = length(X - uBulb);
    float cm = smoothstep(0.42, 0.7, dot(normalize(X - uBulb), vec3(uAxis, 0.0)));
    float am = uIntensity / (1.0 + 60.0 * dm * dm);
    col += uColor * mote * cm * am * 0.35 * (0.6 + 0.4 * sin(uTime * 2.0 + hash(id) * 30.0));
  }

  // the lamp itself, in front of everything: cord, shade, glowing opening
  vec2 up = -uAxis;
  vec2 rt = vec2(up.y, -up.x);
  float s = uLampSize;
  float shadeH = 0.085 * s, rB = 0.066 * s, rT = 0.017 * s;
  vec2 top = uBulb.xy + up * shadeH;
  float cord = segDist(P, top, uAnchor);
  float aa = 1.5 / min(uRes.x, uRes.y);
  float cordA = smoothstep(0.0022 + aa, 0.0022 - aa * 0.5, cord);
  col = mix(col, vec3(0.012) + uColor * att * 0.01, cordA);

  vec2 loc = vec2(dot(P - uBulb.xy, rt), dot(P - uBulb.xy, up));
  float t01 = clamp(loc.y / shadeH, 0.0, 1.0);
  float rad = rT + (rB - rT) * (1.0 - pow(t01, 1.35));
  float inShade = step(-0.004 * s, loc.y) * step(loc.y, shadeH) * smoothstep(rad + aa, rad - aa, abs(loc.x));
  // spun aluminium: dark, with a soft vertical highlight and the wall's light on its rim
  float band = exp(-pow((loc.x / rad + 0.35) * 2.6, 2.0));
  vec3 shadeCol = vec3(0.018, 0.019, 0.022) + vec3(0.09) * band * (0.4 + 0.6 * t01) + uColor * 0.03 * (1.0 - t01);
  shadeCol += uColor * 0.06 * uHover;
  col = mix(col, shadeCol, inShade);
  // the opening, seen from a little below: a bright ellipse
  vec2 op = vec2(loc.x / (rB * 0.93), (loc.y + 0.002 * s) / (0.011 * s));
  float open = smoothstep(1.0, 0.8, length(op));
  col = mix(col, uColor * (0.5 + uIntensity * 0.12), open * step(0.02, uIntensity));
  // the bulb's own halo where it leaves the opening
  col += uColor * exp(-length(vec2(loc.x * 0.6, loc.y + 0.004)) * 55.0 / s) * uIntensity * 0.035;

  col = aces(col * 1.1);
  col = pow(col, vec3(1.0 / 2.2));
  col += (hash(gl_FragCoord.xy * 1.3 + uTime) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

export class HeroLight {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.maskCanvas = document.createElement('canvas');
    this.maskTex = new THREE.CanvasTexture(this.maskCanvas);
    this.uniforms = {
      uRes: { value: new THREE.Vector2(1, 1) },
      uScale: { value: new THREE.Vector2(1, 1) },
      uMask: { value: this.maskTex },
      uBand0: { value: new THREE.Vector4(0, 2, 0, 2) },
      uBand1: { value: new THREE.Vector4(0, 2, 0, 2) },
      uReveal: { value: new THREE.Vector2(0, 0) },
      uBulb: { value: new THREE.Vector3(0.9, 0.85, 0.2) },
      uAxis: { value: new THREE.Vector2(0, -1) },
      uAnchor: { value: new THREE.Vector2(0.9, 1.05) },
      uColor: { value: new THREE.Vector3(1, 0.65, 0.34) },
      uIntensity: { value: 0 },
      uRelief: { value: 0.022 },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uLampSize: { value: 1 }
    };
    this.material = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: this.uniforms });
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material));

    // pendulum: anchor slides on a ceiling track, the lamp swings from it
    this.p = {
      ax: 0.58, axV: 0, axTarget: 0.58, // anchor x, in 0..1 of width
      len: 0.2, lenTarget: 0.2, // cord length, short-side units
      th: 0.6, om: 0, // angle from vertical, angular velocity
      grabbed: false, grabTh: 0
    };
    this.lastPointer = -1e9;
    this.on = false;
    this.level = 0; // the intensity the lamp is set to when on
    this.running = false;
    this.visible = true;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.t0 = performance.now();
    this.prev = this.t0;
    this.loop = this.loop.bind(this);
  }

  setKelvin(k) {
    const [r, g, b] = kelvinToRgb(k);
    const lift = 1 + (6500 - k) / 9000;
    this.uniforms.uColor.value.set(r * lift, g * lift, b * lift);
  }

  get scale() {
    return this.uniforms.uScale.value;
  }

  layout(lines) {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(2, Math.round(rect.width));
    const h = Math.max(2, Math.round(rect.height));
    this.renderer.setSize(w, h, false);
    const pr = this.renderer.getPixelRatio();
    this.uniforms.uRes.value.set(w * pr, h * pr);
    const ar = w / h;
    this.uniforms.uScale.value.set(ar >= 1 ? ar : 1, ar >= 1 ? 1 : 1 / ar);
    this.uniforms.uRelief.value = w < 700 ? 0.016 : 0.022;
    this.uniforms.uLampSize.value = w < 700 ? 0.8 : 1;
    this.narrow = w < 700;

    const scale = Math.min(1.5, 2400 / w);
    const mw = Math.round(w * scale);
    const mh = Math.round(h * scale);
    const sharp = document.createElement('canvas');
    sharp.width = mw;
    sharp.height = mh;
    const blur = document.createElement('canvas');
    blur.width = mw;
    blur.height = mh;
    const sc = sharp.getContext('2d');
    const bc = blur.getContext('2d');
    sc.fillStyle = '#000';
    sc.fillRect(0, 0, mw, mh);
    bc.fillStyle = '#000';
    bc.fillRect(0, 0, mw, mh);

    const bands = [];
    lines.forEach(({ el, text }) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize) * scale;
      const font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
      const ls = parseFloat(cs.letterSpacing) || 0;
      [sc, bc].forEach(ctx => {
        ctx.font = font;
        if ('letterSpacing' in ctx) ctx.letterSpacing = `${ls * scale}px`;
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#fff';
      });
      const met = sc.measureText(text);
      const asc = met.fontBoundingBoxAscent ?? fs * 0.9;
      const desc = met.fontBoundingBoxDescent ?? fs * 0.25;
      const lineH = r.height * scale;
      const x = (r.left - rect.left) * scale;
      const top = (r.top - rect.top) * scale;
      const baseline = top + (lineH - (asc + desc)) / 2 + asc;
      sc.fillText(text, x, baseline);
      bc.filter = `blur(${Math.max(1.5, fs * 0.018)}px)`;
      bc.fillText(text, x, baseline);
      bc.filter = 'none';
      const capTop = baseline - (met.actualBoundingBoxAscent ?? fs * 0.72) - fs * 0.04;
      const y0 = 1 - (baseline + fs * 0.04) / mh;
      const y1 = 1 - capTop / mh;
      bands.push(new THREE.Vector4(x / mw, y0, (x + r.width * scale) / mw, y1));
    });

    this.maskCanvas.width = mw;
    this.maskCanvas.height = mh;
    const out = this.maskCanvas.getContext('2d');
    const a = sc.getImageData(0, 0, mw, mh);
    const b = bc.getImageData(0, 0, mw, mh);
    const o = out.createImageData(mw, mh);
    for (let i = 0; i < o.data.length; i += 4) {
      o.data[i] = a.data[i];
      o.data[i + 1] = b.data[i];
      o.data[i + 2] = 0;
      o.data[i + 3] = 255;
    }
    out.putImageData(o, 0, 0);
    // a texture keeps the size of its first upload, so every new layout gets a fresh one
    const fresh = new THREE.CanvasTexture(this.maskCanvas);
    fresh.minFilter = THREE.LinearFilter;
    fresh.magFilter = THREE.LinearFilter;
    fresh.generateMipmaps = false;
    this.maskTex.dispose();
    this.maskTex = fresh;
    this.uniforms.uMask.value = fresh;
    if (bands[0]) this.uniforms.uBand0.value.copy(bands[0]);
    if (bands[1]) this.uniforms.uBand1.value.copy(bands[1]);
    this.step(0);
    this.render();
  }

  // ----- interaction (x, y in 0..1 of the hero, y up) -----
  toScaled(x, y) {
    return [x * this.scale.x, y * this.scale.y];
  }

  bulbScreen() {
    const b = this.uniforms.uBulb.value;
    return [b.x / this.scale.x, b.y / this.scale.y];
  }

  /** distance from a hero point to the lamp, in short-side units */
  distToLamp(x, y) {
    const [px, py] = this.toScaled(x, y);
    const b = this.uniforms.uBulb.value;
    const ax = this.uniforms.uAxis.value;
    // centre of the shade sits a little above the opening
    const cx = b.x - ax.x * 0.04;
    const cy = b.y - ax.y * 0.04;
    return Math.hypot(px - cx, py - cy);
  }

  hover(x, y) {
    this.lastPointer = performance.now();
    if (this.p.grabbed) {
      this.drag(x, y);
      return;
    }
    // the anchor follows along the ceiling; height sets how far the cord is let down
    this.p.axTarget = Math.min(0.94, Math.max(0.06, x));
    const ceiling = this.scale.y + 0.02;
    const [, py] = this.toScaled(x, y);
    const lo = this.narrow ? 0.34 : 0.16;
    const hi = this.narrow ? 0.7 : 0.48;
    this.p.lenTarget = Math.min(hi, Math.max(lo, (ceiling - py) * 0.55 + 0.1));
    this.uniforms.uHover.value += ((this.distToLamp(x, y) < 0.09 ? 1 : 0) - this.uniforms.uHover.value) * 0.3;
  }

  grab(x, y) {
    if (this.distToLamp(x, y) > 0.1) return false;
    this.p.grabbed = true;
    this.p.grabMoved = 0;
    this.drag(x, y);
    return true;
  }

  drag(x, y) {
    const [px, py] = this.toScaled(x, y);
    const ax = this.p.ax * this.scale.x;
    const ay = this.scale.y + 0.02;
    const th = Math.atan2(px - ax, ay - py);
    this.p.grabMoved += Math.abs(th - this.p.grabTh);
    this.p.grabTh = Math.max(-1.3, Math.min(1.3, th));
    this.p.lenTarget = Math.min(0.75, Math.max(0.14, Math.hypot(px - ax, ay - py) - 0.04));
  }

  release() {
    const wasClick = this.p.grabbed && this.p.grabMoved < 0.02;
    this.p.grabbed = false;
    return wasClick;
  }

  // ----- light -----
  strike(onDone) {
    const u = this.uniforms;
    this.on = true;
    gsap.killTweensOf(u.uIntensity);
    if (this.reduced) {
      u.uIntensity.value = this.level;
      onDone?.();
      return;
    }
    const L = this.level;
    gsap
      .timeline({ onComplete: onDone })
      .to(u.uIntensity, { value: L * 0.35, duration: 0.05 })
      .to(u.uIntensity, { value: L * 0.02, duration: 0.08 })
      .to(u.uIntensity, { value: L * 0.55, duration: 0.05 })
      .to(u.uIntensity, { value: L * 0.12, duration: 0.1 })
      .to(u.uIntensity, { value: L, duration: 0.5, ease: 'power2.out' });
  }

  switchOff() {
    this.on = false;
    gsap.killTweensOf(this.uniforms.uIntensity);
    gsap.to(this.uniforms.uIntensity, { value: 0, duration: this.reduced ? 0 : 0.35, ease: 'power2.in' });
  }

  toggle() {
    if (this.on) this.switchOff();
    else this.strike();
    return this.on;
  }

  intro({ onLit } = {}) {
    const u = this.uniforms;
    this.level = 12;
    if (this.reduced) {
      this.p.th = 0;
      this.on = true;
      u.uIntensity.value = this.level;
      u.uReveal.value.set(1, 1);
      onLit?.();
      return;
    }
    // the lamp swings in from the right and strikes as it passes
    gsap.delayedCall(0.15, () => this.strike());
    gsap.to(u.uReveal.value, { x: 1, duration: 0.9, ease: 'expo.out', delay: 0.3 });
    gsap.to(u.uReveal.value, { y: 1, duration: 0.9, ease: 'expo.out', delay: 0.41 });
    gsap.delayedCall(0.7, () => onLit?.());
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.prev = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  step(dt) {
    const p = this.p;
    const now = performance.now();
    const t = (now - this.t0) / 1000;
    const idle = now - this.lastPointer > 3500;
    if (idle && !p.grabbed && !this.reduced) {
      p.axTarget = 0.56 + Math.sin(t * 0.17) * 0.2;
      p.lenTarget = this.narrow ? 0.46 : 0.2 + Math.sin(t * 0.23) * 0.04;
    }
    if (dt > 0) {
      // anchor: critically damped spring toward its target; its acceleration drives the swing
      const k = 38;
      const c = 2 * Math.sqrt(k);
      const sx = this.scale.x;
      const acc = (p.axTarget - p.ax) * k - p.axV * c;
      p.axV += acc * dt;
      p.ax += p.axV * dt;
      p.len += (p.lenTarget - p.len) * Math.min(1, dt * 4);
      const g = 4.2;
      if (p.grabbed) {
        const prevTh = p.th;
        p.th += (p.grabTh - p.th) * Math.min(1, dt * 18);
        p.om = (p.th - prevTh) / dt;
      } else {
        const alpha = -(g / p.len) * Math.sin(p.th) - 0.9 * p.om - ((acc * sx * 0.3) / p.len) * Math.cos(p.th);
        p.om += alpha * dt;
        p.th = Math.max(-1.25, Math.min(1.25, p.th + p.om * dt));
      }
      if (this.reduced) p.th = 0;
    }
    const sx = this.scale.x;
    const sy = this.scale.y;
    const ax = p.ax * sx;
    const ay = sy + 0.02;
    const u = this.uniforms;
    u.uAnchor.value.set(ax, ay);
    const bx = ax + Math.sin(p.th) * (p.len + 0.085);
    const by = ay - Math.cos(p.th) * (p.len + 0.085);
    u.uBulb.value.set(bx, by, 0.2);
    u.uAxis.value.set(Math.sin(p.th), -Math.cos(p.th));
    u.uTime.value = t;
  }

  loop(now) {
    if (!this.running) return;
    const dt = Math.min(0.033, (now - this.prev) / 1000);
    this.prev = now;
    // two half steps keep the pendulum stable at low frame rates
    this.step(dt / 2);
    this.step(dt / 2);
    if (this.visible) this.render();
    this.raf = requestAnimationFrame(this.loop);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.material.dispose();
    this.maskTex.dispose();
    this.renderer.dispose();
  }
}
