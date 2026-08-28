/**
 * LILEVY GAMES - MONOPOLI PRO: KASINO RODA KEBERUNTUNGAN (LUCKY WHEEL CASINO)
 * Mini-game saat mendarat di petak Parkir Bebas / Istirahat dengan hadiah jackpot tunai & item spesial.
 */

class MonopolyCasino {
  constructor() {
    this.isSpinning = false;
    this.segments = [
      { text: 'Rp 2 Juta 💰', type: 'money', value: 2000000, color: '#4f46e5' },
      { text: 'JACKPOT 10JT 🎰', type: 'money', value: 10000000, color: '#f59e0b' },
      { text: 'Perisai Kebal 🛡️', type: 'shield', color: '#10b981' },
      { text: 'Rp 3.5 Juta 💵', type: 'money', value: 3500000, color: '#06b6d4' },
      { text: 'Zonk ❌', type: 'zonk', color: '#64748b' },
      { text: 'Bebas Pajak 🏛️', type: 'tax_free', color: '#8b5cf6' },
      { text: 'Rp 5 Juta 💰', type: 'money', value: 5000000, color: '#ec4899' },
      { text: '+350 EXP ⚡', type: 'exp', value: 350, color: '#14b8a6' }
    ];
  }

  openCasinoModal(engine, player) {
    const modal = document.getElementById('modal-mono-casino');
    if (!modal) return;

    document.getElementById('casino-player-name').textContent = player.name;
    document.getElementById('casino-result-text').textContent = 'Tekan tombol di bawah untuk memutar roda!';
    document.getElementById('casino-result-text').className = 'text-xs font-semibold text-slate-500 my-2';
    document.getElementById('btn-casino-spin').disabled = false;
    document.getElementById('btn-casino-spin').classList.remove('opacity-40', 'pointer-events-none');

    modal.classList.add('modal-open');
    if (window.soundEngine) window.soundEngine.playHint();

    // Jika bot AI, putar otomatis
    if (player.isAI) {
      setTimeout(() => this.spinWheel(engine, player), 1000);
    }
  }

  spinWheel(engine, player) {
    if (this.isSpinning) return;
    this.isSpinning = true;

    const spinBtn = document.getElementById('btn-casino-spin');
    if (spinBtn) {
      spinBtn.disabled = true;
      spinBtn.classList.add('opacity-40', 'pointer-events-none');
    }

    const wheel = document.getElementById('casino-wheel-disc');
    const segCount = this.segments.length;
    const winningIdx = Math.floor(Math.random() * segCount);
    const winningSeg = this.segments[winningIdx];

    const segAngle = 360 / segCount;
    const baseRotation = 360 * 5; // 5 putaran penuh
    const targetAngle = baseRotation + (segCount - 1 - winningIdx) * segAngle + (segAngle / 2);

    if (wheel) {
      wheel.style.transition = 'transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)';
      wheel.style.transform = `rotate(${targetAngle}deg)`;
    }

    if (window.soundEngine) window.soundEngine.playType();

    setTimeout(() => {
      this.isSpinning = false;
      this.handlePrize(engine, player, winningSeg);
    }, 4200);
  }

  handlePrize(engine, player, prize) {
    const resText = document.getElementById('casino-result-text');

    if (prize.type === 'money') {
      player.money += prize.value;
      engine.log(`🎰 [KASINO PARKIR BEBAS] ${player.name} memenangkan ${prize.text} (Uang Tunai ${engine.formatRupiah(prize.value)})!`, 'success');
      if (resText) {
        resText.textContent = `🎉 SELAMAT! Anda memenangkan ${engine.formatRupiah(prize.value)}!`;
        resText.className = 'text-xs font-black text-emerald-600 dark:text-emerald-400 my-2 animate-bounce';
      }
      if (window.soundEngine) window.soundEngine.playVictory();
      if (typeof confetti === 'function' && !player.isAI) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } else if (prize.type === 'shield') {
      player.hasShield = true;
      engine.log(`🛡️ [KASINO PARKIR BEBAS] ${player.name} memenangkan Perisai Kebal Sewa 1x!`, 'success');
      if (resText) {
        resText.textContent = '🛡️ SELAMAT! Anda mendapatkan Perisai Kebal Sewa 1x!';
        resText.className = 'text-xs font-black text-teal-600 my-2 animate-bounce';
      }
      if (window.soundEngine) window.soundEngine.playWordSuccess();
    } else if (prize.type === 'tax_free') {
      player.hasTaxFree = true;
      engine.log(`🏛️ [KASINO PARKIR BEBAS] ${player.name} memenangkan Tiket Bebas Pajak!`, 'success');
      if (resText) {
        resText.textContent = '🏛️ SELAMAT! Anda mendapatkan Bebas Pajak 1x!';
        resText.className = 'text-xs font-black text-purple-600 my-2 animate-bounce';
      }
      if (window.soundEngine) window.soundEngine.playWordSuccess();
    } else if (prize.type === 'exp') {
      if (window.rankingEngine && !player.isAI) {
        window.rankingEngine.addPoints(prize.value);
      }
      engine.log(`⚡ [KASINO PARKIR BEBAS] ${player.name} mendapatkan bonus +${prize.value} EXP Peringkat!`, 'success');
      if (resText) {
        resText.textContent = `⚡ SELAMAT! Anda mendapatkan +${prize.value} EXP!`;
        resText.className = 'text-xs font-black text-indigo-600 my-2 animate-bounce';
      }
    } else {
      engine.log(`❌ [KASINO PARKIR BEBAS] ${player.name} kurang beruntung (ZONK). Coba lagi nanti!`, 'info');
      if (resText) {
        resText.textContent = '😅 Anda mendapatkan Zonk. Belum beruntung kali ini!';
        resText.className = 'text-xs font-bold text-slate-500 my-2';
      }
    }

    if (engine.onStateChange) engine.onStateChange();

    setTimeout(() => {
      const modal = document.getElementById('modal-mono-casino');
      if (modal) modal.classList.remove('modal-open');
      engine.checkAutoEndTurn(player);
    }, 2200);
  }
}

window.monopolyCasino = new MonopolyCasino();

