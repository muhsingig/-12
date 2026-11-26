import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { teachers } from '../data/projects.js';

export default function About() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // each picture drifts a little slower than the page, so it seems to pass behind the title
        gsap.utils.toArray('.teacher img').forEach(img => {
          gsap.fromTo(
            img,
            { yPercent: -6, scale: 1.12 },
            { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } }
          );
        });
        gsap.from('.about-title', {
          autoAlpha: 0,
          y: 40,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 70%', once: true }
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="about" id="about" aria-labelledby="about-h">
      <div className="about-stage">
      <div className="about-pin">
        <h2 id="about-h" className="about-title">
          Taught
          <br />
          by light
        </h2>
      </div>
      <div className="about-track">
        {teachers.map((t, i) => (
          <figure key={t.name} className={`teacher ${i % 2 ? 'teacher-r' : 'teacher-l'}`}>
            <div className="teacher-img">
              <img
                src={t.img}
                alt={t.name}
                loading="lazy"
                width={t.w}
                height={t.h}
                className={t.invert ? 'is-inverted' : undefined}
                style={{ objectPosition: t.pos }}
              />
            </div>
            <figcaption>
              <strong>{t.name}</strong>
              <span>{t.role}</span>
              <p>{t.text}</p>
            </figcaption>
          </figure>
        ))}
        <div className="about-bio">
          <p>
            Elin Solvik trained in architectural lighting in Stockholm and in theatre lighting in Copenhagen. Twelve years of
            work, the last six on her own, from a studio on Hornsgatan with one north window.
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}
