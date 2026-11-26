import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Gallery } from '../gl/Gallery.js';
import { projects } from '../data/projects.js';

gsap.registerPlugin(ScrollTrigger);

/** Selected work as a dark gallery: scroll walks the length of the wall, one lightbox per project. */
export default function NightGallery({ onOpen }) {
  const ref = useRef(null);
  const canvas = useRef(null);
  const gal = useRef(null);
  const st = useRef(null);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(-1);
  const [failed, setFailed] = useState(false);
  const n = projects.length;

  useEffect(() => {
    let g;
    try {
      g = new Gallery(canvas.current, n);
    } catch {
      setFailed(true);
      return undefined;
    }
    gal.current = g;
    g.resize();
    const ro = new ResizeObserver(() => g.resize());
    ro.observe(canvas.current);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) g.start();
      else g.stop();
    });
    io.observe(canvas.current);
    return () => {
      ro.disconnect();
      io.disconnect();
      g.dispose();
      gal.current = null;
    };
  }, [n]);

  useLayoutEffect(() => {
    st.current = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: self => {
        gal.current?.setProgress(self.progress);
        setActive(Math.round(self.progress * (n - 1)));
      }
    });
    const ctx = gsap.context(() => {
      gsap.from('.gal-head > *, .gal-index', {
        autoAlpha: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.07,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 55%', once: true }
      });
    }, ref);
    return () => {
      st.current?.kill();
      ctx.revert();
    };
  }, [n]);

  const go = i => {
    const s = st.current;
    if (!s) return;
    const y = s.start + ((s.end - s.start) * i) / (n - 1) + 2;
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const toNdc = e => {
    const r = canvas.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1];
  };

  const p = projects[active];

  return (
    <section ref={ref} className="gal" id="work" style={{ '--gal-n': n }} aria-labelledby="gal-h">
      <div className={`gal-stage${hover >= 0 ? ' is-pointing' : ''}`}>
        <canvas
          ref={canvas}
          className="gal-canvas"
          role="img"
          aria-label={`A dark gallery wall with ${n} lightboxes, one per project. ${p.title} is in front of you.`}
          onPointerMove={e => {
            const [x, y] = toNdc(e);
            const g = gal.current;
            if (!g) return;
            g.setPointer(x, y);
            const i = g.pick(x, y);
            g.hovered = i;
            setHover(i);
          }}
          onPointerLeave={() => {
            if (gal.current) gal.current.hovered = -1;
            setHover(-1);
          }}
          onClick={e => {
            const [x, y] = toNdc(e);
            const i = gal.current?.pick(x, y) ?? -1;
            if (i >= 0) onOpen(i);
          }}
        />
        {failed && <div className="gal-fallback">The gallery needs WebGL. The work is listed below.</div>}
        <div className="gal-head">
          <h2 id="gal-h">Selected work</h2>
          <p>Seven pieces of light, 2022 to 2025. Scroll along the wall, click a lightbox to read the case.</p>
        </div>
        <nav className="gal-index" aria-label="Projects">
          {projects.map((x, i) => (
            <button key={x.id} type="button" className={i === active ? 'is-active' : ''} onClick={() => go(i)} aria-current={i === active}>
              {x.title}
            </button>
          ))}
        </nav>
        <div className="gal-caption" key={p.id}>
          <h3 className="gal-title">{p.title}</h3>
          <p className="gal-meta">
            {p.kind}, {p.place}, {p.year}
          </p>
        </div>
        <div className="gal-side" key={`s${p.id}`}>
          <p>{p.summary}</p>
          <button type="button" className="btn btn-lamp" onClick={() => onOpen(active)}>
            Read the case notes
          </button>
        </div>
      </div>
    </section>
  );
}
