import ScrollVelocity from '../components/reactbits/ScrollVelocity.jsx';
import { LAMPS, kelvinToHex } from '../lib/light.js';
import { projects } from '../data/projects.js';

const nf = new Intl.NumberFormat('en-GB');

/** Two ribbons that run with the scroll: the colour temperatures, each in its own light, and the work. */
export default function KelvinBand() {
  const temps = (
    <span className="kb-row">
      {LAMPS.map(l => (
        <span key={l.k} className="kb-item">
          <span style={{ color: kelvinToHex(l.k) }}>{nf.format(l.k)} K</span> {l.name.toLowerCase()}
        </span>
      ))}
    </span>
  );
  const work = (
    <span className="kb-row">
      {projects.map(p => (
        <span key={p.id} className="kb-item">
          {p.title}
        </span>
      ))}
    </span>
  );
  return (
    <div className="kb" aria-hidden="true">
      <ScrollVelocity
        texts={[temps, work]}
        velocity={38}
        numCopies={4}
        className="kb-text"
        parallaxClassName="kb-parallax"
        scrollerClassName="kb-scroller"
      />
    </div>
  );
}
