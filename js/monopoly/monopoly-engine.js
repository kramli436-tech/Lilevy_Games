/**
 * LILEVY GAMES - MONOPOLI NUSANTARA & DUNIA PRO
 * Core Engine dengan Fitur:
 * - Struktur Tarif Sewa Bertingkat (Tiered Rent Structure)
 * - Room ID & Multiplayer tanpa Bot Otomatis
 * - Fitur Tambahkan Bot Mandiri (+ Tambah AI Bot)
 * - 2 s/d 8 Pemain, 8 Karakter Bidak, dan 3 Lempar Dadu
 */

class MonopolyEngine {
  constructor() {
    this.currentMapId = 'world'; // Default Peta Dunia Global
    this.activeMap = MONOPOLY_MAPS.world;
    this.activeTiles = MONOPOLY_TILES_WORLD;
    this.activeGroups = MONOPOLY_GROUPS_WORLD;
    this.totalTiles = 52;

    this.roomId = this.generateRoomId();
    this.players = [];
    this.currentPlayerIndex = 0;
    this.dice = [1, 1, 1]; // 3 Lempar Dadu
    this.isDouble = false;
    this.isTriple = false;
    this.doublesCount = 0;
    this.phase = 'SETUP'; // 'SETUP' | 'ROLL' | 'ACTION' | 'AUCTION' | 'END_TURN' | 'GAME_OVER'
    this.propertyState = {}; // { [tileId]: { ownerId, houses, isHotel, isMortgaged } }
    this.logs = [];

    this.settings = {
      startingMoney: 15000000,
      passGoReward: 3000000,
      jailFine: 500000
    };

    // UI Callbacks
    this.onStateChange = null;
    this.onPlayerMove = null;
    this.onDiceRolled = null;
    this.onLogAdded = null;
    this.onTileActionRequired = null;
    this.onGameOver = null;
    this.onMapChanged = null;
  }

  generateRoomId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'ROOM-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  setMap(mapId) {
    if (!MONOPOLY_MAPS[mapId]) mapId = 'world';
    this.currentMapId = mapId;
    this.activeMap = MONOPOLY_MAPS[mapId];
    this.activeTiles = this.activeMap.tiles;
    this.activeGroups = this.activeMap.groups;
    this.totalTiles = this.activeMap.tileCount;

    // Sinkronkan global alias
    MONOPOLY_TILES = this.activeTiles;
    MONOPOLY_GROUPS = this.activeGroups;

