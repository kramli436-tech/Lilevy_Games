/**
 * LILEVY GAMES - MONOPOLI PRO (UI CONTROLLER & TIERED RENT RENDERER)
 * Mengelola rendering papan 14x14 & 11x11, thumbnail foto kota HD,
 * Tabel Struktur Tarif Sewa Bertingkat (Tiered Rent), 3 Dadu 3D, dan Room ID.
 */

class MonopolyUI {
  constructor() {
    this.boardEl = null;
    this.diceCube1 = null;
    this.diceCube2 = null;
    this.diceCube3 = null;
  }

  init() {
    this.boardEl = document.getElementById('monopoly-board');
    this.diceCube1 = document.getElementById('dice-cube-1');
    this.diceCube2 = document.getElementById('dice-cube-2');

    this.bindCallbacks();
  }

  bindCallbacks() {
    const engine = window.monopolyEngine;
    if (!engine) return;

    engine.onStateChange = () => this.updateUI();

    engine.onMapChanged = () => {
      this.renderBoard();
      this.updateUI();
    };

    // 2 Lempar Dadu UI Animation (3D Dice Roll Effect)
    engine.onDiceRolled = (d1, d2, isDouble) => {
      const diceIcons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      const cubes = [this.diceCube1, this.diceCube2];
      
      cubes.forEach(c => {
        if (c) {
          c.classList.remove('dice-roll-anim');
          void c.offsetWidth; // Trigger reflow
          c.classList.add('dice-roll-anim', 'dice-rolling');
        }
      });

      setTimeout(() => {
        if (this.diceCube1) this.diceCube1.textContent = diceIcons[d1 - 1];
        if (this.diceCube2) this.diceCube2.textContent = diceIcons[d2 - 1];

        cubes.forEach(c => {
          if (c) {
            c.classList.remove('dice-rolling');
            if (isDouble) c.classList.add('ring-4', 'ring-amber-400', 'shadow-xl', 'scale-105');
            else c.classList.remove('ring-4', 'ring-amber-400', 'shadow-xl', 'scale-105');
          }
        });
      }, 480);
    };

    engine.onLogAdded = (entry) => {
      const feed = document.getElementById('mono-log-feed');
      if (!feed) return;
      const item = document.createElement('div');
      item.className = `p-1.5 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 leading-snug ${
        entry.type === 'success' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' :
        entry.type === 'danger' ? 'text-rose-600 dark:text-rose-400 font-semibold' :
        entry.type === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
      }`;
      item.innerHTML = `<span class="text-[10px] opacity-50 mr-1">${entry.time}</span> ${entry.text}`;
      feed.insertBefore(item, feed.firstChild);
    };

    // Animasi Berjalan Step-by-Step Sesuai Angka Dadu dengan Efek Hop & Ripple
    engine.onPlayerMove = (player, startPos, steps, onComplete) => {
      let currentStep = 0;
      let currentPos = startPos;
      const totalTiles = engine.totalTiles;

      if (steps <= 0) {
        if (onComplete) onComplete();
        return;
      }

      const stepInterval = setInterval(() => {
        currentStep++;
        currentPos = (currentPos + 1) % totalTiles;
        player.position = currentPos;

        // Render efek langkah token pada petak aktif
        this.renderStepMove(player, currentPos);

        // Bunyi langkah
        if (window.soundEngine) {
          window.soundEngine.playType();
        }

        if (currentStep >= steps) {
          clearInterval(stepInterval);
          setTimeout(() => {
            this.clearStepEffects();
            this.updateUI();
            if (onComplete) onComplete();
          }, 220);
        }
      }, 190);
    };

    engine.onTileActionRequired = ({ player, tile, card, cardType, actionType }) => {
      if (actionType === 'BUY_PROMPT') {
        this.showBuyPrompt(player, tile);
      } else if (actionType === 'CARD_POPUP') {
        this.showCardPopup(cardType, card);
      }
    };

    if (window.monopolyAuction) {
      window.monopolyAuction.onAuctionUpdate = () => this.updateAuctionModal();
      window.monopolyAuction.onAuctionEnd = () => {
        const modal = document.getElementById('modal-mono-auction');
        if (modal) modal.classList.remove('modal-open');
      };
    }
  }

