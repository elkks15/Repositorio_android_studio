const fs = require('fs');
const path = require('path');

const RATE = 22050;
const outDir = path.join(__dirname, '../assets/sfx');
fs.mkdirSync(outDir, { recursive: true });

function clamp(v) {
  return Math.max(-1, Math.min(1, v));
}

function writeWav(name, samples) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i += 1) {
    data.writeInt16LE(Math.round(clamp(samples[i]) * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(outDir, `${name}.wav`), Buffer.concat([header, data]));
}

function alloc(seconds) {
  return new Array(Math.floor(RATE * seconds)).fill(0);
}

function mix(buf, offsetSec, synth, volume = 1) {
  const start = Math.floor(offsetSec * RATE);
  for (let i = 0; i < synth.length && start + i < buf.length; i += 1) {
    buf[start + i] += synth[i] * volume;
  }
}

function env(i, n, a = 0.02, r = 0.2) {
  const t = i / n;
  if (t < a) return t / a;
  if (t > 1 - r) return Math.max(0, (1 - t) / r);
  return 1;
}

function tone(freq, seconds, type = 'square') {
  const n = Math.floor(RATE * seconds);
  const out = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const ph = (2 * Math.PI * freq * i) / RATE;
    let v = Math.sin(ph);
    if (type === 'square') v = v > 0 ? 1 : -1;
    if (type === 'saw') v = 2 * ((freq * i) / RATE - Math.floor((freq * i) / RATE + 0.5));
    if (type === 'tri') v = 1 - 4 * Math.abs(Math.round((freq * i) / RATE) - (freq * i) / RATE);
    if (type === 'noise') v = Math.random() * 2 - 1;
    out[i] = v * env(i, n) * 0.32;
  }
  return out;
}

function noise(seconds, color = 1) {
  const n = Math.floor(RATE * seconds);
  const out = new Array(n);
  let last = 0;
  for (let i = 0; i < n; i += 1) {
    const white = Math.random() * 2 - 1;
    last = last * (1 - color) + white * color;
    out[i] = last * env(i, n, 0.01, 0.35) * 0.4;
  }
  return out;
}

function sweep(from, to, seconds, type = 'square') {
  const n = Math.floor(RATE * seconds);
  const out = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const f = from + (to - from) * (i / n);
    const ph = (2 * Math.PI * f * i) / RATE;
    let v = Math.sin(ph);
    if (type === 'square') v = Math.sin(ph) > 0 ? 1 : -1;
    out[i] = v * env(i, n, 0.01, 0.25) * 0.3;
  }
  return out;
}

function seq(notes) {
  const parts = notes.map(([f, d]) => tone(f, d));
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Array(total).fill(0);
  let o = 0;
  for (const p of parts) {
    for (let i = 0; i < p.length; i += 1) out[o + i] = p[i];
    o += p.length;
  }
  return out;
}

writeWav('tap', tone(880, 0.05, 'square'));
writeWav('smash', (() => {
  const buf = alloc(0.22);
  mix(buf, 0, noise(0.18, 0.6), 0.9);
  mix(buf, 0, sweep(220, 70, 0.2, 'sine'), 1.2);
  return buf;
})());
writeWav('combo', seq([
  [523, 0.07],
  [659, 0.07],
  [784, 0.07],
  [1046, 0.12],
]));
writeWav('win', seq([
  [523, 0.1],
  [659, 0.1],
  [784, 0.1],
  [1046, 0.22],
]));
writeWav('lose', seq([
  [392, 0.12],
  [330, 0.12],
  [262, 0.22],
]));
writeWav('event', (() => {
  const buf = alloc(0.45);
  mix(buf, 0, tone(980, 0.12, 'square'), 0.8);
  mix(buf, 0.12, tone(740, 0.12, 'square'), 0.8);
  mix(buf, 0.24, tone(980, 0.18, 'square'), 0.9);
  return buf;
})());
writeWav('dice', (() => {
  const buf = alloc(0.55);
  for (let i = 0; i < 8; i += 1) {
    mix(buf, i * 0.06, noise(0.05, 0.9), 0.8);
    mix(buf, i * 0.06, tone(400 + i * 40, 0.04, 'square'), 0.4);
  }
  return buf;
})());
writeWav('match', seq([
  [784, 0.08],
  [1046, 0.16],
]));
writeWav('flip', tone(620, 0.06, 'tri'));
writeWav('place', tone(440, 0.08, 'square'));
writeWav('boss', (() => {
  const buf = alloc(0.2);
  mix(buf, 0, noise(0.16, 0.5), 1);
  mix(buf, 0, sweep(140, 50, 0.18, 'sine'), 1.3);
  return buf;
})());
writeWav('crit', seq([
  [880, 0.05],
  [1320, 0.06],
  [1760, 0.1],
]));
writeWav('jackpot', seq([
  [523, 0.08],
  [659, 0.08],
  [784, 0.08],
  [1046, 0.08],
  [1318, 0.18],
]));
writeWav('unlock', seq([
  [392, 0.1],
  [523, 0.1],
  [659, 0.1],
  [784, 0.1],
  [1046, 0.28],
]));
writeWav('spin', (() => {
  const buf = alloc(0.35);
  mix(buf, 0, sweep(200, 900, 0.35, 'square'), 0.8);
  mix(buf, 0, noise(0.35, 0.4), 0.25);
  return buf;
})());
writeWav('miss', tone(160, 0.18, 'square'));
writeWav('boom', (() => {
  const buf = alloc(0.5);
  mix(buf, 0, noise(0.4, 0.35), 1.1);
  mix(buf, 0, sweep(180, 40, 0.45, 'sine'), 1.4);
  return buf;
})());
writeWav('intro', seq([
  [262, 0.12],
  [330, 0.12],
  [392, 0.12],
  [523, 0.28],
]));

console.log('sfx written to', outDir);
