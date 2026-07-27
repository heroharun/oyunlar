export type MusicState =
  | 'idle'
  | 'investigation'
  | 'suspicion'
  | 'critical'
  | 'success'
  | 'failure';

export type SfxName =
  | 'tap'
  | 'card'
  | 'correct'
  | 'wrong'
  | 'confirm'
  | 'radio'
  | 'stamp'
  | 'badge';

interface AudioSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

interface MusicLayers {
  drone: GainNode;
  pulse: GainNode;
  tension: GainNode;
  pulseLfo: OscillatorNode;
  droneOsc: OscillatorNode;
}

const SETTINGS_KEY = 'teskilat_audio_v1';
const XFADE = 1.2; // katmanlar arası yumuşak geçiş süresi (sn)

/** Duruma göre katman hedef seviyeleri ve nabız hızı (GDD §11.3). */
const STATE_MIX: Record<MusicState, { drone: number; pulse: number; tension: number; bpmHz: number }> = {
  idle: { drone: 0.10, pulse: 0.030, tension: 0.000, bpmHz: 0.9 },
  investigation: { drone: 0.11, pulse: 0.050, tension: 0.012, bpmHz: 1.3 },
  suspicion: { drone: 0.12, pulse: 0.065, tension: 0.030, bpmHz: 1.7 },
  critical: { drone: 0.14, pulse: 0.085, tension: 0.055, bpmHz: 2.5 },
  success: { drone: 0.09, pulse: 0.025, tension: 0.000, bpmHz: 0.8 },
  failure: { drone: 0.08, pulse: 0.015, tension: 0.020, bpmHz: 0.6 }
};

/**
 * Veri odaklı ses yöneticisi (GDD §11, §20, §33).
 * Tüm sesler WebAudio ile sentezlenir; ses dosyası yoktur, dolayısıyla
 * yükleme hatası da olamaz. Her çağrı try/catch ile korunur: ses hiçbir
 * durumda oyunu çökertmez. Mobil autoplay kısıtı için ilk kullanıcı
 * etkileşiminde unlock() çağrılır.
 */
class AudioManagerImpl {
  private ctx: AudioContext | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private layers: MusicLayers | null = null;
  private state: MusicState = 'idle';
  private settings: AudioSettings = this.loadSettings();
  private unlocked = false;

  /** İlk dokunuş/tuş sonrası çağrılır; AudioContext'i başlatır. */
  unlock(): void {
    try {
      if (!this.ctx) {
        const Ctor = window.AudioContext ?? window.webkitAudioContext;
        if (!Ctor) return;
        this.ctx = new Ctor();
        this.buildGraph();
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      this.unlocked = true;
      this.applyState(this.state, true);
    } catch {
      /* ses yoksa oyun sessiz devam eder */
    }
  }

  setState(next: MusicState): void {
    this.state = next;
    if (!this.unlocked) return;
    try {
      this.applyState(next, false);
      if (next === 'success') this.motif([392, 523, 659], 0.16, 0.05);
      if (next === 'failure') this.motif([220, 185], 0.3, 0.04);
    } catch {
      /* sessiz fallback */
    }
  }

  play(name: SfxName): void {
    if (!this.unlocked || !this.settings.sfxEnabled) return;
    try {
      this.synthSfx(name);
    } catch {
      /* sessiz fallback */
    }
  }

  get musicEnabled(): boolean {
    return this.settings.musicEnabled;
  }

  get sfxEnabled(): boolean {
    return this.settings.sfxEnabled;
  }

  toggleMusic(): boolean {
    this.settings.musicEnabled = !this.settings.musicEnabled;
    this.persistSettings();
    try {
      this.applyState(this.state, true);
    } catch {
      /* yoksay */
    }
    return this.settings.musicEnabled;
  }

  toggleSfx(): boolean {
    this.settings.sfxEnabled = !this.settings.sfxEnabled;
    this.persistSettings();
    return this.settings.sfxEnabled;
  }

  /* ── iç yapı ── */

  private buildGraph(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 1;
    this.musicBus.connect(ctx.destination);
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.5;
    this.sfxBus.connect(ctx.destination);

    // Katman 1: alçak drone (testere dişi + alçak geçiren süzgeç)
    const droneOsc = ctx.createOscillator();
    droneOsc.type = 'sawtooth';
    droneOsc.frequency.value = 55;
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 220;
    const drone = ctx.createGain();
    drone.gain.value = 0;
    droneOsc.connect(droneFilter).connect(drone).connect(this.musicBus);
    droneOsc.start();

    // Katman 2: nabız (üçgen osilatör, kare LFO ile vuruş hissi)
    const pulseOsc = ctx.createOscillator();
    pulseOsc.type = 'triangle';
    pulseOsc.frequency.value = 110;
    const pulseAmp = ctx.createGain();
    pulseAmp.gain.value = 0;
    const pulseLfo = ctx.createOscillator();
    pulseLfo.type = 'square';
    pulseLfo.frequency.value = 1;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 1;
    pulseLfo.connect(lfoDepth).connect(pulseAmp.gain);
    const pulse = ctx.createGain();
    pulse.gain.value = 0;
    pulseOsc.connect(pulseAmp).connect(pulse).connect(this.musicBus);
    pulseOsc.start();
    pulseLfo.start();

    // Katman 3: gerilim (detune ikili ince saw, yüksek geçiren)
    const t1 = ctx.createOscillator();
    t1.type = 'sawtooth';
    t1.frequency.value = 440;
    const t2 = ctx.createOscillator();
    t2.type = 'sawtooth';
    t2.frequency.value = 443;
    const tFilter = ctx.createBiquadFilter();
    tFilter.type = 'highpass';
    tFilter.frequency.value = 900;
    const tension = ctx.createGain();
    tension.gain.value = 0;
    t1.connect(tFilter);
    t2.connect(tFilter);
    tFilter.connect(tension).connect(this.musicBus);
    t1.start();
    t2.start();

    this.layers = { drone, pulse, tension, pulseLfo, droneOsc };
  }

  private applyState(next: MusicState, instant: boolean): void {
    const ctx = this.ctx;
    const layers = this.layers;
    if (!ctx || !layers) return;
    const mix = STATE_MIX[next];
    const mute = !this.settings.musicEnabled;
    const t = ctx.currentTime;
    const dur = instant ? 0.05 : XFADE;
    const ramp = (node: GainNode, target: number): void => {
      node.gain.cancelScheduledValues(t);
      node.gain.setValueAtTime(node.gain.value, t);
      node.gain.linearRampToValueAtTime(mute ? 0 : target, t + dur);
    };
    ramp(layers.drone, mix.drone);
    ramp(layers.pulse, mix.pulse);
    ramp(layers.tension, mix.tension);
    layers.pulseLfo.frequency.setTargetAtTime(mix.bpmHz, t, 0.3);
    layers.droneOsc.frequency.setTargetAtTime(next === 'failure' ? 49 : 55, t, 0.5);
  }

  /** Kısa melodik motif (başarı/başarısızlık, GDD §11.2 katman 4-5). */
  private motif(freqs: number[], noteDur: number, vol: number): void {
    const ctx = this.ctx;
    const bus = this.musicBus;
    if (!ctx || !bus || !this.settings.musicEnabled) return;
    freqs.forEach((f, i) => {
      const t = ctx.currentTime + i * noteDur;
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + noteDur * 2.2);
      o.connect(g).connect(bus);
      o.start(t);
      o.stop(t + noteDur * 2.4);
    });
  }

