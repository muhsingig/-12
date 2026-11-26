import { useEffect, useRef, useState } from 'react';
import { HeroLight } from '../gl/HeroLight.js';
import { useLamp } from '../lib/lamp.js';
import { kelvinToHex, lampName } from '../lib/light.js';
import Magnet from '../components/reactbits/Magnet.jsx';
import { switchClick } from '../lib/sound.js';

const SWATCHES = Array.from({ length: 12 }, (_, i) => 1800 + (i * (6500 - 1800)) / 11);

export default function Hero() {
  const { kelvin, setKelvin } = useLamp();
  const section = useRef(null);
  const canvas = useRef(null);
  const l1 = useRef(null);
  const l2 = useRef(null);
  const light = useRef(null);
  const [gl, setGl] = useState(false);
  const [lit, setLit] = useState(false);
  const [touch, setTouch] = useState(false);
  const [lampOn, setLampOn] = useState(true);
  const [grabbing, setGrabbing] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia('(hover: none)').matches);
    let hl;
    try {
      hl = new HeroLight(canvas.current);
    } catch {
      setLit(true);
      return undefined;
    }
    light.current = hl;
    if (import.meta.env.DEV) window.__hero = hl;
    setGl(true);
    hl.setKelvin(kelvin);
    const lines = () => [
      { el: l1.current, text: 'ELIN' },
      { el: l2.current, text: 'SOLVIK' }
    ];
    let alive = true;
    // the relief is drawn from the real face, so ask for it by name before drawing: on a cold visit
    // fonts.ready can resolve before the stylesheet has even requested it
    const face = '800 200px "Libre Franklin"';
    const ready = Promise.race([
      document.fonts.load(face, 'ELINSOLVIK').then(() => document.fonts.ready),
      new Promise(r => setTimeout(r, 2500))
    ]).catch(() => {});
    ready.then(() => {
      if (!alive) return;
      hl.layout(lines());
      hl.start();
      hl.intro({ onLit: () => setLit(true) });
    });
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => hl.layout(lines()), 120);
    };
    window.addEventListener('resize', onResize);
    // if the face arrives after the first drawing (slow network), draw the relief again
    const onFonts = () => {
      if (alive && document.fonts.check(face)) onResize();
    };
    document.fonts.addEventListener?.('loadingdone', onFonts);
    const el = section.current;
    const pos = e => {
      const r = el.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
    };
    const isUi = e => e.target.closest('a, button, input, label');
    const onMove = e => {
      const [x, y] = pos(e);
      hl.hover(x, y);
      setNear(hl.distToLamp(x, y) < 0.09);
    };
    const onDown = e => {
      if (isUi(e)) return;
      const [x, y] = pos(e);
      if (hl.grab(x, y)) {
        el.setPointerCapture?.(e.pointerId);
        setGrabbing(true);
      } else {
        hl.hover(x, y);
      }
    };
    const onUp = e => {
      if (!hl.p.grabbed) return;
      const click = hl.release();
      setGrabbing(false);
      el.releasePointerCapture?.(e.pointerId);
      if (click) {
        const on = hl.toggle();
        switchClick(on);
        setLampOn(on);
      }
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    const io = new IntersectionObserver(([e]) => {
      hl.visible = e.isIntersecting;
      if (e.isIntersecting) hl.start();
      else hl.stop();
    });
    io.observe(el);
    return () => {
      alive = false;
      window.removeEventListener('resize', onResize);
      document.fonts.removeEventListener?.('loadingdone', onFonts);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      io.disconnect();
      hl.dispose();
      light.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    light.current?.setKelvin(kelvin);
  }, [kelvin]);

  return (
    <section
      ref={section}
      className={`hero${gl ? ' is-gl' : ''}${lit ? ' is-lit' : ''}${grabbing ? ' is-grabbing' : near ? ' is-near' : ''}`}
      id="top"
    >
      <canvas ref={canvas} className="hero-gl" aria-hidden="true" />
      <header className="hero-top">
        <a className="mono" href="#top" aria-label="Elin Solvik, back to top">
          ES
        </a>
        <nav className="hero-nav" aria-label="Main">
          <a href="#work">Work</a>
          <a href="#about" className="hide-sm">About</a>
          <a href="#rates" className="hide-sm">Rates</a>
          <a className="btn btn-light btn-sm" href="#contact">
            Book a night walk
          </a>
        </nav>
      </header>

      <h1 className="hero-name">
        <span className="hero-line">
          <span ref={l1} className="hero-word hero-word-1">ELIN</span>
        </span>
        <span className="hero-line">
          <span ref={l2} className="hero-word hero-word-2">SOLVIK</span>
        </span>
      </h1>

      <div className="hero-lamp">
        <label htmlFor="kelvin" className="lamp-label">
          Your lamp <output htmlFor="kelvin">{Math.round(kelvin / 50) * 50} K, {lampName(kelvin).toLowerCase()}</output>
        </label>
        <div className="lamp-scale">
          <div className="lamp-swatches" aria-hidden="true">
            {SWATCHES.map(k => (
              <span key={k} style={{ background: kelvinToHex(k) }} />
            ))}
          </div>
          <input
            id="kelvin"
            type="range"
            min="1800"
            max="6500"
            step="50"
            value={kelvin}
            onChange={e => setKelvin(Number(e.target.value))}
            aria-valuetext={`${kelvin} kelvin, ${lampName(kelvin)}`}
          />
        </div>
        <p className="lamp-hint">
          {touch ? 'Drag the lamp to swing it, tap it to switch.' : 'Grab the lamp and swing it. Click it to switch it '}
          {!touch && (lampOn ? 'off.' : 'on.')}
        </p>
        <button
          type="button"
          className="lamp-switch"
          aria-pressed={lampOn}
          onClick={() => {
            const on = light.current ? light.current.toggle() : !lampOn;
            switchClick(on);
            setLampOn(on);
          }}
        >
          {lampOn ? 'Switch the lamp off' : 'Switch the lamp on'}
        </button>
      </div>

      <div className="hero-sub">
        <p>Lighting designer in Stockholm. I make installations, façades and stages for the dark half of the year.</p>
        <Magnet padding={60} magnetStrength={4}>
          <a className="btn btn-lamp" href="#work">
            See the work
          </a>
        </Magnet>
      </div>
    </section>
  );
}
