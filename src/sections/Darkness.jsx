import { useEffect, useRef } from 'react';

/** With the lights off the page goes dark and the visitor's lamp is the only light: a pool that follows the pointer. */
export default function Darkness({ on }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!on) return undefined;
    const pos = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2 };
    let raf = 0;
    const move = e => {
      const p = e.touches ? e.touches[0] : e;
      pos.tx = p.clientX;
      pos.ty = p.clientY;
    };
    const tick = () => {
      pos.x += (pos.tx - pos.x) * 0.18;
      pos.y += (pos.ty - pos.y) * 0.18;
      document.documentElement.style.setProperty('--mx', `${pos.x.toFixed(1)}px`);
      document.documentElement.style.setProperty('--my', `${pos.y.toFixed(1)}px`);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('touchmove', move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('touchmove', move);
    };
  }, [on]);

  return (
    <div ref={ref} className={`darkness${on ? ' is-on' : ''}`} aria-hidden="true">
      <div className="darkness-shade" />
      <div className="darkness-tint" />
    </div>
  );
}
