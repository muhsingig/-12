import { useEffect, useRef, useState } from 'react';
import ScrollReveal from '../components/reactbits/ScrollReveal.jsx';
import { stockholmToday } from '../lib/light.js';
import { useReveal } from '../lib/useReveal.js';

const STATEMENT =
  'Stockholm gets six hours of daylight in December. The other eighteen are my working day: I light the tunnels, harbours, stages and reading rooms people cross in the dark.';

export default function Intro() {
  const ref = useRef(null);
  const [day, setDay] = useState(() => stockholmToday());
  useReveal(ref);
  useEffect(() => {
    const id = setInterval(() => setDay(stockholmToday()), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <section ref={ref} className="intro" aria-label="Introduction">
      <div className="intro-grid">
        <ScrollReveal
          as="p"
          containerClassName="intro-statement"
          textClassName="intro-statement-text"
          baseOpacity={0.16}
          enableBlur={false}
          baseRotation={0}
          highlightColor="var(--lamp-deep)"
          wordAnimationEnd="center 45%"
        >
          {STATEMENT}
        </ScrollReveal>
        <p className="intro-body" data-reveal>
          You rarely notice the light itself, only that you walked slower, looked up and stayed a little longer. That is the
          brief I write for every client, whatever they first asked for: a façade, a festival, a lobby, a tour.
        </p>
        <figure className="intro-photo" data-reveal>
          <img src="/img/stockholm-night.jpg" width="1600" height="1183" alt="A Stockholm street at night, strung with lights under a sign reading God helg" loading="lazy" />
          <figcaption>Stockholm, a December evening.</figcaption>
        </figure>
        <p className="intro-note" data-reveal>
          Today in Stockholm the sun rises at {day.rise} and sets at {day.set}: {day.daylight} of daylight. It is {day.now} there
          now{day.dark ? ', and dark' : ', and light, for now'}.
        </p>
      </div>
    </section>
  );
}
