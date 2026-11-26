// Colour temperature → linear-ish sRGB (Tanner Helland's fit), 0..1 per channel.
export function kelvinToRgb(k) {
  const t = k / 100;
  let r, g, b;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = 255;
  }
  const c = v => Math.min(255, Math.max(0, v)) / 255;
  return [c(r), c(g), c(b)];
}

export function kelvinToHex(k) {
  return '#' + kelvinToRgb(k).map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}

export const LAMPS = [
  { k: 1900, name: 'Candle' },
  { k: 2700, name: 'Tungsten' },
  { k: 3200, name: 'Stage' },
  { k: 4200, name: 'Moonlit snow' },
  { k: 5600, name: 'Noon' },
  { k: 6500, name: 'Overcast' }
];

export function lampName(k) {
  let best = LAMPS[0];
  for (const l of LAMPS) if (Math.abs(l.k - k) < Math.abs(best.k - k)) best = l;
  return best.name;
}

// Sunrise / sunset for Stockholm, computed with the sunrise equation (no network needed).
const STHLM = { lat: 59.3293, lon: 18.0686 };
const rad = Math.PI / 180;

export function sunTimes(date = new Date(), { lat, lon } = STHLM) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  // day number of the Stockholm calendar date (UTC+1 is close enough for the day boundary)
  const n = Math.floor(jd + 1 / 24 - 0.5) + 1 - 2451545;
  const jStar = n - lon / 360;
  const M = (357.5291 + 0.98560028 * jStar) % 360;
  const C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const jTransit = 2451545.0 + jStar + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lambda * rad);
  const sinD = Math.sin(lambda * rad) * Math.sin(23.4397 * rad);
  const cosD = Math.cos(Math.asin(sinD));
  const cosW = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * sinD) / (Math.cos(lat * rad) * cosD);
  const w = Math.acos(Math.min(1, Math.max(-1, cosW))) / rad;
  const toDate = j => new Date((j - 2440587.5) * 86400000);
  return { rise: toDate(jTransit - w / 360), set: toDate(jTransit + w / 360) };
}

const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' });
export const stockholmTime = d => fmt.format(d);

export function stockholmToday(now = new Date()) {
  const { rise, set } = sunTimes(now);
  const mins = Math.round((set - rise) / 60000);
  const dark = now < rise || now > set;
  return {
    rise: stockholmTime(rise),
    set: stockholmTime(set),
    now: stockholmTime(now),
    daylight: `${Math.floor(mins / 60)} h ${mins % 60} min`,
    darkHours: Math.round((1440 - mins) / 60),
    dark
  };
}
