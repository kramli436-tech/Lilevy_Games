/**
 * AUDIO SYNTHESIZER (WEB AUDIO API)
 * Menghasilkan efek suara interaktif tanpa perlu aset file audio eksternal.
 * Ringan, responsif, dan mendukung persistensi pengaturan Mute/Unmute.
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('tts_sound_muted') === 'true';
  }

  // Inisialisasi audio context saat interaksi pengguna pertama kali
  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('tts_sound_muted', this.isMuted);
    return this.isMuted;
  }

  // Suara ketikan huruf (subtle click)
  playType() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440 + Math.random() * 80, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {
      console.warn("Audio play error", e);
    }
  }

  // Suara navigasi sel
  playNavigate() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.03, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.03);
    } catch (e) {}
  }

  // Suara saat satu kata berhasil terjawab dengan benar
  playWordSuccess() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0, this.audioCtx.currentTime + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.1, this.audioCtx.currentTime + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.07 + 0.22);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + idx * 0.07);
        osc.stop(this.audioCtx.currentTime + idx * 0.07 + 0.25);
      });
    } catch (e) {}
  }

  // Suara hint (sparkle sine sweep)
  playHint() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1174.66, this.audioCtx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.2);
    } catch (e) {}
  }

  // Suara error / peringatan salah
  playError() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, this.audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch (e) {}
  }

  // Fanfare kemenangan spektakuler saat puzzle selesai
  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const fanfare = [
        { f: 523.25, d: 0.12, t: 0.00 }, // C5
        { f: 523.25, d: 0.12, t: 0.14 }, // C5
        { f: 523.25, d: 0.12, t: 0.28 }, // C5
        { f: 659.25, d: 0.25, t: 0.42 }, // E5
        { f: 587.33, d: 0.14, t: 0.70 }, // D5
        { f: 659.25, d: 0.14, t: 0.86 }, // E5
        { f: 783.99, d: 0.60, t: 1.02 }, // G5 (panjang)
        { f: 1046.50, d: 0.80, t: 1.65 } // C6 (klimaks)
      ];

      fanfare.forEach(note => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, this.audioCtx.currentTime + note.t);

        gain.gain.setValueAtTime(0, this.audioCtx.currentTime + note.t);
        gain.gain.linearRampToValueAtTime(0.18, this.audioCtx.currentTime + note.t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + note.t + note.d);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + note.t);
        osc.stop(this.audioCtx.currentTime + note.t + note.d + 0.05);
      });
    } catch (e) {}
  }
}

// Export single instance
window.soundEngine = new SoundEngine();

