// A wall switch, synthesised: a short bright tick over a low thump. Only ever played in answer to a
// click, so browsers allow it without a gesture prompt.
let ctx = null;

export function switchClick(on = true) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.value = 0.22;
    out.connect(ctx.destination);

    const len = Math.floor(ctx.sampleRate * 0.03);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = on ? 3400 : 2600;
    bp.Q.value = 2.5;
    noise.connect(bp).connect(out);
    noise.start(t);

    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.frequency.setValueAtTime(on ? 140 : 110, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.05);
    og.gain.setValueAtTime(0.5, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(og).connect(out);
    osc.start(t);
    osc.stop(t + 0.07);
  } catch {
    /* no audio, no matter */
  }
}
