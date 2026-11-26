import * as THREE from 'three';
import { makeMaterial } from './SceneCanvas.jsx';

// The night gallery: one long dark room, seven lightboxes on the wall, a polished floor that holds
// their reflections. Each lightbox shows its project's scene live (rendered into its own texture);
// the wall and floor take each box's colour of light.

const W = 1.6;
const H = 2.0;
const GAP = 2.75;
const Y = 1.4;

// the colour each piece throws onto the room around it
const SPILL = [
  [1.0, 0.62, 0.32],
  [0.55, 0.8, 1.0],
  [1.0, 0.5, 0.22],
  [0.45, 0.45, 1.0],
  [0.75, 0.82, 1.0],
  [0.55, 0.72, 1.0],
  [1.0, 0.66, 0.36]
];

const roomVert = /* glsl */ `
varying vec3 vW;
void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
`;

const roomFrag = (n, floor) => /* glsl */ `
precision highp float;
varying vec3 vW;
uniform float uX[${n}];
uniform vec3 uCol[${n}];
uniform float uOn[${n}];
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a*noise(p); p *= 2.1; a *= 0.5; } return v; }
float box(vec2 p, vec2 s){ vec2 d = abs(p) - s; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
void main(){
  vec3 c = vec3(0.0);
  ${
    floor
      ? `
  vec2 q = vW.xz;
  float tex = fbm(q * vec2(3.0, 6.0)) * 0.5 + fbm(q * 18.0) * 0.5;
  c = vec3(0.012, 0.013, 0.016) * (0.7 + 0.6 * tex);
  for (int i = 0; i < ${n}; i++){
    float dx = q.x - uX[i];
    float dz = q.y - 0.15;
    float pool = exp(-(dx * dx) * 0.7 - dz * dz * 0.6) * 0.22;
    c += uCol[i] * pool * uOn[i];
  }
  // wet sheen breaks up the reflections underneath
  float a = 0.5 + 0.3 * smoothstep(0.4, 0.8, tex);
  gl_FragColor = vec4(c, a);`
      : `
  vec2 q = vW.xy;
  float plaster = 0.018 + 0.012 * fbm(q * 4.0);
  c = vec3(plaster * 0.95, plaster, plaster * 1.08);
  for (int i = 0; i < ${n}; i++){
    float d = max(box(q - vec2(uX[i], ${Y.toFixed(2)}), vec2(${(W / 2).toFixed(2)}, ${(H / 2).toFixed(2)})), 0.0);
    c += uCol[i] * exp(-d * 2.6) * 0.22 * uOn[i];
  }
  // a dark skirting where wall meets floor
  c *= mix(0.4, 1.0, smoothstep(0.0, 0.25, q.y));
  gl_FragColor = vec4(c, 1.0);`
  }
}
`;

