import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { sceneVert, sceneFrag } from './scenes.glsl.js';
import { kelvinToRgb } from '../lib/light.js';

export function makeMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: sceneVert,
    fragmentShader: sceneFrag,
    uniforms: {
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uScene: { value: 0 },
      uPrev: { value: 0 },
      uMix: { value: 1 },
      uVariant: { value: 0 },
      uLamp: { value: new THREE.Vector3(1, 0.66, 0.34) },
      uWalk: { value: -1 }
    }
  });
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A live drawing of one project. Changing `scene` cross-fades to the next one in the same canvas. */
export default function SceneCanvas({ scene = 0, variant = 0, kelvin = 2700, className = '', label, time = 6, walkRef }) {
  const ref = useRef(null);
  const api = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    } catch {
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    const material = makeMaterial();
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const u = material.uniforms;
    u.uScene.value = scene;
    u.uPrev.value = scene;
    u.uTime.value = time;
    let visible = false;
    let raf = 0;
    let last = performance.now();
    let mixFrom = 0;
    const still = reduced();

    const size = () => {
      const r = canvas.getBoundingClientRect();
      renderer.setSize(Math.max(2, r.width), Math.max(2, r.height), false);
      const pr = renderer.getPixelRatio();
      u.uRes.value.set(r.width * pr, r.height * pr);
      renderer.render(s, cam);
    };
    const frame = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!still) u.uTime.value += dt;
      if (u.uMix.value < 1) u.uMix.value = Math.min(1, u.uMix.value + dt / 0.35);
      renderer.render(s, cam);
      if (visible && (!still || u.uMix.value < 1)) raf = requestAnimationFrame(frame);
      else raf = 0;
    };
    const kick = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    size();

    api.current = {
      setScene(next) {
        if (next === u.uScene.value) return;
        u.uPrev.value = u.uScene.value;
        u.uScene.value = next;
        u.uMix.value = still ? 1 : mixFrom;
        kick();
      },
      setVariant(v) {
        u.uVariant.value = v;
        kick();
      },
      setWalk(w) {
        u.uWalk.value = w;
        kick();
      },
      setLamp(k) {
        const [r, g, b] = kelvinToRgb(k);
        u.uLamp.value.set(r, g, b);
        kick();
      }
    };
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      material.dispose();
      // no forceContextLoss here: React may mount again on this same canvas and would inherit a lost context
      renderer.dispose();
      api.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (walkRef) walkRef.current = w => api.current?.setWalk(w);
  }, [walkRef]);
  useEffect(() => api.current?.setScene(scene), [scene]);
  useEffect(() => api.current?.setVariant(variant), [variant]);
  useEffect(() => api.current?.setLamp(kelvin), [kelvin]);

  return <canvas ref={ref} className={className} role="img" aria-label={label} />;
}

/** Draws each project once into an image, for the phone list where seven live canvases would be too many. */
let stillsPromise = null;
export function renderStills(count = 7, w = 800, h = 500) {
  if (stillsPromise) return stillsPromise;
  stillsPromise = new Promise(resolve => {
    try {
      const canvas = document.createElement('canvas');
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
      renderer.setPixelRatio(1);
      renderer.setSize(w, h, false);
      const material = makeMaterial();
      const s = new THREE.Scene();
      s.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
      const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      material.uniforms.uRes.value.set(w, h);
      const out = [];
      const times = [3.2, 7.5, 6.3, 2.4, 5.1, 10.5, 9.0];
      for (let i = 0; i < count; i++) {
        material.uniforms.uScene.value = i;
        material.uniforms.uPrev.value = i;
        material.uniforms.uTime.value = times[i] ?? 6;
        renderer.render(s, cam);
        out.push(canvas.toDataURL('image/jpeg', 0.86));
      }
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
      resolve(out);
    } catch {
      resolve([]);
    }
  });
  return stillsPromise;
}
