import { useRef, useState } from 'react';
import SceneCanvas from '../gl/SceneCanvas.jsx';
import CountUp from '../components/reactbits/CountUp.jsx';
import { editions } from '../data/projects.js';
import { useReveal } from '../lib/useReveal.js';

export default function Showcase({ onOpen }) {
  const ref = useRef(null);
  const [ed, setEd] = useState(0);
  useReveal(ref);
  const e = editions[ed];

  return (
    <section ref={ref} className="showcase" id="editions" aria-labelledby="sc-h">
      <figure className="sc-plate" data-reveal>
        <SceneCanvas scene={0} variant={e.variant} className="sc-canvas" label={`Midvinter, ${e.label}: a snow tunnel lit by arches`} />
      </figure>
      <div className="sc-side">
        <div className="sc-tabs" role="tablist" aria-label="Midvinter editions" data-reveal>
          {editions.map((x, i) => (
            <button
              key={x.label}
              role="tab"
              type="button"
              aria-selected={i === ed}
              className={i === ed ? 'is-active' : ''}
              onClick={() => setEd(i)}
            >
              {x.label}
            </button>
          ))}
        </div>
        <div className="sc-copy">
          <h2 id="sc-h" className="sc-title" data-reveal>
            Three winters, three tunnels
          </h2>
          <p className="sc-desc" data-reveal>
            Midvinter is rebuilt from snow every winter, a little longer each time. Pick an edition to see how it was
            lit. {e.text}
          </p>
          <dl className="sc-facts" data-reveal>
            <div>
              <dt>metres of tunnel</dt>
              <dd>
                <CountUp key={`l${ed}`} to={e.length} duration={1.4} />
              </dd>
            </div>
            <div>
              <dt>arches of light</dt>
              <dd>
                <CountUp key={`a${ed}`} to={e.arches} duration={1.4} />
              </dd>
            </div>
          </dl>
        </div>
        <div className="sc-actions" data-reveal>
          <button type="button" className="cell cell-ink" onClick={() => onOpen(0)}>
            Read the case notes
          </button>
          <a
            className="cell cell-tone"
            href="mailto:hej@elinsolvik.se?subject=Midvinter%20in%20our%20town&body=Hej%20Elin%2C%0A%0AWe%20would%20like%20to%20talk%20about%20bringing%20Midvinter%20to%20"
          >
            Bring it to your town
          </a>
        </div>
      </div>
    </section>
  );
}
