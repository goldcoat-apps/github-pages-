/**
 * Web Audio API Sound Synthesizer for tactile board game feedback
 * Zero external audio assets required; completely self-contained & reliable.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private volume: number = 0.85;

  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    const saved = localStorage.getItem('bg_sound_enabled');
    if (saved !== null) {
      this.soundEnabled = saved === 'true';
    }
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.initCtx();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private getNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (!this.noiseBuffer) {
      const sampleRate = this.ctx.sampleRate || 44100;
      const bufferSize = sampleRate * 2; // 2 seconds of high quality noise
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.95;
      }
      this.noiseBuffer = buffer;
    }
    return this.noiseBuffer;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('bg_sound_enabled', String(this.soundEnabled));
    if (this.soundEnabled) {
      this.playClick();
    }
    return this.soundEnabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public playClick() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(this.volume * 0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio fallback silent
    }
  }

  public playPieceMove() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      // Rich wooden clack sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {}
  }

  public playCapture() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      // Satisfying double-percussive snap
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(500, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);

      osc2.frequency.setValueAtTime(750, this.ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(this.volume * 0.45, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.15);
      osc2.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  public playKingCrown() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      // Majestic ascending royal arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, this.ctx!.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(this.volume * 0.35, this.ctx!.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.08);
        osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.25);
      });
    } catch {}
  }

  /**
   * Synthesizes an authentic acoustic dice strike on a wooden board.
   * Uses high-frequency bandpass-filtered noise for the sharp resin/plastic corner crack,
   * coupled with a short wooden board low-mid body resonance impulse and realistic micro-rebound.
   */
  public playAcousticDiceClack(atTime?: number, intensity: number = 1.0, isHeavyLanding: boolean = false) {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const noise = this.getNoiseBuffer();
      if (!noise) return;

      const t = atTime !== undefined ? atTime : this.ctx.currentTime;
      const gainScale = this.volume * Math.min(1.0, Math.max(0.12, intensity));

      // 1. High-frequency resin/acrylic corner crack (bandpass-filtered white noise)
      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = noise;
      noiseNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      // Center frequency: 2200Hz - 3400Hz matches dense acrylic/resin dice corners hitting wood
      const centerFreq = (isHeavyLanding ? 2200 : 2700) + (Math.random() * 500 - 250);
      filter.frequency.setValueAtTime(centerFreq, t);
      filter.Q.setValueAtTime(isHeavyLanding ? 3.8 : 4.5, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0, t);
      noiseGain.gain.linearRampToValueAtTime(gainScale * (isHeavyLanding ? 0.95 : 0.7), t + 0.001);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + (isHeavyLanding ? 0.032 : 0.018));

      noiseNode.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noiseNode.start(t);
      noiseNode.stop(t + (isHeavyLanding ? 0.038 : 0.024));

      // 2. Hollow wooden board acoustic body resonance (low-mid woody impact thud)
      const woodOsc = this.ctx.createOscillator();
      const woodGain = this.ctx.createGain();
      woodOsc.type = 'sine';
      const basePitch = isHeavyLanding ? 170 : 220;
      woodOsc.frequency.setValueAtTime(basePitch + Math.random() * 25, t);
      woodOsc.frequency.exponentialRampToValueAtTime(55, t + (isHeavyLanding ? 0.06 : 0.035));

      woodGain.gain.setValueAtTime(gainScale * (isHeavyLanding ? 0.75 : 0.42), t);
      woodGain.gain.exponentialRampToValueAtTime(0.0001, t + (isHeavyLanding ? 0.06 : 0.035));

      woodOsc.connect(woodGain);
      woodGain.connect(this.ctx.destination);

      woodOsc.start(t);
      woodOsc.stop(t + (isHeavyLanding ? 0.065 : 0.04));

      // 3. Wooden surface friction / table slap texture (low-passed impact body)
      const woodTexture = this.ctx.createBufferSource();
      woodTexture.buffer = noise;
      const woodFilter = this.ctx.createBiquadFilter();
      woodFilter.type = 'bandpass';
      woodFilter.frequency.setValueAtTime(isHeavyLanding ? 680 : 880, t);
      woodFilter.Q.setValueAtTime(2.2, t);

      const woodTextGain = this.ctx.createGain();
      woodTextGain.gain.setValueAtTime(0, t);
      woodTextGain.gain.linearRampToValueAtTime(gainScale * (isHeavyLanding ? 0.5 : 0.28), t + 0.001);
      woodTextGain.gain.exponentialRampToValueAtTime(0.0001, t + (isHeavyLanding ? 0.045 : 0.022));

      woodTexture.connect(woodFilter);
      woodFilter.connect(woodTextGain);
      woodTextGain.connect(this.ctx.destination);

      woodTexture.start(t);
      woodTexture.stop(t + (isHeavyLanding ? 0.05 : 0.025));

      // 4. Realistic micro-rebound tick (the physical second facet contact of a bouncing cube)
      if (isHeavyLanding || Math.random() > 0.3) {
        const reboundDelay = 0.012 + Math.random() * 0.008;
        const rebNode = this.ctx.createBufferSource();
        rebNode.buffer = noise;
        rebNode.loop = true;

        const rebFilter = this.ctx.createBiquadFilter();
        rebFilter.type = 'bandpass';
        rebFilter.frequency.setValueAtTime(centerFreq * 1.15, t + reboundDelay);
        rebFilter.Q.setValueAtTime(5.2, t + reboundDelay);

        const rebGain = this.ctx.createGain();
        rebGain.gain.setValueAtTime(0, t + reboundDelay);
        rebGain.gain.linearRampToValueAtTime(gainScale * 0.38, t + reboundDelay + 0.001);
        rebGain.gain.exponentialRampToValueAtTime(0.0001, t + reboundDelay + 0.014);

        rebNode.connect(rebFilter);
        rebFilter.connect(rebGain);
        rebGain.connect(this.ctx.destination);

        rebNode.start(t + reboundDelay);
        rebNode.stop(t + reboundDelay + 0.016);
      }
    } catch {}
  }

  public playDiceTumbleTick() {
    if (!this.soundEnabled) return;
    // Single crisp tactile tumbling click on wood
    this.playAcousticDiceClack(undefined, 0.45, false);
  }

  public playDiceRoll() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Realistic acoustic physics cascade:
      // Simulates dice shaken in a cup or hand, tossed onto the board,
      // skittering across wooden tracks, and settling with decelerating bounces.
      const baseSchedule = [
        { offset: 0.00, velocity: 0.82 },
        { offset: 0.045, velocity: 0.95 },
        { offset: 0.092, velocity: 0.90 },
        { offset: 0.148, velocity: 0.84 },
        { offset: 0.215, velocity: 0.76 },
        { offset: 0.292, velocity: 0.68 },
        { offset: 0.380, velocity: 0.58 },
        { offset: 0.478, velocity: 0.48 },
        { offset: 0.575, velocity: 0.38 },
      ];

      baseSchedule.forEach(({ offset, velocity }) => {
        const jitter = (Math.random() - 0.5) * 0.006;
        const velJitter = Math.max(0.2, velocity + (Math.random() - 0.5) * 0.08);
        this.playAcousticDiceClack(now + Math.max(0, offset + jitter), velJitter, false);
      });
    } catch {}
  }

  public playDiceResult(isSix: boolean) {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // 1. Decisive, heavy physical wooden landing impact of the real die coming to rest
      this.playAcousticDiceClack(undefined, 1.0, true);

      // 2. High-energy celebratory fanfare ONLY if rolling a 6!
      if (isSix) {
        const notes = [659.25, 880, 1174.66]; // E5, A5, D6 triumphant fanfare
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          const startTime = this.ctx!.currentTime + 0.07 + idx * 0.07;
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(this.volume * 0.38, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.22);
        });
      }
    } catch {}
  }

  public playTokenStep() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(this.volume * 0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {}
  }

  public playTokenHome() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      // Cheerful chime
      const freqs = [659.25, 880, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(this.volume * 0.3, this.ctx!.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.07 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.07);
        osc.stop(this.ctx!.currentTime + idx * 0.07 + 0.2);
      });
    } catch {}
  }

  public playWin() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      // Grand victory fanfare
      const melody = [523.25, 659.25, 783.99, 1046.5, 987.77, 1046.5];
      const durations = [0.12, 0.12, 0.12, 0.25, 0.12, 0.4];
      let offset = 0;
      melody.forEach((freq, idx) => {
        const dur = durations[idx];
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + offset);

        gain.gain.setValueAtTime(this.volume * 0.35, this.ctx!.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + offset + dur);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + offset);
        osc.stop(this.ctx!.currentTime + offset + dur);
        offset += dur * 0.85;
      });
    } catch {}
  }

  public playError() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  public playHuffPiece() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      // Breathy gust whoosh + rapid pitch sweep for the "huff / blow off stool" penalty
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(65, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(this.volume * 0.45, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  public playChopPiece() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      // High-energy African chop strike: resonant wooden conga snap followed by bass boom
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(620, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.18);

      osc2.frequency.setValueAtTime(240, this.ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(55, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(this.volume * 0.55, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.18);
      osc2.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  public playHomeUnlocked() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      // Uplifting African royal chime (celebrating opening of home corridor)
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0, this.ctx!.currentTime + idx * 0.07);
        gain.gain.linearRampToValueAtTime(this.volume * 0.35, this.ctx!.currentTime + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.07 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.07);
        osc.stop(this.ctx!.currentTime + idx * 0.07 + 0.2);
      });
    } catch {}
  }
}

export const sounds = new SoundManager();