  // Render Langkah Token dengan Efek Visual Berjalan & Token Hop
  renderStepMove(player, currentPos) {
    const engine = window.monopolyEngine;
    if (!engine) return;

    // Bersihkan efek petak sebelumnya
    this.clearStepEffects();

    // Berikan efek highlight dan ripple pada petak yang sedang dipijak
    const tileEl = document.getElementById(`mono-tile-${currentPos}`) || document.getElementById(`tile-${currentPos}`);
    if (tileEl) {
      tileEl.classList.add('tile-step-active');
      const ripple = document.createElement('div');
      ripple.className = 'tile-step-ripple';
      tileEl.appendChild(ripple);
    }

    // Perbarui posisi token pada seluruh petak
    document.querySelectorAll('.tile-tokens-container').forEach(el => el.innerHTML = '');
    engine.players.forEach(p => {
      if (!p.isBankrupt) {
        const container = document.getElementById(`tokens-tile-${p.position}`);
        if (container) {
          const badge = document.createElement('span');
          const isWalking = (p.id === player.id);
          badge.className = `player-token-badge ${isWalking ? 'token-walking token-hop' : ''}`;
          badge.textContent = p.token || '🚗';
          badge.title = `${p.name} (${engine.formatRupiah(p.money)})`;
          badge.style.filter = `drop-shadow(0 3px 5px ${p.color || '#000'})`;
          container.appendChild(badge);
        }
      }
    });
  }

  clearStepEffects() {
    document.querySelectorAll('.tile-step-active').forEach(el => el.classList.remove('tile-step-active'));
    document.querySelectorAll('.tile-step-ripple').forEach(el => el.remove());
  }

  getTileGridPosition(tileId) {
    const engine = window.monopolyEngine;
    const mapId = engine.currentMapId;

    if (mapId === 'galaxy') {
      // Peta Galaksi (64 Petak Perimeter 17x17)
      if (tileId >= 0 && tileId <= 16) {
        return { col: 17 - tileId, row: 17 };
      } else if (tileId >= 17 && tileId <= 32) {
        return { col: 1, row: 17 - (tileId - 16) };
      } else if (tileId >= 33 && tileId <= 48) {
        return { col: 1 + (tileId - 32), row: 1 };
      } else {
        return { col: 17, row: 1 + (tileId - 48) };
      }
    } else if (mapId === 'world') {
      // Peta Dunia (52 Petak Perimeter 14x14)
      if (tileId >= 0 && tileId <= 13) {
        return { col: 14 - tileId, row: 14 };
      } else if (tileId >= 14 && tileId <= 26) {
        return { col: 1, row: 14 - (tileId - 13) };
      } else if (tileId >= 27 && tileId <= 39) {
        return { col: 1 + (tileId - 26), row: 1 };
      } else {
        return { col: 14, row: 1 + (tileId - 39) };
      }
    } else {
      // Peta Nusantara (40 Petak Perimeter 11x11)
      if (tileId >= 0 && tileId <= 10) {
        return { col: 11 - tileId, row: 11 };
      } else if (tileId >= 11 && tileId <= 20) {
        return { col: 1, row: 11 - (tileId - 10) };
      } else if (tileId >= 21 && tileId <= 30) {
        return { col: 1 + (tileId - 20), row: 1 };
      } else {
        return { col: 11, row: 1 + (tileId - 30) };
      }
    }
  }

  renderBoard() {
    if (!this.boardEl) this.boardEl = document.getElementById('monopoly-board');
    if (!this.boardEl) return;

    const engine = window.monopolyEngine;
    const mapId = engine.currentMapId;
    const isGalaxy = (mapId === 'galaxy');
    const isWorld = (mapId === 'world');

    this.boardEl.classList.toggle('monopoly-board-galaxy', isGalaxy);
    this.boardEl.classList.toggle('monopoly-board-world', isWorld);
    this.boardEl.classList.toggle('monopoly-board-nusantara', !isGalaxy && !isWorld);

    if (isGalaxy) {
      this.boardEl.style.gridTemplateColumns = `1.65fr repeat(15, 1fr) 1.65fr`;
      this.boardEl.style.gridTemplateRows = `1.65fr repeat(15, 1fr) 1.65fr`;
    } else if (isWorld) {
      this.boardEl.style.gridTemplateColumns = `1.4fr repeat(12, 1fr) 1.4fr`;
      this.boardEl.style.gridTemplateRows = `1.4fr repeat(12, 1fr) 1.4fr`;
    } else {
      this.boardEl.style.gridTemplateColumns = `1.4fr repeat(9, 1fr) 1.4fr`;
      this.boardEl.style.gridTemplateRows = `1.4fr repeat(9, 1fr) 1.4fr`;
    }

    const centerHub = document.querySelector('.mono-center-hub');
    if (centerHub) {
      const startTrack = 2;
      const endTrack = isGalaxy ? 17 : (isWorld ? 14 : 11);
      centerHub.style.gridColumn = `${startTrack} / ${endTrack}`;
      centerHub.style.gridRow = `${startTrack} / ${endTrack}`;
    }

    this.boardEl.querySelectorAll('.mono-tile').forEach(el => el.remove());

    const maxDim = isGalaxy ? 17 : (isWorld ? 14 : 11);

    engine.activeTiles.forEach(tile => {
      const pos = this.getTileGridPosition(tile.id);
      const tileDiv = document.createElement('div');
      tileDiv.id = `mono-tile-${tile.id}`;
      tileDiv.className = 'mono-tile';
      tileDiv.style.gridColumn = `${pos.col} / ${pos.col + 1}`;
      tileDiv.style.gridRow = `${pos.row} / ${pos.row + 1}`;

      const isCorner = (pos.col === 1 || pos.col === maxDim) && (pos.row === 1 || pos.row === maxDim);
      const isSideCol = !isCorner && (pos.col === 1 || pos.col === maxDim);

      if (isSideCol) {
        tileDiv.classList.add('tile-side-edge');
        if (pos.col === 1) tileDiv.classList.add('tile-side-left');
        if (pos.col === maxDim) tileDiv.classList.add('tile-side-right');
      }

      const group = engine.activeGroups[tile.group] || {};
      const colorBand = group.color && (tile.type === 'property' || tile.type === 'station' || tile.type === 'utility')
        ? `<div class="tile-color-band" style="background-color: ${group.color};"></div>` : '';

      const priceLabel = tile.price ? `<span class="tile-price-tag" title="Harga Beli Lengkap: ${engine.formatRupiah(tile.price)}">${engine.formatCompactPrice(tile.price)}</span>` : '';
      const subtitleLabel = (!isGalaxy && !isSideCol && tile.subtitle) ? `<span class="text-[8px] text-cyan-200 block truncate leading-tight">${tile.subtitle}</span>` : '';

      const bgPhotoHtml = tile.image
        ? `<div class="tile-bg-image" style="background-image: url('${tile.image}');"></div><div class="tile-bg-overlay"></div>`
        : '';

      tileDiv.innerHTML = `
        ${bgPhotoHtml}
        ${colorBand}
        <div class="tile-buildings-container" id="buildings-tile-${tile.id}"></div>
        <div class="tile-info-block leading-tight text-center">
          <span class="tile-name-label block font-bold" title="${tile.name}">${tile.name}</span>
          ${subtitleLabel}
        </div>
        ${priceLabel}
        <div class="tile-tokens-container" id="tokens-tile-${tile.id}"></div>
      `;

      tileDiv.addEventListener('click', () => this.showTileDetails(tile));
      this.boardEl.appendChild(tileDiv);
    });

    this.updateUI();
    if (window.lucide) window.lucide.createIcons();
  }

