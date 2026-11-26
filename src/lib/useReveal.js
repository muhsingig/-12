import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Parts of a section marked [data-reveal] rise in, in document order, once, as the section enters. */
export function useReveal(ref, { start = 'top 78%' } = {}) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const groups = new Map();
        el.querySelectorAll('[data-reveal]').forEach(node => {
          const key = node.closest('[data-reveal-group]') || el;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(node);
        });
        groups.forEach((nodes, trigger) => {
          gsap.from(nodes, {
            y: 26,
            autoAlpha: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.075,
            scrollTrigger: { trigger, start, once: true }
          });
        });
      });
    }, el);
    return () => ctx.revert();
  }, [ref, start]);
}