export class Gallery {
  constructor(canvas, count) {
    this.count = count;
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    // every shader here already writes display colours, so nothing is converted on the way out
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050608);
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 80);

    // drawing each project into its own texture
    this.sceneMat = makeMaterial();
    this.quad = new THREE.Scene();
    this.quad.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.sceneMat));
    this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.sceneMat.uniforms.uRes.value.set(512, 640);
    this.rts = Array.from({ length: count }, () => {
      const rt = new THREE.WebGLRenderTarget(512, 640, { depthBuffer: false });
      return rt;
    });
    this.drawn = new Array(count).fill(false);

    const xs = Array.from({ length: count }, (_, i) => i * GAP);
    const cols = SPILL.slice(0, count).map(c => new THREE.Vector3(...c));
    this.on = new Array(count).fill(0.5);
    const shared = { uX: { value: xs }, uCol: { value: cols }, uOn: { value: this.on } };

    const span = (count - 1) * GAP;
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(span + 30, 9),
      new THREE.ShaderMaterial({ vertexShader: roomVert, fragmentShader: roomFrag(count, false), uniforms: shared })
    );
    wall.position.set(span / 2, 4.5, -0.02);
    this.scene.add(wall);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(span + 30, 14),
      new THREE.ShaderMaterial({
        vertexShader: roomVert,
        fragmentShader: roomFrag(count, true),
        uniforms: shared,
        transparent: true,
        depthWrite: false
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(span / 2, 0, 7);
    floor.renderOrder = 2;
    this.scene.add(floor);

    this.boxes = [];
    const geo = new THREE.PlaneGeometry(W, H);
    const frameGeo = new THREE.PlaneGeometry(W + 0.08, H + 0.08);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x0b0c0e });
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ map: this.rts[i].texture, color: 0xffffff });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(xs[i], Y, 0.06);
      m.userData.index = i;
      m.renderOrder = 3;
      this.scene.add(m);
      const fr = new THREE.Mesh(frameGeo, frameMat);
      fr.position.set(xs[i], Y, 0.04);
      this.scene.add(fr);
      // reflection under the floor, seen through its sheen
      const rm = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.rts[i].texture, transparent: true, opacity: 0.55 }));
      rm.position.set(xs[i], -Y, 0.06);
      rm.scale.y = -1;
      rm.renderOrder = 1;
      this.scene.add(rm);
      this.boxes.push({ mesh: m, refl: rm, mat });
    }

    this.progress = 0;
    this.camX = 0;
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    this.hovered = -1;
    this.raycaster = new THREE.Raycaster();
    this.running = false;
    this.visible = false;
    this.t0 = performance.now();
    this.loop = this.loop.bind(this);
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.renderer.setSize(Math.max(2, r.width), Math.max(2, r.height), false);
    this.camera.aspect = r.width / Math.max(1, r.height);
    this.narrow = r.width < 700;
    this.camera.fov = this.narrow ? 48 : 36;
    this.camera.updateProjectionMatrix();
  }

  setProgress(p) {
    this.progress = p;
  }

  setPointer(x, y) {
    this.pointer.tx = x;
    this.pointer.ty = y;
  }

  pick(nx, ny) {
    this.raycaster.setFromCamera(new THREE.Vector2(nx, ny), this.camera);
    const hit = this.raycaster.intersectObjects(this.boxes.map(b => b.mesh))[0];
    return hit ? hit.object.userData.index : -1;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  loop() {
    if (!this.running) return;
    this.frame();
    this.raf = requestAnimationFrame(this.loop);
  }

  frame() {
    const now = performance.now();
    const t = (now - this.t0) / 1000;
    const dt = Math.min(0.1, (now - (this.last || now)) / 1000);
    this.last = now;
    const target = this.progress * (this.count - 1) * GAP;
    this.camX += (target - this.camX) * (1 - Math.exp(-dt * 6));
    const pt = this.pointer;
    const kp = 1 - Math.exp(-dt * 3);
    pt.x += (pt.tx - pt.x) * kp;
    pt.y += (pt.ty - pt.y) * kp;
    const z = this.narrow ? 4.9 : 6.0;
    this.camera.position.set(this.camX + pt.x * 0.45, 1.55 + pt.y * 0.22, z);
    this.camera.lookAt(this.camX + pt.x * 0.12, 1.25, 0);

    const at = this.camX / GAP;
    const active = Math.round(at);
    for (let i = 0; i < this.count; i++) {
      const near = Math.abs(i - at);
      const want = i === active ? 1 : 0.35;
      this.on[i] += (want - this.on[i]) * (1 - Math.exp(-dt * 5));
      const b = this.boxes[i];
      const lift = this.hovered === i ? 1.035 : 1;
      b.mesh.scale.x += (lift - b.mesh.scale.x) * 0.15;
      b.mesh.scale.y = b.mesh.scale.x;
      const level = 0.35 + 0.65 * this.on[i];
      b.mat.color.setScalar(level);
      b.refl.material.opacity = 0.35 + 0.45 * this.on[i];
      // only redraw the pieces near the camera; the rest keep their last frame
      if (near < 1.6 || !this.drawn[i]) {
        const u = this.sceneMat.uniforms;
        u.uScene.value = i;
        u.uPrev.value = i;
        u.uMix.value = 1;
        u.uTime.value = t + i * 3.1;
        this.renderer.setRenderTarget(this.rts[i]);
        this.renderer.render(this.quad, this.quadCam);
        this.drawn[i] = true;
      }
    }
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.rts.forEach(r => r.dispose());
    this.sceneMat.dispose();
    this.renderer.dispose();
  }
}
