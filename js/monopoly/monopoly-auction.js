/**
 * MONOPOLI NUSANTARA & DUNIA - OPEN LIVE AUCTION MODULE
 * Mengelola lelang terbuka publik dengan durasi hitung mundur (Countdown Timer 15 Detik),
 * kesempatan menawar bagi seluruh pemain, tombol X keluar/batal, dan penanganan mundur (pass) yang mulus.
 */

class MonopolyAuction {
  constructor() {
    this.isActive = false;
    this.currentTile = null;
    this.highestBid = 0;
    this.highestBidder = null;
    this.activeBidders = [];
    this.onAuctionUpdate = null;
    this.onAuctionEnd = null;

    // Countdown Timer Properties
    this.totalDuration = 15; // 15 Detik durasi lelang
    this.remainingSeconds = 15;
    this.timerInterval = null;
    this.aiBidTimeout = null;
  }

  // Mulai Lelang Terbuka dengan Durasi Waktu Nyata
  startAuction(engine, tile, onEndCallback) {
    this.stopAuctionTimer();
    if (this.aiBidTimeout) clearTimeout(this.aiBidTimeout);

    this.isActive = true;
    this.currentTile = tile;
    this.highestBid = Math.max(100000, Math.floor((tile.price || 1000000) * 0.2));
    this.highestBidder = null;
    this.activeBidders = engine.players.filter(p => !p.isBankrupt && p.money >= this.highestBid);
    this.onAuctionEnd = onEndCallback;
    this.remainingSeconds = this.totalDuration;

    engine.log(`🔨 LELANG TERBUKA DIMULAI untuk [${tile.name}]! Harga pembuka: ${engine.formatRupiah(this.highestBid)}. Waktu lelang: ${this.totalDuration} detik.`, 'warning');
    if (window.soundEngine) window.soundEngine.playHint();

    if (this.onAuctionUpdate) this.onAuctionUpdate();

    // Mulai Timer Hitung Mundur
    this.startAuctionTimer(engine);
    this.scheduleAIBid(engine);
  }

  // Timer Hitung Mundur Lelang
  startAuctionTimer(engine) {
    this.stopAuctionTimer();
    this.updateTimerUI();

    this.timerInterval = setInterval(() => {
      if (!this.isActive) {
        this.stopAuctionTimer();
        return;
      }

      this.remainingSeconds--;
      this.updateTimerUI();

      // Suara detik di 3 detik terakhir
      if (this.remainingSeconds <= 3 && this.remainingSeconds > 0) {
        if (window.soundEngine) window.soundEngine.playType();
      }

      // Waktu Habis -> Ketuk Palu!
      if (this.remainingSeconds <= 0) {
        this.stopAuctionTimer();
        this.concludeAuction(engine);
      }
    }, 1000);
  }

  stopAuctionTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.aiBidTimeout) {
      clearTimeout(this.aiBidTimeout);
      this.aiBidTimeout = null;
    }
  }

  updateTimerUI() {
    const textEl = document.getElementById('auc-timer-text');
    const barEl = document.getElementById('auc-timer-bar');

    if (textEl) {
      textEl.textContent = `${this.remainingSeconds}s`;
      if (this.remainingSeconds <= 4) {
        textEl.className = 'font-mono font-black text-sm text-rose-600 dark:text-rose-400 animate-pulse';
      } else {
        textEl.className = 'font-mono font-black text-sm text-amber-600 dark:text-amber-400';
      }
    }

    if (barEl) {
      const pct = Math.max(0, Math.min(100, (this.remainingSeconds / this.totalDuration) * 100));
      barEl.style.width = `${pct}%`;
      if (this.remainingSeconds <= 4) {
        barEl.className = 'h-full bg-rose-600 transition-all duration-500';
      } else {
        barEl.className = 'h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500';
      }
    }
  }

  // Ajukan Penawaran
  placeBid(engine, player, amount) {
    if (!this.isActive) return false;
    if (amount <= this.highestBid || player.money < amount) return false;

    this.highestBid = amount;
    this.highestBidder = player;

    // Tambah bonus waktu +6 detik jika sisa waktu di bawah 6 detik (Going once... Going twice...)
    if (this.remainingSeconds < 6) {
      this.remainingSeconds = Math.min(this.totalDuration, this.remainingSeconds + 6);
      this.updateTimerUI();
    }

    engine.log(`🏷️ ${player.name} menawar [${this.currentTile.name}] seharga ${engine.formatRupiah(amount)}! (Sisa waktu: ${this.remainingSeconds}s)`);
    if (window.soundEngine) window.soundEngine.playType();

    if (this.onAuctionUpdate) this.onAuctionUpdate();
    this.scheduleAIBid(engine);
    return true;
  }

  // Mundur / Pass dari Lelang
  passBid(engine, player) {
    if (!this.isActive) return;

    this.activeBidders = this.activeBidders.filter(p => p.id !== player.id);
    engine.log(`🏳️ ${player.name} memutuskan mundur dari lelang [${this.currentTile.name}].`);

    if (this.onAuctionUpdate) this.onAuctionUpdate();

    // Jika seluruh peserta mundur dan tidak ada yang menawar lagi, segera selesaikan
    if (this.activeBidders.length === 0 || (this.activeBidders.length === 1 && this.highestBidder && this.activeBidders[0].id === this.highestBidder.id)) {
      this.stopAuctionTimer();
      this.concludeAuction(engine);
    } else {
      this.scheduleAIBid(engine);
    }
  }

  // Tombol X / Batal Lelang & Keluar Modal Kapan Saja
  closeOrCancelAuction(engine) {
    this.stopAuctionTimer();
    const modal = document.getElementById('modal-mono-auction');
    if (modal) modal.classList.remove('modal-open');

    if (!this.isActive) return;

    // Jika sudah ada penawar tertinggi saat ditutup, selesaikan dengan pemenang tersebut
    if (this.highestBidder && this.highestBid > 0) {
      this.concludeAuction(engine);
    } else {
      this.isActive = false;
      engine.log(`❌ Lelang [${this.currentTile?.name || 'Properti'}] ditutup.`);
      if (engine.onStateChange) engine.onStateChange();
      const cb = this.onAuctionEnd;
      this.onAuctionEnd = null;
      if (cb) cb();
    }
  }

  scheduleAIBid(engine) {
    if (!this.isActive) return;
    if (this.aiBidTimeout) clearTimeout(this.aiBidTimeout);

    const aiBidders = this.activeBidders.filter(p => p.isAI && (!this.highestBidder || p.id !== this.highestBidder.id));
    if (aiBidders.length === 0) {
      // Tidak ada bot yang ingin menawar, biarkan timer berjalan untuk pemain manusia
      return;
    }

    const nextAI = aiBidders[Math.floor(Math.random() * aiBidders.length)];
    const tilePrice = this.currentTile?.price || 1000000;
    const maxValuation = Math.floor(tilePrice * 1.2);
    const isStrategic = engine.isStrategicTileForAI(nextAI, this.currentTile);
    const bidStep = Math.max(100000, Math.floor(tilePrice * 0.1));
    const nextBid = this.highestBid + bidStep;

    const delay = 1800 + Math.random() * 1500; // AI berpikir 1.8s - 3.3s agar manusia punya waktu bereaksi

    this.aiBidTimeout = setTimeout(() => {
      if (!this.isActive) return;

      if (nextBid <= (isStrategic ? maxValuation * 1.3 : maxValuation) && nextAI.money >= (nextBid + 1000000)) {
        this.placeBid(engine, nextAI, nextBid);
      } else {
        this.passBid(engine, nextAI);
      }
    }, delay);
  }

  concludeAuction(engine) {
    this.stopAuctionTimer();
    if (!this.isActive) return;
    this.isActive = false;

    // Pastikan modal ditutup
    const modal = document.getElementById('modal-mono-auction');
    if (modal) modal.classList.remove('modal-open');

    if (this.highestBidder && this.highestBid > 0) {
      this.highestBidder.money -= this.highestBid;
      engine.propertyState[this.currentTile.id].ownerId = this.highestBidder.id;
      engine.log(`🏆 KETUK PALU! [${this.currentTile.name}] RESMI TERJUAL kepada ${this.highestBidder.name} seharga ${engine.formatRupiah(this.highestBid)}!`, 'success');
      if (window.soundEngine) window.soundEngine.playVictory();

      if (engine.checkFullGroupOwnership(this.highestBidder.id, this.currentTile.group)) {
        const groupName = engine.activeGroups[this.currentTile.group]?.name || this.currentTile.group;
        engine.log(`👑 HAK MONOPOLI AKTIF! ${this.highestBidder.name} berhasil menguasai 1 SET LENGKAP ${groupName}! Efek: Uang sewa dasar tanah tanpa bangunan di seluruh area ini berlipat ganda 2x lipat!`, 'success');
        if (typeof confetti === 'function' && !this.highestBidder.isAI) {
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
        }
      }
    } else {
      engine.log(`❌ Lelang [${this.currentTile?.name || 'Properti'}] selesai tanpa penawar.`);
    }

    if (engine.onStateChange) engine.onStateChange();
    const cb = this.onAuctionEnd;
    this.onAuctionEnd = null;
    if (cb) cb();
  }
}

window.monopolyAuction = new MonopolyAuction();
