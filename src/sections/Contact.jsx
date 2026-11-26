import { useRef } from 'react';
import Magnet from '../components/reactbits/Magnet.jsx';
import VariableProximity from '../components/reactbits/VariableProximity.jsx';
import { useReveal } from '../lib/useReveal.js';

const MAIL =
  'mailto:hej@elinsolvik.se?subject=A%20night%20walk&body=Hej%20Elin%2C%0A%0AThe%20site%20is%3A%20%0AIt%20is%20dark%20there%20from%3A%20%0AWhat%20we%20hope%20people%20feel%3A%20';

function Heavy({ label, area }) {
  // letters gain weight as the pointer comes near, as if warmed by the lamp
  return (
    <VariableProximity
      label={label}
      className="c-vp"
      fromFontVariationSettings="'wght' 500"
      toFontVariationSettings="'wght' 900"
      containerRef={area}
      radius={220}
      falloff="gaussian"
    />
  );
}

export default function Contact() {
  const ref = useRef(null);
  useReveal(ref, { start: 'top 85%' });
  return (
    <section ref={ref} className="contact" id="contact">
      <h2 className="c-row" data-reveal>
        <span>
          <Heavy label="Studio Solvik" area={ref} />
        </span>
      </h2>
      <a className="c-row" href="https://www.google.com/maps/search/?api=1&query=Hornsgatan+64+Stockholm" data-reveal>
        <span>
          <Heavy label="Hornsgatan 64" area={ref} />
        </span>
      </a>
      <p className="c-row" data-reveal>
        <span>
          <Heavy label="118 21 Stockholm" area={ref} />
        </span>
      </p>
      <p className="c-row" data-reveal>
        <span>
          <Heavy label="Visits Tue–Fri, after dark" area={ref} />
        </span>
      </p>
      <a className="c-row" href="tel:+46701740642" data-reveal>
        <span>
          <Heavy label="+46 70 174 06 42" area={ref} />
        </span>
      </a>
      <div className="c-row c-hej" data-reveal>
        <span>
          <Heavy label="Hej" area={ref} />
        </span>
        <Magnet padding={80} magnetStrength={3} wrapperClassName="c-magnet">
          <a className="c-go" href={MAIL} aria-label="Write to Elin by email">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
            </svg>
          </a>
        </Magnet>
      </div>
    </section>
  );
}
