const Renderer = (function() {
  let canvas = null, ctx = null;
  let width = 0, height = 0;
  let camera = { x: 0, y: 0, zoom: 1 };
  let isDragging = false, lastTouch = null;
  let boardSize = 0;
  let tileSize = 0;
  const BOARD_PADDING = 24;
  
  const GROUP_COLORS = {
    purple: '#a855f7',
    lightblue: '#38bdf8',
    pink: '#ec4899',
    orange: '#f97316',
    red: '#ef4444',
    yellow: '#eab308',
    green: '#22c55e',
    blue: '#3b82f6'
  };
  
  let isInitialized = false;
  function init(canvasEl) {
    if (!canvasEl) return;
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    resize();
    if (!isInitialized) {
      isInitialized = true;
      setupTouchControls();
      window.addEventListener('resize', resize);
    }
  }
  
  function resize() {
    if (!canvas) {
      canvas = document.getElementById('game-canvas');
      if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth || document.documentElement.clientWidth || 360;
    height = window.innerHeight || document.documentElement.clientHeight || 640;
    
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx = canvas.getContext('2d');
    
    // Fit board comfortably in viewport between Top Bars (HUD + Tools) and Floating Action Dock
    const hudEl = document.getElementById('hud-top');
    const toolsEl = document.getElementById('top-tools-bar');
    const actEl = document.getElementById('action-panel');
    
    const isMobile = width <= 480;
    const hudH = (hudEl && hudEl.offsetHeight > 0) ? hudEl.offsetHeight : 42;
    const toolsH = (toolsEl && toolsEl.offsetHeight > 0) ? toolsEl.offsetHeight : 64;
    const actBottomOffset = isMobile ? 65 : 32;
    const actH = (actEl && actEl.offsetHeight > 0) ? (actEl.offsetHeight + actBottomOffset) : (50 + actBottomOffset);
    const topTotalH = hudH + toolsH;
    
    const availableH = Math.max(160, height - topTotalH - actH - 6);
    const availableW = Math.max(160, width - 6);
    boardSize = Math.max(200, Math.min(availableW, availableH, 760));
    tileSize = boardSize / 14;
    
    camera.x = Math.round((width - boardSize) / 2);
    camera.y = Math.round(topTotalH + (availableH - boardSize) / 2 + 2);
    camera.zoom = 1;
  }
  
  let startClick = { x: 0, y: 0 };
  
  function setupTouchControls() {
    if (!canvas) return;
    canvas.addEventListener('touchstart', (e) => { 
      if (e.touches.length === 1) {
        isDragging = true; 
        lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY }; 
        startClick = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });
    canvas.addEventListener('touchmove', (e) => {
      if(!isDragging || !lastTouch || e.touches.length !== 1) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - lastTouch.x;
      const dy = e.touches[0].clientY - lastTouch.y;
      camera.x += dx; 
      camera.y += dy;
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      render();
    }, { passive: false });
    canvas.addEventListener('touchend', (e) => { 
      isDragging = false; 
      if(lastTouch && Math.hypot(lastTouch.x - startClick.x, lastTouch.y - startClick.y) < 8) {
        const worldX = (startClick.x - camera.x) / camera.zoom;
        const worldY = (startClick.y - camera.y) / camera.zoom;
        const tileIdx = getTileAtPoint(worldX, worldY);
        if(tileIdx !== null && typeof UI !== 'undefined') {
          UI.showPropertyModal(tileIdx);
        }
      }
    });
    
    canvas.addEventListener('mousedown', (e) => { 
      isDragging = true; 
      lastTouch = { x: e.clientX, y: e.clientY }; 
      startClick = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('mousemove', (e) => {
      if(!isDragging || !lastTouch) return;
      camera.x += e.clientX - lastTouch.x;
      camera.y += e.clientY - lastTouch.y;
      lastTouch = { x: e.clientX, y: e.clientY };
      render();
    });
    canvas.addEventListener('mouseup', (e) => { 
      isDragging = false; 
      if(Math.hypot(e.clientX - startClick.x, e.clientY - startClick.y) < 8) {
        const worldX = (e.clientX - camera.x) / camera.zoom;
        const worldY = (e.clientY - camera.y) / camera.zoom;
        const tileIdx = getTileAtPoint(worldX, worldY);
        if(tileIdx !== null && typeof UI !== 'undefined') {
          UI.showPropertyModal(tileIdx);
        }
      }
    });
    canvas.addEventListener('mouseleave', () => { isDragging = false; });
    
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.95 : 1.05;
      camera.zoom = Math.max(0.7, Math.min(1.8, camera.zoom * delta));
      render();
    }, { passive: false });
  }
  
  function getTileAtPoint(worldX, worldY) {
    for (let i = 0; i < 52; i++) {
      const pos = getTilePosition(i);
      if (worldX >= pos.x && worldX <= pos.x + pos.w && worldY >= pos.y && worldY <= pos.y + pos.h) {
        return i;
      }
    }
    return null;
  }
  
  function render(gameState) {
    if(!canvas) {
      canvas = document.getElementById('game-canvas');
      if(canvas) ctx = canvas.getContext('2d');
    }
    if(!ctx || !canvas) return;
    if(!gameState) {
      if(typeof Game !== 'undefined') gameState = Game.getState();
    }
    if(!gameState) return;
    
    const dpr = window.devicePixelRatio || 1;
    if(width <= 0 || height <= 0 || boardSize <= 0 || canvas.width !== Math.round(width * dpr)) {
      resize();
    }
    
    // 1. Reset transform matrix and clear entire physical canvas buffer
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 2. Set camera & HiDPI scale transform matrix
    const scale = dpr * (camera.zoom || 1);
    ctx.setTransform(scale, 0, 0, scale, camera.x * dpr, camera.y * dpr);
    
    // 3. Draw all game board layers
    drawBackground();
    drawCenterBoard(gameState);
    drawBoard(gameState);
    drawPlayers(gameState);
    
    if(gameState && typeof Animations !== 'undefined' && Animations.renderWeather) {
      Animations.renderWeather(ctx, gameState.weather, boardSize);
    }
    
    // 4. Reset transform back to identity
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  
  function drawBackground() {
    // Subtle backdrop grid
    ctx.fillStyle = '#0f1923';
    ctx.fillRect(-60, -60, boardSize + 120, boardSize + 120);
    
    ctx.strokeStyle = 'rgba(79, 140, 255, 0.03)';
    ctx.lineWidth = 1;
    for(let i = -40; i <= boardSize + 40; i += 25) {
      ctx.beginPath(); ctx.moveTo(i, -60); ctx.lineTo(i, boardSize + 60); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-60, i); ctx.lineTo(boardSize + 60, i); ctx.stroke();
    }
  }
  
  function getTilePosition(index) {
    const cs = tileSize * 1.5; // Corner tile dimension
    const boardInner = boardSize - cs * 2;
    const nw = boardInner / 12; // Normal tile width (12 tiles between corners)
    
    // Bottom row (0 to 13, Right to Left)
    if (index === 0) {
      return { x: boardSize - cs, y: boardSize - cs, w: cs, h: cs, side: 'corner', corner: 0 };
    }
    if (index >= 1 && index <= 12) {
      const col = index;
      return { x: boardSize - cs - col * nw, y: boardSize - cs, w: nw, h: cs, side: 'bottom' };
    }
    if (index === 13) {
      return { x: 0, y: boardSize - cs, w: cs, h: cs, side: 'corner', corner: 13 };
    }
    // Left column (14 to 25, Bottom to Top)
    if (index >= 14 && index <= 25) {
      const row = index - 13;
      return { x: 0, y: boardSize - cs - row * nw, w: cs, h: nw, side: 'left' };
    }
    if (index === 26) {
      return { x: 0, y: 0, w: cs, h: cs, side: 'corner', corner: 26 };
    }
    // Top row (27 to 38, Left to Right)
    if (index >= 27 && index <= 38) {
      const col = index - 26;
      return { x: cs + (col - 1) * nw, y: 0, w: nw, h: cs, side: 'top' };
    }
    if (index === 39) {
      return { x: boardSize - cs, y: 0, w: cs, h: cs, side: 'corner', corner: 39 };
    }
    // Right column (40 to 51, Top to Bottom)
    if (index >= 40 && index <= 51) {
      const row = index - 39;
      return { x: boardSize - cs, y: cs + (row - 1) * nw, w: cs, h: nw, side: 'right' };
    }
    return { x: 0, y: 0, w: tileSize, h: tileSize, side: 'bottom' };
  }
  
  function drawCenterBoard(gameState) {
    const cs = tileSize * 1.5;
    const cx = cs;
    const cy = cs;
    const cw = boardSize - cs * 2;
    const ch = boardSize - cs * 2;
    
    // Center background card
    ctx.fillStyle = 'rgba(15, 25, 35, 0.94)';
    roundRect(ctx, cx + 4, cy + 4, cw - 8, ch - 8, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(79, 140, 255, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    const centerX = boardSize / 2;
    const centerY = boardSize / 2;
    
    // Game Title & Branding
    const titleSize = Math.max(14, Math.min(cw * 0.11, 28));
    ctx.fillStyle = '#4f8cff';
    ctx.font = `800 ${titleSize}px 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('MONOPOLY', centerX, centerY - ch * 0.26);
    
    const subSize = Math.max(8, Math.min(cw * 0.045, 12));
    ctx.fillStyle = '#94a3b8';
    ctx.font = `600 ${subSize}px 'Inter', sans-serif`;
    ctx.fillText('LILEVY GAMES', centerX, centerY - ch * 0.17);
    
    if (gameState) {
      // Active Player Turn info
      const currP = gameState.players ? gameState.players[gameState.currentPlayerIndex] : null;
      if (currP) {
        const turnSize = Math.max(9, Math.min(cw * 0.055, 14));
        ctx.fillStyle = currP.color || '#4f8cff';
        ctx.font = `bold ${turnSize}px 'Inter', sans-serif`;
        const pName = currP.isAI ? `🤖 ${currP.name}` : `👤 ${currP.name}`;
        ctx.fillText(pName + ' Turn', centerX, centerY - ch * 0.05);
      }
      
      // Weather & Economy Badges
      let wIcon = '☀️';
      let wName = 'Sunny';
      if (typeof Weather !== 'undefined' && Weather.getWeatherInfo) {
        const wi = Weather.getWeatherInfo(gameState.weather.current);
        if (wi) { wIcon = wi.icon; wName = wi.id || wi.name || 'Sunny'; }
      }
      
      const pillW = Math.min(210, cw * 0.88);
      const pillH = Math.max(22, ch * 0.11);
      const pillY = centerY + ch * 0.06;
      
      ctx.fillStyle = 'rgba(79, 140, 255, 0.08)';
      roundRect(ctx, centerX - pillW / 2, pillY, pillW, pillH, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(79, 140, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      const econName = (gameState.economy && gameState.economy.currentEvent) ? (gameState.economy.eventName || gameState.economy.currentEvent) : 'Normal';
      let statusStr = `${wIcon} ${wName.toUpperCase()} | 📊 ${econName}`;
      
      let badgeFont = Math.max(7.5, Math.min(cw * 0.042, 11));
      ctx.font = `500 ${badgeFont}px 'Inter', sans-serif`;
      while (ctx.measureText(statusStr).width > pillW - 12 && badgeFont > 6) {
        badgeFont -= 0.5;
        ctx.font = `500 ${badgeFont}px 'Inter', sans-serif`;
      }
      
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(statusStr, centerX, pillY + pillH * 0.65);
      
      // Dice Roll Display in center
      if (typeof Dice !== 'undefined') {
        const lastRoll = Dice.getLastRoll();
        if (lastRoll && lastRoll.values) {
          const diceFont = Math.max(9, Math.min(cw * 0.055, 14));
          ctx.fillStyle = '#22c55e';
          ctx.font = `bold ${diceFont}px monospace`;
          ctx.fillText(`🎲 [ ${lastRoll.values[0]} ] [ ${lastRoll.values[1]} ] = ${lastRoll.total}`, centerX, centerY + ch * 0.32);
        }
      }
    }
  }
  
  function drawBoard(gameState) {
    if(!gameState || !gameState.tiles) return;
    
    gameState.tiles.forEach((tile, i) => {
      const pos = getTilePosition(i);
      const isCorner = [0, 13, 26, 39].includes(i);
      const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
      const name = (lang === 'id' ? tile.name_id : tile.name_en) || tile.name_en || '';
      
      // Tile background
      ctx.fillStyle = isCorner ? 'rgba(22, 33, 48, 0.98)' : 'rgba(20, 28, 42, 0.95)';
      roundRect(ctx, pos.x, pos.y, pos.w, pos.h, 3);
      ctx.fill();
      
      // Tile border
      ctx.strokeStyle = 'rgba(79, 140, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Color Stripe for Color Group Properties
      if(tile.group && GROUP_COLORS[tile.group]) {
        ctx.fillStyle = GROUP_COLORS[tile.group];
        const stripeSize = 4;
        if(pos.side === 'bottom') {
          ctx.fillRect(pos.x, pos.y, pos.w, stripeSize);
        } else if(pos.side === 'left') {
          ctx.fillRect(pos.x + pos.w - stripeSize, pos.y, stripeSize, pos.h);
        } else if(pos.side === 'top') {
          ctx.fillRect(pos.x, pos.y + pos.h - stripeSize, pos.w, stripeSize);
        } else if(pos.side === 'right') {
          ctx.fillRect(pos.x, pos.y, stripeSize, pos.h);
        }
      }
      
      // Owner Badge / Building Indicator
      if(tile.owner && gameState.players) {
        const owner = gameState.players.find(p => p.id === tile.owner);
        if(owner) {
          ctx.fillStyle = owner.color;
          ctx.beginPath();
          ctx.arc(pos.x + pos.w - 6, pos.y + 6, 3.5, 0, Math.PI * 2);
          ctx.fill();
          
          if(owner.buildings && owner.buildings[i] && typeof Property !== 'undefined') {
            const b = owner.buildings[i];
            const bDef = Property.BUILDING_PATHS ? Property.BUILDING_PATHS[b.type] : null;
            const bIcon = bDef ? bDef.icon : '🏠';
            ctx.font = '10px serif';
            ctx.fillText(bIcon, pos.x + 8, pos.y + 10);
          }
        }
      }
      
      // Corner Tiles Rendering
      if (isCorner) {
        ctx.textAlign = 'center';
        if (i === 0) { // GO
          ctx.font = `bold ${Math.max(11, pos.h * 0.22)}px 'Inter', sans-serif`;
          ctx.fillStyle = '#22c55e';
          ctx.fillText('🚀 GO', pos.x + pos.w / 2, pos.y + pos.h * 0.42);
          ctx.font = `600 ${Math.max(8, pos.h * 0.14)}px monospace`;
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('+$300', pos.x + pos.w / 2, pos.y + pos.h * 0.72);
        } else if (i === 13) { // Jail
          ctx.font = `bold ${Math.max(11, pos.h * 0.22)}px 'Inter', sans-serif`;
          ctx.fillStyle = '#f59e0b';
          ctx.fillText('🔒 JAIL', pos.x + pos.w / 2, pos.y + pos.h * 0.45);
          ctx.font = `500 ${Math.max(7, pos.h * 0.13)}px 'Inter', sans-serif`;
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('Visiting', pos.x + pos.w / 2, pos.y + pos.h * 0.72);
        } else if (i === 26) { // Free Parking
          ctx.font = `bold ${Math.max(11, pos.h * 0.22)}px 'Inter', sans-serif`;
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('🅿️ PARK', pos.x + pos.w / 2, pos.y + pos.h * 0.45);
          ctx.font = `500 ${Math.max(7, pos.h * 0.13)}px 'Inter', sans-serif`;
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('Free Rest', pos.x + pos.w / 2, pos.y + pos.h * 0.72);
        } else if (i === 39) { // Go to Jail
          ctx.font = `bold ${Math.max(11, pos.h * 0.22)}px 'Inter', sans-serif`;
          ctx.fillStyle = '#ef4444';
          ctx.fillText('👮 ARREST', pos.x + pos.w / 2, pos.y + pos.h * 0.45);
          ctx.font = `500 ${Math.max(7, pos.h * 0.13)}px 'Inter', sans-serif`;
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('To Jail', pos.x + pos.w / 2, pos.y + pos.h * 0.72);
        }
        return;
      }
      
      // Normal Tiles Content Rendering (Horizontal vs Vertical)
      ctx.textAlign = 'center';
      
      if (tile.type === 'property') {
        // Strip prefixes for clean display
        const cleanName = name.replace(/^(Gang |Jl. |Jalan |St. |Street |Gg. )/i, '').trim();
        const maxTextW = pos.w - 4;
        
        if (pos.side === 'bottom') {
          // Bottom row: tall tile
          const words = cleanName.split(' ');
          let line1 = cleanName, line2 = '';
          if (words.length >= 2) { line1 = words[0]; line2 = words.slice(1).join(' '); }
          
          let fontSize = Math.max(6, Math.min(pos.w * 0.26, 11));
          ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
          while ((ctx.measureText(line1).width > maxTextW || (line2 && ctx.measureText(line2).width > maxTextW)) && fontSize > 4.5) {
            fontSize -= 0.5;
            ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
          }
          ctx.fillStyle = '#f1f5f9';
          if (line2) {
            ctx.fillText(line1, pos.x + pos.w / 2, pos.y + pos.h * 0.38);
            ctx.fillText(line2, pos.x + pos.w / 2, pos.y + pos.h * 0.58);
          } else {
            ctx.fillText(line1, pos.x + pos.w / 2, pos.y + pos.h * 0.48);
          }
          if (tile.price > 0) {
            ctx.fillStyle = '#22c55e';
            ctx.font = `bold ${Math.max(6, Math.min(pos.w * 0.24, 10))}px monospace`;
            ctx.fillText('$' + tile.price, pos.x + pos.w / 2, pos.y + pos.h - 5);
          }
        } else if (pos.side === 'top') {
          // Top row: tall tile
          if (tile.price > 0) {
            ctx.fillStyle = '#22c55e';
            ctx.font = `bold ${Math.max(6, Math.min(pos.w * 0.24, 10))}px monospace`;
            ctx.fillText('$' + tile.price, pos.x + pos.w / 2, pos.y + 12);
          }
          const words = cleanName.split(' ');
          let line1 = cleanName, line2 = '';
          if (words.length >= 2) { line1 = words[0]; line2 = words.slice(1).join(' '); }
          
          let fontSize = Math.max(6, Math.min(pos.w * 0.26, 11));
          ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
          while ((ctx.measureText(line1).width > maxTextW || (line2 && ctx.measureText(line2).width > maxTextW)) && fontSize > 4.5) {
            fontSize -= 0.5;
            ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
          }
          ctx.fillStyle = '#f1f5f9';
          if (line2) {
            ctx.fillText(line1, pos.x + pos.w / 2, pos.y + pos.h * 0.50);
            ctx.fillText(line2, pos.x + pos.w / 2, pos.y + pos.h * 0.70);
          } else {
            ctx.fillText(line1, pos.x + pos.w / 2, pos.y + pos.h * 0.60);
          }
        } else {
          // Left and Right columns: wide tile (cs x nw)
          let singleName = cleanName;
          let fontSize = Math.max(6, Math.min(pos.h * 0.38, 10));
          ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
          while (ctx.measureText(singleName).width > maxTextW - 4 && fontSize > 4.5) {
            fontSize -= 0.5;
            ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
          }
          ctx.fillStyle = '#f1f5f9';
          ctx.fillText(singleName, pos.x + pos.w / 2, pos.y + pos.h * 0.44);
          if (tile.price > 0) {
            ctx.fillStyle = '#22c55e';
            ctx.font = `bold ${Math.max(5.5, Math.min(pos.h * 0.32, 9.5))}px monospace`;
            ctx.fillText('$' + tile.price, pos.x + pos.w / 2, pos.y + pos.h * 0.86);
          }
        }
      } else {
        // Special Action Tiles
        let icon = '❓';
        let label = 'EVENT';
        if (tile.type === 'chance') { icon = '❓'; label = 'CHANCE'; }
        else if (tile.type === 'chest') { icon = '📦'; label = 'CHEST'; }
        else if (tile.type === 'tax') { icon = '💸'; label = 'TAX'; }
        else if (tile.type === 'station') { icon = '🚄'; label = 'METRO'; }
        else if (tile.type === 'utility') { icon = tile.index % 2 === 0 ? '⚡' : '🌐'; label = 'POWER'; }
        else if (tile.type === 'black_market') { icon = '🏴'; label = 'MARKET'; }
        
        ctx.font = `${Math.max(8, Math.min(pos.w, pos.h) * 0.35)}px serif`;
        ctx.fillText(icon, pos.x + pos.w / 2, pos.y + pos.h * 0.45);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = `bold ${Math.max(5.5, Math.min(pos.w, pos.h) * 0.18)}px 'Inter', sans-serif`;
        ctx.fillText(label, pos.x + pos.w / 2, pos.y + pos.h * 0.84);
      }
    });
  }
  
  function drawPlayers(gameState) {
    if(!gameState || !gameState.players) return;
    
    // Group players by position so they never overlap on the same tile
    const playersByPos = {};
    gameState.players.forEach(p => {
      if (p.isBankrupt) return;
      if (!playersByPos[p.position]) playersByPos[p.position] = [];
      playersByPos[p.position].push(p);
    });
    
    Object.entries(playersByPos).forEach(([posIndex, players]) => {
      const tilePos = getTilePosition(parseInt(posIndex, 10));
      const count = players.length;
      
      players.forEach((player, i) => {
        let px = tilePos.x + tilePos.w / 2;
        let py = tilePos.y + tilePos.h / 2;
        
        if (count > 1) {
          const offsetX = ((i % 2) - 0.5) * 14;
          const offsetY = (Math.floor(i / 2) - (count > 2 ? 0.5 : 0)) * 14;
          px += offsetX;
          py += offsetY;
        }
        
        // Token Outer Glow
        ctx.shadowColor = player.color || '#4f8cff';
        ctx.shadowBlur = 8;
        ctx.fillStyle = player.color || '#4f8cff';
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Token Inner Ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.stroke();
        
        // Character Icon
        let charIcon = '👤';
        if (typeof Skills !== 'undefined') {
          const charInfo = Skills.getCharacter(player.character);
          if (charInfo) charIcon = charInfo.icon;
        }
        ctx.font = '7px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(charIcon, px, py);
        ctx.textBaseline = 'alphabetic';
        
        // Player Short Name Tag
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px sans-serif';
        const tag = player.name ? player.name.substring(0, 4) : 'P';
        ctx.fillText(tag, px, py - 9);
      });
    });
  }
  
  function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  
  function getCamera() { return camera; }
  function setCamera(x, y, z) { camera.x = x; camera.y = y; if(z) camera.zoom = z; }
  
  return { 
    init, render, resize, getCamera, setCamera, getTilePosition, GROUP_COLORS 
  };
})();
