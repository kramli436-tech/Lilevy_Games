/**
 * LILEVY GAMES - MONOPOLI PRO: BENCANA ALAM, KRISIS GLOBAL & HIPERINFLASI (HARDCORE MODE)
 * Menghadirkan bencana alam tak terduga, zona bahaya runtuh, dan hiperinflasi bertingkat.
 */

class MonopolyDisaster {
  constructor() {
    this.currentDisaster = null;
    this.disasterDuration = 0;
    this.inflationRate = 1.0; // Multiplier inflasi bertingkat
    this.hazardTiles = new Set(); // Petak zona bahaya / runtuh
    this.turnCounter = 0;
  }

  // Dipanggil setiap putaran giliran selesai
  onTurnEnd(engine) {
    this.turnCounter++;

    // 1. Cek Hiperinflasi setiap 8 putaran (Hard Game Mode)
    if (this.turnCounter % 8 === 0) {
      this.inflationRate = parseFloat((this.inflationRate + 0.25).toFixed(2));
      engine.log(`📈 [HIPERINFLASI GLOBAL] Tarif sewa seluruh properti naik menjadi ${(this.inflationRate * 100).toFixed(0)}%!`, 'danger');
      if (window.soundEngine) window.soundEngine.playHint();
    }

    // 2. Zona Bahaya / Runtuh Sudden Death (setiap 12 putaran)
    if (this.turnCounter % 12 === 0 && this.hazardTiles.size < Math.floor(engine.totalTiles * 0.25)) {
      const available = engine.activeTiles.filter(t => !this.hazardTiles.has(t.id) && t.type === 'property');
      if (available.length > 0) {
        const hazardTile = available[Math.floor(Math.random() * available.length)];
        this.hazardTiles.add(hazardTile.id);
        engine.log(`☣️ [ZONA BAHAYA SUDDEN DEATH] [${hazardTile.name}] mengalami longsor/kehancuran! Denda 50% kas bagi yang mendarat!`, 'danger');
        if (window.soundEngine) window.soundEngine.playError();
        this.highlightHazardTile(hazardTile.id);
      }
    }

    // 3. Durasi Bencana Aktif
    if (this.currentDisaster) {
      this.disasterDuration--;
      if (this.disasterDuration <= 0) {
        engine.log(`🌤️ [PULIH] Masa krisis bencana [${this.currentDisaster.title}] telah berakhir. Wilayah kembali normal.`, 'success');
        this.currentDisaster = null;
      }
    } else {
      // Peluang 15% setiap putaran memicu bencana alam acak
      if (Math.random() < 0.15 && this.turnCounter >= 3) {
        this.triggerRandomDisaster(engine);
      }
    }

    this.updateBanner();
  }

  triggerRandomDisaster(engine) {
    const disasterTypes = [
      {
        id: 'earthquake',
        icon: '🌪️',
        title: 'Gempa Bumi Megathrust',
        desc: 'Gempa hebat merusak bangunan! 1 rumah hancur di kawasan terdampak.',
        type: 'danger',
        duration: 3,
        effect: (eng) => {
          // Cari grup properti yang memiliki rumah terbanyak
          const ownedProps = eng.activeTiles.filter(t => eng.propertyState[t.id]?.houses > 0 || eng.propertyState[t.id]?.isHotel);
          if (ownedProps.length > 0) {
            const target = ownedProps[Math.floor(Math.random() * ownedProps.length)];
            const prop = eng.propertyState[target.id];
            if (prop.isHotel) {
              prop.isHotel = false;
              prop.houses = 4;
              eng.log(`💥 Gempa merusak Hotel Megah di [${target.name}] turun menjadi 4 Rumah!`, 'danger');
            } else if (prop.houses > 0) {
              prop.houses--;
              eng.log(`💥 Gempa menghancurkan 1 Rumah di [${target.name}] (Sisa: ${prop.houses} Rumah)!`, 'danger');
            }
          }
        }
      },
      {
        id: 'fire',
        icon: '🔥',
        title: 'Kebakaran Kota Besar',
        desc: 'Kebakaran hebat melanda kota! Biaya pemadam Rp 1.500.000 bagi pemilik kawasan.',
        type: 'danger',
        duration: 2,
        effect: (eng) => {
          const ownedProps = eng.activeTiles.filter(t => eng.propertyState[t.id]?.ownerId);
          if (ownedProps.length > 0) {
            const target = ownedProps[Math.floor(Math.random() * ownedProps.length)];
            const owner = eng.players.find(p => p.id === eng.propertyState[target.id].ownerId);
            if (owner) {
              owner.money = Math.max(0, owner.money - 1500000);
              eng.log(`🔥 Kebakaran di [${target.name}]! ${owner.name} membayar Rp 1.500.000 untuk renovasi darurat.`, 'danger');
            }
          }
        }
      },
      {
        id: 'blackout',
        icon: '⚡',
        title: 'Pemadaman Listrik Global (Blackout)',
        desc: 'Krisis energi! Seluruh petak Utilitas Publik dan Stasiun bebas biaya sewa selama 2 putaran.',
        type: 'warning',
        duration: 2,
        effect: () => {}
      },
      {
        id: 'quarantine',
        icon: '😷',
        title: 'Karantina & Lockdown Regional',
        desc: 'Pemberlakuan lockdown ketat! Pendapatan sewa kota metropolitan turun 50%.',
        type: 'warning',
        duration: 3,
        effect: () => {}
      }
    ];

    const chosen = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];
    this.currentDisaster = chosen;
    this.disasterDuration = chosen.duration;

