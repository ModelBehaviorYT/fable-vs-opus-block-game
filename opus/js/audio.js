// All sounds synthesized with WebAudio
export const Sound = {
  ctx: null, master: null, vol: 0.8, noiseBuf: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    this.master = this.ctx.createGain(); this.master.gain.value = this.vol; this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 1.5; this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  },
  setVol(v) { this.vol = v; if (this.master) this.master.gain.value = v; },
  noise(dur, type, freq, q, gain, when = 0, sweepTo) {
    const c = this.ctx; if (!c) return; const t = c.currentTime + when;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t, Math.random() * 0.5, dur + 0.05);
  },
  tone(type, f0, f1, dur, gain, when = 0, vib = 0) {
    const c = this.ctx; if (!c) return; const t = c.currentTime + when;
    const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.02); g.gain.setValueAtTime(gain, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let lfo;
    if (vib) { lfo = c.createOscillator(); lfo.frequency.value = vib; const lg = c.createGain(); lg.gain.value = f0 * 0.06; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + dur); }
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400;
    o.connect(f); f.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.05);
  },
  // gentle procedural ambient music: soft piano-like phrases with long pauses
  musicT: 20,
  piano(freq, when, dur, gain) {
    const c = this.ctx; if (!c) return; const t = c.currentTime + when;
    for (const [mult, g] of [[1, 1], [2, 0.25], [3, 0.08]]) {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq * mult;
      const gn = c.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(gain * g, t + 0.015); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(gn); gn.connect(this.master); o.start(t); o.stop(t + dur + 0.05);
    }
  },
  updateMusic(dt, night) {
    if (!this.ctx) return; this.musicT -= dt; if (this.musicT > 0) return;
    this.musicT = 90 + Math.random() * 150;
    const scale = night ? [220, 246.9, 261.6, 329.6, 349.2, 440, 493.9, 523.3] : [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3];
    let t = 0; const bars = 6 + Math.random() * 6 | 0; let idx = Math.random() * scale.length | 0;
    for (let b = 0; b < bars; b++) {
      const root = scale[(idx + 8) % scale.length] / 2; this.piano(root, t, 3.5, 0.05); this.piano(root * 1.5, t + 0.05, 3.2, 0.03);
      const notes = 2 + Math.random() * 3 | 0;
      for (let n = 0; n < notes; n++) { idx = Math.max(0, Math.min(scale.length - 1, idx + (Math.random() * 5 | 0) - 2)); this.piano(scale[idx], t + n * (0.6 + Math.random() * 0.5), 2.6, 0.06); }
      t += 2.6 + Math.random() * 1.2;
    }
  },
  // material-based sounds
  mat(m, kind) {
    const k = kind === 'step' ? 0.35 : kind === 'hit' ? 0.3 : 1;
    const dur = kind === 'break' ? 0.22 : kind === 'place' ? 0.12 : 0.09;
    switch (m) {
      case 'grass': this.noise(dur, 'lowpass', 1400, 0.7, 0.5 * k); break;
      case 'sand': this.noise(dur, 'highpass', 2500, 0.5, 0.35 * k); this.noise(dur, 'lowpass', 900, 0.5, 0.2 * k); break;
      case 'snow': this.noise(dur, 'bandpass', 1800, 0.8, 0.4 * k); break;
      case 'wood': this.noise(dur, 'bandpass', 500, 2.5, 0.8 * k); this.tone('triangle', 220, 160, dur * 0.8, 0.15 * k); break;
      case 'glass': this.tone('sine', 1900, 1500, 0.15, 0.2 * k); this.noise(0.25, 'highpass', 4000, 1, 0.3 * k); break;
      case 'wool': this.noise(dur, 'lowpass', 700, 0.5, 0.4 * k); break;
      default: this.noise(dur, 'bandpass', 1100, 1.6, 0.7 * k); this.noise(dur * 0.6, 'highpass', 3000, 0.7, 0.2 * k); break;
    }
  },
  play(name) {
    if (!this.ctx) return;
    const R = Math.random;
    switch (name) {
      case 'pop': this.tone('sine', 700 + R() * 300, 1400 + R() * 300, 0.07, 0.25); break;
      case 'hurt': this.tone('square', 330, 180, 0.18, 0.15); this.noise(0.12, 'bandpass', 900, 1, 0.3); break;
      case 'eat': for (let i = 0; i < 4; i++) this.noise(0.08, 'bandpass', 1300 + R() * 600, 1.5, 0.4, i * 0.12); break;
      case 'burp': this.tone('sawtooth', 120, 90, 0.3, 0.15); break;
      case 'click': this.tone('square', 900, 700, 0.04, 0.12); break;
      case 'splash': this.noise(0.5, 'lowpass', 2000, 0.6, 0.5, 0, 300); break;
      case 'fuse': this.noise(1.4, 'highpass', 3000, 0.5, 0.25); break;
      case 'explode': this.noise(1.4, 'lowpass', 900, 0.8, 1.0, 0, 60); this.tone('sine', 80, 30, 0.9, 0.6); break;
      case 'bow': this.noise(0.15, 'bandpass', 600, 2, 0.4); this.tone('triangle', 300, 120, 0.15, 0.15); break;
      case 'cow': this.tone('sawtooth', 150 + R() * 20, 110, 0.9, 0.18, 0, 5); break;
      case 'pig': for (let i = 0; i < 2; i++) this.tone('square', 260 + R() * 60, 180, 0.12, 0.1, i * 0.15); break;
      case 'sheep': this.tone('sawtooth', 380 + R() * 40, 330, 0.6, 0.12, 0, 22); break;
      case 'chest': this.tone('sawtooth', 140, 90, 0.35, 0.08); this.noise(0.3, 'bandpass', 700, 4, 0.2); break;
      case 'levelup': [523, 659, 784, 1047].forEach((f,i) => this.tone('square', f, f, 0.12, 0.08, i*0.08)); break;
      case 'cave': { const f = 70 + R() * 60; this.tone('sine', f, f * (0.6 + R() * 0.8), 3.5, 0.12, 0, 0.7); this.noise(3, 'bandpass', 200 + R() * 300, 6, 0.06); break; }
      case 'golem': this.noise(0.3, 'lowpass', 300, 2, 0.4); this.tone('square', 70, 50, 0.25, 0.1); break;
      case 'slime': this.noise(0.12, 'lowpass', 500, 2, 0.35); this.tone('sine', 140, 90, 0.12, 0.15); break;
      case 'wolf': this.tone('sawtooth', 420 + R() * 60, 260, 0.1, 0.12); this.noise(0.08, 'bandpass', 900, 2, 0.2); this.tone('sawtooth', 400, 250, 0.1, 0.1, 0.18); break;
      case 'villager': this.tone('sawtooth', 180 + R() * 40, 140, 0.25, 0.1, 0, 8); this.tone('sawtooth', 160, 200, 0.2, 0.08, 0.25, 6); break;
      case 'chicken': for (let i = 0; i < 3; i++) this.tone('square', 900 + R() * 300, 700, 0.05, 0.07, i * 0.09); break;
      case 'zombie': this.tone('sawtooth', 110 + R() * 20, 70, 1.0, 0.18, 0, 3); this.noise(0.8, 'lowpass', 400, 1, 0.15); break;
      case 'skeleton': for (let i = 0; i < 5; i++) this.noise(0.04, 'bandpass', 2500 + R() * 1000, 4, 0.35, i * 0.07); break;
      case 'spider': this.noise(0.5, 'bandpass', 2500, 3, 0.25); this.tone('sawtooth', 200, 140, 0.3, 0.06); break;
      case 'mobhurt': this.tone('square', 400 + R() * 100, 200, 0.15, 0.12); break;
      case 'death': this.tone('sawtooth', 300, 60, 0.6, 0.15); break;
      case 'swim': this.noise(0.25, 'lowpass', 800, 0.7, 0.2); break;
      case 'lava': this.noise(0.12, 'lowpass', 300, 3, 0.25); break;
      case 'fizz': this.noise(0.4, 'highpass', 2000, 1, 0.3); break;
      case 'craft': this.noise(0.1, 'bandpass', 800, 2, 0.3); break;
    }
  }
};
