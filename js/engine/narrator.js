/**
 * LILEVY GAMES - VOICE NARRATION & TEXT-TO-SPEECH (TTS) NARRATOR
 * Menggunakan Web Speech Synthesis API bawaan browser untuk menyuarakan event permainan.
 */

class VoiceNarrator {
  constructor() {
    this.isEnabled = false;
    this.synth = null;
    this.rate = 1.05;
    this.pitch = 1.0;
  }

  toggle() {
    return false;
  }

  speak(text, lang = null) {
    // Fitur narasi suara dinonaktifkan
    return;
  }

  announceDice(die1, die2, isDouble) {
    const isEn = window.i18n?.currentLang === 'en';
    const total = die1 + die2;
    if (isDouble) {
      const msg = isEn 
        ? `Double ${die1}! Total ${total}. Roll again!`
        : `Dadu kembar ${die1}! Total ${total}. Lempar lagi!`;
      this.speak(msg);
    } else {
      const msg = isEn ? `Rolled ${die1} and ${die2}. Total ${total}.` : `Dadu ${die1} dan ${die2}. Total ${total}.`;
      this.speak(msg);
    }
  }

  announceLanding(playerName, tileName) {
    const isEn = window.i18n?.currentLang === 'en';
    const msg = isEn 
      ? `${playerName} landed on ${tileName}`
      : `${playerName} mendarat di ${tileName}`;
    this.speak(msg);
  }

  announceCrisis(eventTitle) {
    const isEn = window.i18n?.currentLang === 'en';
    const msg = isEn 
      ? `Global Event Alert! ${eventTitle}`
      : `Perhatian! Event Ekonomi Makro! ${eventTitle}`;
    this.speak(msg);
  }

  announceVictory(winnerName) {
    const isEn = window.i18n?.currentLang === 'en';
    const msg = isEn 
      ? `Victory! ${winnerName} has won the championship!`
      : `Selamat! ${winnerName} keluar sebagai pemenang juara monopoli!`;
    this.speak(msg);
  }

  updateUi() {
    const btn = document.getElementById('btn-narrator-toggle');
    if (btn) {
      btn.innerHTML = this.isEnabled 
        ? `<i data-lucide="mic" class="w-4 h-4 text-purple-400 animate-pulse"></i> <span>Suara On</span>`
        : `<i data-lucide="mic-off" class="w-4 h-4 text-slate-400"></i> <span>Suara Off</span>`;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

window.voiceNarrator = new VoiceNarrator();

