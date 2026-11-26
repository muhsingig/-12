import { useEffect, useState } from 'react';
import { useLamp } from '../lib/lamp.js';
import { switchClick } from '../lib/sound.js';

/** Appears once the hero has gone: the name, the sections, the room's light switch and the one action. */
export default function FixedBar() {
  const { lightsOff, setLightsOff } = useLamp();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('top');
    if (!hero) return undefined;
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting), { threshold: 0.02 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`bar${shown ? ' is-shown' : ''}`} inert={shown ? undefined : ''}>
      <a className="bar-mark" href="#top">
        Elin Solvik
      </a>
      <nav className="bar-nav" aria-label="Sections">
        <a href="#work">Work</a>
        <a href="#midvinter">Midvinter</a>
        <a href="#about">About</a>
        <a href="#rates">Rates</a>
      </nav>
      <button
        type="button"
        className={`rocker${lightsOff ? ' is-off' : ''}`}
        aria-pressed={lightsOff}
        onClick={() => {
          switchClick(lightsOff);
          setLightsOff(!lightsOff);
        }}
      >
        <span className="rocker-plate" aria-hidden="true">
          <span className="rocker-key" />
        </span>
        <span className="rocker-label">{lightsOff ? 'Lights on' : 'Lights off'}</span>
      </button>
      <a className="btn btn-lamp btn-sm bar-cta" href="#contact">
        Book a night walk
      </a>
    </div>
  );
}
