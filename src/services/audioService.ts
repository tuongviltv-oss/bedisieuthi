
class AudioService {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Context will be initialized on first user interaction
  }

  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.masterGain) {
      this.masterGain.gain.value = mute ? 0 : 1;
    }
  }

  // Synthesize a simple "ting" sound
  playTing() {
    this.initContext();
    if (this.isMuted) return;
    const osc = this.context!.createOscillator();
    const gain = this.context!.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.context!.currentTime);
    gain.gain.setValueAtTime(0.1, this.context!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context!.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.context!.currentTime + 0.2);
  }

  // Synthesize a success sound (arpeggio)
  playSuccess() {
    this.initContext();
    if (this.isMuted) return;
    const now = this.context!.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.1, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }

  // Synthesize a failure sound
  playFailure() {
    this.initContext();
    if (this.isMuted) return;
    const osc = this.context!.createOscillator();
    const gain = this.context!.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.context!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.context!.currentTime + 0.5);
    gain.gain.setValueAtTime(0.1, this.context!.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.context!.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.context!.currentTime + 0.5);
  }

  // Synthesize a tick sound
  playTick() {
    this.initContext();
    if (this.isMuted) return;
    const osc = this.context!.createOscillator();
    const gain = this.context!.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, this.context!.currentTime);
    gain.gain.setValueAtTime(0.05, this.context!.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.context!.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.context!.currentTime + 0.05);
  }

  // Synthesize a victory fanfare
  playVictory() {
    this.initContext();
    if (this.isMuted) return;
    const now = this.context!.currentTime;
    const notes = [523.25, 523.25, 523.25, 698.46, 880.00];
    notes.forEach((freq, i) => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.2);
      gain.gain.setValueAtTime(0.1, now + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.4);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.4);
    });
  }

  playFanfare() {
    this.initContext();
    if (this.isMuted) return;
    const now = this.context!.currentTime;
    // C Major arpeggio with a "sparkle" feel
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, i) => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);
      gain.gain.setValueAtTime(0.1, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.5);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.5);
    });
  }

  // Simple background music loop (synthesized)
  private bgOsc: OscillatorNode | null = null;
  private bgGain: GainNode | null = null;

  startBGM() {
    this.initContext();
    if (this.bgOsc) return;
    
    // This is a very simple "music" pattern
    const playNote = (freq: number, time: number, duration: number) => {
        const osc = this.context!.createOscillator();
        const g = this.context!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        g.gain.setValueAtTime(0.02, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(g);
        g.connect(this.masterGain!);
        osc.start(time);
        osc.stop(time + duration);
    };

    const loop = () => {
        if (!this.bgOsc) return; // Stopped
        const now = this.context!.currentTime;
        const melody = [261.63, 329.63, 392.00, 523.25];
        melody.forEach((f, i) => {
            playNote(f, now + i * 0.5, 0.4);
        });
        setTimeout(loop, 2000);
    };

    this.bgOsc = this.context!.createOscillator(); // Dummy to flag as playing
    loop();
  }

  stopBGM() {
    this.bgOsc = null;
  }
}

export const audioService = new AudioService();