  updateUI() {
    const engine = window.monopolyEngine;
    if (!engine) return;

    const current = engine.getCurrentPlayer();

    // 0. Update Host Permissions & Room Settings Lock
    const activeUser = window.authEngine?.getUser();
    const isHost = (!engine.hostId || engine.hostId === activeUser?.id || engine.hostId === 'p_host' || !activeUser || activeUser.id === 'p_host');

    const mapSelectEl = document.getElementById('mono-map-select');
    const setupBtnEl = document.getElementById('btn-mono-open-setup');

    if (mapSelectEl) {
      mapSelectEl.disabled = !isHost;
      mapSelectEl.classList.toggle('opacity-60', !isHost);
      mapSelectEl.classList.toggle('cursor-not-allowed', !isHost);
    }

    if (setupBtnEl) {
      setupBtnEl.classList.toggle('opacity-60', !isHost);
      setupBtnEl.title = isHost ? 'Pengaturan Room' : '🔒 Terkunci: Hanya Pembuat Room yang berwenang mengubah Pengaturan Room';
    }

    // 0. Update Room ID Badge
    const roomIdEl = document.getElementById('mono-room-id-badge');
    if (roomIdEl) {
      roomIdEl.textContent = engine.roomId || 'ROOM-1';
    }

    // 1. Update Posisi Bidak Pemain (Mendukung hingga 8 Bidak)
    document.querySelectorAll('.tile-tokens-container').forEach(el => el.innerHTML = '');
    engine.players.forEach(p => {
      if (!p.isBankrupt) {
        const container = document.getElementById(`tokens-tile-${p.position}`);
        if (container) {
          const badge = document.createElement('span');
          badge.className = 'player-token-badge';
          badge.textContent = p.token || '🚗';
          badge.title = `${p.name} (${engine.formatRupiah(p.money)})`;
          badge.style.filter = `drop-shadow(0 2px 3px ${p.color || '#000'})`;
          container.appendChild(badge);
        }
      }
    });

    // 2. Update Kepemilikan & Icon Rumah, Hotel & Pencakar Langit (Sky) di Kotak Petak
    engine.activeTiles.forEach(t => {
      const prop = engine.propertyState[t.id];
      const tileEl = document.getElementById(`mono-tile-${t.id}`);
      const container = document.getElementById(`buildings-tile-${t.id}`);

      if (tileEl && prop) {
        if (prop.ownerId) {
          const owner = engine.players.find(p => p.id === prop.ownerId);
          if (owner) {
            tileEl.classList.add('tile-owned');
            tileEl.style.borderColor = owner.color || '#4f46e5';
            tileEl.style.boxShadow = `inset 0 0 8px ${owner.color}35`;
          }
        } else {
          tileEl.classList.remove('tile-owned');
          tileEl.style.borderColor = '';
          tileEl.style.boxShadow = '';
        }
      }

      if (container && prop) {
        container.innerHTML = '';
        if (prop.isSkyscraper) {
          container.innerHTML = '<span class="building-icon-box building-sky" title="🏢 Gedung Pencakar Langit Megah (Sky)">🏢<span class="badge-subtext">SKY</span></span>';
        } else if (prop.isHotel) {
          container.innerHTML = '<span class="building-icon-box building-hotel" title="🏨 Hotel Megah">🏨<span class="badge-subtext">HOTEL</span></span>';
        } else if (prop.houses > 0) {
          container.innerHTML = `<span class="building-icon-box building-house" title="${prop.houses} Rumah">${prop.houses > 2 ? `🏠x${prop.houses}` : '🏠'.repeat(prop.houses)}</span>`;
        } else if (prop.isMortgaged) {
          container.innerHTML = '<span class="building-icon-box building-mortgaged" title="🔒 Digadaikan">🔒</span>';
        } else if (prop.ownerId && engine.checkFullGroupOwnership(prop.ownerId, t.group)) {
          container.innerHTML = '<span class="building-icon-box building-monopoly" title="👑 Hak Monopoli 1 Set Lengkap (Sewa Dasar 2x Lipat)">👑2x</span>';
        }
      }
    });

    // 3. Update Banner Giliran
    if (current) {
      const tokenEl = document.getElementById('mono-turn-token');
      const nameEl = document.getElementById('mono-turn-player-name');
      const cashEl = document.getElementById('mono-turn-player-cash');
      const skillEl = document.getElementById('mono-turn-player-skill');

      if (tokenEl) tokenEl.textContent = current.token;
      if (nameEl) nameEl.textContent = current.name + (current.isAI ? ' (AI)' : '');
      if (cashEl) cashEl.textContent = engine.formatRupiah(current.money);

      const skill = CHARACTER_ABILITIES[current.token];
      if (skillEl && skill) {
        skillEl.textContent = `⚡ Skill: ${skill.name} (${skill.desc})`;
      }
    }

    // 4. Update Event Makro Ekonomi
    const ecoBanner = document.getElementById('mono-economy-banner');
    if (ecoBanner && window.monopolyEconomy) {
      const ev = window.monopolyEconomy.currentEvent;
      if (ev) {
        ecoBanner.classList.remove('hidden');
        ecoBanner.className = `p-2 rounded-xl text-xs font-bold mb-3 flex items-center justify-between border ${
          ev.type === 'danger' ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300' :
          ev.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300' :
          'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
        }`;
        ecoBanner.innerHTML = `<span>${ev.title}: ${ev.desc}</span><span class="text-[10px] font-mono underline">${window.monopolyEconomy.eventDurationTurns} Putaran</span>`;
      } else {
        ecoBanner.classList.add('hidden');
      }
    }

    // 5. Update Action Buttons
    const btnRoll = document.getElementById('btn-mono-roll');
    const btnEndTurn = document.getElementById('btn-mono-end-turn');
    if (btnRoll) btnRoll.disabled = (engine.phase !== 'ROLL' || (current && current.isAI));
    if (btnEndTurn) btnEndTurn.disabled = (engine.phase !== 'END_TURN' || (current && current.isAI));

    // 6. Update Sidebar Daftar Pemain
    this.renderPlayersSidebar();
    if (window.lucide) window.lucide.createIcons();
  }

