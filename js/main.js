// Events bus is defined in index.html (loaded before all scripts)

const Main = (function() {
  let currentScreen = 'home';
  let selectedCharacter = null;
  let playerName = '';
  let lobbyPlayers = [];
  
  function init() {
    // Initialize network
    Network.init();
    // Setup UI event listeners
    setupMenuEvents();
    setupCharacterEvents();
    setupLobbyEvents();
    setupGameEvents();
    // Setup network event listeners
    setupNetworkEvents();
    // Initialize guide
    if (typeof Guide !== 'undefined') Guide.init();
    // Initialize chat
    if (typeof Chat !== 'undefined') Chat.init();
    // Pre-initialize canvas renderer
    const cvs = document.getElementById('game-canvas');
    if(cvs && typeof Renderer !== 'undefined') {
      Renderer.init(cvs);
    }
    // Show home screen
    showScreen('home');
    // Language toggle
    document.getElementById('btn-lang-toggle')?.addEventListener('click', toggleLanguage);
    // Generate background particles
    document.querySelectorAll('.particles-bg').forEach(bg => {
      for(let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random()*100 + '%';
        p.style.top = Math.random()*100 + '%';
        p.style.animationDelay = Math.random()*10 + 's';
        p.style.animationDuration = (10 + Math.random()*15) + 's';
        bg.appendChild(p);
      }
    });
    console.log('Monopoly by Lilevy Games initialized!');
  }
  
  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById('screen-' + name);
    if(screen) {
      screen.classList.add('active');
      if(name === 'game') {
        const cvs = document.getElementById('game-canvas');
        if(cvs && typeof Renderer !== 'undefined') {
          Renderer.init(cvs);
          if(typeof Game !== 'undefined') {
            const gs = Game.getState();
            if(gs) Renderer.render(gs);
          }
        }
      }
    }
    currentScreen = name;
  }
  
  function toggleLanguage() {
    if (typeof Lang === 'undefined') return;
    const newLang = Lang.getLang() === 'id' ? 'en' : 'id';
    Lang.setLang(newLang);
    updateAllText();
    // Update guide if it's showing
    if(typeof Guide !== 'undefined') Guide.updateLanguage();
  }
  
  function updateAllText() {
    if (typeof Lang === 'undefined') return;
    document.querySelectorAll('[data-lang]').forEach(el => {
      el.textContent = Lang.t(el.dataset.lang);
    });
  }
  
  function setupMenuEvents() {
    document.getElementById('btn-menu-play')?.addEventListener('click', () => showScreen('character'));
    document.getElementById('btn-menu-guide')?.addEventListener('click', () => { if(typeof Guide !== 'undefined') Guide.init(); showScreen('guide'); });
    document.getElementById('btn-guide-back')?.addEventListener('click', () => showScreen('home'));
    document.getElementById('btn-menu-settings')?.addEventListener('click', () => { if(typeof UI !== 'undefined') UI.showModal('settings'); });
  }
  
  function setupCharacterEvents() {
    document.querySelectorAll('.char-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedCharacter = card.dataset.char;
      });
    });

    // CREATE ROOM
    document.getElementById('btn-room-create')?.addEventListener('click', () => {
      playerName = document.getElementById('player-name-input')?.value || 'Player';
      if(!selectedCharacter) {
        if(typeof UI !== 'undefined') UI.showToast(typeof Lang !== 'undefined' ? Lang.t('selectCharacter') : 'Pilih karakter!', 'warning');
        return;
      }
      Network.createRoom(playerName, selectedCharacter);
    });

    // JOIN ROOM
    document.getElementById('btn-room-join')?.addEventListener('click', () => {
      const code = document.getElementById('room-code-input')?.value;
      playerName = document.getElementById('player-name-input')?.value || 'Player';
      if(!code || code.length < 4) {
        if(typeof UI !== 'undefined') UI.showToast('Invalid room code', 'error');
        return;
      }
      if(!selectedCharacter) {
        if(typeof UI !== 'undefined') UI.showToast(typeof Lang !== 'undefined' ? Lang.t('selectCharacter') : 'Pilih karakter!', 'warning');
        return;
      }
      Network.joinRoom(code, playerName, selectedCharacter);
    });

    // READY / QUICK START — creates room if none exists, then goes to lobby
    document.getElementById('btn-char-ready')?.addEventListener('click', () => {
      if(!selectedCharacter) {
        if(typeof UI !== 'undefined') UI.showToast(typeof Lang !== 'undefined' ? Lang.t('selectCharacter') : 'Pilih karakter!', 'warning');
        return;
      }
      playerName = document.getElementById('player-name-input')?.value || 'Player';
      
      // If not in a room yet, create one automatically
      if(!Network.getRoomCode()) {
        Network.createRoom(playerName, selectedCharacter);
      } else {
        // Already in a room, just update presence as ready
        Network.updatePresence({ ready: true, name: playerName, character: selectedCharacter });
      }
    });
  }
  
  function setupLobbyEvents() {
    document.getElementById('btn-add-bot')?.addEventListener('click', addBot);
    document.getElementById('btn-lobby-start')?.addEventListener('click', startGame);
    document.getElementById('btn-lobby-back')?.addEventListener('click', () => {
      Network.disconnect();
      showScreen('character');
    });
  }
  
  function setupGameEvents() {
    // Roll dice
    document.getElementById('btn-roll')?.addEventListener('click', () => {
      if(!Network.getIsHost()) {
        Network.sendAction({ type:'roll' });
        return;
      }
      const player = Game.getCurrentPlayer();
      if(!player) return;
      if(player.id !== Network.getPlayerId() && !player.isAI) return;
      
      if(typeof Dice !== 'undefined') {
        Dice.animateRoll((result) => {
          Game.rollDice(player, result);
          if(typeof UI !== 'undefined') {
            const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
            UI.showToast(`${player.name} [ 🎲 ${result.dice1} + ${result.dice2} = ${result.total} ]`, 'info');
          }
        });
      } else {
        Game.rollDice(player);
      }
    });

    // End turn
    document.getElementById('btn-end-turn')?.addEventListener('click', () => {
      if(!Network.getIsHost()) {
        Network.sendAction({ type:'endTurn' });
        return;
      }
      Game.endTurn();
      syncAndRender();
    });

    // Buy property
    document.getElementById('btn-buy')?.addEventListener('click', () => {
      if(!Network.getIsHost()) {
        const p = Game.getCurrentPlayer();
        Network.sendAction({ type:'buy', playerId: p?.id, tileIndex: p?.position });
        return;
      }
      const player = Game.getCurrentPlayer();
      if(player) {
        const bought = Game.buyProperty(player.id, player.position);
        if(bought && typeof UI !== 'undefined') {
          const gs = Game.getState();
          const tile = gs.tiles[player.position];
          const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
          const name = tile ? ((lang === 'id' ? tile.name_id : tile.name_en) || tile.name_en) : 'Property';
          UI.showToast(`${player.name} ${lang === 'id' ? 'membeli' : 'bought'} ${name} ($${tile ? tile.price : ''})!`, 'success');
        }
        syncAndRender();
      }
    });
    
    setupBuildButton();
    setupTradeButton();
    setupStockButton();
    setupLoanButton();
    setupBlackMarketButton();
    setupSkillButton();
    setupCardsButton();
    setupJVButton();
    setupAuctionButton();
    document.getElementById('btn-pause-menu')?.addEventListener('click', () => {
      if(typeof UI !== 'undefined') UI.showModal('settings');
    });

    // Core Game Events Listener for automatic live UI & Board rendering
    Events.on('turnStart', () => syncAndRender());
    Events.on('playerMoved', () => syncAndRender());
    Events.on('diceRolled', () => syncAndRender());
    Events.on('propertyBought', () => syncAndRender());
    Events.on('stateUpdated', () => syncAndRender());
    Events.on('propertyOffer', (data) => {
      if(typeof UI !== 'undefined' && data && data.tile) {
        const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
        const name = (lang === 'id' ? data.tile.name_id : data.tile.name_en) || data.tile.name_en;
        UI.showToast(`${name} - ${lang==='id'?'Tersedia seharga':'Available for'} $${data.tile.price}`, 'info');
      }
      syncAndRender();
    });
  }

  function syncAndRender() {
    if(typeof Game === 'undefined') return;
    const gs = Game.getState();
    if(!gs) return;
    if(typeof Network !== 'undefined') Network.broadcastState(gs);
    if(typeof Renderer !== 'undefined') Renderer.render(gs);
    if(typeof UI !== 'undefined') {
      UI.updateHUD(gs);
      UI.updateActionButtons(gs);
    }
  }
  
  function setupBuildButton() { document.getElementById('btn-build')?.addEventListener('click', () => { if(typeof UI !== 'undefined') UI.showBuildModal(); }); }
  function setupTradeButton() { document.getElementById('btn-trade')?.addEventListener('click', () => { if(typeof UI !== 'undefined') UI.showTradeModal(); }); }
  function setupStockButton() { document.getElementById('btn-stock')?.addEventListener('click', () => { if(typeof UI !== 'undefined') UI.showStockModal(); }); }
  function setupLoanButton() { document.getElementById('btn-loan')?.addEventListener('click', () => { if(typeof UI !== 'undefined') UI.showLoanModal(); }); }
  function setupBlackMarketButton() { document.getElementById('btn-black-market')?.addEventListener('click', () => { if(typeof UI !== 'undefined') UI.showBlackMarketModal(); }); }
  function setupSkillButton() { document.getElementById('btn-skill')?.addEventListener('click', () => {
    if(typeof UI === 'undefined') return;
    const player = Game.getCurrentPlayer();
    if(typeof Skills !== 'undefined' && Skills.canUseActive(player)) UI.showSkillModal();
    else if(typeof Lang !== 'undefined') UI.showToast(Lang.t('skillOnCooldown') || 'Skill on cooldown', 'warning');
  }); }
  function setupCardsButton() { document.getElementById('btn-cards')?.addEventListener('click', () => { if(typeof UI !== 'undefined') UI.showCardsModal(); }); }
  function setupJVButton() { document.getElementById('btn-jv')?.addEventListener('click', () => { if(typeof UI !== 'undefined') UI.showJVModal(); }); }
  function setupAuctionButton() { document.getElementById('btn-auction')?.addEventListener('click', () => { if(typeof UI !== 'undefined') UI.showAuctionModal(); }); }
  
  function setupNetworkEvents() {
    Events.on('roomJoined', (data) => {
      // Show room code
      const d = document.getElementById('room-code-display');
      if(d) { d.textContent = data.code; d.classList.remove('hidden'); }
      const ld = document.getElementById('lobby-room-display');
      if(ld) ld.textContent = data.code;
      // Show/hide start button for host
      const startBtn = document.getElementById('btn-lobby-start');
      if(startBtn) {
        if(data.isHost) startBtn.classList.remove('hidden');
        else startBtn.classList.add('hidden');
      }
      showScreen('lobby');
      if(typeof UI !== 'undefined') UI.showToast('Room: ' + data.code, 'success');
    });

    Events.on('presenceSync', (presenceState) => {
      lobbyPlayers = [];
      Object.entries(presenceState).forEach(([key, presences]) => {
        if(Array.isArray(presences)) {
          presences.forEach(p => lobbyPlayers.push(p));
        } else {
          lobbyPlayers.push(presences);
        }
      });
      updateLobbyUI();
    });

    Events.on('stateSync', (newState) => {
      if(typeof Game !== 'undefined') Game.syncState(newState);
      if(currentScreen !== 'game') {
        showScreen('game');
        setTimeout(() => {
          const cvs = document.getElementById('game-canvas');
          if(cvs && typeof Renderer !== 'undefined') {
            Renderer.init(cvs);
            Renderer.render(newState);
          }
        }, 50);
      } else {
        if(typeof Renderer !== 'undefined') Renderer.render(newState);
      }
      if(typeof UI !== 'undefined') {
        UI.updateHUD(newState);
        UI.updateActionButtons(newState);
      }
    });

    Events.on('networkAction', (action) => {
      if(!Network.getIsHost()) return;
      handleNetworkAction(action);
    });
  }
  
  function handleNetworkAction(action) {
    switch(action.type) {
      case 'roll': Game.rollDice(Game.getCurrentPlayer()); break;
      case 'endTurn': Game.endTurn(); break;
      case 'buy': Game.buyProperty(action.playerId, action.tileIndex); break;
      case 'addBot':
        Network.addBot(action.name, action.character);
        break;
    }
    Network.broadcastState(Game.getState());
    if(typeof Renderer !== 'undefined') Renderer.render(Game.getState());
    if(typeof UI !== 'undefined') {
      UI.updateHUD(Game.getState());
      UI.updateActionButtons(Game.getState());
    }
  }
  
  function updateLobbyUI() {
    const container = document.getElementById('lobby-players');
    if(!container) return;
    container.innerHTML = '';
    lobbyPlayers.forEach(p => {
      const div = document.createElement('div');
      div.className = 'lobby-player';
      let charInfo = null;
      if (typeof Skills !== 'undefined') charInfo = Skills.getCharacter(p.character);
      div.innerHTML = `<span class="char-icon">${charInfo ? charInfo.icon : '👤'}</span><span class="player-name">${p.name || 'Player'}</span><span class="player-char">${p.character || ''}</span><span class="ready-badge ${p.ready ? 'ready' : ''}">${p.ready ? '✓ Ready' : '...'}</span>${p.isBot ? '<span style="color:var(--warning,#f59e0b);font-size:0.75rem;font-weight:bold;margin-left:auto;">🤖 BOT</span>' : ''}`;
      container.appendChild(div);
    });

    // Update player count
    const countEl = document.getElementById('lobby-player-count');
    if(countEl) countEl.textContent = lobbyPlayers.length + '/6';
  }
  
  function addBot() {
    const botChars = ['banker','engineer','trader','politician','gambler','guardian'];
    const usedChars = lobbyPlayers.map(p => p.character);
    const available = botChars.filter(c => !usedChars.includes(c));
    if(available.length === 0 || lobbyPlayers.length >= 6) {
      if(typeof UI !== 'undefined') UI.showToast('Max players reached', 'warning');
      return null;
    }
    const char = available[Math.floor(Math.random()*available.length)];
    const botName = 'Bot ' + (lobbyPlayers.filter(p => p.isBot).length + 1);
    
    return Network.addBot(botName, char);
  }
  
  function startGame() {
    if(!Network.getIsHost()) return;
    
    // Ensure we have at least the local host player
    if(lobbyPlayers.length === 0) {
      const myId = Network.getPlayerId() || 'host_p1';
      const myName = playerName || 'Player 1';
      const myChar = selectedCharacter || 'banker';
      lobbyPlayers = [{ id: myId, name: myName, character: myChar, isHost: true, ready: true, isBot: false }];
    }
    
    // If only 1 player (solo), automatically add an AI Bot opponent
    if(lobbyPlayers.length < 2) {
      const botChars = ['engineer', 'trader', 'politician', 'gambler', 'guardian'];
      const usedChars = lobbyPlayers.map(p => p.character);
      const avail = botChars.filter(c => !usedChars.includes(c));
      const chosenChar = (avail.length > 0) ? avail[Math.floor(Math.random() * avail.length)] : 'engineer';
      const botObj = {
        id: 'bot_' + Math.random().toString(36).substr(2, 9),
        name: 'AI Bot',
        character: chosenChar,
        isHost: false,
        ready: true,
        isBot: true
      };
      lobbyPlayers.push(botObj);
      Network.addBot(botObj.name, botObj.character);
    }

    const players = lobbyPlayers.map((p, i) => {
      return Player.create(p.id, p.name || ('Player ' + (i+1)), p.character, p.isBot || false, i);
    });

    Game.initGame(players);
    showScreen('game');

    // Double render pass to guarantee canvas is sized and drawn immediately
    const cvs = document.getElementById('game-canvas');
    if(cvs && typeof Renderer !== 'undefined') {
      Renderer.init(cvs);
      Renderer.render(Game.getState());
    }
    setTimeout(() => {
      if(cvs && typeof Renderer !== 'undefined') {
        Renderer.init(cvs);
        Renderer.render(Game.getState());
      }
      if(typeof UI !== 'undefined') {
        UI.updateHUD(Game.getState());
        UI.updateActionButtons(Game.getState());
      }
      Network.broadcastState(Game.getState());
      if(typeof UI !== 'undefined') {
        const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
        UI.showToast(lang === 'id' ? 'Permainan Dimulai!' : 'Game Started!', 'success');
      }
    }, 60);
  }
  
  // Initialize on DOM ready
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  return { init, showScreen, toggleLanguage };
})();