    engine.log(`🚨 [BENCANA ALAM] ${chosen.icon} ${chosen.title}! ${chosen.desc}`, 'danger');
    if (window.soundEngine) window.soundEngine.playError();
    chosen.effect(engine);

    if (engine.onStateChange) engine.onStateChange();
  }

  // Modifikasi tarif sewa berdasarkan Bencana Alam & Hiperinflasi
  getModifiedRent(baseRent, tile) {
    let rent = baseRent * this.inflationRate;

    if (this.currentDisaster) {
      if (this.currentDisaster.id === 'blackout' && (tile.type === 'station' || tile.type === 'utility')) {
        return 0; // Bebas sewa saat mati listrik
      }
      if (this.currentDisaster.id === 'quarantine') {
        rent *= 0.5; // Diskon karantina
      }
    }
    return Math.floor(rent);
  }

  // Cek pendaratan di zona bahaya
  checkHazardLanding(engine, player, tileId) {
    if (this.hazardTiles.has(tileId)) {
      const penalty = Math.floor(player.money * 0.5);
      player.money -= penalty;
      engine.log(`☣️ BAHAYA! ${player.name} terperosok ke ZONA RUNTUH [${engine.activeTiles[tileId].name}]! Kehilangan 50% saldo (Denda: ${engine.formatRupiah(penalty)})!`, 'danger');
      if (window.soundEngine) window.soundEngine.playError();
      return true;
    }
    return false;
  }

  highlightHazardTile(tileId) {
    const tileEl = document.getElementById(`tile-${tileId}`);
    if (tileEl) {
      tileEl.classList.add('tile-hazard-zone');
    }
  }

  updateBanner() {
    const banner = document.getElementById('mono-disaster-banner');
    if (!banner) return;

    if (this.currentDisaster) {
      banner.classList.remove('hidden');
      banner.className = 'p-2.5 rounded-xl text-xs font-bold mb-3 flex items-center justify-between border bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800 shadow-md animate-pulse';
      banner.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="text-base">${this.currentDisaster.icon}</span>
          <span><strong>${this.currentDisaster.title}:</strong> ${this.currentDisaster.desc}</span>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 bg-rose-600 text-white rounded-full font-black">${this.disasterDuration} Putaran</span>
      `;
    } else if (this.inflationRate > 1.0) {
      banner.classList.remove('hidden');
      banner.className = 'p-2 rounded-xl text-xs font-bold mb-3 flex items-center justify-between border bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      banner.innerHTML = `
        <div class="flex items-center gap-2">
          <span>📈 <strong>Hiperinflasi Aktif:</strong> Tarif sewa seluruh dunia naik menjadi ${(this.inflationRate * 100).toFixed(0)}%</span>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full font-black">x${this.inflationRate} Sewa</span>
      `;
    } else {
      banner.classList.add('hidden');
    }
  }
}

window.monopolyDisaster = new MonopolyDisaster();