  renderPlayersSidebar() {
    const engine = window.monopolyEngine;
    const current = engine.getCurrentPlayer();
    const list = document.getElementById('mono-players-list');
    if (!list) return;

    list.innerHTML = '';
    engine.players.forEach(p => {
      const isCurrent = current && current.id === p.id;
      const loan = window.monopolyBank?.loans[p.id]?.amount || 0;
      const currentTile = engine.activeTiles[p.position] || { name: `Petak ${p.position}` };

      const card = document.createElement('div');
      card.className = `p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
        p.isBankrupt ? 'opacity-40 bg-slate-100 dark:bg-slate-900 border-slate-200' :
        isCurrent ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-2 ring-amber-400' :
        'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
      }`;

      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-sm" style="background-color: ${p.color}20; border: 1.5px solid ${p.color};">
              ${p.token}
            </span>
            <div>
              <div class="flex items-center gap-1">
                <span class="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[100px] sm:max-w-[130px]">${p.name}</span>
                ${p.isAI ? '<span class="px-1 py-0.2 bg-slate-200 dark:bg-slate-800 text-[9px] font-bold rounded">AI</span>' : ''}
              </div>
              <span class="text-[10px] text-slate-500 truncate block max-w-[120px]">${currentTile.name}</span>
            </div>
          </div>
          <div class="text-right">
            <span class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">${engine.formatRupiah(p.money)}</span>
            <span class="text-[9px] text-slate-400 font-semibold">${p.isBankrupt ? '💀 Bangkrut' : p.inJail ? '🔒 Penjara' : 'Aktif'}</span>
          </div>
        </div>
        ${loan > 0 ? `<div class="mt-1 text-[9px] font-mono text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded flex justify-between"><span>Utang:</span><span>${engine.formatRupiah(loan)}</span></div>` : ''}
      `;
      list.appendChild(card);
    });
  }

  // =========================================================================
  // TABEL STRUKTUR SEWA BERTINGKAT (TIERED RENT STRUCTURE)
  // =========================================================================
  renderRentStructureTable(tile, prop = null) {
    const engine = window.monopolyEngine;
    const group = engine.activeGroups[tile.group] || {};

    if (!tile.rent || tile.rent.length === 0) {
      return '';
    }

    if (tile.type === 'station') {
      return `
        <div class="mt-3 p-3 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <h4 class="font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
            <span>🚆 Struktur Sewa Stasiun & Kereta Cepat</span>
          </h4>
          <div class="space-y-1">
            <div class="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-700"><span>Punya 1 Stasiun:</span><span class="font-mono font-bold">${engine.formatRupiah(tile.rent[0])}</span></div>
            <div class="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-700"><span>Punya 2 Stasiun:</span><span class="font-mono font-bold">${engine.formatRupiah(tile.rent[1] || tile.rent[0]*2)}</span></div>
            <div class="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-700"><span>Punya 3 Stasiun:</span><span class="font-mono font-bold">${engine.formatRupiah(tile.rent[2] || tile.rent[0]*4)}</span></div>
            <div class="flex justify-between py-0.5"><span>Punya 4 Stasiun (Monopoli Penuh):</span><span class="font-mono font-bold text-indigo-600">${engine.formatRupiah(tile.rent[3] || tile.rent[0]*8)}</span></div>
          </div>
        </div>
      `;
    }

    if (tile.type === 'utility') {
      return `
        <div class="mt-3 p-3 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <h4 class="font-bold text-slate-900 dark:text-white mb-2">⚡ Struktur Sewa Utilitas Publik</h4>
          <p class="text-[11px] text-slate-600 dark:text-slate-300">
            • 1 Utilitas: <strong>Jumlah Dadu × 60.000</strong><br>
            • 2+ Utilitas (Monopoli): <strong>Jumlah Dadu × 150.000</strong>
          </p>
        </div>
      `;
    }

    const currentHouses = prop?.houses || 0;
    const isHotel = prop?.isHotel || false;
    const isSkyscraper = prop?.isSkyscraper || false;
    const isFullGroup = prop?.ownerId ? engine.checkFullGroupOwnership(prop.ownerId, tile.group) : false;
    const skyscraperRent = Math.floor((tile.rent[5] || 1000000) * 1.8);

    return `
      <div class="mt-3 p-3 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
        <div class="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200 dark:border-slate-700">
          <h4 class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>📊 Struktur Tarif Sewa (1-4 Rumah, Hotel & Pencakar Langit)</span>
          </h4>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">${group.name || ''}</span>
        </div>

        <!-- Grid Icon Visual 1/2/3/4 Rumah, Hotel & Pencakar Langit -->
        <div class="grid grid-cols-6 gap-1 mb-2.5 text-center">
          <div class="p-1 rounded-lg border flex flex-col items-center justify-between ${!isHotel && !isSkyscraper && currentHouses === 1 ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 ring-1 ring-amber-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}">
            <span class="text-xs">🏠</span>
            <span class="text-[8.5px] font-bold text-slate-600 dark:text-slate-300">1 Rmh</span>
            <span class="text-[8px] font-mono font-bold text-amber-600">${engine.formatRupiah(tile.rent[1])}</span>
          </div>

          <div class="p-1 rounded-lg border flex flex-col items-center justify-between ${!isHotel && !isSkyscraper && currentHouses === 2 ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 ring-1 ring-amber-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}">
            <span class="text-xs">🏠🏠</span>
            <span class="text-[8.5px] font-bold text-slate-600 dark:text-slate-300">2 Rmh</span>
            <span class="text-[8px] font-mono font-bold text-amber-600">${engine.formatRupiah(tile.rent[2])}</span>
          </div>

          <div class="p-1 rounded-lg border flex flex-col items-center justify-between ${!isHotel && !isSkyscraper && currentHouses === 3 ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 ring-1 ring-amber-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}">
            <span class="text-xs">🏠🏠🏠</span>
            <span class="text-[8.5px] font-bold text-slate-600 dark:text-slate-300">3 Rmh</span>
            <span class="text-[8px] font-mono font-bold text-amber-600">${engine.formatRupiah(tile.rent[3])}</span>
          </div>

          <div class="p-1 rounded-lg border flex flex-col items-center justify-between ${!isHotel && !isSkyscraper && currentHouses === 4 ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 ring-1 ring-amber-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}">
            <span class="text-xs">🏠🏠🏠🏠</span>
            <span class="text-[8.5px] font-bold text-slate-600 dark:text-slate-300">4 Rmh</span>
            <span class="text-[8px] font-mono font-bold text-amber-600">${engine.formatRupiah(tile.rent[4])}</span>
          </div>

          <div class="p-1 rounded-lg border flex flex-col items-center justify-between ${isHotel && !isSkyscraper ? 'bg-rose-100 dark:bg-rose-950 border-rose-400 ring-1 ring-rose-400' : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'}">
            <span class="text-xs">🏨</span>
            <span class="text-[8.5px] font-extrabold text-rose-700 dark:text-rose-300">Hotel</span>
            <span class="text-[8px] font-mono font-black text-rose-600 dark:text-rose-400">${engine.formatRupiah(tile.rent[5])}</span>
          </div>

          <div class="p-1 rounded-lg border flex flex-col items-center justify-between ${isSkyscraper ? 'bg-amber-200 dark:bg-amber-900 border-amber-500 ring-1 ring-amber-500' : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'}">
            <span class="text-xs">🏢</span>
            <span class="text-[8.5px] font-black text-amber-800 dark:text-amber-300">Sky</span>
            <span class="text-[8px] font-mono font-black text-amber-700 dark:text-amber-300">${engine.formatRupiah(skyscraperRent)}</span>
          </div>
        </div>
        
        <!-- Rincian Tarif Bertingkat -->
        <div class="space-y-1">
          <div class="flex justify-between py-1 px-2 rounded ${!isHotel && !isSkyscraper && currentHouses === 0 && !isFullGroup ? 'bg-indigo-50 dark:bg-indigo-950 font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' : 'border-b border-slate-100 dark:border-slate-700/50'}">
            <span>📍 Sewa Tanah Kosong (Base Rent):</span>
            <span class="font-mono font-bold">${engine.formatRupiah(tile.rent[0])}</span>
          </div>

          <div class="flex justify-between py-1 px-2 rounded ${!isHotel && !isSkyscraper && currentHouses === 0 && isFullGroup ? 'bg-amber-100 dark:bg-amber-950 font-bold text-amber-900 dark:text-amber-200 border border-amber-400 shadow-sm' : 'border-b border-slate-100 dark:border-slate-700/50'}">
            <span class="flex items-center gap-1">👑 Hak Monopoli 1 Set Lengkap (2x Sewa Dasar): ${isFullGroup ? '<span class="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full animate-pulse">AKTIF 2x</span>' : ''}</span>
            <span class="font-mono font-black text-amber-600 dark:text-amber-400">${engine.formatRupiah(tile.rent[0] * 2)}</span>
          </div>

          <div class="flex justify-between py-1 px-2 rounded ${!isHotel && !isSkyscraper && currentHouses === 1 ? 'bg-amber-100 dark:bg-amber-950 font-bold text-amber-800 dark:text-amber-300 border border-amber-300' : 'border-b border-slate-100 dark:border-slate-700/50'}">
            <span>🏠 Sewa dengan 1 Rumah:</span>
            <span class="font-mono font-bold">${engine.formatRupiah(tile.rent[1])}</span>
          </div>

          <div class="flex justify-between py-1 px-2 rounded ${!isHotel && !isSkyscraper && currentHouses === 2 ? 'bg-amber-100 dark:bg-amber-950 font-bold text-amber-800 dark:text-amber-300 border border-amber-300' : 'border-b border-slate-100 dark:border-slate-700/50'}">
            <span>🏠🏠 Sewa dengan 2 Rumah:</span>
            <span class="font-mono font-bold">${engine.formatRupiah(tile.rent[2])}</span>
          </div>

          <div class="flex justify-between py-1 px-2 rounded ${!isHotel && !isSkyscraper && currentHouses === 3 ? 'bg-amber-100 dark:bg-amber-950 font-bold text-amber-800 dark:text-amber-300 border border-amber-300' : 'border-b border-slate-100 dark:border-slate-700/50'}">
            <span>🏠🏠🏠 Sewa dengan 3 Rumah:</span>
            <span class="font-mono font-bold">${engine.formatRupiah(tile.rent[3])}</span>
          </div>

          <div class="flex justify-between py-1 px-2 rounded ${!isHotel && !isSkyscraper && currentHouses === 4 ? 'bg-amber-100 dark:bg-amber-950 font-bold text-amber-800 dark:text-amber-300 border border-amber-300' : 'border-b border-slate-100 dark:border-slate-700/50'}">
            <span>🏠🏠🏠🏠 Sewa dengan 4 Rumah:</span>
            <span class="font-mono font-bold">${engine.formatRupiah(tile.rent[4])}</span>
          </div>

          <div class="flex justify-between py-1 px-2 rounded ${isHotel && !isSkyscraper ? 'bg-rose-100 dark:bg-rose-950 font-bold text-rose-800 dark:text-rose-300 border border-rose-300' : 'border-b border-slate-100 dark:border-slate-700/50'}">
            <span>🏨 Sewa dengan Hotel Megah:</span>
            <span class="font-mono font-black text-rose-600 dark:text-rose-400">${engine.formatRupiah(tile.rent[5])}</span>
          </div>

          <div class="flex justify-between py-1 px-2 rounded ${isSkyscraper ? 'bg-amber-100 dark:bg-amber-950 font-bold text-amber-900 dark:text-amber-200 border border-amber-400' : 'border-b border-slate-100 dark:border-slate-700/50'}">
            <span>🏢 Sewa Pencakar Langit (Level 6):</span>
            <span class="font-mono font-black text-amber-600 dark:text-amber-400">${engine.formatRupiah(skyscraperRent)}</span>
          </div>
        </div>

        <div class="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span class="text-slate-500 block">Biaya Bangun Rumah:</span>
            <span class="font-mono font-bold text-slate-800 dark:text-slate-200">${engine.formatRupiah(group.houseCost)}</span>
          </div>
          <div>
            <span class="text-slate-500 block">Nilai Gadai (50%):</span>
            <span class="font-mono font-bold text-amber-600">${engine.formatRupiah(Math.floor(tile.price * 0.5))}</span>
          </div>
        </div>
      </div>
    `;
  }

  showTileDetails(tile) {
    if (!tile.price) return;
    const engine = window.monopolyEngine;
    const prop = engine.propertyState[tile.id];
    const group = engine.activeGroups[tile.group] || {};

    const modal = document.getElementById('modal-mono-buy');
    document.getElementById('buy-prop-color-band').style.backgroundColor = group.color || '#4f46e5';
    document.getElementById('buy-prop-name').textContent = tile.name;
    document.getElementById('buy-prop-city').textContent = tile.city || group.name || '';
    document.getElementById('buy-prop-price').textContent = engine.formatRupiah(tile.price);
    document.getElementById('buy-prop-rent').textContent = engine.formatRupiah(tile.rent?.[0] || 0);

    const imgEl = document.getElementById('buy-prop-image');
    if (imgEl && tile.image) {
      imgEl.src = tile.image;
      imgEl.classList.remove('hidden');
    } else if (imgEl) {
      imgEl.classList.add('hidden');
    }

    const descEl = document.getElementById('buy-prop-desc');
    if (descEl) descEl.textContent = tile.desc || '';

    // Render Tabel Struktur Tarif Sewa Lengkap
    const rentContainer = document.getElementById('buy-prop-rent-structure');
    if (rentContainer) {
      rentContainer.innerHTML = this.renderRentStructureTable(tile, prop);
    }

    const btnCloseX = document.getElementById('btn-close-buy-modal');
    const btnConfirm = document.getElementById('btn-mono-buy-confirm');
    const btnAuction = document.getElementById('btn-mono-buy-auction');
    const btnSkip = document.getElementById('btn-mono-buy-skip');

    if (btnConfirm) btnConfirm.classList.add('hidden');
    if (btnAuction) btnAuction.classList.add('hidden');
    if (btnSkip) {
      btnSkip.classList.remove('hidden');
      btnSkip.className = 'col-span-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition';
      btnSkip.textContent = 'Tutup (Kembali ke Papan)';
      btnSkip.onclick = () => modal.classList.remove('modal-open');
    }
    if (btnCloseX) {
      btnCloseX.onclick = () => modal.classList.remove('modal-open');
    }

    modal.classList.add('modal-open');
    if (window.lucide) window.lucide.createIcons();
  }

  showBuyPrompt(player, tile) {
    const engine = window.monopolyEngine;
    const modal = document.getElementById('modal-mono-buy');
    const group = engine.activeGroups[tile.group] || {};
    const prop = engine.propertyState[tile.id];

    document.getElementById('buy-prop-color-band').style.backgroundColor = group.color || '#4f46e5';
    document.getElementById('buy-prop-name').textContent = tile.name;
    document.getElementById('buy-prop-city').textContent = tile.city || group.name || '';

    let price = tile.price;
    if (window.monopolySkills) price = window.monopolySkills.getPurchaseCostModifier(player, price);
    document.getElementById('buy-prop-price').textContent = engine.formatRupiah(price);
    document.getElementById('buy-prop-rent').textContent = engine.formatRupiah(tile.rent?.[0] || 0);

    const imgEl = document.getElementById('buy-prop-image');
    if (imgEl && tile.image) {
      imgEl.src = tile.image;
      imgEl.classList.remove('hidden');
    }

    const descEl = document.getElementById('buy-prop-desc');
    if (descEl) descEl.textContent = tile.desc || '';

    const rentContainer = document.getElementById('buy-prop-rent-structure');
    if (rentContainer) {
      rentContainer.innerHTML = this.renderRentStructureTable(tile, prop);
    }

    const btnCloseX = document.getElementById('btn-close-buy-modal');
    const btnConfirm = document.getElementById('btn-mono-buy-confirm');
    const btnAuction = document.getElementById('btn-mono-buy-auction');
    const btnSkip = document.getElementById('btn-mono-buy-skip');

    if (btnConfirm) {
      btnConfirm.classList.remove('hidden');
      btnConfirm.onclick = () => {
        engine.buyProperty(player, tile.id);
        modal.classList.remove('modal-open');
      };
    }

    if (btnAuction) {
      btnAuction.classList.remove('hidden');
      btnAuction.onclick = () => {
        modal.classList.remove('modal-open');
        engine.phase = 'AUCTION';
        if (window.monopolyAuction) {
          window.monopolyAuction.startAuction(engine, tile, () => {
            engine.checkAutoEndTurn(player);
          });
        } else {
          engine.checkAutoEndTurn(player);
        }
      };
    }

    const dismissAndResumeTurn = () => {
      modal.classList.remove('modal-open');
      engine.log(`⏭️ ${player.name} melewati pembelian properti [${tile.name}].`);
      engine.phase = 'END_TURN';
      if (engine.onStateChange) engine.onStateChange();
      engine.checkAutoEndTurn(player);
    };

    if (btnSkip) {
      btnSkip.classList.remove('hidden');
      btnSkip.className = 'py-2.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition';
      btnSkip.textContent = 'Lewati / Tutup ❌';
      btnSkip.onclick = dismissAndResumeTurn;
    }

    if (btnCloseX) {
      btnCloseX.onclick = dismissAndResumeTurn;
    }

    modal.classList.add('modal-open');
    if (window.lucide) window.lucide.createIcons();
  }

  showCardPopup(cardType, card) {
    const modal = document.getElementById('modal-mono-card');
    document.getElementById('mono-card-type').textContent = cardType === 'chance' ? '🃏 KESEMPATAN' : '💼 DANA UMUM';
    document.getElementById('mono-card-text').textContent = card.text;
    modal.classList.add('modal-open');
  }

  showRentToast(player, owner, tile, rent, tierName, tierIcon) {
    const engine = window.monopolyEngine;
    if (!engine) return;

    let toastEl = document.getElementById('mono-rent-toast');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'mono-rent-toast';
      toastEl.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none transform -translate-y-6 opacity-0';
      document.body.appendChild(toastEl);
    }

    const isSkyscraper = tierName.includes('Sky');
    const isHotel = tierName.includes('Hotel');

    toastEl.innerHTML = `
      <div class="px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
        isSkyscraper ? 'bg-amber-950/90 text-amber-200 border-amber-500 shadow-amber-500/40 ring-2 ring-amber-400' :
        isHotel ? 'bg-rose-950/90 text-rose-200 border-rose-500 shadow-rose-500/40 ring-2 ring-rose-400' :
        'bg-slate-900/90 text-white border-slate-700 shadow-indigo-500/30'
      }">
        <span class="text-2xl">${tierIcon || '💸'}</span>
        <div>
          <div class="flex items-center gap-1.5 text-xs font-bold">
            <span class="text-rose-400">💸 DENDA SEWA:</span>
            <span class="font-extrabold text-white">${player.name}</span>
            <span class="text-slate-400">➔</span>
            <span class="text-emerald-400 font-extrabold">${owner.name}</span>
          </div>
          <div class="flex items-center gap-2 mt-0.5 text-[11px]">
            <span class="font-mono font-black text-amber-300">${engine.formatRupiah(rent)}</span>
            <span class="text-slate-400">•</span>
            <span class="font-semibold text-slate-300">${tile.name} (${tierName})</span>
          </div>
        </div>
      </div>
    `;

    toastEl.classList.remove('opacity-0', '-translate-y-6', 'pointer-events-none');
    toastEl.classList.add('opacity-100', 'translate-y-0');

    if (window.soundEngine) {
      if (isSkyscraper || isHotel) window.soundEngine.playError();
      else window.soundEngine.playType();
    }

    setTimeout(() => {
      toastEl.classList.remove('opacity-100', 'translate-y-0');
      toastEl.classList.add('opacity-0', '-translate-y-6', 'pointer-events-none');
    }, 2800);
  }

  updateAuctionModal() {
    const auc = window.monopolyAuction;
    if (!auc || !auc.isActive) return;

    const modal = document.getElementById('modal-mono-auction');
    if (!modal) return;

    document.getElementById('auc-prop-name').textContent = auc.currentTile?.name || 'Properti';
    document.getElementById('auc-highest-bid').textContent = window.monopolyEngine.formatRupiah(auc.highestBid);
    document.getElementById('auc-highest-bidder').textContent = auc.highestBidder ? auc.highestBidder.name : 'Belum Ada Penawar';
    auc.updateTimerUI();

    modal.classList.add('modal-open');
    if (window.lucide) window.lucide.createIcons();
  }
}

window.monopolyUI = new MonopolyUI();
