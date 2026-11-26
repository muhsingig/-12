import { useEffect, useMemo, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ClickSpark from './components/reactbits/ClickSpark.jsx';
import { LampContext } from './lib/lamp.js';
import { kelvinToHex } from './lib/light.js';
import Hero from './sections/Hero.jsx';
import Intro from './sections/Intro.jsx';
import NightGallery from './sections/NightGallery.jsx';
import MidvinterWalk from './sections/MidvinterWalk.jsx';
import KelvinBand from './sections/KelvinBand.jsx';
import FixedBar from './sections/FixedBar.jsx';
import Darkness from './sections/Darkness.jsx';
import Showcase from './sections/Showcase.jsx';
import About from './sections/About.jsx';
import Rates from './sections/Rates.jsx';
import Contact from './sections/Contact.jsx';
import Footer from './sections/Footer.jsx';
import CaseStudy from './sections/CaseStudy.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [kelvin, setKelvin] = useState(2700);
  const [open, setOpen] = useState(null);
  const [lightsOff, setLightsOff] = useState(false);
  const [lenis, setLenis] = useState(null);
  const hex = kelvinToHex(kelvin);

  useEffect(() => {
    document.documentElement.style.setProperty('--lamp', hex);
  }, [hex]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const l = new Lenis({ duration: 1.15, smoothWheel: true });
    l.on('scroll', ScrollTrigger.update);
    const tick = time => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(l);
    window.__lenis = l;
    // in-page links glide instead of jumping
    const onClick = e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      const target = id.length > 1 && document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      l.scrollTo(target, { offset: 0 });
      history.replaceState(null, '', id);
    };
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(tick);
      l.destroy();
      window.__lenis = null;
    };
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (open === null) lenis.start();
    else lenis.stop();
  }, [open, lenis]);

  const lamp = useMemo(() => ({ kelvin, setKelvin, hex, lightsOff, setLightsOff }), [kelvin, hex, lightsOff]);

  return (
    <LampContext.Provider value={lamp}>
      <ClickSpark sparkColor={hex} sparkSize={9} sparkRadius={22} sparkCount={9} duration={420} style={{ height: 'auto' }}>
        <a className="skip" href="#work">Skip to the work</a>
        <FixedBar />
        <main className="page">
          <Hero />
          <KelvinBand />
          <Intro />
          <NightGallery onOpen={setOpen} />
          <MidvinterWalk />
          <Showcase onOpen={setOpen} />
          <About />
          <Rates />
          <Contact />
        </main>
        <Footer />
      </ClickSpark>
      <Darkness on={lightsOff} />
      <CaseStudy index={open} onClose={() => setOpen(null)} onGo={setOpen} />
    </LampContext.Provider>
  );
}
