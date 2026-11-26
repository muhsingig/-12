import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SceneCanvas from '../gl/SceneCanvas.jsx';
import { kelvinToHex } from '../lib/light.js';

gsap.registerPlugin(ScrollTrigger);

const ARCHES = 96;
const SWATCHES = Array.from({ length: 16 }, (_, i) => 5200 - (i * (5200 - 1800)) / 15);
const nf = new Intl.NumberFormat('en-GB');

function lightName(k) {
  if (k > 4700) return 'Overcast noon';
  if (k > 3900) return 'Late morning';
  if (k > 3100) return 'Low morning sun';
  if (k > 2350) return 'Sunrise';
  return 'Before dawn, by candle';
}

/** Scroll walks the visitor through the 412 metres of Midvinter; the day runs backwards as you go. */
export default function MidvinterWalk() {
  const ref = useRef(null);
  const walk = useRef(null);
  const metres = useRef(null);
  const kelvin = useRef(null);
  const name = useRef(null);
  const clock = useRef(null);
  const marker = useRef(null);
  const end = useRef(null);

  useLayoutEffect(() => {
    const paint = p => {
      const k = 5200 - (5200 - 1800) * p;
      walk.current?.(p * (ARCHES + 1.2));
      if (metres.current) metres.current.textContent = nf.format(Math.round(p * 412));
      if (kelvin.current) {
        kelvin.current.textContent = `${nf.format(Math.round(k / 50) * 50)} K`;
        kelvin.current.style.color = kelvinToHex(k);
      }
      if (name.current) name.current.textContent = lightName(k);
      if (clock.current) {
        const mins = Math.round((12 - p * 7) * 60);
        clock.current.textContent = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
      }
      if (marker.current) marker.current.style.left = `${(p * 100).toFixed(2)}%`;
      if (end.current) end.current.style.opacity = p > 0.96 ? '1' : '0';
    };
    paint(0);
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: self => paint(self.progress)
    });
    const ctx = gsap.context(() => {
      gsap.from('.walk-hud > *', {
        autoAlpha: 0,
        y: 24,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 60%', once: true }
      });
    }, ref);
    return () => {
      st.kill();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={ref} className="walk" id="midvinter" aria-labelledby="walk-h">
      <div className="walk-stage">
        <SceneCanvas scene={0} walkRef={walk} className="walk-canvas" label="Walking through Midvinter, a snow tunnel of 96 arches of light" />
        <div className="walk-hud">
          <div className="walk-head">
            <h2 id="walk-h">Midvinter: a day, walked backwards</h2>
            <p>
              Scroll to walk the tunnel in Kiruna. Its 96 arches run the light of a day in reverse, from overcast noon at
              the entrance to one candle before dawn.
            </p>
          </div>
          <div className="walk-read">
            <div>
              <span className="walk-big" ref={metres}>
                0
              </span>
              <span className="walk-small">metres of 412</span>
            </div>
            <div>
              <span className="walk-big" ref={kelvin}>
                5,200 K
              </span>
              <span className="walk-small" ref={name}>
                Overcast noon
              </span>
            </div>
            <div className="walk-clock">
              <span className="walk-big" ref={clock}>
                12:00
              </span>
              <span className="walk-small">the light of this hour</span>
            </div>
          </div>
          <div className="walk-strip" aria-hidden="true">
            {SWATCHES.map(k => (
              <span key={k} style={{ background: kelvinToHex(k) }} />
            ))}
            <i ref={marker} />
          </div>
          <p className="walk-end" ref={end}>
            You reached the candle. Turn around and it is noon again.
          </p>
        </div>
      </div>
    </section>
  );
}
