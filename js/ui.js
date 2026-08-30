const UI = (function() {
  function init() {
    // Setup modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => hideAllModals());
    });
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => { if(e.target === modal) hideAllModals(); });
    });
  }
  
  function showModal(id) {
    const modal = document.getElementById('modal-' + id);
    if(!modal) return;
    // Populate content for specific modals
    if(id === 'settings') populateSettingsModal();
    if(id === 'history' && typeof MatchHistory !== 'undefined') MatchHistory.updateHistoryUI();
    modal.classList.add('active');
  }
  function hideModal(id) {
    const modal = document.getElementById('modal-' + id);
    if(modal) modal.classList.remove('active');
  }
  function hideAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
  }
  
  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, duration);
  }
  
  function populateSettingsModal() {
    const body = document.querySelector('#modal-settings .modal-body');
    if(!body) return;
    const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
    const currQ = (typeof Renderer !== 'undefined' && Renderer.getQuality) ? Renderer.getQuality() : 'medium';

    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        <div>
          <h3 style="color:var(--primary);margin-bottom:0.5rem;">${lang==='id'?'Bahasa / Language':'Language'}</h3>
          <div style="display:flex;gap:0.5rem;">
            <button class="action-btn ${lang==='id'?'btn-primary':''}" onclick="Lang.setLang('id');UI.showModal('settings');">
              🇮🇩 Indonesia
            </button>
            <button class="action-btn ${lang==='en'?'btn-primary':''}" onclick="Lang.setLang('en');UI.showModal('settings');">
              🇬🇧 English
            </button>
          </div>
        </div>
        <div>
          <h3 style="color:var(--primary);margin-bottom:0.5rem;">${lang==='id'?'Suara':'Sound'}</h3>
          <div style="display:flex;align-items:center;gap:1rem;">
            <span>🔊</span>
            <input type="range" id="setting-volume" min="0" max="100" value="70" 
              style="flex:1;accent-color:var(--primary);" 
              oninput="if(typeof GameAudio!=='undefined')GameAudio.setVolume(this.value/100)">
            <span id="volume-val">70%</span>
          </div>
        </div>
        <div>
          <h3 style="color:var(--primary);margin-bottom:0.5rem;">${lang==='id'?'Kualitas Grafis (Optimalisasi Low-End)':'Graphics Quality'}</h3>
          <div style="display:flex;gap:0.5rem;">
            <button class="action-btn ${currQ==='low'?'btn-primary':''}" onclick="UI.setQuality('low')">⚡ Low (Ringan)</button>
            <button class="action-btn ${currQ==='medium'?'btn-primary':''}" onclick="UI.setQuality('medium')">⚖️ Medium</button>
            <button class="action-btn ${currQ==='high'?'btn-primary':''}" onclick="UI.setQuality('high')">✨ High</button>
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.4rem;">
            ${currQ==='low' ? 'Mode Low: Mematikan blur & partikel, merender 60 FPS super ringan pada HP spek rendah.' : currQ==='medium' ? 'Mode Medium: Keseimbangan optimal grafis dan kecepatan.' : 'Mode High: Efek partikel, glow neon & cuaca penuh.'}
          </div>
        </div>
        <div>
          <h3 style="color:var(--primary);margin-bottom:0.5rem;">⚡ Core Engine</h3>
          <div style="display:flex;align-items:center;gap:0.75rem;background:rgba(0,255,255,0.06);border:1px solid rgba(0,255,255,0.25);padding:0.6rem 0.8rem;border-radius:6px;">
            <span style="font-size:1.3rem;">⚡</span>
            <div>
              <div style="color:#00ffff;font-weight:bold;font-size:0.85rem;">WebAssembly (Wasm) Rust Core</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${(typeof WasmEngine !== 'undefined' && WasmEngine.isReady()) ? ('Status: Aktif (v' + WasmEngine.getVersion() + ' - Ultra Performance)') : 'Status: Fallback JS Engine'}</div>
            </div>
          </div>
        </div>
        <div>
          <h3 style="color:var(--primary);margin-bottom:0.5rem;">Info</h3>
          <p style="font-size:0.85rem;color:var(--text-muted);">
            Monopoly v3.3 &copy; Lilevy Games<br>
            ${lang==='id'?'Game Monopoli Hardcore Modern':'Hardcore Modern Monopoly Game'}<br>
            ${lang==='id'?'Akselerasi Engine WebAssembly (Rust) & Supabase Realtime':'WebAssembly (Rust) Acceleration & Supabase Realtime'}
          </p>
        </div>
      </div>
    `;
    const volSlider = body.querySelector('#setting-volume');
    const volVal = body.querySelector('#volume-val');
    if(volSlider && volVal) {
      volSlider.addEventListener('input', () => { volVal.textContent = volSlider.value + '%'; });
    }
  }
  
  function setQuality(level) {
    if(typeof Renderer !== 'undefined' && Renderer.setQuality) {
      Renderer.setQuality(level);
    }
    populateSettingsModal();
  }
  
  function updateHUD(gameState) {
    if(!gameState || !gameState.players) return;
    const player = gameState.players[gameState.currentPlayerIndex];
    if(!player) return;
    const turnEl = document.getElementById('hud-current-player');
    if(turnEl) turnEl.textContent = player.name;
    const turnNumEl = document.getElementById('hud-turn-number');
    if(turnNumEl) turnNumEl.textContent = (typeof Lang !== 'undefined' ? Lang.t('turn') : 'Turn') + ': ' + gameState.turnNumber;
    const moneyEl = document.getElementById('hud-money');
    if(moneyEl) {
      const myPlayer = gameState.players.find(p => typeof Network !== 'undefined' && p.id === Network.getPlayerId());
      moneyEl.textContent = '₿ ' + (myPlayer ? myPlayer.money : 0);
    }
    const weatherEl = document.getElementById('hud-weather');
    if(weatherEl && typeof Weather !== 'undefined' && Weather.getWeatherInfo) {
      const wInfo = Weather.getWeatherInfo(gameState.weather.current);
      weatherEl.textContent = wInfo ? wInfo.icon : '☀️';
      weatherEl.title = wInfo ? wInfo.name_en : 'Sunny';
    }
    const econEl = document.getElementById('hud-economy');
    if(econEl) {
      if(gameState.economy.currentEvent && typeof Lang !== 'undefined') {
        econEl.textContent = Lang.t('evt_' + gameState.economy.currentEvent);
        econEl.style.background = 'rgba(255,0,255,0.2)';
      } else {
        econEl.textContent = typeof Lang !== 'undefined' ? 'Normal' : 'Normal';
        econEl.style.background = 'rgba(0,255,255,0.1)';
      }
    }
  }
  
  function updateActionButtons(gameState) {
    if(!gameState || !gameState.players) return;
    const player = gameState.players[gameState.currentPlayerIndex];
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    const isMyTurn = player && player.id === myId;
    const isAction = gameState.turnPhase === 'ACTION' || gameState.turnPhase === 'LAND';
    const currentTile = (gameState.tiles && player) ? gameState.tiles[player.position] : null;
    const canBuy = isMyTurn && (gameState.turnPhase === 'ACTION') && currentTile && !currentTile.owner && (currentTile.type === 'property' || currentTile.type === 'station' || currentTile.type === 'utility') && player.money >= currentTile.price;
    
    // Primary Action Buttons
    setBtn('btn-roll', isMyTurn && gameState.turnPhase === 'ROLL');
    setBtn('btn-buy', canBuy);
    setBtn('btn-build', isMyTurn);
    setBtn('btn-end-turn', isMyTurn && gameState.turnPhase === 'ACTION');
    
    // Top Tool Buttons - Always accessible so players can manage portfolio, trade, check stocks & loans
    setBtn('btn-trade', true);
    setBtn('btn-auction', true);
    setBtn('btn-stock', true);
    setBtn('btn-loan', true);
    setBtn('btn-black-market', true);
    setBtn('btn-skill', true);
    setBtn('btn-cards', true);
    setBtn('btn-jv', true);
    
    const rollBtn = document.getElementById('btn-roll');
    if(rollBtn) rollBtn.classList.toggle('highlight', isMyTurn && gameState.turnPhase === 'ROLL');

    const buyBtn = document.getElementById('btn-buy');
    if(buyBtn) buyBtn.classList.toggle('highlight', canBuy);

    const endTurnBtn = document.getElementById('btn-end-turn');
    if(endTurnBtn) endTurnBtn.classList.toggle('highlight', isMyTurn && gameState.turnPhase === 'ACTION');
  }
  
  function setBtn(id, enabled) {
    const btn = document.getElementById(id);
    if(btn) btn.disabled = !enabled;
  }
  
  function showBuildModal() {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs) return;
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    const player = gs.players.find(p => p.id === myId);
    if(!player || typeof Property === 'undefined') return;
    const body = document.querySelector('#modal-build .modal-body');
    if(!body) return;
    
    const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
    body.innerHTML = '';
    
    if(!player.properties || player.properties.length === 0) {
      body.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:1rem;">${lang==='id'?'Anda belum memiliki properti. Beli properti terlebih dahulu untuk membangun!':'You don\'t own any properties yet. Buy properties to build!'}</p>`;
      showModal('build');
      return;
    }
    
    player.properties.forEach(ti => {
      const tile = gs.tiles[ti];
      if(!tile || tile.type !== 'property') return;
      
      const groupColor = (typeof Renderer !== 'undefined' && Renderer.GROUP_COLORS) ? (Renderer.GROUP_COLORS[tile.group] || '#4f8cff') : '#4f8cff';
      const tileName = (lang==='id'?tile.name_id:tile.name_en)||tile.name_en;
      const isMonopoly = Property.hasMonopoly(player.id, tile.group, gs);
      const bldg = (player.buildings && player.buildings[ti]) ? player.buildings[ti] : null;
      const currLevel = bldg ? bldg.level : 0;
      const currType = bldg ? bldg.type : 'none';
      const houseCost = Property.getBuildCost(tile, 'house', gs);
      const rent = tile.rent || [10, 50, 150, 450, 800, 1250];
      
      const card = document.createElement('div');
      card.style.background = 'rgba(255,255,255,0.04)';
      card.style.border = `1px solid ${groupColor}55`;
      card.style.borderRadius = '8px';
      card.style.padding = '0.75rem';
      card.style.marginBottom = '0.75rem';
      
      let statusBadge = '';
      if(currType === 'hotel') statusBadge = '🏨 HOTEL (Level 5)';
      else if(currLevel > 0) statusBadge = `🏠 ${currLevel} Rumah (Level ${currLevel})`;
      else statusBadge = lang==='id'?'Tanpa Rumah (Sewa Dasar)':'No Houses (Base Rent)';
      
      let currRent = rent[currLevel] || rent[0];
      if(isMonopoly && currLevel === 0) currRent = rent[0] * 2;
      if(currType === 'hotel') currRent = rent[5];
      
      const monopolyBadge = isMonopoly 
        ? `<span style="font-size:0.7rem;background:rgba(34,197,94,0.15);color:#22c55e;padding:2px 6px;border-radius:4px;border:1px solid rgba(34,197,94,0.3);font-weight:600;">👑 ${lang==='id'?'Monopoli Penuh':'Full Monopoly'}</span>`
        : `<span style="font-size:0.7rem;background:rgba(148,163,184,0.12);color:var(--text-muted);padding:2px 6px;border-radius:4px;">🎨 ${lang==='id'?'Belum Monopoli':'No Monopoly'}</span>`;

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
          <div>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <strong style="color:${groupColor};font-size:1rem;">${tileName}</strong>
              ${monopolyBadge}
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">${statusBadge} | ${lang==='id'?'Sewa Saat Ini':'Current Rent'}: <span style="color:#22c55e;font-weight:bold;">$${currRent}</span></div>
          </div>
          <button class="action-btn" style="font-size:0.75rem;padding:0.2rem 0.5rem;" onclick="UI.showPropertyModal(${ti});">
            📋 ${lang==='id'?'Detail':'Details'}
          </button>
        </div>
      `;
      
      const actionsDiv = document.createElement('div');
      actionsDiv.style.display = 'flex';
      actionsDiv.style.flexWrap = 'wrap';
      actionsDiv.style.gap = '0.5rem';
      actionsDiv.style.marginTop = '0.5rem';
      
      if(currType === 'house' || currLevel === 0) {
        if(currLevel < 4) {
          const nextLevel = currLevel + 1;
          const nextRent = rent[nextLevel];
          const btn = document.createElement('button');
          btn.className = 'action-btn btn-primary';
          btn.textContent = `🏠 ${lang==='id'?'Bangun Rumah Ke-':'Build House #'}${nextLevel} ($${houseCost}) ➔ Sewa: $${nextRent}`;
          btn.onclick = () => {
            const res = Property.build(player.id, ti, 'house', gs);
            if(res) {
              if(typeof Network !== 'undefined') Network.broadcastState(gs);
              showBuildModal();
              showToast(`${lang==='id'?'Berhasil membangun rumah di':'Built house on'} ${tileName}!`, 'success');
            } else {
              showToast(lang==='id'?'Uang tidak mencukupi atau cuaca buruk':'Insufficient funds or bad weather', 'error');
            }
          };
          actionsDiv.appendChild(btn);
        } else if(currLevel === 4) {
          if(isMonopoly) {
            const hotelCost = Property.getBuildCost(tile, 'hotel', gs);
            const btn = document.createElement('button');
            btn.className = 'action-btn btn-primary';
            btn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            btn.textContent = `🏨 ${lang==='id'?'UPGRADE KE HOTEL':'UPGRADE TO HOTEL'} ($${hotelCost}) ➔ Sewa: $${rent[5]}`;
            btn.onclick = () => {
              const res = Property.build(player.id, ti, 'hotel', gs);
              if(res) {
                if(typeof Network !== 'undefined') Network.broadcastState(gs);
                showBuildModal();
                showToast(`🏨 ${lang==='id'?'HOTEL berhasil dibangun di':'HOTEL constructed on'} ${tileName}!`, 'success');
              } else {
                showToast(lang==='id'?'Uang tidak mencukupi atau cuaca buruk':'Insufficient funds or bad weather', 'error');
              }
            };
            actionsDiv.appendChild(btn);
          } else {
            const warnDiv = document.createElement('div');
            warnDiv.style.fontSize = '0.75rem';
            warnDiv.style.color = 'var(--warning)';
            warnDiv.style.background = 'rgba(245,158,11,0.1)';
            warnDiv.style.border = '1px solid rgba(245,158,11,0.3)';
            warnDiv.style.padding = '0.4rem 0.6rem';
            warnDiv.style.borderRadius = '4px';
            warnDiv.style.width = '100%';
            warnDiv.textContent = `⚠️ ${lang==='id'?'4 Rumah telah terpasang. Kumpulkan semua properti warna ini (Monopoli Penuh) untuk upgrade ke HOTEL!':'4 Houses built. Collect all properties in this color group to upgrade to HOTEL!'}`;
            actionsDiv.appendChild(warnDiv);
          }
        }
        
        // Special alternative buildings
        const avail = Property.getAvailableBuildings(ti, gs);
        (avail || []).forEach(bType => {
          if(bType === 'house' || bType === 'hotel') return;
          const path = Property.BUILDING_PATHS[bType];
          if(!path) return;
          const bCost = Property.getBuildCost(tile, bType, gs);
          const bBtn = document.createElement('button');
          bBtn.className = 'action-btn';
          bBtn.textContent = `${path.icon} ${lang==='id'?(path.name_id||bType):(path.name_en||bType)} ($${bCost})`;
          bBtn.onclick = () => {
            const res = Property.build(player.id, ti, bType, gs);
            if(res) {
              if(typeof Network !== 'undefined') Network.broadcastState(gs);
              showBuildModal();
              showToast(`${path.icon} ${path.name_id || bType} berhasil dibangun!`, 'success');
            } else {
              showToast(lang==='id'?'Uang tidak mencukupi':'Insufficient funds', 'error');
            }
          };
          actionsDiv.appendChild(bBtn);
        });
      } else {
        actionsDiv.innerHTML = `<div style="font-size:0.8rem;color:#22c55e;">✅ ${lang==='id'?'Bangunan tingkat maksimal tercapai!':'Maximum building upgrade reached!'}</div>`;
      }
      
      card.appendChild(actionsDiv);
      body.appendChild(card);
    });
    
    showModal('build');
  }
  
  function showTradeModal(selectedTargetId) {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs) return;
    const body = document.querySelector('#modal-trade .modal-body');
    if(!body) return;
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    const me = gs.players.find(p => p.id === myId);
    if(!me) return;
    
    const others = gs.players.filter(p => p.id !== myId && !p.isBankrupt);
    const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
    
    if(others.length === 0) {
      body.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:1.5rem;">' +
        (lang === 'id' ? 'Tidak ada pemain lain yang aktif untuk bertukar properti.' : 'No other active players available to trade with.') +
        '</p>';
      showModal('trade');
      return;
    }
    
    // Choose selected target or default to first other player
    let target = others.find(p => p.id === selectedTargetId) || others[0];
    
    // Build partner selector tabs
    let partnerTabsHtml = '<div style="display:flex;gap:0.4rem;overflow-x:auto;margin-bottom:1rem;padding-bottom:0.25rem;">';
    others.forEach(p => {
      const isSelected = p.id === target.id;
      partnerTabsHtml += `
        <button class="quick-chip" style="${isSelected ? 'background:rgba(79,140,255,0.35);border-color:var(--neon-cyan);color:#fff;font-weight:bold;' : ''}"
          onclick="UI.showTradeModal('${p.id}')">
          👤 ${p.name} ($${p.money})
        </button>
      `;
    });
    partnerTabsHtml += '</div>';

    // My properties checkboxes
    let myPropsHtml = '';
    if(!me.properties || me.properties.length === 0) {
      myPropsHtml = `<div style="font-size:0.75rem;color:var(--text-muted);font-style:italic;">${lang==='id'?'Tidak ada properti':'No properties'}</div>`;
    } else {
      myPropsHtml = me.properties.map(ti => {
        const tile = gs.tiles[ti];
        if(!tile) return '';
        const groupColor = (typeof Renderer !== 'undefined' && Renderer.GROUP_COLORS) ? (Renderer.GROUP_COLORS[tile.group] || '#4f8cff') : '#4f8cff';
        const tName = (lang==='id'?tile.name_id:tile.name_en)||tile.name_en;
        return `
          <label style="display:flex;align-items:center;gap:0.4rem;background:rgba(255,255,255,0.04);padding:0.35rem 0.5rem;border-radius:6px;font-size:0.78rem;cursor:pointer;border-left:3px solid ${groupColor};">
            <input type="checkbox" class="trade-offer-prop" value="${ti}">
            <span style="flex:1;">${tName}</span>
            <span style="color:#22c55e;font-weight:bold;">$${tile.price}</span>
          </label>
        `;
      }).join('');
    }

    // Target properties checkboxes
    let targetPropsHtml = '';
    if(!target.properties || target.properties.length === 0) {
      targetPropsHtml = `<div style="font-size:0.75rem;color:var(--text-muted);font-style:italic;">${lang==='id'?'Partner tidak memiliki properti':'Partner has no properties'}</div>`;
    } else {
      targetPropsHtml = target.properties.map(ti => {
        const tile = gs.tiles[ti];
        if(!tile) return '';
        const groupColor = (typeof Renderer !== 'undefined' && Renderer.GROUP_COLORS) ? (Renderer.GROUP_COLORS[tile.group] || '#4f8cff') : '#4f8cff';
        const tName = (lang==='id'?tile.name_id:tile.name_en)||tile.name_en;
        return `
          <label style="display:flex;align-items:center;gap:0.4rem;background:rgba(255,255,255,0.04);padding:0.35rem 0.5rem;border-radius:6px;font-size:0.78rem;cursor:pointer;border-left:3px solid ${groupColor};">
            <input type="checkbox" class="trade-req-prop" value="${ti}">
            <span style="flex:1;">${tName}</span>
            <span style="color:#22c55e;font-weight:bold;">$${tile.price}</span>
          </label>
        `;
      }).join('');
    }

    body.innerHTML = `
      <div style="padding:0.25rem;">
        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.4rem;">${lang==='id'?'Pilih Partner Trading:':'Select Trading Partner:'}</div>
        ${partnerTabsHtml}

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
          <!-- Left: My Offer -->
          <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(79,140,255,0.25);border-radius:8px;padding:0.6rem;display:flex;flex-direction:column;gap:0.5rem;">
            <div style="font-weight:bold;font-size:0.85rem;color:var(--neon-cyan);border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:0.3rem;">
              📤 ${lang==='id'?'Tawaran Anda':'Your Offer'} (${me.name})
            </div>
            
            <div>
              <div style="font-size:0.72rem;color:var(--text-muted);">${lang==='id'?'Uang Tunai Ditawarkan:':'Cash Offered:'}</div>
              <div style="display:flex;align-items:center;gap:0.3rem;margin-top:0.2rem;">
                <span style="font-size:0.8rem;color:#22c55e;">$</span>
                <input type="number" id="trade-offer-cash" min="0" max="${me.money}" value="0" step="10"
                  style="width:100%;background:rgba(0,0,0,0.5);border:1px solid rgba(79,140,255,0.3);border-radius:6px;padding:0.3rem 0.5rem;color:#fff;font-size:0.8rem;">
              </div>
              <div style="font-size:0.68rem;color:var(--text-muted);margin-top:0.15rem;">Max: $${me.money}</div>
            </div>

            <div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:0.3rem;">${lang==='id'?'Pilih Properti Anda:':'Select Your Properties:'}</div>
              <div style="display:flex;flex-direction:column;gap:0.3rem;max-height:140px;overflow-y:auto;padding-right:2px;">
                ${myPropsHtml}
              </div>
            </div>
          </div>

          <!-- Right: Request from Target -->
          <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(245,158,11,0.25);border-radius:8px;padding:0.6rem;display:flex;flex-direction:column;gap:0.5rem;">
            <div style="font-weight:bold;font-size:0.85rem;color:#f59e0b;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:0.3rem;">
              📥 ${lang==='id'?'Permintaan Anda':'Your Request'} (${target.name})
            </div>

            <div>
              <div style="font-size:0.72rem;color:var(--text-muted);">${lang==='id'?'Uang Tunai Diminta:':'Cash Requested:'}</div>
              <div style="display:flex;align-items:center;gap:0.3rem;margin-top:0.2rem;">
                <span style="font-size:0.8rem;color:#22c55e;">$</span>
                <input type="number" id="trade-req-cash" min="0" max="${target.money}" value="0" step="10"
                  style="width:100%;background:rgba(0,0,0,0.5);border:1px solid rgba(245,158,11,0.3);border-radius:6px;padding:0.3rem 0.5rem;color:#fff;font-size:0.8rem;">
              </div>
              <div style="font-size:0.68rem;color:var(--text-muted);margin-top:0.15rem;">Max: $${target.money}</div>
            </div>

            <div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:0.3rem;">${lang==='id'?'Pilih Properti Target:':'Select Target Properties:'}</div>
              <div style="display:flex;flex-direction:column;gap:0.3rem;max-height:140px;overflow-y:auto;padding-right:2px;">
                ${targetPropsHtml}
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          <button id="btn-submit-trade" class="action-btn btn-primary" style="padding:0.6rem 1rem;font-weight:bold;font-size:0.9rem;">
            🤝 ${lang==='id'?'AJUKAN PERTUKARAN PROPERTI':'PROPOSE PROPERTY TRADE'}
          </button>
          ${(me.character === 'trader' && me.skillCooldown <= 0) ? `
            <button id="btn-force-trade-trader" class="action-btn" style="background:linear-gradient(135deg,#ec4899,#f43f5e);font-weight:bold;padding:0.5rem 1rem;">
              ⚡ ${lang==='id'?'PAKSA PERTUKARAN (SKILL TRADER)':'FORCE TRADE (TRADER SKILL)'}
            </button>
          ` : ''}
        </div>
      </div>
    `;

    // Hook submit button
    const btnSubmit = body.querySelector('#btn-submit-trade');
    if(btnSubmit) {
      btnSubmit.onclick = () => {
        executeTradeProposal(false, me, target, gs, lang);
      };
    }

    const btnForce = body.querySelector('#btn-force-trade-trader');
    if(btnForce) {
      btnForce.onclick = () => {
        executeTradeProposal(true, me, target, gs, lang);
      };
    }

    showModal('trade');
  }

  function executeTradeProposal(isForced, me, target, gs, lang) {
    const offerCash = parseInt(document.getElementById('trade-offer-cash')?.value || '0', 10) || 0;
    const reqCash = parseInt(document.getElementById('trade-req-cash')?.value || '0', 10) || 0;
    
    const offerProps = [];
    document.querySelectorAll('.trade-offer-prop:checked').forEach(cb => {
      offerProps.push(parseInt(cb.value, 10));
    });

    const reqProps = [];
    document.querySelectorAll('.trade-req-prop:checked').forEach(cb => {
      reqProps.push(parseInt(cb.value, 10));
    });

    if(offerCash === 0 && reqCash === 0 && offerProps.length === 0 && reqProps.length === 0) {
      showToast(lang==='id'?'Pilih minimal 1 properti atau uang untuk pertukaran!':'Select at least 1 property or cash amount!', 'warning');
      return;
    }

    if(offerCash > me.money) {
      showToast(lang==='id'?'Uang kas Anda tidak mencukupi!':'Insufficient cash balance!', 'error');
      return;
    }

    if(reqCash > target.money) {
      showToast(lang==='id'?'Uang kas partner tidak mencukupi permintaan!':'Partner does not have enough cash!', 'error');
      return;
    }

    const offer = { money: offerCash, properties: offerProps };
    const request = { money: reqCash, properties: reqProps };

    if(isForced && typeof Trade !== 'undefined') {
      const forced = Trade.forceTrade(me.id, target.id, offer, request, gs);
      if(forced) {
        me.skillCooldown = 10;
        showToast(lang==='id'?'⚡ Pertukaran dipaksa berhasil dengan skill Trader!':'⚡ Forced trade executed with Trader skill!', 'success');
        if(typeof Network !== 'undefined') Network.broadcastState(gs);
        if(typeof Game !== 'undefined') Game.syncState(gs);
        hideModal('trade');
        return;
      }
    }

    const tradeObj = Trade.proposeTrade(me.id, target.id, offer, request, gs);
    if(!tradeObj) {
      showToast(lang==='id'?'Pertukaran tidak valid atau ditolak!':'Invalid trade proposal!', 'error');
      return;
    }

    // AI bot evaluation
    if(target.isAI || !Network.getIsOnline()) {
      const tradeData = {
        from: me.id,
        to: target.id,
        offerMoney: offerCash,
        offerTiles: offerProps,
        requestMoney: reqCash,
        requestTiles: reqProps
      };
      const accepts = (typeof AI !== 'undefined' && AI.decideTradeResponse) 
        ? AI.decideTradeResponse(target, tradeData, gs)
        : (offerCash >= reqCash);

      if(accepts) {
        Trade.acceptTrade(gs);
        if(typeof GameAudio !== 'undefined') GameAudio.play('buy');
        showToast(`🤝 ${target.name} ${lang==='id'?'menyetujui pertukaran!':'accepted the trade!'}`, 'success');
        if(typeof Chat !== 'undefined') {
          Network.sendChatMessage(lang==='id'?'Tawaran menguntungkan, saya setuju untuk bertukar properti! 🤝':'Smart deal, I agree to the trade! 🤝', target);
        }
      } else {
        Trade.rejectTrade(gs);
        showToast(`❌ ${target.name} ${lang==='id'?'menolak pertukaran (Taktik tidak menguntungkan).':'rejected the trade (Unfavorable tactical trade).' }`, 'warning');
        if(typeof Chat !== 'undefined') {
          Network.sendChatMessage(lang==='id'?'Maaf, tawaran ini kurang menguntungkan atau memberi Anda monopoli! ❌':'Sorry, that trade gives you too much advantage or monopoly! ❌', target);
        }
      }
    } else {
      showToast((lang==='id'?'Penawaran pertukaran telah dikirim ke ':'Trade proposal sent to ') + target.name, 'info');
    }

    if(typeof Network !== 'undefined') Network.broadcastState(gs);
    if(typeof Game !== 'undefined') Game.syncState(gs);
    hideModal('trade');
  }

  function showJVModal() {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs) return;
    const body = document.querySelector('#modal-jv .modal-body');
    if(!body) return;
    const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    const me = gs.players.find(p => p.id === myId);
    if(!me) return;

    const others = gs.players.filter(p => p.id !== myId && !p.isBankrupt);

    let activeJvsHtml = '';
    if(me.jointVentures && me.jointVentures.length > 0) {
      activeJvsHtml = `
        <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:8px;padding:0.6rem;margin-bottom:1rem;">
          <div style="font-weight:bold;color:#22c55e;font-size:0.85rem;margin-bottom:0.4rem;">
            🏢 ${lang==='id'?'Joint Venture Aktif Milik Anda:':'Your Active Joint Ventures:'}
          </div>
          <div style="display:flex;flex-direction:column;gap:0.4rem;">
            ${me.jointVentures.map(jv => {
              const tile = gs.tiles[jv.tileIndex];
              const partner = gs.players.find(p => p.id === jv.partnerId);
              const tileName = (lang==='id'?tile?.name_id:tile?.name_en)||tile?.name_en||'Property';
              const pName = partner ? partner.name : 'Partner';
              return `
                <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.3);padding:0.4rem 0.6rem;border-radius:6px;font-size:0.8rem;">
                  <div>
                    <strong>${tileName}</strong> dengan <span style="color:var(--neon-cyan);">${pName}</span>
                    <div style="font-size:0.72rem;color:var(--text-muted);">${lang==='id'?'Porsi Anda':'Your Share'}: ${jv.ratio}% | Porsi Partner: ${100-jv.ratio}%</div>
                  </div>
                  <button class="action-btn btn-danger" style="font-size:0.72rem;padding:0.25rem 0.5rem;" onclick="UI.dissolveJVAction(${jv.tileIndex})">
                    💔 ${lang==='id'?'Bubarkan':'Dissolve'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    if(!me.properties || me.properties.length === 0) {
      body.innerHTML = `
        <div style="text-align:center;padding:1rem;">
          <p style="color:var(--text-muted);">${lang==='id'?'Anda belum memiliki properti untuk diajak kerjasama Joint Venture. Beli properti terlebih dahulu!':'You do not own any properties for Joint Venture. Buy properties first!'}</p>
          ${activeJvsHtml}
        </div>
      `;
      showModal('jv');
      return;
    }

    if(others.length === 0) {
      body.innerHTML = `
        <div style="text-align:center;padding:1rem;">
          <p style="color:var(--text-muted);">${lang==='id'?'Tidak ada partner yang tersedia.':'No partners available.'}</p>
          ${activeJvsHtml}
        </div>
      `;
      showModal('jv');
      return;
    }

    body.innerHTML = `
      <div style="padding:0.25rem;">
        <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.75rem;">
          ${lang==='id'?'Bentuk kemitraan kepemilikan properti untuk berbagi hasil sewa (+20% bonus) dan patungan biaya bangun!':'Form a property partnership to split rents (+20% bonus) and share construction costs!'}
        </p>

        ${activeJvsHtml}

        <div style="background:rgba(0,0,0,0.25);border:1px solid rgba(79,140,255,0.2);border-radius:8px;padding:0.75rem;display:flex;flex-direction:column;gap:0.75rem;">
          <div style="font-weight:bold;color:var(--primary);font-size:0.85rem;">
            ➕ ${lang==='id'?'Bentuk Joint Venture Baru':'Create New Joint Venture'}
          </div>

          <!-- Step 1: Select Property -->
          <div>
            <label style="font-size:0.75rem;color:var(--text-muted);display:block;margin-bottom:0.25rem;">
              1. ${lang==='id'?'Pilih Properti Anda:':'Select Your Property:'}
            </label>
            <select id="jv-select-property" style="width:100%;background:rgba(0,0,0,0.5);border:1px solid rgba(79,140,255,0.35);border-radius:6px;padding:0.4rem;color:#fff;font-size:0.82rem;">
              ${me.properties.map(ti => {
                const t = gs.tiles[ti];
                const tName = (lang==='id'?t?.name_id:t?.name_en)||t?.name_en;
                return `<option value="${ti}">${tName} ($${t?.price})</option>`;
              }).join('')}
            </select>
          </div>

          <!-- Step 2: Select Partner -->
          <div>
            <label style="font-size:0.75rem;color:var(--text-muted);display:block;margin-bottom:0.25rem;">
              2. ${lang==='id'?'Pilih Partner Kerjasama:':'Select Partner Player:'}
            </label>
            <select id="jv-select-partner" style="width:100%;background:rgba(0,0,0,0.5);border:1px solid rgba(79,140,255,0.35);border-radius:6px;padding:0.4rem;color:#fff;font-size:0.82rem;">
              ${others.map(p => `<option value="${p.id}">👤 ${p.name} ($${p.money})</option>`).join('')}
            </select>
          </div>

          <!-- Step 3: Split Ratio -->
          <div>
            <label style="font-size:0.75rem;color:var(--text-muted);display:block;margin-bottom:0.25rem;">
              3. ${lang==='id'?'Pilih Rasio Bagi Hasil (Anda / Partner):':'Select Profit Split Ratio (You / Partner):'}
            </label>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.4rem;">
              <label style="display:flex;align-items:center;gap:0.3rem;background:rgba(255,255,255,0.05);padding:0.35rem;border-radius:6px;font-size:0.75rem;cursor:pointer;">
                <input type="radio" name="jv-ratio" value="50" checked> 50% / 50%
              </label>
              <label style="display:flex;align-items:center;gap:0.3rem;background:rgba(255,255,255,0.05);padding:0.35rem;border-radius:6px;font-size:0.75rem;cursor:pointer;">
                <input type="radio" name="jv-ratio" value="60"> 60% / 40%
              </label>
              <label style="display:flex;align-items:center;gap:0.3rem;background:rgba(255,255,255,0.05);padding:0.35rem;border-radius:6px;font-size:0.75rem;cursor:pointer;">
                <input type="radio" name="jv-ratio" value="70"> 70% / 30%
              </label>
            </div>
          </div>

          <button id="btn-submit-jv" class="action-btn btn-primary" style="margin-top:0.4rem;padding:0.55rem;font-weight:bold;">
            🏢 ${lang==='id'?'BENTUK JOINT VENTURE':'FORM JOINT VENTURE'}
          </button>
        </div>
      </div>
    `;

    const btnSubmit = body.querySelector('#btn-submit-jv');
    if(btnSubmit) {
      btnSubmit.onclick = () => {
        const tileIndex = parseInt(document.getElementById('jv-select-property')?.value, 10);
        const partnerId = document.getElementById('jv-select-partner')?.value;
        const ratio = parseInt(document.querySelector('input[name="jv-ratio"]:checked')?.value || '50', 10);
        
        if(isNaN(tileIndex) || !partnerId) {
          showToast(lang==='id'?'Pilih properti dan partner!':'Select property and partner!', 'warning');
          return;
        }

        const prop = JointVenture.proposeJV(me.id, partnerId, tileIndex, ratio, gs);
        if(!prop) {
          showToast(lang==='id'?'Gagal mengajukan Joint Venture':'Failed to propose Joint Venture', 'error');
          return;
        }

        const partner = gs.players.find(p => p.id === partnerId);
        if(partner && (partner.isAI || !Network.getIsOnline())) {
          JointVenture.acceptJV(prop, gs);
          if(typeof GameAudio !== 'undefined') GameAudio.play('buy');
          showToast(`🤝 ${partner.name} ${lang==='id'?'menyetujui kemitraan Joint Venture!':'accepted the Joint Venture!'}`, 'success');
          if(typeof Chat !== 'undefined') {
            Network.sendChatMessage(lang==='id'?'Kemitraan yang luar biasa! Mari kita kembangkan bersama 🏢':'Great partnership! Let us grow this together 🏢', partner);
          }
        } else {
          showToast(lang==='id'?'Proposal kemitraan terkirim!':'Joint venture proposal sent!', 'info');
        }

        if(typeof Network !== 'undefined') Network.broadcastState(gs);
        if(typeof Game !== 'undefined') Game.syncState(gs);
        showJVModal();
      };
    }

    showModal('jv');
  }

  function dissolveJVAction(tileIndex) {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs) return;
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';

    const success = JointVenture.dissolveJV(myId, tileIndex, gs);
    if(success) {
      showToast(lang==='id'?'Kemitraan Joint Venture telah dibubarkan':'Joint Venture dissolved', 'success');
      if(typeof Network !== 'undefined') Network.broadcastState(gs);
      if(typeof Game !== 'undefined') Game.syncState(gs);
      showJVModal();
    } else {
      showToast(lang==='id'?'Saldo tidak cukup untuk membeli sisa saham partner':'Insufficient funds for buyout', 'error');
    }
  }
  
  function showStockModal() {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs || typeof Stock === 'undefined') return;
    const body = document.querySelector('#modal-stock .modal-body');
    if(!body) return;
    body.innerHTML = '';
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    const player = gs.players.find(p => p.id === myId);
    const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'en';
    Object.entries(gs.stocks).forEach(([name, data]) => {
      const trend = Stock.getStockTrend(name, gs);
      const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
      const owned = player ? (player.stocks[name] || 0) : 0;
      const sInfo = Stock.STOCKS ? Stock.STOCKS[name] : null;
      const icon = sInfo ? sInfo.icon : '📊';
      const div = document.createElement('div');
      div.className = 'stock-item';
      div.innerHTML = `
        <div class="stock-name">${icon} ${name}</div>
        <div class="stock-price">$${data.price} ${trendIcon}</div>
        <div class="stock-owned">${lang==='id'?'Milik':'Owned'}: ${owned}</div>
        <div style="display:flex;gap:4px;">
          <button class="action-btn" data-act="buy">${lang==='id'?'Beli':'Buy'}</button>
          <button class="action-btn" data-act="sell">${lang==='id'?'Jual':'Sell'}</button>
        </div>
      `;
      div.querySelector('[data-act="buy"]').onclick = () => {
        const r = Stock.buyStock(player.id, name, 1, gs);
        if(r.success) { showToast('Bought 1 ' + name + ' ($' + r.cost + ')', 'success'); }
        else showToast(r.reason, 'error');
        if(typeof Network !== 'undefined') Network.broadcastState(gs);
        showStockModal();
      };
      div.querySelector('[data-act="sell"]').onclick = () => {
        const r = Stock.sellStock(player.id, name, 1, gs);
        if(r.success) { showToast('Sold 1 ' + name + ' (+$' + r.proceeds + ')', 'success'); }
        else showToast(r.reason, 'error');
        if(typeof Network !== 'undefined') Network.broadcastState(gs);
        showStockModal();
      };
      body.appendChild(div);
    });
    showModal('stock');
  }
  
  function showLoanModal() {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs || typeof Loan === 'undefined') return;
    const body = document.querySelector('#modal-loan .modal-body');
    if(!body) return;
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    const player = gs.players.find(p => p.id === myId);
    if(!player) return;
    const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'en';
    body.innerHTML = '';
    // Existing loans
    if(player.loans && player.loans.length > 0) {
      const loansDiv = document.createElement('div');
      loansDiv.innerHTML = '<h3 style="color:var(--warning);margin-bottom:0.5rem;">' + (lang==='id'?'Pinjaman Aktif':'Active Loans') + '</h3>';
      player.loans.forEach((loan, i) => {
        const lDiv = document.createElement('div');
        lDiv.className = 'build-option';
        lDiv.innerHTML = `<strong>${loan.type}</strong> - $${loan.amount} (${loan.turnsLeft} ${lang==='id'?'giliran tersisa':'turns left'})`;
        const payBtn = document.createElement('button');
        payBtn.className = 'action-btn';
        payBtn.textContent = lang==='id'?'Bayar':'Repay';
        payBtn.onclick = () => { Loan.repayLoan(player.id, i, gs); if(typeof Network!=='undefined')Network.broadcastState(gs); showLoanModal(); };
        lDiv.appendChild(payBtn);
        loansDiv.appendChild(lDiv);
      });
      body.appendChild(loansDiv);
    }
    // New loans
    const newDiv = document.createElement('div');
    newDiv.innerHTML = '<h3 style="color:var(--primary);margin-top:1rem;margin-bottom:0.5rem;">' + (lang==='id'?'Pinjaman Baru':'New Loan') + '</h3>';
    const loanTypes = [
      { type:'bank', label:lang==='id'?'Bank (5%/giliran, maks $1000)':'Bank (5%/turn, max $1000)', amount:500 },
      { type:'shark', label:lang==='id'?'Lintah Darat (15%/giliran)':'Loan Shark (15%/turn)', amount:1000 },
    ];
    loanTypes.forEach(lt => {
      const btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.style.margin = '4px 0';
      btn.textContent = lt.label;
      btn.onclick = () => {
        const r = Loan.takeLoan(player.id, lt.type, lt.amount, null, gs);
        if(r) showToast((lang==='id'?'Pinjaman diambil!':'Loan taken!'), 'success');
        else showToast(lang==='id'?'Gagal':'Failed', 'error');
        if(typeof Network!=='undefined') Network.broadcastState(gs);
        showLoanModal();
      };
      newDiv.appendChild(btn);
    });
    body.appendChild(newDiv);
    showModal('loan');
  }
  
  function showBlackMarketModal() {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs || typeof BlackMarket === 'undefined') return;
    const body = document.querySelector('#modal-black-market .modal-body');
    if(!body) return;
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    const player = gs.players.find(p => p.id === myId);
    body.innerHTML = '';
    const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
    
    body.innerHTML = `
      <div style="margin-bottom:0.75rem;text-align:center;">
        <div style="font-size:0.8rem;color:var(--text-muted);">
          ${lang==='id' ? 'Barang ilegal dan teknologi gelap dengan efek instan yang sangat kuat, namun memiliki risiko tertangkap polisi siber!' : 'Illegal contraband with powerful instant effects, but carries a risk of getting caught by cyber police!'}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.6rem;max-height:360px;overflow-y:auto;">
        ${(BlackMarket.ITEMS || []).map(item => {
          const riskPct = Math.round((item.riskChance || 0) * 100);
          const riskColor = riskPct === 0 ? '#22c55e' : riskPct > 20 ? '#ef4444' : '#f59e0b';
          const canAfford = player && player.money >= item.price;
          return `
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,0,128,0.2);border-radius:8px;padding:0.6rem 0.75rem;display:flex;justify-content:space-between;align-items:center;">
              <div style="flex:1;padding-right:0.5rem;">
                <div style="font-weight:bold;font-size:0.92rem;color:var(--neon-pink,#ff007f);">${lang==='id'?(item.name_id||item.id):(item.name_en||item.id)}</div>
                <div style="font-size:0.78rem;color:var(--text-muted);margin:0.2rem 0;">${lang==='id'?(item.desc_id||''):(item.desc_en||'')}</div>
                <div style="font-size:0.75rem;">
                  <span style="color:#22c55e;font-weight:bold;">$${item.price}</span> | 
                  ${lang==='id'?'Risiko Tertangkap':'Risk'}: <span style="color:${riskColor};font-weight:bold;">${riskPct}%</span>
                </div>
              </div>
              <button class="action-btn btn-danger" style="font-size:0.8rem;padding:0.4rem 0.8rem;" onclick="UI.buyBlackMarketItem('${item.id}')" ${!canAfford ? 'disabled' : ''}>
                ${lang==='id'?'Beli':'Buy'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
    showModal('black-market');
  }

  function buyBlackMarketItem(itemId) {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs || typeof BlackMarket === 'undefined') return;
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    const player = gs.players.find(p => p.id === myId);
    const item = (BlackMarket.ITEMS || []).find(i => i.id === itemId);
    if(!player || !item) return;

    const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
    if(player.money < item.price) {
      showToast(lang==='id' ? 'Saldo kas Anda tidak mencukupi!' : 'Not enough cash!', 'error');
      return;
    }

    const result = BlackMarket.buyItem(myId, item.id, null, gs);
    if(result && result.caught) {
      showToast(lang==='id' ? `🚨 TERTANGKAP POLISI SIBER! Didenda $${item.penalty}${item.penaltyExtra==='jail'?' & Masuk Penjara!':''}` : `🚨 BUSTED BY CYBER POLICE! Fined $${item.penalty}`, 'error', 6000);
    } else if(result && result.success) {
      showToast(lang==='id' ? `🕶️ Berhasil membeli ${item.name_id || item.name_en}!` : `🕶️ Acquired ${item.name_en}!`, 'success', 4000);
    }
    if(typeof Network !== 'undefined') Network.broadcastState(gs);
    hideModal('black-market');
  }
  
  function showCardsModal() {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs) return;
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    const player = gs.players.find(p => p.id === myId);
    const body = document.querySelector('#modal-cards .modal-body');
    if(!body || !player) return;
    body.innerHTML = '';
    const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'en';
    if(!player.cards || player.cards.length === 0) {
      body.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">' + (lang==='id'?'Tidak ada kartu':'No cards in hand') + '</p>';
      showModal('cards');
      return;
    }
    player.cards.forEach((card, i) => {
      const div = document.createElement('div');
      div.className = 'card-item';
      div.innerHTML = `
        <strong>${lang==='id' ? (card.name_id||card.id) : (card.name_en||card.id)}</strong>
        <p style="font-size:0.85rem;margin:0.25rem 0;">${lang==='id' ? (card.desc_id||'') : (card.desc_en||'')}</p>
        <span class="card-type" data-type="${card.type||'special'}">${card.type||'special'}</span>
      `;
      const btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.style.marginTop = '0.5rem';
      btn.textContent = lang==='id'?'Gunakan':'Use';
      btn.onclick = () => {
        if(card.execute) card.execute(player, null, gs);
        player.cards.splice(i, 1);
        if(typeof Network!=='undefined') Network.broadcastState(gs);
        showCardsModal();
      };
      div.appendChild(btn);
      body.appendChild(div);
    });
    showModal('cards');
  }
  
  function showSkillModal() {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs) return;
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    const player = gs.players.find(p => p.id === myId);
    if(!player || typeof Skills === 'undefined') return;

    const charDef = Skills.getCharacter(player.character);
    if(!charDef) return;

    const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
    const body = document.querySelector('#modal-skill .modal-body');
    if(!body) return;

    const activeName = lang === 'id' ? charDef.active.name_id : charDef.active.name_en;
    const activeDesc = lang === 'id' ? charDef.active.desc_id : charDef.active.desc_en;
    const onCooldown = player.skillCooldown > 0;

    body.innerHTML = `
      <div style="text-align:center;padding:1rem;">
        <div style="font-size:3rem;margin-bottom:0.5rem;">${charDef.icon}</div>
        <h3 style="color:var(--primary);margin-bottom:0.5rem;">${activeName}</h3>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1.5rem;">${activeDesc}</p>
        <p style="font-size:0.85rem;margin-bottom:1.5rem;">
          ${onCooldown ? `<span style="color:var(--warning);">Cooldown: ${player.skillCooldown} ${lang==='id'?'giliran':'turns'}</span>` : `<span style="color:var(--success);">${lang==='id'?'Siap digunakan!':'Ready to use!'}</span>`}
        </p>
        <button id="btn-use-skill-confirm" class="menu-btn" ${onCooldown ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
          ${lang === 'id' ? 'GUNAKAN SKILL' : 'USE SKILL'}
        </button>
      </div>
    `;

    const btn = body.querySelector('#btn-use-skill-confirm');
    if(btn && !onCooldown) {
      btn.onclick = () => {
        Skills.useActive(player, null, null, gs);
        hideModal('skill');
        showToast(lang === 'id' ? 'Skill berhasil digunakan!' : 'Skill activated!', 'success');
        updateActionButtons(gs);
      };
    }

    showModal('skill');
  }

  function showPropertyModal(tileIndex) {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs || !gs.tiles) return;
    
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    const player = gs.players.find(p => p.id === myId);
    
    if(tileIndex === undefined || tileIndex === null) {
      tileIndex = player ? player.position : 1;
    }
    
    const tile = gs.tiles[tileIndex];
    if(!tile) return;
    
    const body = document.querySelector('#modal-property .modal-body');
    if(!body) return;
    
    const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
    const name = (lang === 'id' ? tile.name_id : tile.name_en) || tile.name_en || '';
    const groupColor = (typeof Renderer !== 'undefined' && Renderer.GROUP_COLORS) ? (Renderer.GROUP_COLORS[tile.group] || '#4f8cff') : '#4f8cff';
    
    let contentHtml = '';
    
    if(tile.type === 'property') {
      const rent = tile.rent || [10, 50, 150, 450, 800, 1250];
      const houseCost = tile.houseCost || 50;
      const owner = tile.owner ? gs.players.find(p => p.id === tile.owner) : null;
      const ownerName = owner ? owner.name : (lang === 'id' ? 'Belum Ada (Tersedia)' : 'Unowned (Available)');
      const buildingInfo = (owner && owner.buildings && owner.buildings[tileIndex]) ? owner.buildings[tileIndex] : null;
      let currentBldgText = lang === 'id' ? 'Tanpa Bangunan' : 'No Buildings';
      if(buildingInfo) {
        if(buildingInfo.type === 'hotel') currentBldgText = '🏨 Hotel (Tingkat 5)';
        else if(buildingInfo.type === 'house') currentBldgText = `🏠 ${buildingInfo.level} Rumah (Level ${buildingInfo.level})`;
        else if(typeof Property !== 'undefined' && Property.BUILDING_PATHS[buildingInfo.type]) {
          currentBldgText = `${Property.BUILDING_PATHS[buildingInfo.type].icon} ${Property.BUILDING_PATHS[buildingInfo.type].name_id || buildingInfo.type}`;
        }
      }
      
      contentHtml = `
        <div style="display:flex;flex-direction:column;gap:1rem;">
          <!-- Card Header / Title Deed -->
          <div style="background:${groupColor};color:#fff;padding:0.75rem;border-radius:8px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
            <div style="font-size:0.75rem;letter-spacing:1px;text-transform:uppercase;opacity:0.9;">${lang==='id'?'SERTIFIKAT HAK MILIK':'TITLE DEED'}</div>
            <h2 style="margin:0.25rem 0;font-size:1.4rem;font-weight:800;">${name}</h2>
            <div style="font-size:0.8rem;opacity:0.9;">${tile.group ? tile.group.toUpperCase() : ''} | Distrik ${tile.district || 1}</div>
          </div>

          <!-- Price & Key Stats -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem;text-align:center;background:rgba(255,255,255,0.04);padding:0.6rem;border-radius:6px;">
            <div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${lang==='id'?'Harga Beli':'Price'}</div>
              <div style="font-weight:bold;color:#22c55e;font-size:1rem;">$${tile.price}</div>
            </div>
            <div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${lang==='id'?'Biaya / Rumah':'Cost / House'}</div>
              <div style="font-weight:bold;color:var(--primary);font-size:1rem;">$${houseCost}</div>
            </div>
            <div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${lang==='id'?'Nilai Gadai':'Mortgage'}</div>
              <div style="font-weight:bold;color:var(--warning);font-size:1rem;">$${tile.mortgageValue || tile.price/2}</div>
            </div>
          </div>

          <!-- Complete Rent Table (Houses 1, 2, 3, 4, Hotel 5) -->
          <div style="background:rgba(0,0,0,0.25);border:1px solid rgba(79,140,255,0.15);border-radius:8px;padding:0.6rem;">
            <div style="font-weight:bold;font-size:0.85rem;margin-bottom:0.5rem;color:var(--primary);text-align:center;">
              📋 ${lang==='id'?'DAFTAR HARGA SEWA LENGKAP':'RENT BREAKDOWN TABLE'}
            </div>
            <table style="width:100%;font-size:0.82rem;border-collapse:collapse;">
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                <td style="padding:4px 0;">🏢 ${lang==='id'?'Sewa Dasar':'Base Rent'}</td>
                <td style="text-align:right;font-weight:bold;color:#e2e8f0;">$${rent[0]}</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                <td style="padding:4px 0;">🎨 ${lang==='id'?'1 Set Lengkap (Monopoli)':'With Full Color Set'}</td>
                <td style="text-align:right;font-weight:bold;color:#38bdf8;">$${rent[0] * 2}</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                <td style="padding:4px 0;">🏠 ${lang==='id'?'Dengan 1 Rumah':'With 1 House'}</td>
                <td style="text-align:right;font-weight:bold;color:#22c55e;">$${rent[1]}</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                <td style="padding:4px 0;">🏠🏠 ${lang==='id'?'Dengan 2 Rumah':'With 2 Houses'}</td>
                <td style="text-align:right;font-weight:bold;color:#22c55e;">$${rent[2]}</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                <td style="padding:4px 0;">🏠🏠🏠 ${lang==='id'?'Dengan 3 Rumah':'With 3 Houses'}</td>
                <td style="text-align:right;font-weight:bold;color:#22c55e;">$${rent[3]}</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                <td style="padding:4px 0;">🏠🏠🏠🏠 ${lang==='id'?'Dengan 4 Rumah':'With 4 Houses'}</td>
                <td style="text-align:right;font-weight:bold;color:#22c55e;">$${rent[4]}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-weight:bold;color:#f59e0b;">🏨 ${lang==='id'?'Dengan 1 HOTEL (Level 5)':'With HOTEL (Level 5)'}</td>
                <td style="text-align:right;font-weight:bold;color:#f59e0b;font-size:0.95rem;">$${rent[5]}</td>
              </tr>
            </table>
          </div>

          <!-- Alternative Buildings Info -->
          <div style="background:rgba(255,255,255,0.03);border-radius:6px;padding:0.5rem;font-size:0.75rem;color:var(--text-muted);">
            <div style="font-weight:bold;color:#e2e8f0;margin-bottom:0.25rem;">✨ ${lang==='id'?'Pilihan Gedung Khusus':'Special Building Branches'}:</div>
            <div>🏬 <strong>Mall</strong>: +$50 ${lang==='id'?'pasif/turn (Min 2 Rumah)':'passive/turn (Min 2 Houses)'}</div>
            <div>🏢 <strong>HQ</strong>: ${lang==='id'?'Pengganda Skill x2 (Min 2 Rumah)':'Skill Multiplier x2 (Min 2 Houses)'}</div>
            <div>🎰 <strong>Kasino</strong>: ${lang==='id'?'Sewa Acak 0.5x-3.0x (Min 1 Rumah)':'Random Rent 0.5x-3.0x (Min 1 House)'}</div>
            <div>🏰 <strong>Benteng</strong>: ${lang==='id'?'Kebal Serangan Kartu (Min 3 Rumah)':'Immune to Attack Cards (Min 3 Houses)'}</div>
          </div>

          <!-- Owner Status & Quick Action Buttons -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem;background:rgba(0,0,0,0.3);border-radius:6px;">
            <div style="font-size:0.8rem;">
              <div><strong>${lang==='id'?'Pemilik':'Owner'}:</strong> <span style="color:${owner?owner.color:'#94a3b8'}">${ownerName}</span></div>
              <div style="color:var(--text-muted);font-size:0.75rem;"><strong>${lang==='id'?'Bangunan':'Building'}:</strong> ${currentBldgText}</div>
            </div>
            <div style="display:flex;gap:0.5rem;">
              ${(!owner && gs.turnPhase === 'ACTION' && player && player.position === tileIndex) ? `
                <button class="action-btn btn-primary" onclick="Game.buyProperty('${player.id}', ${tileIndex}); UI.hideModal('property');">
                  💰 ${lang==='id'?'Beli Sekarang':'Buy Now'}
                </button>
              ` : ''}
              ${(!owner) ? `
                <button class="action-btn" onclick="Auction.startAuction(${tileIndex}, Game.getState()); UI.hideModal('property'); UI.showAuctionModal();">
                  ⚖️ ${lang==='id'?'Mulai Lelang':'Auction'}
                </button>
              ` : ''}
              ${(owner && owner.id === myId) ? `
                <button class="action-btn btn-primary" onclick="UI.hideModal('property'); UI.showBuildModal();">
                  🏗️ ${lang==='id'?'Bangun Rumah':'Construct'}
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    } else {
      // Special Tiles details
      let desc = '';
      if(tile.type === 'station') {
        desc = `
          <div style="text-align:center;padding:1rem;">
            <div style="font-size:3rem;margin-bottom:0.5rem;">🚄</div>
            <h3>${name}</h3>
            <p style="color:var(--text-muted);margin:0.5rem 0;">${lang==='id'?'Stasiun Metro / Kereta Cepat':'Metro / Hyperloop Station'}</p>
            <div style="text-align:left;background:rgba(0,0,0,0.25);padding:0.75rem;border-radius:6px;margin-top:1rem;font-size:0.85rem;">
              <div>1 Stasiun: $25</div>
              <div>2 Stasiun: $50</div>
              <div>3 Stasiun: $100</div>
              <div>4 Stasiun: $200</div>
            </div>
          </div>
        `;
      } else if(tile.type === 'utility') {
        desc = `
          <div style="text-align:center;padding:1rem;">
            <div style="font-size:3rem;margin-bottom:0.5rem;">⚡</div>
            <h3>${name}</h3>
            <p style="color:var(--text-muted);margin:0.5rem 0;">${lang==='id'?'Utilitas Listrik / Jaringan':'Power / Utility Grid'}</p>
            <div style="text-align:left;background:rgba(0,0,0,0.25);padding:0.75rem;border-radius:6px;margin-top:1rem;font-size:0.85rem;">
              <div>1 Utilitas: 4x Angka Dadu</div>
              <div>2 Utilitas: 10x Angka Dadu</div>
            </div>
          </div>
        `;
      } else {
        desc = `
          <div style="text-align:center;padding:1rem;">
            <div style="font-size:3rem;margin-bottom:0.5rem;">📍</div>
            <h3>${name}</h3>
            <p style="color:var(--text-muted);margin-top:0.5rem;">${lang==='id'?'Petak Aksi Khusus Monopoli':'Special Monopoly Action Tile'}</p>
          </div>
        `;
      }
      contentHtml = desc;
    }
    
    body.innerHTML = contentHtml;
    showModal('property');
  }

  function showAuctionModal() {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs) return;
    
    const body = document.querySelector('#modal-auction .modal-body');
    if(!body) return;
    
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    const player = gs.players.find(p => p.id === myId);
    const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
    
    // When NO auction is active: Balai Lelang Properti Kota
    if(!gs.auction || !gs.auction.isActive) {
      const poolIndices = gs.auctionPool || [];
      const discoveredTiles = poolIndices.map(ti => gs.tiles[ti]).filter(t => t && !t.owner);
      
      if(discoveredTiles.length === 0) {
        body.innerHTML = `
          <div style="text-align:center;padding:1.5rem;">
            <div style="font-size:3rem;margin-bottom:0.5rem;">⚖️</div>
            <h3 style="color:var(--primary);margin-bottom:0.5rem;">${lang === 'id' ? 'Balai Lelang Masih Kosong' : 'Auction House is Empty'}</h3>
            <p style="color:var(--text-muted);font-size:0.85rem;line-height:1.5;max-width:400px;margin:0 auto;">
              ${lang === 'id' 
                ? 'Belum ada properti di tempat lelang. Saat pemain berjalan dan mendarat di petak properti yang belum dibeli, properti tersebut akan otomatis masuk ke daftar lelang bersama untuk seluruh pemain!' 
                : 'No properties available in the auction house yet. As players walk and land on unowned property tiles, they will be discovered and added to the shared auction list for everyone!'}
            </p>
          </div>
        `;
        showModal('auction');
        return;
      }

      // Check if player stands on an unowned tile right now
      const currTile = (player && gs.tiles) ? gs.tiles[player.position] : null;
      const isStandingOnUnowned = currTile && !currTile.owner && (currTile.type === 'property' || currTile.type === 'station' || currTile.type === 'utility');
      const currTileName = currTile ? ((lang === 'id' ? currTile.name_id : currTile.name_en) || currTile.name_en) : '';

      let currentTileBanner = '';
      if(isStandingOnUnowned) {
        const startBid = Math.max(10, Math.floor(currTile.price * 0.5));
        currentTileBanner = `
          <div style="background:linear-gradient(135deg, rgba(0,240,255,0.15), rgba(79,140,255,0.25));border:1.5px solid var(--neon-cyan);border-radius:8px;padding:0.75rem;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:0.7rem;color:var(--neon-cyan);font-weight:bold;letter-spacing:1px;text-transform:uppercase;">📍 ${lang==='id'?'PETAK POSISI ANDA':'YOUR CURRENT TILE'}</div>
              <div style="font-weight:bold;font-size:1rem;color:#fff;">${currTileName}</div>
              <div style="font-size:0.75rem;color:#22c55e;">${lang==='id'?'Harga Asli':'Original Price'}: $${currTile.price} | ${lang==='id'?'Mulai Dari':'Starting Bid'}: <strong>$${startBid}</strong></div>
            </div>
            <button class="action-btn btn-primary" onclick="UI.triggerStartAuction(${currTile.index})">
              ⚖️ ${lang==='id'?'Lelang Sekarang':'Auction Now'}
            </button>
          </div>
        `;
      }

      body.innerHTML = `
        <div style="padding:0.25rem;">
          <div style="text-align:center;margin-bottom:0.75rem;">
            <h3 style="color:var(--primary);margin-bottom:0.25rem;">⚖️ ${lang==='id'?'Balai Lelang Properti Publik':'Public Property Auction House'}</h3>
            <p style="font-size:0.78rem;color:var(--text-muted);">${lang==='id'?'Daftar properti yang telah dilewati pemain dan siap dilelang ke seluruh room:':'Properties discovered by players, ready to be auctioned across the room:'}</p>
          </div>

          ${currentTileBanner}

          <div style="display:flex;flex-direction:column;gap:0.45rem;max-height:280px;overflow-y:auto;padding-right:2px;">
            ${discoveredTiles.map(t => {
              const tName = (lang==='id'?t.name_id:t.name_en)||t.name_en;
              const startBid = Math.max(10, Math.floor(t.price * 0.5));
              const groupColor = (typeof Renderer !== 'undefined' && Renderer.GROUP_COLORS) ? (Renderer.GROUP_COLORS[t.group] || '#4f8cff') : '#4f8cff';
              return `
                <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.04);padding:0.45rem 0.65rem;border-radius:6px;border-left:3.5px solid ${groupColor};">
                  <div>
                    <strong style="font-size:0.85rem;">${tName}</strong>
                    <div style="font-size:0.72rem;color:var(--text-muted);">${lang==='id'?'Harga':'Price'}: $${t.price} ➔ ${lang==='id'?'Tawaran Awal':'Start Bid'}: <span style="color:#22c55e;font-weight:bold;">$${startBid}</span></div>
                  </div>
                  <button class="action-btn btn-primary" style="font-size:0.75rem;padding:0.3rem 0.65rem;" onclick="UI.triggerStartAuction(${t.index})">
                    ⚖️ ${lang==='id'?'Buka Lelang':'Start Auction'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
      showModal('auction');
      return;
    }
    
    // ACTIVE LIVE AUCTION ROOM (Synchronized across all players)
    const auction = gs.auction;
    const tile = gs.tiles[auction.tileIndex];
    if(!tile) return;
    
    const tileName = (lang === 'id' ? tile.name_id : tile.name_en) || tile.name_en;
    const bidder = auction.currentBidder ? gs.players.find(p => p.id === auction.currentBidder) : null;
    const bidderName = bidder ? bidder.name : (lang === 'id' ? 'Belum Ada Penawar' : 'No Bids Yet');
    const minBid = Auction.getMinBid(gs);
    const hasPassed = player && auction.passedPlayers.includes(player.id);
    
    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:0.85rem;padding:0.25rem;">
        <!-- Property Badge -->
        <div style="background:rgba(79,140,255,0.12);border:1.5px solid rgba(79,140,255,0.4);border-radius:8px;padding:0.75rem;text-align:center;">
          <div style="font-size:0.7rem;color:var(--neon-cyan);letter-spacing:1px;font-weight:bold;text-transform:uppercase;">🔥 ${lang==='id'?'SESI LELANG TERBUKA AKTIF':'ACTIVE PUBLIC AUCTION SESSION'}</div>
          <h2 style="color:var(--primary);margin:0.25rem 0;font-size:1.3rem;">⚖️ ${tileName}</h2>
          <div style="font-size:0.8rem;color:var(--text-muted);">${lang==='id'?'Harga Asli di Papan':'Original Board Price'}: $${tile.price}</div>
        </div>

        <!-- Bid & Timer Info Card -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;text-align:center;">
          <div style="background:rgba(0,0,0,0.35);border-radius:8px;padding:0.75rem;border:1px solid rgba(34,197,94,0.4);">
            <div style="font-size:0.72rem;color:var(--text-muted);">${lang==='id'?'Tawaran Tertinggi Saat Ini':'Current Highest Bid'}</div>
            <div style="font-size:1.6rem;font-weight:bold;color:#22c55e;margin:0.2rem 0;">$${auction.currentBid}</div>
            <div style="font-size:0.78rem;color:${bidder?bidder.color:'#94a3b8'};font-weight:700;">👤 ${bidderName}</div>
          </div>
          <div style="background:rgba(0,0,0,0.35);border-radius:8px;padding:0.75rem;border:1px solid rgba(245,158,11,0.4);">
            <div style="font-size:0.72rem;color:var(--text-muted);">${lang==='id'?'Waktu Berpikir':'Time Remaining'}</div>
            <div style="font-size:1.6rem;font-weight:bold;color:#f59e0b;margin:0.2rem 0;" id="auction-timer-val">⏱️ ${auction.timeLeft}s</div>
            <div style="font-size:0.72rem;color:var(--text-muted);">${lang==='id'?'Tawar sebelum timer habis':'Bid before timer expires'}</div>
          </div>
        </div>

        <!-- Bidding Controls -->
        ${!hasPassed ? `
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            <div style="font-size:0.8rem;color:var(--text-muted);text-align:center;">
              ${lang==='id'?'Tawaran Minimal':'Minimum Bid'}: <strong style="color:#22c55e;">$${minBid}</strong> (Saldo Kas Anda: <strong style="color:#fff;">$${player ? player.money : 0}</strong>)
            </div>
            <div style="display:flex;gap:0.4rem;justify-content:center;">
              <button class="action-btn btn-primary" onclick="UI.triggerPlaceBid(${minBid})" ${player && player.money < minBid ? 'disabled' : ''}>
                +$10 ($${minBid})
              </button>
              <button class="action-btn" onclick="UI.triggerPlaceBid(${auction.currentBid + 50})" ${player && player.money < auction.currentBid + 50 ? 'disabled' : ''}>
                +$50 ($${auction.currentBid + 50})
              </button>
              <button class="action-btn" onclick="UI.triggerPlaceBid(${auction.currentBid + 100})" ${player && player.money < auction.currentBid + 100 ? 'disabled' : ''}>
                +$100 ($${auction.currentBid + 100})
              </button>
            </div>
            <div style="display:flex;gap:0.5rem;margin-top:0.25rem;">
              <button class="action-btn btn-danger" style="flex:1;padding:0.5rem;" onclick="UI.triggerPassAuction()">
                ❌ ${lang==='id'?'LEWATI LELANG INI / PASS':'PASS THIS AUCTION'}
              </button>
            </div>
          </div>
        ` : `
          <div style="text-align:center;padding:0.75rem;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:6px;color:#ef4444;font-size:0.85rem;">
            ${lang==='id'?'Anda telah melewati lelang ini. Menunggu penawaran pemain lain...':'You have passed this auction. Waiting for other bidders...'}
          </div>
        `}
      </div>
    `;
    
    showModal('auction');
  }

  function triggerStartAuction(tileIndex) {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs) return;
    if(typeof Network !== 'undefined' && !Network.getIsHost()) {
      Network.sendAction({ type: 'startAuction', tileIndex });
    } else if(typeof Auction !== 'undefined') {
      Auction.startAuction(tileIndex, gs);
    }
  }

  function triggerPlaceBid(amount) {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs) return;
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    if(!myId) return;

    if(typeof Network !== 'undefined' && !Network.getIsHost()) {
      Network.sendAction({ type: 'placeBid', playerId: myId, amount });
    } else if(typeof Auction !== 'undefined') {
      Auction.placeBid(myId, amount, gs);
    }
  }

  function triggerPassAuction() {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs) return;
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    if(!myId) return;

    if(typeof Network !== 'undefined' && !Network.getIsHost()) {
      Network.sendAction({ type: 'passAuction', playerId: myId });
    } else if(typeof Auction !== 'undefined') {
      Auction.passAuction(myId, gs);
    }
  }

  function showEventModal(event) { showModal('event'); }
  function showGameOverModal(winner) {
    const body = document.querySelector('#modal-game-over .modal-body');
    if(body && winner) {
      const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'en';
      body.innerHTML = `
        <div style="text-align:center;">
          <div style="font-size:4rem;">🏆</div>
          <h2 style="color:var(--warning);margin:1rem 0;">${lang==='id'?'PEMENANG!':'WINNER!'}</h2>
          <h3 style="color:var(--primary);">${winner.name}</h3>
          <p style="margin-top:1rem;">$${winner.money} | Net Worth: $${winner.netWorth || 0}</p>
        </div>
      `;
    }
    showModal('game-over');
  }
  
  // Initialize when DOM ready
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Event listeners
  if(typeof Events !== 'undefined') {
    Events.on('economyEventTriggered', (data) => { if(typeof Lang !== 'undefined') showToast(Lang.t('evt_'+data.eventId), 'event', 5000); });
    Events.on('weatherChanged', (data) => { if(typeof Lang !== 'undefined' && data) showToast(Lang.t('weather_'+(data.current||'sunny')), 'info', 4000); });
    Events.on('playerBankrupt', (data) => { showToast((data.player ? data.player.name : '') + ' BANKRUPT!', 'error', 5000); });
    Events.on('gameOver', (data) => { showGameOverModal(data.winner); });
    Events.on('rentPaid', (data) => { showToast('Rent: $' + data.amount, 'warning'); });
    Events.on('propertyBought', (data) => { showToast('Property bought!', 'success'); });
    Events.on('auctionStarted', () => { showAuctionModal(); });
    Events.on('auctionBid', () => { showAuctionModal(); });
    Events.on('auctionPass', () => { showAuctionModal(); });
    Events.on('auctionTick', () => {
      const modal = document.getElementById('modal-auction');
      if(modal && modal.classList.contains('active')) {
        const timerVal = document.getElementById('auction-timer-val');
        const gs = typeof Game !== 'undefined' ? Game.getState() : null;
        if(timerVal && gs && gs.auction) {
          timerVal.textContent = `⏱️ ${gs.auction.timeLeft}s`;
        }
      }
    });
  }
  
  return { init, showModal, hideModal, hideAllModals, showToast, updateHUD, updateActionButtons, setQuality, showBuildModal, showTradeModal, showStockModal, showLoanModal, showBlackMarketModal, buyBlackMarketItem, showSkillModal, showCardsModal, showJVModal, dissolveJVAction, showAuctionModal, triggerStartAuction, triggerPlaceBid, triggerPassAuction, showPropertyModal, showEventModal, showGameOverModal };
})();
