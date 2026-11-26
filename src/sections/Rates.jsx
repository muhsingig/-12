import { useRef } from 'react';
import SplitText from '../components/reactbits/SplitText.jsx';
import { rates } from '../data/projects.js';
import { useReveal } from '../lib/useReveal.js';

export default function Rates() {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section ref={ref} className="rates" id="rates">
      <SplitText
        tag="h2"
        text="What working together costs"
        className="rates-title"
        splitType="lines"
        textAlign="left"
        duration={0.9}
        delay={90}
      />
      <div className="rates-body">
        <figure className="rates-photo" data-reveal>
          <img src="/img/lighthouse.jpg" width="1200" height="1500" alt="A white lighthouse with its lamp lit under a starry sky" loading="lazy" />
        </figure>
        <p className="rates-label" data-reveal>Rates</p>
        <div className="rates-table" data-reveal-group>
          <table>
            <caption className="sr-only">Rates for commissions, stage and studio work</caption>
            {rates.map(g => (
              <tbody key={g.group}>
                <tr className="rates-group" data-reveal>
                  <th colSpan="3" scope="rowgroup">{g.group}</th>
                </tr>
                {g.items.map(r => (
                  <tr key={r.kind + r.what} data-reveal>
                    <th scope="row">{r.kind}</th>
                    <td>{r.what}</td>
                    <td className="rates-price">{r.price}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
          <p className="rates-note" data-reveal>
            Prices are before VAT and hardware. Every commission starts with a night walk on site, and its fee comes off the
            first invoice.
          </p>
        </div>
      </div>
    </section>
  );
}