  private synthSfx(name: SfxName): void {
    const ctx = this.ctx;
    const bus = this.sfxBus;
    if (!ctx || !bus) return;
    const t = ctx.currentTime;
    const tone = (
      freq: number,
      dur: number,
      vol: number,
      type: OscillatorType = 'square',
      delay = 0
    ): void => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
      o.connect(g).connect(bus);
      o.start(t + delay);
      o.stop(t + delay + dur + 0.02);
    };
    const noise = (dur: number, vol: number, freq: number, delay = 0): void => {
      const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
      src.connect(f).connect(g).connect(bus);
      src.start(t + delay);
    };
    switch (name) {
      case 'tap':
        tone(660, 0.06, 0.12);
        break;
      case 'card':
        noise(0.09, 0.18, 1800);
        break;
      case 'correct':
        tone(523, 0.09, 0.12, 'triangle');
        tone(784, 0.14, 0.12, 'triangle', 0.08);
        break;
      case 'wrong':
        tone(160, 0.18, 0.14, 'sawtooth');
        break;
      case 'confirm':
        tone(440, 0.08, 0.12, 'triangle');
        tone(587, 0.12, 0.12, 'triangle', 0.07);
        break;
      case 'radio':
        noise(0.12, 0.14, 1200);
        noise(0.1, 0.1, 2400, 0.16);
        break;
      case 'stamp':
        tone(90, 0.22, 0.3, 'sine');
        noise(0.08, 0.2, 600);
        break;
      case 'badge':
        tone(659, 0.1, 0.1, 'triangle');
        tone(880, 0.1, 0.1, 'triangle', 0.09);
        tone(1047, 0.18, 0.1, 'triangle', 0.18);
        break;
    }
  }

  private loadSettings(): AudioSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const p: unknown = JSON.parse(raw);
        if (typeof p === 'object' && p !== null) {
          const s = p as Partial<AudioSettings>;
          return {
            musicEnabled: s.musicEnabled !== false,
            sfxEnabled: s.sfxEnabled !== false
          };
        }
      }
    } catch {
      /* varsayılanlara dön */
    }
    return { musicEnabled: true, sfxEnabled: true };
  }

  private persistSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      /* depolama yoksa ayar oturumla sınırlı kalır */
    }
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export const Audio = new AudioManagerImpl();
