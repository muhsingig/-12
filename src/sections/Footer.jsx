import { useEffect, useState } from 'react';
import credits from '../credits.json';
import { stockholmToday, lampName } from '../lib/light.js';
import { useLamp } from '../lib/lamp.js';

function Word({ text, w }) {
  // fitted so the word runs exactly margin to margin
  return (
    <svg className="f-word" viewBox={`0 0 ${w} 100`} preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <text x="0" y="96" textLength={w} lengthAdjust="spacingAndGlyphs">
        {text}
      </text>
    </svg>
  );
}

export default function Footer() {
  const { kelvin } = useLamp();
  const [day, setDay] = useState(() => stockholmToday());
  useEffect(() => {
    const id = setInterval(() => setDay(stockholmToday()), 60000);
    return () => clearInterval(id);
  }, []);
  return (
    <footer className="footer">
      <div className="f-cols">
        <div>
          <p className="f-lead">Studio Solvik</p>
          <p>Hornsgatan 64</p>
          <p>118 21 Stockholm</p>
          <p>
            <a href="mailto:hej@elinsolvik.se">hej@elinsolvik.se</a>
          </p>
        </div>
        <div>
          <p className="f-lead">Index</p>
          <p><a href="#work">Work</a></p>
          <p><a href="#midvinter">Midvinter</a></p>
          <p><a href="#about">About</a></p>
          <p><a href="#rates">Rates</a></p>
        </div>
        <div>
          <p className="f-lead">Tonight in Stockholm</p>
          <p>Sunset {day.set}, sunrise {day.rise}</p>
          <p>{day.daylight} of daylight</p>
          <p>
            Your lamp: {kelvin} K, {lampName(kelvin).toLowerCase()}
          </p>
        </div>
        <div className="f-credits">
          <p className="f-lead">Pictures</p>
          {credits.map(c => (
            <p key={c.img}>
              <a href={c.page} rel="noreferrer" target="_blank">
                {c.title}
              </a>
              , {c.creator}, {c.license}
            </p>
          ))}
        </div>
      </div>
      <div className="f-mark">
        <div className="f-mark-wide">
          <Word text="ELIN SOLVIK" w={760} />
        </div>
        <div className="f-mark-stack">
          <Word text="ELIN" w={272} />
          <Word text="SOLVIK" w={455} />
        </div>
        <p className="f-legal">© 2026 Studio Solvik. Project names, clients and figures are sample work.</p>
      </div>
    </footer>
  );
}
