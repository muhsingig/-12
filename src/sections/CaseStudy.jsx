import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import SceneCanvas from '../gl/SceneCanvas.jsx';
import CountUp from '../components/reactbits/CountUp.jsx';
import { projects } from '../data/projects.js';
import { useLamp } from '../lib/lamp.js';

export default function CaseStudy({ index, onClose, onGo }) {
  const ref = useRef(null);
  const closeRef = useRef(null);
  const textRef = useRef(null);
  const lastFocus = useRef(null);
  const { kelvin } = useLamp();
  const open = index !== null;
  const p = open ? projects[index] : null;

  useEffect(() => {
    if (!open) return undefined;
    lastFocus.current = lastFocus.current || document.activeElement;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const f = ref.current.querySelectorAll('button, a[href]');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.documentElement.classList.add('is-locked');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('is-locked');
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open && lastFocus.current) {
      lastFocus.current.focus?.({ preventScroll: true });
      lastFocus.current = null;
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(ref.current, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.75, ease: 'expo.out' });
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !textRef.current) return;
    textRef.current.scrollTop = 0;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from(textRef.current.querySelectorAll('[data-in]'), { y: 22, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06, delay: 0.15 });
  }, [index, open]);

  if (!open) return null;
  const prev = projects[(index + projects.length - 1) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <div ref={ref} className="case" role="dialog" aria-modal="true" aria-labelledby="case-h">
      <div className="case-media">
        <SceneCanvas scene={p.scene} kelvin={kelvin} className="case-canvas" label={`${p.title}: ${p.kind}, ${p.place}`} />
      </div>
      <div className="case-text" ref={textRef} data-lenis-prevent>
        <div className="case-bar">
          <button ref={closeRef} type="button" className="case-close" onClick={onClose}>
            Close
          </button>
        </div>
        <h2 id="case-h" className="case-title" data-in>
          {p.title}
        </h2>
        <p className="case-meta" data-in>
          {p.kind}, {p.place}, {p.year}. For {p.client}.
        </p>
        <p className="case-lead" data-in>
          {p.summary}
        </p>
        <dl className="case-facts" data-in>
          {p.facts.map(f => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>
                <CountUp key={p.id + f.label} to={f.value} duration={1.3} separator={f.separator || ''} decimals={f.decimals} />
                {f.suffix || ''}
              </dd>
            </div>
          ))}
        </dl>
        {p.body.map(t => (
          <p key={t.slice(0, 20)} className="case-body" data-in>
            {t}
          </p>
        ))}
        <p className="case-credits" data-in>
          {p.credits}
        </p>
        <div className="case-nav">
          <button type="button" onClick={() => onGo((index + projects.length - 1) % projects.length)}>
            <span>Previous</span> {prev.title}
          </button>
          <button type="button" onClick={() => onGo((index + 1) % projects.length)}>
            <span>Next</span> {next.title}
          </button>
        </div>
      </div>
    </div>
  );
}