    if (this.onMapChanged) this.onMapChanged(this.activeMap);
  }

  log(message, type = 'info') {
    const entry = {
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text: message,
      type
    };
    this.logs.unshift(entry);
    if (this.logs.length > 50) this.logs.pop();
    if (this.onLogAdded) this.onLogAdded(entry);
  }

  formatRupiah(amount) {
    const cur = this.activeMap ? this.activeMap.currency : 'Rp';
    return `${cur} ${(amount || 0).toLocaleString('id-ID')}`;
  }

  // Format singkatan harga agar pas di kotak petak (misal: 1Jt, 500Rb, $1.5M, ₡2M)
  formatCompactPrice(amount) {
    if (!amount || amount === 0) return '0';
    const cur = this.activeMap ? this.activeMap.currency : 'Rp';

    if (cur === 'Rp') {
      if (amount >= 1000000000) {
        return (amount / 1000000000).toFixed(1).replace('.0', '') + 'Mly';
      }
      if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1).replace('.0', '') + 'Jt';
      }
      if (amount >= 1000) {
        return (amount / 1000).toFixed(0) + 'Rb';
      }
      return `${amount}`;
    } else {
      // Dolar ($) atau Kredit Galaksi (₡)
      if (amount >= 1000000000) {
        return `${cur}${(amount / 1000000000).toFixed(1).replace('.0', '')}B`;
      }
      if (amount >= 1000000) {
        return `${cur}${(amount / 1000000).toFixed(1).replace('.0', '')}M`;
      }
      if (amount >= 1000) {
        return `${cur}${(amount / 1000).toFixed(0)}k`;
      }
      return `${cur}${amount}`;
    }
  }

  initGame(playerConfigs, customSettings = {}) {
    if (customSettings.mapId) {
      this.setMap(customSettings.mapId);
    } else {
      this.setMap(this.currentMapId || 'world');
    }

    this.hostId = customSettings.hostId || (playerConfigs[0] ? playerConfigs[0].id : 'p_host');
    this.roomId = customSettings.roomId || this.generateRoomId();
    this.settings = { ...this.settings, ...customSettings };
    this.propertyState = {};
    this.logs = [];
    this.doublesCount = 0;
    this.currentPlayerIndex = 0;
    this.phase = 'ROLL';

    // Reset Submodul
    if (window.monopolySkills) window.monopolySkills.reset();
    if (window.monopolyBank) window.monopolyBank.reset();
    if (window.monopolyEconomy) window.monopolyEconomy.reset();

    // Inisialisasi Kepemilikan Seluruh Petak Aktif
    this.activeTiles.forEach(t => {
      if (t.type === 'property' || t.type === 'station' || t.type === 'utility') {
        this.propertyState[t.id] = {
          ownerId: null,
          houses: 0,
          isHotel: false,
          isMortgaged: false
        };
      }
    });

    const playerColors = [
      '#4f46e5', '#059669', '#d97706', '#dc2626',
      '#0891b2', '#7c3aed', '#ea580c', '#65a30d'
    ];

    // Inisialisasi Pemain
    this.players = playerConfigs.map((cfg, idx) => ({
      id: cfg.id || 'p_' + idx,
      name: cfg.name || `Pemain ${idx + 1}`,
      avatar: cfg.avatar || '🧠',
      token: cfg.token || '🚗',
      color: cfg.color || playerColors[idx % playerColors.length],
      money: this.settings.startingMoney,
      position: 0,
      inJail: false,
      jailTurns: 0,
      jailCards: 0,
      isBankrupt: false,
      isAI: !!cfg.isAI,
      aiLevel: cfg.aiLevel || 'smart'
    }));

    this.log(`🎮 Room [${this.roomId}] dimulai! Peta: ${this.activeMap.name} (${this.players.length} Pemain).`);
    if (this.onStateChange) this.onStateChange();

    const current = this.getCurrentPlayer();
    if (current && current.isAI) {
      setTimeout(() => this.executeAITurn(), 1000);
    }
  }

  // Fitur Tambahkan Bot Pemain Secara Terpisah (Max 8 Pemain)
  addBotPlayer() {
    if (this.players.length >= 8) {
      return { success: false, message: 'Room sudah penuh (Maksimal 8 pemain).' };
    }

    const allTokens = ['🚗', '🚢', '✈️', '🎩', '🐕', '🚀', '🏎️', '👑'];
    const usedTokens = new Set(this.players.map(p => p.token));
    const availableTokens = allTokens.filter(t => !usedTokens.has(t));
    const chosenToken = availableTokens.length > 0 ? availableTokens[0] : allTokens[Math.floor(Math.random() * allTokens.length)];

    const botNames = ['Budi Bot 🤖', 'Siti Bot 🤖', 'Rian Bot 🤖', 'Maya Bot 🤖', 'Doni Bot 🤖', 'Lina Bot 🤖', 'Agus Bot 🤖'];
    const botIdx = this.players.filter(p => p.isAI).length;
    const botName = botNames[botIdx % botNames.length];

    const playerColors = [
      '#4f46e5', '#059669', '#d97706', '#dc2626',
      '#0891b2', '#7c3aed', '#ea580c', '#65a30d'
    ];

    const newBot = {
      id: 'bot_' + Date.now(),
      name: botName,
      avatar: '🤖',
      token: chosenToken,
      color: playerColors[this.players.length % playerColors.length],
      money: this.settings.startingMoney,
      position: 0,
      inJail: false,
      jailTurns: 0,
      jailCards: 0,
      isBankrupt: false,
      isAI: true,
      aiLevel: 'smart'
    };

    this.players.push(newBot);
    this.log(`🤖 ${newBot.name} (${newBot.token}) berhasil ditambahkan ke dalam permainan!`, 'success');
    if (window.soundEngine) window.soundEngine.playWordSuccess();

    if (this.onStateChange) this.onStateChange();
    if (window.roomNetwork?.isHost) window.roomNetwork.broadcastGameState();
    return { success: true, bot: newBot };
  }

  // Tambahkan Pemain Manusia Asli (Real Online Player) yang Masuk Room
  addRealPlayer(playerConfig) {
    if (this.players.length >= 8) {
      return { success: false, message: 'Room penuh (Maksimal 8 pemain).' };
    }

    const existing = this.players.find(p => p.id === playerConfig.id);
    if (existing) {
      existing.name = playerConfig.name || existing.name;
      existing.avatar = playerConfig.avatar || existing.avatar;
      existing.token = playerConfig.token || existing.token;
      if (this.onStateChange) this.onStateChange();
      if (window.monopolyUI) window.monopolyUI.renderBoard();
      return { success: true, player: existing, alreadyExisted: true };
    }

    const allTokens = ['🚗', '🚢', '✈️', '🎩', '🐕', '🚀', '🏎️', '👑', '🤖', '💎', '🐉', '🛡️', '🛸', '🦁', '🧙‍♂️', '🦄'];
    const usedTokens = new Set(this.players.map(p => p.token));
    let token = playerConfig.token;
    if (usedTokens.has(token)) {
      const available = allTokens.filter(t => !usedTokens.has(t));
      token = available[0] || token;
    }

    const playerColors = [
      '#4f46e5', '#059669', '#d97706', '#dc2626',
      '#0891b2', '#7c3aed', '#ea580c', '#65a30d'
    ];

    const newPlayer = {
      id: playerConfig.id || ('usr_' + Date.now()),
      name: playerConfig.name || `Pemain ${this.players.length + 1}`,
      avatar: playerConfig.avatar || '👤',
      token: token,
      color: playerColors[this.players.length % playerColors.length],
      money: this.settings.startingMoney,
      position: 0,
      inJail: false,
      jailTurns: 0,
      jailCards: 0,
      isBankrupt: false,
      isAI: false
    };

    this.players.push(newPlayer);
    this.log(`🎉 ${newPlayer.name} (${newPlayer.token}) berhasil bergabung ke dalam Room!`, 'success');
    if (window.soundEngine) window.soundEngine.playWordSuccess();

    if (this.onStateChange) this.onStateChange();
    if (window.monopolyUI) window.monopolyUI.renderBoard();
    if (window.roomNetwork?.isHost) window.roomNetwork.broadcastGameState();
    return { success: true, player: newPlayer };
  }

  // Serialisasi seluruh status permainan untuk disinkronkan ke seluruh pemain
  serializeState() {
    return {
      currentMapId: this.currentMapId,
      roomId: this.roomId,
      hostId: this.hostId,
      players: this.players,
      currentPlayerIndex: this.currentPlayerIndex,
      dice: this.dice,
      isDouble: this.isDouble,
      doublesCount: this.doublesCount,
      phase: this.phase,
      propertyState: this.propertyState,
      settings: this.settings,
      logs: this.logs.slice(0, 30)
    };
  }

  // Terapkan status permainan yang diterima dari Host (Untuk Guest)
  applyState(state) {
    if (!state) return;
    if (state.currentMapId && state.currentMapId !== this.currentMapId) {
      this.setMap(state.currentMapId);
    }
    this.roomId = state.roomId || this.roomId;
    this.hostId = state.hostId || this.hostId;
    this.players = state.players || this.players;
    this.currentPlayerIndex = state.currentPlayerIndex ?? this.currentPlayerIndex;
    this.dice = state.dice || this.dice;
    this.isDouble = state.isDouble || false;
    this.doublesCount = state.doublesCount || 0;
    this.phase = state.phase || this.phase;
    this.propertyState = state.propertyState || this.propertyState;
    this.settings = state.settings || this.settings;
    if (state.logs) this.logs = state.logs;

    if (this.onStateChange) this.onStateChange();
    if (window.monopolyUI) window.monopolyUI.renderBoard();
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex] || null;
  }

  // =========================================================================
  // SISTEM 2 LEMPAR DADU (CLASSIC DOUBLE & SPEED PERK)
  // =========================================================================
  rollDice() {
    if (this.phase !== 'ROLL') return null;
    this.phase = 'ACTION';
    if (this.onStateChange) this.onStateChange();

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    this.dice = [d1, d2];
    this.isDouble = (d1 === d2);
    this.isTriple = false;

    let totalSteps = d1 + d2;
    const player = this.getCurrentPlayer();

    if (player.token === '🚗' && totalSteps % 2 === 0) {
      totalSteps += 1;
      this.log(`⚡ Skill Pembalap: Dadu genap memberikan bonus +1 langkah! (Total ${totalSteps})`);
    }

    if (this.isDouble) {
      this.doublesCount = (this.doublesCount || 0) + 1;
    } else {
      this.doublesCount = 0;
    }

    this.log(`🎲 ${player.name} melempar 2 DADU: [${d1}] [${d2}] (Total ${totalSteps} Langkah)${this.isDouble ? ' ✨ DADU KEMBAR (DOUBLE)!' : ''}`);

    if (window.soundEngine) window.soundEngine.playType();
    if (window.voiceNarrator) window.voiceNarrator.announceDice(d1, d2, this.isDouble);
    if (this.onDiceRolled) this.onDiceRolled(d1, d2, this.isDouble);

    // Aturan 3x Double Berturut-turut Masuk Penjara
    if (this.doublesCount >= 3) {
      this.log(`🚨 3x DADU KEMBAR BERTURUT-TURUT! ${player.name} terkena razia kecepatan dan langsung masuk penjara!`, 'danger');
      this.doublesCount = 0;
      this.sendToJail(player);
      this.phase = 'END_TURN';
      if (this.onStateChange) this.onStateChange();
      this.checkAutoEndTurn(player);
      return { dice: [d1, d2], inJail: true };
    }

    if (player.inJail) {
      if (this.isDouble) {
        this.log(`🔓 Dadu kembar [${d1}-${d2}]! ${player.name} bebas dari penjara dan bergerak maju!`, 'success');
        player.inJail = false;
        player.jailTurns = 0;
        this.doublesCount = 0;
        this.phase = 'ACTION';
        this.movePlayerSteps(player, totalSteps);
      } else {
        player.jailTurns++;
        if (player.jailTurns >= 3) {
          this.log(`⏱️ Batas 3 putaran habis! ${player.name} membayar denda bebas ${this.formatRupiah(this.settings.jailFine)}.`);
          this.deductMoney(player, this.settings.jailFine);
          player.inJail = false;
          player.jailTurns = 0;
          this.phase = 'ACTION';
          this.movePlayerSteps(player, totalSteps);
        } else {
          this.log(`🔒 ${player.name} masih tertahan di penjara (Putaran ${player.jailTurns}/3).`);
          this.phase = 'END_TURN';
          if (this.onStateChange) this.onStateChange();
          this.checkAutoEndTurn(player);
        }
      }
      return { dice: [d1, d2], isDouble: this.isDouble };
    }

    this.phase = 'ACTION';
    this.movePlayerSteps(player, totalSteps);
    return { dice: [d1, d2], isDouble: this.isDouble };
  }

  movePlayerSteps(player, steps) {
    const oldPos = player.position;
    const newPos = (oldPos + steps) % this.totalTiles;

    if (this.onPlayerMove) {
      this.onPlayerMove(player, oldPos, steps, () => {
        if (newPos < oldPos && steps > 0) {
          let reward = window.monopolyEconomy ? window.monopolyEconomy.getPassGoReward(this.settings.passGoReward) : this.settings.passGoReward;
          if (window.monopolySkills) reward = window.monopolySkills.getPassGoBonus(player, reward);
          player.money += reward;
          this.log(`🚩 ${player.name} melewati MULAI dan menerima bonus ${this.formatRupiah(reward)}!`, 'success');
          if (window.soundEngine) window.soundEngine.playWordSuccess();
        }
        player.position = newPos;
        this.handleTileLanding(player, newPos);
      });
    } else {
      if (newPos < oldPos && steps > 0) {
        let reward = window.monopolyEconomy ? window.monopolyEconomy.getPassGoReward(this.settings.passGoReward) : this.settings.passGoReward;
        if (window.monopolySkills) reward = window.monopolySkills.getPassGoBonus(player, reward);
        player.money += reward;
        this.log(`🚩 ${player.name} melewati MULAI dan menerima bonus ${this.formatRupiah(reward)}!`, 'success');
        if (window.soundEngine) window.soundEngine.playWordSuccess();
      }
      player.position = newPos;
      this.handleTileLanding(player, newPos);
    }
  }

  handleTileLanding(player, tileId) {
    const tile = this.activeTiles[tileId];
    if (!tile) return;

    this.log(`📍 ${player.name} mendarat di [${tile.name}].`);
    if (window.voiceNarrator) window.voiceNarrator.announceLanding(player.name, tile.name);

    if (!player.isAI && player.money >= 30000000 && window.achievementEngine) {
      window.achievementEngine.unlock('TYCOON_CASH');
    }

    if (tile.type === 'property' || tile.type === 'station' || tile.type === 'utility') {
      const prop = this.propertyState[tileId];

      if (!prop.ownerId) {
        if (player.isAI) {
          this.handleAIBuyDecision(player, tile);
        } else {
          if (this.onTileActionRequired) {
            this.onTileActionRequired({ player, tile, actionType: 'BUY_PROMPT' });
          }
        }
      } else if (prop.ownerId === player.id) {
        this.log(`🏠 ${player.name} berkunjung ke aset properti miliknya sendiri.`);
        this.checkAutoEndTurn(player);
      } else {
        const owner = this.players.find(p => p.id === prop.ownerId);
        if (owner && !owner.isBankrupt && !prop.isMortgaged) {
          // Cek Perisai Kebal Pasar Gelap
          if (player.hasShield) {
            player.hasShield = false;
            this.log(`🛡️ [PERISAI KEBAL DIGUNAKAN] ${player.name} kebal bebas sewa 1x di [${tile.name}]!`, 'success');
          } else if (owner.isBlackedOut) {
            this.log(`⚡ [MATI LISTRIK] Kawasan milik ${owner.name} sedang padam listrik! ${player.name} bebas biaya sewa!`, 'info');
          } else if (window.monopolySkills && window.monopolySkills.isStationRentExempt(player, tile)) {
            this.log(`🚢 Keahlian Kapten Maritim! ${player.name} bebas biaya sewa stasiun/bandara!`, 'success');
          } else if (window.monopolySkills && window.monopolySkills.checkEmperorFreeRent(player)) {
            this.log(`👑 Keahlian Kaisar Properti! ${player.name} kebal bebas sewa 1x di [${tile.name}]!`, 'success');
          } else {
            let rent = this.calculateRent(tileId);
            if (window.monopolySkills) {
              rent = window.monopolySkills.getPayRentDiscount(player, rent);
            }
            let buildingTierName = 'Tanah Kosong';
            let buildingTierIcon = '📍';

            if (tile.type === 'property') {
              if (prop.isSkyscraper) {
                buildingTierName = '🏢 Gedung Pencakar Langit (Sky Level 6)';
                buildingTierIcon = '🏢';
              } else if (prop.isHotel) {
                buildingTierName = '🏨 Hotel Megah (Level 5)';
                buildingTierIcon = '🏨';
              } else if (prop.houses > 0) {
                buildingTierName = `🏠 ${prop.houses} Rumah (Level ${prop.houses})`;
                buildingTierIcon = '🏠'.repeat(prop.houses);
              } else if (this.checkFullGroupOwnership(prop.ownerId, tile.group)) {
                buildingTierName = '🎨 Monopoli 1 Warna Penuh (2x Sewa)';
                buildingTierIcon = '👑';
              } else {
                buildingTierName = '📍 Tanah Kosong (Sewa Dasar)';
                buildingTierIcon = '📍';
              }
            } else if (tile.type === 'station') {
              buildingTierName = '🚆 Stasiun Kereta / Bandara';
              buildingTierIcon = '🚆';
            } else if (tile.type === 'utility') {
              buildingTierName = '⚡ Utilitas Publik';
              buildingTierIcon = '⚡';
            }

            this.log(`💸 [DENDA SEWA] ${player.name} mendarat di properti milik ${owner.name} [${tile.name}] (${buildingTierName}) dan dikenakan denda sewa sebesar ${this.formatRupiah(rent)}!`, 'warning');
            this.transferMoney(player, owner, rent);

            // Royalti / Dividen Ratu Permata
            if (window.monopolySkills) {
              window.monopolySkills.triggerLandingPerks(owner, player, tile, this);
            }

            // Cashback FinTech Smart City jika event aktif
            const cashbackRate = window.monopolyEconomy ? window.monopolyEconomy.getCashbackPercent() : 0;
            if (cashbackRate > 0) {
              const cashback = Math.floor(rent * cashbackRate);
              player.money += cashback;
              this.log(`🌐 [CASHBACK FINTECH 20%] ${player.name} menerima stimulus pengembalian dana ${this.formatRupiah(cashback)} dari kas pusat!`, 'success');
            }

            if (window.monopolyUI && window.monopolyUI.showRentToast) {
              window.monopolyUI.showRentToast(player, owner, tile, rent, buildingTierName, buildingTierIcon);
            }

            if (window.monopolyChat) {
              window.monopolyChat.triggerAIChatReaction('RENT_PAID', owner, player, { tile, rent, buildingTierName });
            }
          }
        } else if (prop.isMortgaged) {
          this.log(`🛡️ Properti [${tile.name}] sedang digadaikan. Bebas biaya sewa.`);
        }

        // Bonus Souvenir World Expo jika event berlangsung
        if (window.monopolyEconomy?.currentEvent?.id === 'WORLD_EXPO_CARNIVAL') {
          const expoBonus = window.monopolyEconomy.currentEvent.expoBonus || 500000;
          player.money += expoBonus;
          this.log(`🎪 [WORLD EXPO] ${player.name} menerima bonus souvenir turis sebesar ${this.formatRupiah(expoBonus)}!`, 'success');
        }

        if (window.monopolyBounty) window.monopolyBounty.checkAllQuests(this, player);
        this.checkAutoEndTurn(player);
      }
      return;
    }

    if (tile.type === 'tax') {
      if (window.monopolyEconomy && window.monopolyEconomy.isTaxFree()) {
        this.log(`🏛️ Program Pengampunan Pajak Aktif! ${player.name} bebas biaya pajak!`, 'success');
      } else {
        let tax = tile.taxAmount || 2000000;
        if (window.monopolySkills) tax = Math.floor(tax * window.monopolySkills.isTaxExempt(player, tile));
        this.log(`🧾 ${player.name} terkena ${tile.name} sebesar ${this.formatRupiah(tax)}!`, 'danger');
        this.deductMoney(player, tax);

        // 50% dari pajak masuk ke Kolam Hadiah Jackpot Dunia!
        const jackpotShare = Math.floor(tax * 0.5);
        this.jackpotPool = (this.jackpotPool || 0) + jackpotShare;
        this.log(`💰 ${this.formatRupiah(jackpotShare)} masuk ke Kolam Hadiah Jackpot Dunia (Total Kas Jackpot: ${this.formatRupiah(this.jackpotPool)})!`, 'info');
      }
      this.checkAutoEndTurn(player);
      return;
    }

    const jailTarget = this.activeMap.goToJailTileId || 30;
    if (tileId === jailTarget) {
      if (window.monopolySkills && window.monopolySkills.checkJailImmunity(player)) {
        this.log(`🐕 Keahlian Detektif Cerdik! ${player.name} lolos dari razia petugas!`, 'success');
        this.checkAutoEndTurn(player);
      } else {
        this.log(`🚨 KENA RAZIA! ${player.name} dijebloskan langsung ke Penjara!`, 'danger');
        this.sendToJail(player);
        this.phase = 'END_TURN';
        if (this.onStateChange) this.onStateChange();
        this.checkAutoEndTurn(player);
      }
      return;
    }

    // Mendarat di Parkir Bebas / Istirahat -> Kasino & Menangkan Jackpot Pajak Dunia jika ada
    const freeParkId = this.activeMap.freeParkingTileId || 20;
    if (tile.type === 'rest' || tile.type === 'free_parking' || tileId === freeParkId) {
      if (this.jackpotPool && this.jackpotPool > 0) {
        const winJackpot = this.jackpotPool;
        player.money += winJackpot;
        this.jackpotPool = 0;
        this.log(`🎉 [JACKPOT LOTERE PAJAK DUNIA] ${player.name} mendarat di ${tile.name} dan memenangkan SELURUH Kas Pajak sebesar ${this.formatRupiah(winJackpot)}!`, 'success');
        if (typeof confetti === 'function' && !player.isAI) {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
        }
        if (window.soundEngine) window.soundEngine.playVictory();
      }

      this.log(`🎰 ${player.name} singgah di Parkir Bebas & memutar Kasino Roda Keberuntungan!`, 'warning');
      if (window.monopolyCasino) {
        window.monopolyCasino.openCasinoModal(this, player);
      } else {
        this.checkAutoEndTurn(player);
      }
      return;
    }

    if (tile.type === 'chance' || tile.type === 'chest') {
      this.drawCard(player, tile.type);
      return;
    }

    this.checkAutoEndTurn(player);
  }

  drawCard(player, type) {
    const deck = type === 'chance' ? CHANCE_CARDS : CHEST_CARDS;
    const card = deck[Math.floor(Math.random() * deck.length)];

    this.log(`${type === 'chance' ? '🃏 KESEMPATAN' : '💼 DANA UMUM'} untuk ${player.name}: "${card.text}"`, 'info');

    if (this.onTileActionRequired) {
      this.onTileActionRequired({ player, card, cardType: type, actionType: 'CARD_POPUP' });
    }

    setTimeout(() => this.executeCardAction(player, card), 1200);
  }

  executeCardAction(player, card) {
    if (card.action === 'move_to') {
      const oldPos = player.position;
      if (card.collectGo && card.targetTile < oldPos) {
        player.money += this.settings.passGoReward;
      }
      player.position = card.targetTile;
      this.handleTileLanding(player, card.targetTile);
      return;
    } else if (card.action === 'move_to_highest') {
      const highestTile = this.activeTiles.filter(t => t.type === 'property').slice(-1)[0];
      if (highestTile) {
        player.position = highestTile.id;
        this.handleTileLanding(player, highestTile.id);
      }
      return;
    } else if (card.action === 'move_to_nearest_station') {
      const stations = this.activeTiles.filter(t => t.type === 'station');
      if (stations.length > 0) {
        let nearest = stations[0];
        for (let s of stations) {
          if (s.id >= player.position) { nearest = s; break; }
        }
        player.position = nearest.id;
        this.handleTileLanding(player, nearest.id);
      }
      return;
    } else if (card.action === 'receive_money') {
      player.money += card.amount;
    } else if (card.action === 'pay_money') {
      this.deductMoney(player, card.amount);
    } else if (card.action === 'get_jail_card') {
      player.jailCards++;
    } else if (card.action === 'go_to_jail') {
      this.sendToJail(player);
      this.phase = 'END_TURN';
      if (this.onStateChange) this.onStateChange();
      this.checkAutoEndTurn(player);
      return;
    } else if (card.action === 'collect_from_players') {
      this.players.forEach(p => {
        if (p.id !== player.id && !p.isBankrupt) this.transferMoney(p, player, card.amount);
      });
    } else if (card.action === 'property_repairs') {
      let totalCost = 0;
      this.activeTiles.forEach(t => {
        const prop = this.propertyState[t.id];
        if (prop && prop.ownerId === player.id) {
          if (prop.isHotel) totalCost += (card.hotelFee || 1000000);
          else if (prop.houses > 0) totalCost += prop.houses * (card.houseFee || 250000);
        }
      });
      if (totalCost > 0) {
        this.log(`🔨 Biaya renovasi properti ${player.name}: ${this.formatRupiah(totalCost)}`, 'warning');
        this.deductMoney(player, totalCost);
      } else {
        this.log(`✨ ${player.name} tidak memiliki bangunan sehingga bebas biaya renovasi.`);
      }
    }

    this.checkAutoEndTurn(player);
  }

  sendToJail(player) {
    player.position = this.activeMap.jailTileId || 10;
    player.inJail = true;
    player.jailTurns = 0;
    if (window.soundEngine) window.soundEngine.playError();
  }

  // =========================================================================
  // STRUKTUR SEWA BERTINGKAT (TIERED RENT SYSTEM)
  // =========================================================================
  calculateRent(tileId) {
    const tile = this.activeTiles[tileId];
    const prop = this.propertyState[tileId];
    if (!tile || !prop || !prop.ownerId) return 0;

    const owner = this.players.find(p => p.id === prop.ownerId);
    let rent = 0;

    if (tile.type === 'station') {
      const stations = this.activeTiles.filter(t => (t.type === 'station') && this.propertyState[t.id]?.ownerId === prop.ownerId).length;
      rent = tile.rent[Math.min(stations - 1, tile.rent.length - 1)] || 350000;
    } else if (tile.type === 'utility') {
      const utils = this.activeTiles.filter(t => (t.type === 'utility') && this.propertyState[t.id]?.ownerId === prop.ownerId).length;
      const sum = this.dice.reduce((a, b) => a + b, 0);
      rent = sum * (utils >= 2 ? 150000 : 60000);
    } else if (tile.type === 'property') {
      if (prop.isSkyscraper) {
        rent = Math.floor(tile.rent[5] * 1.8); // Tier 6: Gedung Pencakar Langit Megah (1.8x Hotel)
      } else if (prop.isHotel) {
        rent = tile.rent[5]; // Tier 5: Hotel Megah
      } else if (prop.houses > 0) {
        rent = tile.rent[prop.houses]; // Tier 1-4 Rumah
      } else {
        const fullGroup = this.checkFullGroupOwnership(prop.ownerId, tile.group);
        rent = fullGroup ? tile.rent[0] * 2 : tile.rent[0]; // Tier: Monopoli Warna Penuh (2x) / Dasar
      }
    }

    if (owner && window.monopolySkills) {
      rent = window.monopolySkills.modifyRentByOwner(owner, tile, rent);
    }

    if (window.monopolyEconomy) {
      rent = window.monopolyEconomy.getModifiedRent(tile, rent, this);
    }

    if (window.monopolyDisaster) {
      rent = window.monopolyDisaster.getModifiedRent(rent, tile);
    }

    return rent;
  }

  checkFullGroupOwnership(ownerId, groupId) {
    if (!ownerId || !groupId || groupId === 'SPECIAL') return false;
    const groupTiles = this.activeTiles.filter(t => t.group === groupId);
    return groupTiles.every(t => this.propertyState[t.id]?.ownerId === ownerId);
  }

  buyProperty(player, tileId) {
    const tile = this.activeTiles[tileId];
    const prop = this.propertyState[tileId];
    if (!tile || !prop || prop.ownerId) return false;

    let price = tile.price;
    if (window.monopolySkills) price = window.monopolySkills.getPurchaseCostModifier(player, price);

    if (player.money < price) return false;

    player.money -= price;
    prop.ownerId = player.id;

    this.log(`🎉 ${player.name} resmi membeli [${tile.name}] seharga ${this.formatRupiah(price)}!`, 'success');
    if (window.soundEngine) window.soundEngine.playWordSuccess();

    if (this.checkFullGroupOwnership(player.id, tile.group)) {
      const groupName = this.activeGroups[tile.group]?.name || tile.group;
      this.log(`👑 HAK MONOPOLI AKTIF! ${player.name} berhasil menguasai 1 SET LENGKAP ${groupName}! Efek: Uang sewa dasar tanah tanpa bangunan di seluruh area ini berlipat ganda 2x lipat!`, 'success');
      if (typeof confetti === 'function' && !player.isAI) {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
      }
      if (!player.isAI && window.achievementEngine) window.achievementEngine.unlock('COLOR_MONOPOLY');
      if (window.soundEngine) window.soundEngine.playVictory();
    }

    if (this.onStateChange) this.onStateChange();
    this.checkAutoEndTurn(player);
    return true;
  }

  buildHouse(player, tileId) {
    const tile = this.activeTiles[tileId];
    const prop = this.propertyState[tileId];
    const group = this.activeGroups[tile.group];

    if (!tile || !prop || prop.ownerId !== player.id || !group || group.houseCost <= 0) return false;
    if (!this.checkFullGroupOwnership(player.id, tile.group) || prop.isSkyscraper) return false;

    let cost = group.houseCost;
    if (prop.isHotel) cost = Math.floor(cost * 1.5); // Biaya bangun Gedung Pencakar Langit
    if (window.monopolyEconomy) cost = window.monopolyEconomy.getModifiedHouseCost(cost);
    if (window.monopolySkills) cost = window.monopolySkills.getHouseBuildingCost(player, cost);

    if (player.money < cost) return false;

    player.money -= cost;
    if (prop.houses < 4 && !prop.isHotel) {
      prop.houses++;
      this.log(`🏗️ ${player.name} membangun Rumah ke-${prop.houses} di [${tile.name}] seharga ${this.formatRupiah(cost)}.`, 'success');
    } else if (prop.houses >= 4 && !prop.isHotel) {
      prop.houses = 4;
      prop.isHotel = true;
      this.log(`🏨 HOTEL MEGAH! ${player.name} meresmikan Hotel Megah di [${tile.name}]!`, 'success');
    } else if (prop.isHotel && !prop.isSkyscraper) {
      prop.isSkyscraper = true;
      this.log(`🏢 PENCAKAR LANGIT MEGAH! ${player.name} mendirikan Gedung Pencakar Langit di [${tile.name}] seharga ${this.formatRupiah(cost)}!`, 'success');
      if (!player.isAI && window.achievementEngine) window.achievementEngine.unlock('SKYSCRAPER_BUILDER');
    }

    if (window.soundEngine) window.soundEngine.playVictory();
    if (this.onStateChange) this.onStateChange();
    return true;
  }

  transferMoney(fromPlayer, toPlayer, amount) {
    this.deductMoney(fromPlayer, amount);
    if (!fromPlayer.isBankrupt) toPlayer.money += amount;
    if (this.onStateChange) this.onStateChange();
  }

  deductMoney(player, amount) {
    if (player.money >= amount) {
      player.money -= amount;
    } else {
      const netWorth = this.calculateNetWorth(player);
      if (netWorth < amount) {
        this.declareBankruptcy(player);
      } else {
        player.money -= amount;
      }
    }
  }

  calculateNetWorth(player) {
    let total = player.money;
    this.activeTiles.forEach(t => {
      const prop = this.propertyState[t.id];
      if (prop && prop.ownerId === player.id) {
        total += (t.price || 0);
        const group = this.activeGroups[t.group];
        if (group && prop.houses > 0) total += prop.houses * group.houseCost;
      }
    });
    return total;
  }

  declareBankruptcy(player) {
    player.isBankrupt = true;
    player.money = 0;
    this.log(`💀 KEBANGKRUTAN! ${player.name} dinyatakan pailit dan gugur dari permainan!`, 'danger');
    if (window.soundEngine) window.soundEngine.playError();

    this.activeTiles.forEach(t => {
      const prop = this.propertyState[t.id];
      if (prop && prop.ownerId === player.id) {
        prop.ownerId = null;
        prop.houses = 0;
        prop.isHotel = false;
        prop.isMortgaged = false;
      }
    });

    this.checkGameOver();
  }

  endTurn() {
    if (this.phase === 'GAME_OVER') return;

    if (window.monopolyBank) {
      window.monopolyBank.processLoanInterest(this, this.getCurrentPlayer());
    }

    if (this.isDouble && !this.getCurrentPlayer().inJail && !this.getCurrentPlayer().isBankrupt) {
      this.log(`✨ Dadu kembar! ${this.getCurrentPlayer().name} mendapat lemparan dadu tambahan!`);
      this.phase = 'ROLL';
      if (this.onStateChange) this.onStateChange();
      if (this.getCurrentPlayer().isAI) setTimeout(() => this.executeAITurn(), 1200);
      return;
    }

    this.doublesCount = 0;
    let nextIdx = (this.currentPlayerIndex + 1) % this.players.length;
    let guard = 0;
    while (this.players[nextIdx].isBankrupt && guard < this.players.length) {
      nextIdx = (nextIdx + 1) % this.players.length;
      guard++;
    }

    this.currentPlayerIndex = nextIdx;
    this.phase = 'ROLL';
    const nextPlayer = this.getCurrentPlayer();
    this.log(`➡️ Giliran: ${nextPlayer.name}`);

    if (window.monopolyEconomy) {
      window.monopolyEconomy.checkRoundProgress(this);
    }

    if (window.monopolyDisaster) {
      window.monopolyDisaster.onTurnEnd(this);
    }

    if (window.monopolyStocks) {
      window.monopolyStocks.updateMarket(this);
    }

    if (window.monopolyBounty) {
      window.monopolyBounty.checkAllQuests(this, nextPlayer);
    }

    // Reset status padam listrik lawan jika ada
    if (nextPlayer.isBlackedOut) {
      nextPlayer.isBlackedOut = false;
    }

    // Segera perbarui state UI (enable tombol Lempar Dadu & update nama giliran)
    if (this.onStateChange) this.onStateChange();

    if (nextPlayer.isAI) {
      setTimeout(() => this.executeAITurn(), 1000);
    }
  }

  checkAutoEndTurn(player) {
    if (player.isAI) {
      setTimeout(() => {
        this.handleAIHouseBuilding(player);
        this.endTurn();
      }, 1000);
    } else {
      this.phase = 'END_TURN';
      if (this.onStateChange) this.onStateChange();
    }
  }

  checkGameOver() {
    const active = this.players.filter(p => !p.isBankrupt);
    if (active.length <= 1) {
      this.phase = 'GAME_OVER';
      const winner = active[0] || this.players[0];
      this.log(`🏆 SELAMAT! ${winner.name} keluar sebagai JUARA MONOPOLI!`, 'success');
      if (window.soundEngine) window.soundEngine.playVictory();
      if (this.onGameOver) this.onGameOver(winner);
      if (this.onStateChange) this.onStateChange();
      return true;
    }
    return false;
  }

  // AI Decision Logic
  executeAITurn() {
    const player = this.getCurrentPlayer();
    if (!player || !player.isAI || player.isBankrupt || this.phase === 'GAME_OVER') {
      if (player && player.isBankrupt) this.endTurn();
      return;
    }

    this.phase = 'ROLL';
    if (this.onStateChange) this.onStateChange();

    if (player.inJail) {
      if (player.jailCards > 0) {
        player.jailCards--;
        player.inJail = false;
        player.jailTurns = 0;
        this.log(`🤖 ${player.name} menggunakan Kartu Bebas Penjara!`, 'success');
      } else if (player.money > 4000000) {
        this.deductMoney(player, this.settings.jailFine);
        player.inJail = false;
        player.jailTurns = 0;
        this.log(`🤖 ${player.name} membayar denda bebas penjara ${this.formatRupiah(this.settings.jailFine)}.`);
      }
    }

    this.rollDice();
  }

  handleAIBuyDecision(player, tile) {
    let buffer = 1000000;
    const personality = player.personality || player.aiLevel || 'smart';

    if (personality === 'aggressive') {
      buffer = 500000; // Agresif: Cadangan kas tipis, selalu beli
    } else if (personality === 'conservative') {
      buffer = 3500000; // Konservatif: Cadangan kas tebal Rp 3.5M
    } else if (personality === 'trader') {
      buffer = 1200000; // Negosiator
    } else if (player.aiLevel === 'expert') {
      buffer = 1500000;
    }

    const canAfford = (player.money - tile.price) >= buffer;
    const isStrategic = this.isStrategicTileForAI(player, tile);

    if (canAfford || (isStrategic && player.money >= tile.price)) {
      setTimeout(() => this.buyProperty(player, tile.id), 700);
    } else {
      this.log(`🤖 ${player.name} (${personality}) melewatkan pembelian [${tile.name}]. Membuka Lelang Publik!`);
      this.phase = 'AUCTION';
      if (window.monopolyAuction) {
        window.monopolyAuction.startAuction(this, tile, () => this.checkAutoEndTurn(player));
      } else {
        this.checkAutoEndTurn(player);
      }
    }
  }

  isStrategicTileForAI(player, tile) {
    if (!tile.group || tile.group === 'SPECIAL') return false;
    const groupTiles = this.activeTiles.filter(t => t.group === tile.group);
    const owned = groupTiles.filter(t => this.propertyState[t.id]?.ownerId === player.id).length;
    return owned >= (groupTiles.length - 1);
  }

  handleAIHouseBuilding(player) {
    let buffer = 2000000;
    const personality = player.personality || player.aiLevel || 'smart';

    if (personality === 'aggressive') {
      buffer = 1000000; // Membangun secepatnya
    } else if (personality === 'conservative') {
      buffer = 4000000; // Hanya membangun jika kas sangat aman
    }

    if (player.money < buffer) return;

    const ownedGroups = new Set();
    this.activeTiles.forEach(t => {
      if (t.type === 'property' && this.propertyState[t.id]?.ownerId === player.id) {
        if (this.checkFullGroupOwnership(player.id, t.group)) ownedGroups.add(t.group);
      }
    });

    ownedGroups.forEach(groupId => {
      const groupTiles = this.activeTiles.filter(t => t.group === groupId);
      const groupConfig = this.activeGroups[groupId];
      groupTiles.forEach(t => {
        const prop = this.propertyState[t.id];
        if (prop && !prop.isHotel && (player.money - groupConfig.houseCost) >= buffer) {
          this.buildHouse(player, t.id);
        }
      });
    });
  }

  // =========================================================================
  // SISTEM DISCONNECT & AUTO-KICK 1 MENIT 30 DETIK (90 DETIK)
  // =========================================================================
  markPlayerDisconnected(player) {
    if (!player || player.isAI || player.isBankrupt) return;
    if (player.isDisconnected) return;

    player.isDisconnected = true;
    player.disconnectSecondsLeft = 90; // 1 menit 30 detik

    this.log(`⚠️ [DISCONNECT DETECTED] ${player.name} terputus dari jaringan! Waktu tunggu tersambung: 1 menit 30 detik (90s).`, 'warning');
    if (window.soundEngine) window.soundEngine.playError();

    if (player.disconnectInterval) clearInterval(player.disconnectInterval);

    player.disconnectInterval = setInterval(() => {
      player.disconnectSecondsLeft--;
      this.updateDisconnectBannerUI(player);

      if (player.disconnectSecondsLeft <= 0) {
        clearInterval(player.disconnectInterval);
        player.disconnectInterval = null;
        this.kickDisconnectedPlayer(player);
      }
    }, 1000);

    this.updateDisconnectBannerUI(player);
    if (this.onStateChange) this.onStateChange();
  }

  markPlayerReconnected(player) {
    if (!player || !player.isDisconnected) return;

    player.isDisconnected = false;
    player.disconnectSecondsLeft = 90;
    if (player.disconnectInterval) {
      clearInterval(player.disconnectInterval);
      player.disconnectInterval = null;
    }

    this.log(`✅ [RECONNECTED] ${player.name} berhasil tersambung kembali ke room game!`, 'success');
    if (window.soundEngine) window.soundEngine.playVictory();

    this.updateDisconnectBannerUI(null);
    if (this.onStateChange) this.onStateChange();
  }

  kickDisconnectedPlayer(player) {
    if (!player || player.isBankrupt) return;

    this.log(`🚨 [DISCONNECT TIMEOUT] ${player.name} otomatis dikeluarkan dari room karena tidak tersambung lebih dari 1 menit 30 detik!`, 'danger');

    // Lepas seluruh aset properti milik pemain yang dikeluarkan ke Bank (Open Market)
    let releasedCount = 0;
    this.activeTiles.forEach(t => {
      const prop = this.propertyState[t.id];
      if (prop && prop.ownerId === player.id) {
        prop.ownerId = null;
        prop.houses = 0;
        prop.isHotel = false;
        prop.isSkyscraper = false;
        prop.isMortgaged = false;
        releasedCount++;
      }
    });

    if (releasedCount > 0) {
      this.log(`🏛️ Sebanyak ${releasedCount} aset tanah milik ${player.name} dilepaskan kembali ke Bank dan dapat dibeli pemain lain!`, 'info');
    }

    player.isBankrupt = true;
    player.isDisconnected = false;
    this.updateDisconnectBannerUI(null);

    // Jika sedang giliran pemain yang di-kick, otomatis lanjutkan ke giliran berikutnya
    const isCurrent = this.players[this.currentPlayerIndex]?.id === player.id;
    if (isCurrent) {
      this.phase = 'END_TURN';
      this.checkAutoEndTurn(player);
    }

    this.checkWinner();
    if (this.onStateChange) this.onStateChange();
  }

  updateDisconnectBannerUI(disconnectedPlayer) {
    const banner = document.getElementById('mono-disconnect-banner');
    const nameEl = document.getElementById('mono-dc-player-name');
    const timerEl = document.getElementById('mono-dc-timer-text');

    if (!banner) return;

    if (!disconnectedPlayer || !disconnectedPlayer.isDisconnected) {
      banner.classList.add('hidden');
      return;
    }

    banner.classList.remove('hidden');
    if (nameEl) nameEl.textContent = `${disconnectedPlayer.token} ${disconnectedPlayer.name}`;

    if (timerEl) {
      const mins = Math.floor(disconnectedPlayer.disconnectSecondsLeft / 60);
      const secs = disconnectedPlayer.disconnectSecondsLeft % 60;
      timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  }
}

window.monopolyEngine = new MonopolyEngine();
