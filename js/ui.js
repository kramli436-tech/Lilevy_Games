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
          <h3 style="color:var(--primary);margin-bottom:0.5rem;">${lang==='id'?'Kualitas Grafis':'Graphics Quality'}</h3>
          <div style="display:flex;gap:0.5rem;">
            <button class="action-btn" onclick="UI.setQuality('low')">Low</button>
            <button class="action-btn btn-primary" onclick="UI.setQuality('medium')">Medium</button>
            <button class="action-btn" onclick="UI.setQuality('high')">High</button>
          </div>
        </div>
        <div>
          <h3 style="color:var(--primary);margin-bottom:0.5rem;">Info</h3>
          <p style="font-size:0.85rem;color:var(--text-muted);">
            Monopoly v1.0 &copy; Lilevy Games<br>
            ${lang==='id'?'Game Monopoli Hardcore Modern':'Hardcore Modern Monopoly Game'}<br>
            ${lang==='id'?'Powered by Supabase Realtime':'Powered by Supabase Realtime'}
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
    // Adjust particle count and animation quality
    showToast('Quality: ' + level, 'info');
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
    const hasBuildingsToMake = player && player.properties && player.properties.length > 0;
    const skillReady = player && player.skillCooldown <= 0;
    
    setBtn('btn-roll', isMyTurn && gameState.turnPhase === 'ROLL');
    setBtn('btn-buy', canBuy);
    setBtn('btn-build', isMyTurn && hasBuildingsToMake);
    setBtn('btn-trade', isMyTurn);
    setBtn('btn-auction', isMyTurn);
    setBtn('btn-stock', isMyTurn);
    setBtn('btn-loan', isMyTurn);
    setBtn('btn-black-market', isMyTurn);
    setBtn('btn-skill', isMyTurn && skillReady);
    setBtn('btn-cards', isMyTurn && player.cards && player.cards.length > 0);
    setBtn('btn-jv', isMyTurn && hasBuildingsToMake);
    setBtn('btn-end-turn', isMyTurn && gameState.turnPhase === 'ACTION');
    
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
      
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
          <div>
            <strong style="color:${groupColor};font-size:1rem;">${tileName}</strong>
            <div style="font-size:0.75rem;color:var(--text-muted);">${statusBadge} | ${lang==='id'?'Sewa Saat Ini':'Current Rent'}: <span style="color:#22c55e;font-weight:bold;">$${currRent}</span></div>
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
      
      if(!isMonopoly) {
        actionsDiv.innerHTML = `
          <div style="font-size:0.75rem;color:var(--warning);background:rgba(245,158,11,0.1);padding:0.4rem 0.6rem;border-radius:4px;width:100%;">
            ⚠️ ${lang==='id'?'Kumpulkan semua properti warna ini untuk membangun rumah!':'Collect all properties in this color group to build houses!'}
          </div>
        `;
      } else if(currType === 'house' || currLevel === 0) {
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
              showToast(lang==='id'?'Uang tidak mencukupi':'Insufficient funds', 'error');
            }
          };
          actionsDiv.appendChild(btn);
        } else if(currLevel === 4) {
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
              showToast(lang==='id'?'Uang tidak mencukupi':'Insufficient funds', 'error');
            }
          };
          actionsDiv.appendChild(btn);
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
  
  function showTradeModal() {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs) return;
    const body = document.querySelector('#modal-trade .modal-body');
    if(!body) return;
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    const me = gs.players.find(p => p.id === myId);
    const others = gs.players.filter(p => p.id !== myId && !p.isBankrupt);
    const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'en';
    body.innerHTML = '<h3 style="margin-bottom:1rem;">' + (lang==='id'?'Pilih pemain untuk trading:':'Select player to trade with:') + '</h3>';
    others.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.style.margin = '4px';
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.textContent = p.name + ' ($' + p.money + ') - ' + (p.properties||[]).length + ' properties';
      btn.onclick = () => { showToast(lang==='id'?'Fitur trading segera hadir!':'Trading feature coming soon!', 'info'); };
      body.appendChild(btn);
    });
    showModal('trade');
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
    body.innerHTML = '';
    const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'en';
    (BlackMarket.ITEMS || []).forEach(item => {
      const div = document.createElement('div');
      div.className = 'bm-item';
      div.innerHTML = `
        <strong>${lang==='id' ? (item.name_id||item.id) : (item.name_en||item.id)}</strong>
        <p style="font-size:0.85rem;margin:0.25rem 0;">${lang==='id' ? (item.desc_id||'') : (item.desc_en||'')}</p>
        <p style="font-size:0.85rem;">$${item.price} | ${lang==='id'?'Risiko':'Risk'}: ${Math.round((item.riskChance||0)*100)}%</p>
      `;
      const btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.textContent = lang==='id'?'Beli':'Buy';
      btn.onclick = () => {
        const result = BlackMarket.buyItem(myId, item.id, null, gs);
        if(result && result.caught) showToast((lang==='id'?'TERTANGKAP!':'CAUGHT!'), 'error');
        else showToast(lang==='id'?'Item didapat!':'Item acquired!', 'success');
        if(typeof Network!=='undefined') Network.broadcastState(gs);
        hideModal('black-market');
      };
      div.appendChild(btn);
      body.appendChild(div);
    });
    showModal('black-market');
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
  
  function showJVModal() {
    const gs = typeof Game !== 'undefined' ? Game.getState() : null;
    if(!gs) return;
    const body = document.querySelector('#modal-jv .modal-body');
    if(!body) return;
    const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'en';
    const myId = typeof Network !== 'undefined' ? Network.getPlayerId() : null;
    const me = gs.players.find(p => p.id === myId);
    body.innerHTML = '<p style="text-align:center;color:var(--text-muted);">' + (lang==='id'?'Pilih properti dan partner untuk Joint Venture':'Select property and partner for Joint Venture') + '</p>';
    if(me && me.properties && me.properties.length > 0) {
      me.properties.forEach(ti => {
        const tile = gs.tiles[ti];
        if(!tile) return;
        const div = document.createElement('div');
        div.className = 'build-option';
        div.innerHTML = '<strong>' + (lang==='id' ? tile.name_id : tile.name_en) + '</strong>';
        body.appendChild(div);
      });
    } else {
      body.innerHTML += '<p style="color:var(--text-muted);text-align:center;margin-top:1rem;">' + (lang==='id'?'Kamu belum punya properti':'You don\'t have any properties') + '</p>';
    }
    showModal('jv');
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
    
    if(!gs.auction || !gs.auction.isActive) {
      // If no active auction, allow selecting an unowned property to start auction
      const unownedTiles = gs.tiles.filter(t => (t.type === 'property' || t.type === 'station' || t.type === 'utility') && !t.owner);
      if(unownedTiles.length === 0) {
        body.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:1rem;">' + 
          (lang === 'id' ? 'Tidak ada properti yang tersedia untuk dilelang.' : 'No properties available for auction.') + '</p>';
        showModal('auction');
        return;
      }
      
      body.innerHTML = `
        <div style="padding:0.5rem;">
          <h3 style="color:var(--primary);margin-bottom:0.5rem;text-align:center;">⚖️ ${lang==='id'?'Pilih Properti Untuk Dilelang':'Select Property to Auction'}</h3>
          <div style="display:flex;flex-direction:column;gap:0.5rem;max-height:300px;overflow-y:auto;">
            ${unownedTiles.map(t => {
              const tName = (lang==='id'?t.name_id:t.name_en)||t.name_en;
              return `
                <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.05);padding:0.5rem 0.75rem;border-radius:6px;">
                  <div>
                    <strong>${tName}</strong>
                    <div style="font-size:0.75rem;color:#22c55e;">$${t.price}</div>
                  </div>
                  <button class="action-btn btn-primary" onclick="Auction.startAuction(${t.index}, Game.getState()); UI.showAuctionModal();">
                    ⚖️ ${lang==='id'?'Lelang':'Auction'}
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
    
    // Active auction display
    const auction = gs.auction;
    const tile = gs.tiles[auction.tileIndex];
    if(!tile) return;
    
    const tileName = (lang === 'id' ? tile.name_id : tile.name_en) || tile.name_en;
    const bidder = auction.currentBidder ? gs.players.find(p => p.id === auction.currentBidder) : null;
    const bidderName = bidder ? bidder.name : (lang === 'id' ? 'Belum Ada Penawar' : 'No Bids Yet');
    const minBid = Auction.getMinBid(gs);
    const hasPassed = player && auction.passedPlayers.includes(player.id);
    
    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:1rem;padding:0.5rem;">
        <!-- Property Badge -->
        <div style="background:rgba(79,140,255,0.12);border:1px solid rgba(79,140,255,0.3);border-radius:8px;padding:0.75rem;text-align:center;">
          <div style="font-size:0.75rem;color:var(--text-muted);letter-spacing:1px;text-transform:uppercase;">${lang==='id'?'LELANG PROPERTI AKTIF':'ACTIVE PROPERTY AUCTION'}</div>
          <h2 style="color:var(--primary);margin:0.25rem 0;font-size:1.3rem;">⚖️ ${tileName}</h2>
          <div style="font-size:0.85rem;color:var(--text-muted);">${lang==='id'?'Harga Dasar':'Base Price'}: $${tile.price}</div>
        </div>

        <!-- Bid & Timer Info Card -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;text-align:center;">
          <div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:0.75rem;border:1px solid rgba(34,197,94,0.3);">
            <div style="font-size:0.75rem;color:var(--text-muted);">${lang==='id'?'Tawaran Tertinggi':'Current Highest Bid'}</div>
            <div style="font-size:1.5rem;font-weight:bold;color:#22c55e;margin:0.25rem 0;">$${auction.currentBid}</div>
            <div style="font-size:0.8rem;color:${bidder?bidder.color:'#94a3b8'};font-weight:600;">👤 ${bidderName}</div>
          </div>
          <div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:0.75rem;border:1px solid rgba(245,158,11,0.3);">
            <div style="font-size:0.75rem;color:var(--text-muted);">${lang==='id'?'Waktu Tersisa':'Time Remaining'}</div>
            <div style="font-size:1.5rem;font-weight:bold;color:#f59e0b;margin:0.25rem 0;" id="auction-timer-val">⏱️ ${auction.timeLeft}s</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${lang==='id'?'Tawar sebelum waktu habis':'Bid before time runs out'}</div>
          </div>
        </div>

        <!-- Bidding Controls -->
        ${!hasPassed ? `
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            <div style="font-size:0.8rem;color:var(--text-muted);text-align:center;">
              ${lang==='id'?'Tawaran Minimal':'Minimum Bid'}: <strong style="color:#22c55e;">$${minBid}</strong> (Saldo: $${player ? player.money : 0})
            </div>
            <div style="display:flex;gap:0.5rem;justify-content:center;">
              <button class="action-btn" onclick="Auction.placeBid('${player.id}', ${minBid}, Game.getState()); UI.showAuctionModal();" ${player && player.money < minBid ? 'disabled' : ''}>
                +$10 ($${minBid})
              </button>
              <button class="action-btn" onclick="Auction.placeBid('${player.id}', ${auction.currentBid + 50}, Game.getState()); UI.showAuctionModal();" ${player && player.money < auction.currentBid + 50 ? 'disabled' : ''}>
                +$50 ($${auction.currentBid + 50})
              </button>
              <button class="action-btn" onclick="Auction.placeBid('${player.id}', ${auction.currentBid + 100}, Game.getState()); UI.showAuctionModal();" ${player && player.money < auction.currentBid + 100 ? 'disabled' : ''}>
                +$100 ($${auction.currentBid + 100})
              </button>
            </div>
            <div style="display:flex;gap:0.5rem;margin-top:0.25rem;">
              <button class="action-btn btn-danger" style="flex:1;" onclick="Auction.passAuction('${player.id}', Game.getState()); UI.showAuctionModal();">
                ❌ ${lang==='id'?'LEWATI / PASS':'PASS AUCTION'}
              </button>
            </div>
          </div>
        ` : `
          <div style="text-align:center;padding:0.75rem;background:rgba(239,68,68,0.1);border-radius:6px;color:#ef4444;font-size:0.9rem;">
            ${lang==='id'?'Anda telah melewati lelang ini. Menunggu pemain lain...':'You have passed this auction. Waiting for others...'}
          </div>
        `}
      </div>
    `;
    
    showModal('auction');
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
  
  return { init, showModal, hideModal, hideAllModals, showToast, updateHUD, updateActionButtons, setQuality, showBuildModal, showTradeModal, showStockModal, showLoanModal, showBlackMarketModal, showSkillModal, showCardsModal, showJVModal, showAuctionModal, showPropertyModal, showEventModal, showGameOverModal };
})();
