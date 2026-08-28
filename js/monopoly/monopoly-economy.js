/**
 * LILEVY GAMES - MONOPOLI PRO: EXPANDED MACROECONOMIC ENGINE
 * Mengelola 13+ event ekonomi global & targeted dinamis (menguntungkan / merugikan).
 */

class MonopolyEconomy {
  constructor() {
    this.currentEvent = null;
    this.eventDurationTurns = 0;
    this.roundCounter = 0;
    this.frozenPropertyId = null;
  }

  reset() {
    this.currentEvent = null;
    this.eventDurationTurns = 0;
    this.roundCounter = 0;
    this.frozenPropertyId = null;
  }

  checkRoundProgress(engine) {
    this.roundCounter++;

    if (this.currentEvent) {
      this.eventDurationTurns--;
      if (this.eventDurationTurns <= 0) {
        engine.log(`🔄 [PULIH] Kondisi makro-ekonomi kembali stabil setelah masa [${this.currentEvent.title}].`, 'info');
        if (this.frozenPropertyId !== null && engine.propertyState[this.frozenPropertyId]) {
          engine.propertyState[this.frozenPropertyId].isFrozen = false;
          this.frozenPropertyId = null;
        }
        this.currentEvent = null;
        if (engine.onStateChange) engine.onStateChange();
      }
    } else if (this.roundCounter >= 4) { // Terjadi setiap 4 putaran
      this.roundCounter = 0;
      this.triggerRandomEvent(engine);
    }
  }

  triggerRandomEvent(engine) {
    if (!ECONOMIC_EVENTS || ECONOMIC_EVENTS.length === 0) return;

    const event = ECONOMIC_EVENTS[Math.floor(Math.random() * ECONOMIC_EVENTS.length)];
    this.currentEvent = event;
    this.eventDurationTurns = event.duration || 3;

    engine.log(`📢 [EVENT EKONOMI GLOBAL] ${event.title}! "${event.desc}"`, event.type);
    if (window.soundEngine) {
      if (event.type === 'danger') window.soundEngine.playError();
      else window.soundEngine.playVictory();
    }

    // Eksekusi Efek Langsung (Immediate Impact)
    this.applyImmediateEventEffect(engine, event);

    if (engine.onStateChange) engine.onStateChange();
  }

  applyImmediateEventEffect(engine, event) {
    const activePlayers = engine.players.filter(p => !p.isBankrupt);
    if (activePlayers.length === 0) return;

    // 1. Subsidi Pemilik Properti Terbanyak
    if (event.effectType === 'CASH_GRANT_TOP_PROPERTY') {
      let topPlayer = activePlayers[0];
      let maxProps = -1;

      activePlayers.forEach(p => {
        const propCount = engine.activeTiles.filter(t => engine.propertyState[t.id]?.ownerId === p.id).length;
        if (propCount > maxProps) {
          maxProps = propCount;
          topPlayer = p;
        }
      });

      if (topPlayer) {
        topPlayer.money += event.grantAmount;
        engine.log(`🎁 ${topPlayer.name} menerima dana hibah pembangunan sebesar ${engine.formatRupiah(event.grantAmount)} dari Pemerintah!`, 'success');
        if (typeof confetti === 'function' && !topPlayer.isAI) {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        }
      }
    }

    // 2. Jackpot Rezeki Nomplok 1 Pemain Acak
    else if (event.effectType === 'CASH_GRANT_RANDOM') {
      const luckyPlayer = activePlayers[Math.floor(Math.random() * activePlayers.length)];
      luckyPlayer.money += event.grantAmount;
      engine.log(`💎 REZEKI NOMPLOK! ${luckyPlayer.name} memenangkan undian nasional sebesar ${engine.formatRupiah(event.grantAmount)}!`, 'success');
      if (typeof confetti === 'function' && !luckyPlayer.isAI) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
      }
    }

    // 3. Hak Paten Transportasi Bebas 1 Pemain Acak
    else if (event.effectType === 'STATION_SHIELD_RANDOM') {
      const luckyPlayer = activePlayers[Math.floor(Math.random() * activePlayers.length)];
      luckyPlayer.hasStationShield = true;
      engine.log(`🛡️ ${luckyPlayer.name} dianugerahi Hak Paten Bebas Sewa di seluruh Stasiun & Bandara!`, 'success');
    }

