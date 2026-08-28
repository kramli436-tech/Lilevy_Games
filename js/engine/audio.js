/**
 * AUDIO SYNTHESIZER & DYNAMIC BGM ENGINE (WEB AUDIO API)
 * Menghasilkan efek suara interaktif dan musik latar sintetis berkualitas tinggi tanpa file audio eksternal.
 * Ringan, hemat memori, dan mendukung 4 tema melodi (Lofi, Nusantara, 8-Bit Arcade, Cyberpunk).
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = true;
    
    // BGM State
    this.isBgmPlaying = false;
    this.bgmVolume = 0;
    this.currentTrack = 'lofi';
    this.bgmInterval = null;
    this.bgmStep = 0;
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
    if (this.isMuted && this.isBgmPlaying) {
      this.stopBgm();
    }
    return this.isMuted;
  }

  // =========================================================================
  // SOUND EFFECTS (SFX)
  // =========================================================================

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
    } catch (e) {}
  }

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

  playLevelComplete() {
    this.playVictory();
  }

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

  // =========================================================================
  // DYNAMIC BACKGROUND MUSIC SYNTHESIZER (BGM)
  // =========================================================================

  startBgm(track = null) {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    if (track) this.currentTrack = track;
    localStorage.setItem('lilevy_bgm_track', this.currentTrack);

    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }

    this.isBgmPlaying = true;
    this.bgmStep = 0;

    // Frekuensi Melodi per Tema
    const tracks = {
      lofi: [
        { chord: [261.63, 329.63, 392.00], bass: 130.81, dur: 0.8 }, // C maj
        { chord: [220.00, 261.63, 329.63], bass: 110.00, dur: 0.8 }, // A min
        { chord: [174.61, 220.00, 261.63], bass: 87.31, dur: 0.8 },  // F maj
        { chord: [196.00, 246.94, 293.66], bass: 98.00, dur: 0.8 }   // G maj
      ],
      nusantara: [
        { chord: [392.00, 440.00, 523.25], bass: 196.00, dur: 0.6 }, // Slendro Nem
        { chord: [329.63, 392.00, 440.00], bass: 164.81, dur: 0.6 }, // Slendro Lima
        { chord: [293.66, 329.63, 392.00], bass: 146.83, dur: 0.6 }, // Slendro Dada
        { chord: [261.63, 293.66, 392.00], bass: 130.81, dur: 0.6 }  // Slendro Gulu
      ],
      arcade: [
        { chord: [523.25, 659.25], bass: 130.81, dur: 0.25 },
        { chord: [587.33, 698.46], bass: 146.83, dur: 0.25 },
        { chord: [659.25, 783.99], bass: 164.81, dur: 0.25 },
        { chord: [783.99, 1046.50], bass: 196.00, dur: 0.25 }
      ],
      cyberpunk: [
        { chord: [220.00, 261.63, 311.13], bass: 55.00, dur: 0.5 },
        { chord: [246.94, 293.66, 349.23], bass: 61.74, dur: 0.5 },
        { chord: [261.63, 311.13, 369.99], bass: 65.41, dur: 0.5 },
        { chord: [196.00, 233.08, 277.18], bass: 48.99, dur: 0.5 }
      ]
    };

    const activeSequence = tracks[this.currentTrack] || tracks.lofi;
    const intervalMs = (activeSequence[0].dur * 1000) || 600;

    const playNextChord = () => {
      if (!this.isBgmPlaying || this.isMuted || !this.audioCtx) return;
      const pattern = activeSequence[this.bgmStep % activeSequence.length];
      this.bgmStep++;

      try {
        const now = this.audioCtx.currentTime;
        const mainGain = this.bgmVolume * 0.15;

        // Play Bass
        const bassOsc = this.audioCtx.createOscillator();
        const bassGain = this.audioCtx.createGain();
        bassOsc.type = this.currentTrack === 'cyberpunk' ? 'sawtooth' : 'sine';
        bassOsc.frequency.setValueAtTime(pattern.bass, now);

        bassGain.gain.setValueAtTime(0, now);
        bassGain.gain.linearRampToValueAtTime(mainGain * 1.2, now + 0.05);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + pattern.dur);

        bassOsc.connect(bassGain);
        bassGain.connect(this.audioCtx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + pattern.dur);

        // Play Chord Notes
        pattern.chord.forEach((freq, i) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = this.currentTrack === 'arcade' ? 'square' : (this.currentTrack === 'nusantara' ? 'sine' : 'triangle');
          osc.frequency.setValueAtTime(freq, now + i * 0.05);

          gain.gain.setValueAtTime(0, now + i * 0.05);
          gain.gain.linearRampToValueAtTime(mainGain * 0.8, now + i * 0.05 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + pattern.dur);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + pattern.dur);
        });
      } catch (e) {}
    };

    playNextChord();
    this.bgmInterval = setInterval(playNextChord, intervalMs);
    this.updateBgmUi();
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.updateBgmUi();
  }

  toggleBgm() {
    if (this.isBgmPlaying) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return this.isBgmPlaying;
  }

  setBgmVolume(vol) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('lilevy_bgm_vol', this.bgmVolume);
  }

  updateBgmUi() {
    const btn = document.getElementById('btn-bgm-toggle');
    const badge = document.getElementById('bgm-track-badge');
    if (btn) {
      btn.innerHTML = this.isBgmPlaying 
        ? `<i data-lucide="volume-2" class="w-4 h-4 text-emerald-400 animate-pulse"></i> <span>BGM On</span>`
        : `<i data-lucide="volume-x" class="w-4 h-4 text-slate-400"></i> <span>BGM Off</span>`;
      if (window.lucide) window.lucide.createIcons();
    }
    if (badge) {
      const trackNames = { lofi: '🎶 Lofi Chill', nusantara: '🎺 Nusantara', arcade: '🕹️ 8-Bit', cyberpunk: '🌌 Cyberpunk' };
      badge.textContent = trackNames[this.currentTrack] || 'BGM';
    }
  }
}

// Export single instance
window.soundEngine = new SoundEngine();