    // 4. Audit Pajak Pemain Terkaya
    else if (event.effectType === 'TAX_PERCENT_RICHEST') {
      let richest = activePlayers[0];
      activePlayers.forEach(p => {
        if (p.money > richest.money) richest = p;
      });

      const taxDeduction = Math.floor(richest.money * (event.taxPercent || 0.15));
      if (taxDeduction > 0) {
        richest.money -= taxDeduction;
        engine.log(`🕵️ AUDIT PAJAK KPK! ${richest.name} dikenakan pajak investigasi sebesar ${engine.formatRupiah(taxDeduction)} (15% dari saldo)!`, 'danger');
        if (window.soundEngine) window.soundEngine.playError();
      }
    }

    // 5. Skandal Korporasi 1 Pemain Acak
    else if (event.effectType === 'FINE_RANDOM') {
      const targetPlayer = activePlayers[Math.floor(Math.random() * activePlayers.length)];
      const fine = Math.min(targetPlayer.money, event.fineAmount || 2500000);
      targetPlayer.money -= fine;
      engine.log(`💥 SKANDAL KORPORASI! ${targetPlayer.name} membayar ganti rugi sebesar ${engine.formatRupiah(fine)}!`, 'danger');
      if (window.soundEngine) window.soundEngine.playError();
    }

    // 6. Pembekuan 1 Aset Acak
    else if (event.effectType === 'FREEZE_PROPERTY_RANDOM') {
      const ownedTiles = engine.activeTiles.filter(t => engine.propertyState[t.id]?.ownerId);
      if (ownedTiles.length > 0) {
        const frozenTile = ownedTiles[Math.floor(Math.random() * ownedTiles.length)];
        this.frozenPropertyId = frozenTile.id;
        engine.propertyState[frozenTile.id].isFrozen = true;
        engine.log(`🔒 PEMBEKUAN ASET! Properti [${frozenTile.name}] dibekukan oleh regulator. Bebas sewa selama 2 putaran!`, 'warning');
      }
    }

    // 7. Stimulus Ekonomi ke Seluruh Pemain
    else if (event.effectType === 'GLOBAL_STIMULUS') {
      activePlayers.forEach(p => {
        p.money += event.stimulusAmount;
      });
      engine.log(`🚀 STIMULUS GLOBAL! Seluruh pemain menerima bantuan tunai ${engine.formatRupiah(event.stimulusAmount)}!`, 'success');
      if (typeof confetti === 'function') confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }

    // 8. Iuran Krisis Seluruh Pemain
    else if (event.effectType === 'GLOBAL_LEVY') {
      activePlayers.forEach(p => {
        p.money = Math.max(0, p.money - event.levyAmount);
      });
      engine.log(`📉 IURAN RESESI! Seluruh pemain membayar kontribusi darurat ${engine.formatRupiah(event.levyAmount)}!`, 'danger');
      if (window.soundEngine) window.soundEngine.playError();
    }
  }

  getModifiedRent(tile, baseRent) {
    if (this.frozenPropertyId === tile.id) {
      return 0; // Properti sedang dibekukan oleh regulator
    }

    if (!this.currentEvent) return baseRent;

    let modified = baseRent * (this.currentEvent.rentMultiplier || 1.0);

    // Krisis Energi: Utilitas & Stasiun naik 2x lipat
    if (this.currentEvent.utilityMultiplier && (tile.type === 'utility' || tile.type === 'station')) {
      modified *= this.currentEvent.utilityMultiplier;
    }

    return Math.floor(modified);
  }

  getModifiedHouseCost(baseCost) {
    if (!this.currentEvent) return baseCost;
    return Math.floor(baseCost * (this.currentEvent.costMultiplier || 1.0));
  }

  isTaxFree() {
    return !!(this.currentEvent && this.currentEvent.taxFree);
  }

  isZeroInterest() {
    return !!(this.currentEvent && this.currentEvent.zeroInterest);
  }

  getPassGoReward(defaultReward) {
    if (this.currentEvent && this.currentEvent.passGoReduction) {
      return Math.max(1000000, defaultReward - this.currentEvent.passGoReduction);
    }
    return defaultReward;
  }
}

window.monopolyEconomy = new MonopolyEconomy();
