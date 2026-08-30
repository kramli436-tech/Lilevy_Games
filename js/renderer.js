const Renderer = (function() {
  'use strict';

  let canvas = null, ctx = null;
  let width = 0, height = 0;
  let camera = { x: 0, y: 0, zoom: 1 };
  let isDragging = false, lastTouch = null;
  let boardSize = 0;
  let tileSize = 0;
  const BOARD_PADDING = 24;

  // Offscreen Pre-rendered Board Canvas Cache for 60fps Ultra-Sharp Performance
  let cacheCanvas = null;
  let cacheCtx = null;
  let isCacheDirty = true;
  let isPageVisible = true;

  // Quality Setting (defaults to 'high' for crystal clear sharp rendering)
  let quality = 'high';
  try {
    const savedQuality = localStorage.getItem('monopoly_quality');
    if (savedQuality && ['low', 'medium', 'high'].includes(savedQuality)) {
      quality = savedQuality;
    }
  } catch(e) {
    quality = 'high';
  }

  const GROUP_COLORS = {
    purple: '#c084fc',
    lightblue: '#38bdf8',
    pink: '#f472b6',
    orange: '#fb923c',
    red: '#f87171',
    yellow: '#facc15',
    green: '#4ade80',
    blue: '#60a5fa'
  };

  let isInitialized = false;
  function init(canvasEl) {
    if (!canvasEl) return;
    canvas = canvasEl;
    ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    
    // Create offscreen cache canvas
    if (!cacheCanvas) {
      cacheCanvas = document.createElement('canvas');
      cacheCtx = cacheCanvas.getContext('2d');
    }

    applyQualityClass();
    resize();

    if (!isInitialized) {
      isInitialized = true;
      setupTouchControls();
      window.addEventListener('resize', debounceResize);
      setupCacheInvalidationListeners();
      
      // Page Visibility Power Saver
      document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
        if (isPageVisible) render();
      });
    }
  }

  let resizeTimeout = null;
  function debounceResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
      render();
    }, 60);
  }

  function setupCacheInvalidationListeners() {
    if (typeof Events === 'undefined') return;
    const invalidate = () => { isCacheDirty = true; };
    Events.on('propertyBought', invalidate);
    Events.on('buildingAdded', invalidate);
    Events.on('propertyMortgaged', invalidate);
    Events.on('propertyUnmortgaged', invalidate);
    Events.on('tradeCompleted', invalidate);
    Events.on('jvAccepted', invalidate);
    Events.on('turnStart', invalidate);
    Events.on('economyEventTriggered', invalidate);
    Events.on('weatherChanged', invalidate);
    Events.on('diceRolled', invalidate);
  }

  function applyQualityClass() {
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove('quality-low', 'quality-medium', 'quality-high');
      document.body.classList.add('quality-' + quality);
    }
  }

  function setQuality(level) {
    if (!['low', 'medium', 'high'].includes(level)) return;
    quality = level;
    try { localStorage.setItem('monopoly_quality', level); } catch(e) {}
    applyQualityClass();
    isCacheDirty = true;
    resize();
    render();
    if (typeof UI !== 'undefined' && UI.showToast) {
      const qText = level === 'low' ? 'Low (Hemat Daya)' : level === 'medium' ? 'Medium (Seimbang)' : 'High (Ultra HD Jernih)';
      UI.showToast(`Kualitas Grafis: ${qText}`, 'info');
    }
  }

  function getQuality() {
    return quality;
  }

  function getRenderScale() {
    const rawDPR = window.devicePixelRatio || 1;
    // Guarantee razor-sharp crisp rendering by matching or exceeding device physical pixels
    if (quality === 'low') {
      return Math.max(1.5, Math.min(rawDPR, 2.0));
    } else if (quality === 'medium') {
      return Math.max(2.0, Math.min(rawDPR, 2.5));
    }
    return Math.max(2.0, Math.min(rawDPR, 3.0));
  }

  function resize() {
    if (!canvas) {
      canvas = document.getElementById('game-canvas');
      if (canvas) ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    }
    if (!canvas) return;

    const dpr = getRenderScale();
    width = window.innerWidth || document.documentElement.clientWidth || 360;
    height = window.innerHeight || document.documentElement.clientHeight || 640;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

    // Fit board comfortably in viewport between Top Bars and Floating Action Dock
    const hudEl = document.getElementById('hud-top');
    const toolsEl = document.getElementById('top-tools-bar');
    const actEl = document.getElementById('action-panel');

    const isMobile = width <= 480;
    const hudH = (hudEl && hudEl.offsetHeight > 0) ? hudEl.offsetHeight : 44;
    const toolsH = (toolsEl && toolsEl.offsetHeight > 0) ? toolsEl.offsetHeight : (isMobile ? 62 : 36);
    const actBottomOffset = isMobile ? 62 : 32;
    const actH = (actEl && actEl.offsetHeight > 0) ? (actEl.offsetHeight + actBottomOffset) : (48 + actBottomOffset);
    const topTotalH = hudH + toolsH;

    const availableH = Math.max(160, height - topTotalH - actH - 6);
    const availableW = Math.max(160, width - 6);
    boardSize = Math.max(180, Math.min(availableW, availableH, 760));
    tileSize = boardSize / 14;

    camera.x = Math.round((width - boardSize) / 2);
    camera.y = Math.round(topTotalH + (availableH - boardSize) / 2 + 2);
    camera.zoom = 1;
    isCacheDirty = true;
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
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if(!isDragging || !lastTouch || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastTouch.x;
      const dy = e.touches[0].clientY - lastTouch.y;
      camera.x += dx; 
      camera.y += dy;
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      render();
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => { 
      isDragging = false; 
      if(lastTouch && Math.hypot(lastTouch.x - startClick.x, lastTouch.y - startClick.y) < 10) {
        const worldX = (startClick.x - camera.x) / camera.zoom;
        const worldY = (startClick.y - camera.y) / camera.zoom;
        const tileIdx = getTileAtPoint(worldX, worldY);
        if(tileIdx !== null && typeof UI !== 'undefined') {
          UI.showPropertyModal(tileIdx);
        }
      }
    }, { passive: true });

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
    if (!isPageVisible) return;
    if (!canvas) {
      canvas = document.getElementById('game-canvas');
      if (canvas) ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    }
    if (!ctx || !canvas) return;
    if (!gameState) {
      if (typeof Game !== 'undefined') gameState = Game.getState();
    }
    if (!gameState) return;

    const dpr = getRenderScale();

    if (width <= 0 || height <= 0 || boardSize <= 0 || canvas.width !== Math.round(width * dpr)) {
      resize();
    }

    // 1. Reset transform matrix and clear physical canvas buffer
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0a0f18';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Set camera & HiDPI scale transform matrix
    const scale = dpr * (camera.zoom || 1);
    ctx.setTransform(scale, 0, 0, scale, camera.x * dpr, camera.y * dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 3. Pre-rendered Ultra-HD Offscreen Board Buffer
    if (!cacheCanvas) {
      cacheCanvas = document.createElement('canvas');
      cacheCtx = cacheCanvas.getContext('2d');
      isCacheDirty = true;
    }

    const cachePixelW = Math.round(boardSize * dpr);
    const cachePixelH = Math.round(boardSize * dpr);
    if (isCacheDirty || cacheCanvas.width !== cachePixelW || cacheCanvas.height !== cachePixelH) {
      cacheCanvas.width = cachePixelW;
      cacheCanvas.height = cachePixelH;
      
      // Scale offscreen context so all vector operations & fonts are razor sharp
      cacheCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cacheCtx.imageSmoothingEnabled = true;
      cacheCtx.imageSmoothingQuality = 'high';
      cacheCtx.clearRect(0, 0, boardSize, boardSize);

      drawBackgroundTo(cacheCtx);
      drawCenterBoardTo(cacheCtx, gameState);
      drawBoardTo(cacheCtx, gameState);
      isCacheDirty = false;
    }

    // Blit pre-cached board at exact 1:1 pixel mapping with zero scaling blur
    ctx.drawImage(cacheCanvas, 0, 0, cacheCanvas.width, cacheCanvas.height, 0, 0, boardSize, boardSize);

    // 4. Draw Dynamic Active Entities (Players & Weather Overlays)
    drawPlayers(gameState);

    if (quality !== 'low' && gameState && typeof Animations !== 'undefined' && Animations.renderWeather) {
      Animations.renderWeather(ctx, gameState.weather, boardSize);
    }

    // 5. Reset transform back to identity
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  function drawBackgroundTo(tCtx) {
    tCtx.fillStyle = '#0b111c';
    tCtx.fillRect(0, 0, boardSize, boardSize);

    // High-contrast subtle grid
    tCtx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    tCtx.lineWidth = 1;
    const step = 30;
    for (let i = 0; i <= boardSize; i += step) {
      tCtx.beginPath(); tCtx.moveTo(i, 0); tCtx.lineTo(i, boardSize); tCtx.stroke();
      tCtx.beginPath(); tCtx.moveTo(0, i); tCtx.lineTo(boardSize, i); tCtx.stroke();
    }
  }

  function getTilePosition(index) {
    const cs = tileSize * 1.5;
    const boardInner = boardSize - cs * 2;
    const nw = boardInner / 12;

    if (index === 0) return { x: boardSize - cs, y: boardSize - cs, w: cs, h: cs, side: 'corner', corner: 0 };
    if (index >= 1 && index <= 12) {
      const col = index;
      return { x: boardSize - cs - col * nw, y: boardSize - cs, w: nw, h: cs, side: 'bottom' };
    }
    if (index === 13) return { x: 0, y: boardSize - cs, w: cs, h: cs, side: 'corner', corner: 13 };
    if (index >= 14 && index <= 25) {
      const row = index - 13;
      return { x: 0, y: boardSize - cs - row * nw, w: cs, h: nw, side: 'left' };
    }
    if (index === 26) return { x: 0, y: 0, w: cs, h: cs, side: 'corner', corner: 26 };
    if (index >= 27 && index <= 38) {
      const col = index - 26;
      return { x: cs + (col - 1) * nw, y: 0, w: nw, h: cs, side: 'top' };
    }
    if (index === 39) return { x: boardSize - cs, y: 0, w: cs, h: cs, side: 'corner', corner: 39 };
    if (index >= 40 && index <= 51) {
      const row = index - 39;
      return { x: boardSize - cs, y: cs + (row - 1) * nw, w: cs, h: nw, side: 'right' };
    }
    return { x: 0, y: 0, w: tileSize, h: tileSize, side: 'bottom' };
  }

  function drawCenterBoardTo(tCtx, gameState) {
    const cs = tileSize * 1.5;
    const cx = cs;
    const cy = cs;
    const cw = boardSize - cs * 2;
    const ch = boardSize - cs * 2;

    // High-contrast center stage card
    tCtx.fillStyle = 'rgba(11, 18, 30, 0.98)';
    roundRect(tCtx, cx + 4, cy + 4, cw - 8, ch - 8, 10);
    tCtx.fill();
    tCtx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    tCtx.lineWidth = 1.5;
    tCtx.stroke();

    const centerX = boardSize / 2;
    const centerY = boardSize / 2;

    const titleSize = Math.max(15, Math.min(cw * 0.115, 30));
    tCtx.fillStyle = '#00f0ff';
    tCtx.font = `900 ${titleSize}px 'Inter', -apple-system, sans-serif`;
    tCtx.textAlign = 'center';
    tCtx.fillText('MONOPOLY', centerX, centerY - ch * 0.26);

    const subSize = Math.max(8, Math.min(cw * 0.045, 12));
    tCtx.fillStyle = '#94a3b8';
    tCtx.font = `700 ${subSize}px 'Inter', -apple-system, sans-serif`;
    tCtx.fillText('LILEVY GAMES', centerX, centerY - ch * 0.17);

    if (gameState) {
      const currP = gameState.players ? gameState.players[gameState.currentPlayerIndex] : null;
      if (currP) {
        const turnSize = Math.max(10, Math.min(cw * 0.058, 15));
        tCtx.fillStyle = currP.color || '#38bdf8';
        tCtx.font = `800 ${turnSize}px 'Inter', -apple-system, sans-serif`;
        const pName = currP.isAI ? `🤖 ${currP.name}` : `👤 ${currP.name}`;
        tCtx.fillText(pName + ' Turn', centerX, centerY - ch * 0.05);
      }

      let wIcon = '☀️';
      let wName = 'Sunny';
      if (typeof Weather !== 'undefined' && Weather.getWeatherInfo) {
        const wi = Weather.getWeatherInfo(gameState.weather.current);
        if (wi) { wIcon = wi.icon; wName = wi.id || wi.name || 'Sunny'; }
      }

      const pillW = Math.min(220, cw * 0.88);
      const pillH = Math.max(24, ch * 0.11);
      const pillY = centerY + ch * 0.06;

      tCtx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      roundRect(tCtx, centerX - pillW / 2, pillY, pillW, pillH, 8);
      tCtx.fill();
      tCtx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      tCtx.lineWidth = 1.2;
      tCtx.stroke();

      const econName = (gameState.economy && gameState.economy.currentEvent) ? (gameState.economy.eventName || gameState.economy.currentEvent) : 'Normal';
      let statusStr = `${wIcon} ${wName.toUpperCase()} | 📊 ${econName}`;

      let badgeFont = Math.max(8, Math.min(cw * 0.045, 12));
      tCtx.font = `700 ${badgeFont}px 'Inter', -apple-system, sans-serif`;
      while (tCtx.measureText(statusStr).width > pillW - 12 && badgeFont > 6) {
        badgeFont -= 0.5;
        tCtx.font = `700 ${badgeFont}px 'Inter', -apple-system, sans-serif`;
      }

      tCtx.fillStyle = '#f8fafc';
      tCtx.fillText(statusStr, centerX, pillY + pillH * 0.66);

      if (typeof Dice !== 'undefined') {
        const lastRoll = Dice.getLastRoll();
        if (lastRoll && lastRoll.values) {
          const diceFont = Math.max(10, Math.min(cw * 0.06, 16));
          tCtx.fillStyle = '#4ade80';
          tCtx.font = `900 ${diceFont}px monospace`;
          tCtx.fillText(`🎲 [ ${lastRoll.values[0]} ] [ ${lastRoll.values[1]} ] = ${lastRoll.total}`, centerX, centerY + ch * 0.32);
        }
      }
    }
  }

  function drawBoardTo(tCtx, gameState) {
    if(!gameState || !gameState.tiles) return;

    gameState.tiles.forEach((tile, i) => {
      const pos = getTilePosition(i);
      const isCorner = [0, 13, 26, 39].includes(i);
      const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
      const name = (lang === 'id' ? tile.name_id : tile.name_en) || tile.name_en || '';

      // High-Contrast Solid Deep-Tone Background
      tCtx.fillStyle = isCorner ? '#162338' : '#0f172a';
      roundRect(tCtx, pos.x, pos.y, pos.w, pos.h, 4);
      tCtx.fill();

      // Sharp Tile Border
      tCtx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
      tCtx.lineWidth = 1;
      tCtx.stroke();

      // Vibrant District Color Stripe (5px)
      if(tile.group && GROUP_COLORS[tile.group]) {
        tCtx.fillStyle = GROUP_COLORS[tile.group];
        const stripeSize = 5;
        if(pos.side === 'bottom') {
          tCtx.fillRect(pos.x, pos.y, pos.w, stripeSize);
        } else if(pos.side === 'left') {
          tCtx.fillRect(pos.x + pos.w - stripeSize, pos.y, stripeSize, pos.h);
        } else if(pos.side === 'top') {
          tCtx.fillRect(pos.x, pos.y + pos.h - stripeSize, pos.w, stripeSize);
        } else if(pos.side === 'right') {
          tCtx.fillRect(pos.x, pos.y, stripeSize, pos.h);
        }
      }

      // Owner Badge / Building Indicator
      if(tile.owner && gameState.players) {
        const owner = gameState.players.find(p => p.id === tile.owner);
        if(owner) {
          tCtx.fillStyle = owner.color || '#38bdf8';
          tCtx.beginPath();
          tCtx.arc(pos.x + pos.w - 6, pos.y + 6, 4, 0, Math.PI * 2);
          tCtx.fill();
          tCtx.strokeStyle = '#ffffff';
          tCtx.lineWidth = 1;
          tCtx.stroke();

          if(owner.buildings && owner.buildings[i] && typeof Property !== 'undefined') {
            const b = owner.buildings[i];
            const bDef = Property.BUILDING_PATHS ? Property.BUILDING_PATHS[b.type] : null;
            const bIcon = bDef ? bDef.icon : '🏠';
            tCtx.font = '11px serif';
            tCtx.textAlign = 'center';
            tCtx.textBaseline = 'middle';
            tCtx.fillText(bIcon, pos.x + 8, pos.y + 11);
            tCtx.textBaseline = 'alphabetic';
          }
        }
      }

      // Corner Tiles Rendering (GO, JAIL, PARK, ARREST)
      if (isCorner) {
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';

        let icon = '🚀', title = 'GO', sub = '+$300', color = '#4ade80';
        if (i === 0) {
          icon = '🚀'; title = (lang === 'id' ? 'MULAI' : 'GO'); sub = '+$300'; color = '#4ade80';
        } else if (i === 13) {
          icon = '🔒'; title = (lang === 'id' ? 'PENJARA' : 'JAIL'); sub = (lang === 'id' ? 'Kunjungan' : 'Visiting'); color = '#fbbf24';
        } else if (i === 26) {
          icon = '🅿️'; title = (lang === 'id' ? 'PARKIR' : 'PARK'); sub = (lang === 'id' ? 'Bebas' : 'Free Rest'); color = '#38bdf8';
        } else if (i === 39) {
          icon = '👮'; title = (lang === 'id' ? 'POLISI' : 'ARREST'); sub = (lang === 'id' ? 'Masuk Sel' : 'To Jail'); color = '#f87171';
        }

        const iconSize = Math.max(10, Math.min(pos.w, pos.h) * 0.28);
        tCtx.font = `${iconSize}px serif`;
        tCtx.fillText(icon, pos.x + pos.w / 2, pos.y + pos.h * 0.30);

        const titleSize = Math.max(7.5, Math.min(pos.w, pos.h) * 0.17);
        tCtx.fillStyle = color;
        tCtx.font = `900 ${titleSize}px 'Inter', -apple-system, sans-serif`;
        tCtx.fillText(title, pos.x + pos.w / 2, pos.y + pos.h * 0.58);

        const subSize = Math.max(6, Math.min(pos.w, pos.h) * 0.13);
        tCtx.fillStyle = '#cbd5e1';
        tCtx.font = `700 ${subSize}px 'Inter', -apple-system, sans-serif`;
        tCtx.fillText(sub, pos.x + pos.w / 2, pos.y + pos.h * 0.82);

        tCtx.textBaseline = 'alphabetic';
        return;
      }

      // Property & Special Tiles Text Rendering
      if (tile.type === 'property') {
        const cleanName = name.replace(/^(Jalan |Jl\. |Street |St\. )/i, '').trim();

        if (pos.side === 'bottom') {
          // Bottom row (Stripe at top, Price at bottom)
          const textMaxW = pos.w - 4;
          const textMaxH = pos.h - 22;
          const textCenterY = pos.y + 6 + textMaxH / 2;
          drawFittedTileName(tCtx, cleanName, pos.x + pos.w / 2, textCenterY, textMaxW, textMaxH);

          if (tile.price > 0) {
            tCtx.fillStyle = '#4ade80';
            tCtx.font = `900 ${Math.max(6.5, Math.min(pos.w * 0.26, 11))}px monospace`;
            tCtx.textAlign = 'center';
            tCtx.fillText('$' + tile.price, pos.x + pos.w / 2, pos.y + pos.h - 4);
          }
        } else if (pos.side === 'top') {
          // Top row (Price at top, Stripe at bottom)
          if (tile.price > 0) {
            tCtx.fillStyle = '#4ade80';
            tCtx.font = `900 ${Math.max(6.5, Math.min(pos.w * 0.26, 11))}px monospace`;
            tCtx.textAlign = 'center';
            tCtx.fillText('$' + tile.price, pos.x + pos.w / 2, pos.y + 11);
          }

          const textMaxW = pos.w - 4;
          const textMaxH = pos.h - 22;
          const textCenterY = pos.y + 13 + textMaxH / 2;
          drawFittedTileName(tCtx, cleanName, pos.x + pos.w / 2, textCenterY, textMaxW, textMaxH);
        } else if (pos.side === 'left') {
          // Left column (Stripe at right)
          const textMaxW = pos.w - 9;
          const textMaxH = pos.h * 0.60;
          const textCenterY = pos.y + pos.h * 0.36;
          drawFittedTileName(tCtx, cleanName, pos.x + 2 + textMaxW / 2, textCenterY, textMaxW, textMaxH);

          if (tile.price > 0) {
            tCtx.fillStyle = '#4ade80';
            tCtx.font = `900 ${Math.max(6.5, Math.min(pos.h * 0.32, 10.5))}px monospace`;
            tCtx.textAlign = 'center';
            tCtx.fillText('$' + tile.price, pos.x + 2 + textMaxW / 2, pos.y + pos.h - 3.5);
          }
        } else if (pos.side === 'right') {
          // Right column (Stripe at left)
          const textMaxW = pos.w - 9;
          const textMaxH = pos.h * 0.60;
          const textCenterY = pos.y + pos.h * 0.36;
          drawFittedTileName(tCtx, cleanName, pos.x + 6 + textMaxW / 2, textCenterY, textMaxW, textMaxH);

          if (tile.price > 0) {
            tCtx.fillStyle = '#4ade80';
            tCtx.font = `900 ${Math.max(6.5, Math.min(pos.h * 0.32, 10.5))}px monospace`;
            tCtx.textAlign = 'center';
            tCtx.fillText('$' + tile.price, pos.x + 6 + textMaxW / 2, pos.y + pos.h - 3.5);
          }
        }
      } else {
        // Special Action Tiles (Chance, Chest, Tax, Metro, Utility, Black Market)
        let icon = '❓';
        let label = 'EVENT';
        let subText = '';

        if (tile.type === 'chance') { 
          icon = '❓'; label = 'CHANCE'; 
        } else if (tile.type === 'chest') { 
          icon = '📦'; label = 'CHEST'; 
        } else if (tile.type === 'tax') { 
          icon = '💸'; label = (lang === 'id' ? 'PAJAK' : 'TAX'); subText = tile.price ? ('$' + tile.price) : '10%'; 
        } else if (tile.type === 'station') { 
          icon = '🚄'; label = 'METRO'; subText = '$200'; 
        } else if (tile.type === 'utility') { 
          icon = (tile.index % 2 === 0) ? '⚡' : '🌐'; label = 'POWER'; subText = '$150'; 
        } else if (tile.type === 'black_market') { 
          icon = '🏴'; label = 'MARKET'; 
        }

        if (pos.side === 'bottom' || pos.side === 'top') {
          // Vertical layout for top/bottom
          const iconSize = Math.max(9, Math.min(pos.w, pos.h) * 0.34);
          tCtx.font = `${iconSize}px serif`;
          tCtx.textAlign = 'center';
          tCtx.textBaseline = 'middle';
          tCtx.fillText(icon, pos.x + pos.w / 2, pos.y + pos.h * 0.38);

          tCtx.fillStyle = '#94a3b8';
          tCtx.font = `800 ${Math.max(5.5, Math.min(pos.w, pos.h) * 0.18)}px 'Inter', sans-serif`;
          tCtx.fillText(label, pos.x + pos.w / 2, pos.y + pos.h * 0.68);

          if (subText) {
            tCtx.fillStyle = '#4ade80';
            tCtx.font = `900 ${Math.max(5.5, Math.min(pos.w, pos.h) * 0.16)}px monospace`;
            tCtx.fillText(subText, pos.x + pos.w / 2, pos.y + pos.h * 0.88);
          }
          tCtx.textBaseline = 'alphabetic';
        } else {
          // Horizontal side-by-side layout for Left and Right columns (No more clipping!)
          tCtx.textBaseline = 'middle';
          const isLeft = pos.side === 'left';
          const iconCenterX = isLeft ? (pos.x + 3 + (pos.w - 8) * 0.28) : (pos.x + 6 + (pos.w - 8) * 0.74);
          const textCenterX = isLeft ? (pos.x + 3 + (pos.w - 8) * 0.72) : (pos.x + 6 + (pos.w - 8) * 0.34);

          const iconSize = Math.max(9, Math.min(pos.w, pos.h) * 0.40);
          tCtx.font = `${iconSize}px serif`;
          tCtx.textAlign = 'center';
          tCtx.fillText(icon, iconCenterX, pos.y + pos.h / 2);

          tCtx.fillStyle = '#94a3b8';
          tCtx.font = `800 ${Math.max(5.5, Math.min(pos.w, pos.h) * 0.22)}px 'Inter', sans-serif`;
          tCtx.fillText(label, textCenterX, subText ? (pos.y + pos.h * 0.36) : (pos.y + pos.h / 2));

          if (subText) {
            tCtx.fillStyle = '#4ade80';
            tCtx.font = `900 ${Math.max(5.5, Math.min(pos.w, pos.h) * 0.20)}px monospace`;
            tCtx.fillText(subText, textCenterX, pos.y + pos.h * 0.72);
          }
          tCtx.textBaseline = 'alphabetic';
        }
      }
    });
  }

  function drawFittedTileName(tCtx, text, centerX, centerY, maxW, maxH) {
    if (!text) return;
    const words = text.trim().split(/\s+/);

    // Prepare optimal line break candidates
    let lines = [];
    if (words.length === 1) {
      lines = [words[0]];
    } else if (words.length === 2) {
      lines = [words[0], words[1]];
    } else if (words.length === 3) {
      lines = [words[0], words[1] + ' ' + words[2]];
    } else {
      const mid = Math.ceil(words.length / 2);
      lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
    }

    // Dynamic auto-scaling font size with safety margins
    let fontSize = Math.max(6, Math.min(maxW * 0.34, maxH * 0.44, 11));
    let fits = false;

    while (!fits && fontSize >= 4.5) {
      tCtx.font = `700 ${fontSize}px 'Inter', -apple-system, sans-serif`;
      let allLinesFit = true;
      for (let l of lines) {
        if (tCtx.measureText(l).width > maxW) {
          allLinesFit = false;
          break;
        }
      }
      const totalH = lines.length * (fontSize * 1.15);
      if (allLinesFit && totalH <= maxH) {
        fits = true;
      } else {
        fontSize -= 0.4;
      }
    }

    tCtx.fillStyle = '#ffffff';
    tCtx.font = `700 ${fontSize}px 'Inter', -apple-system, sans-serif`;
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';

    const lineHeight = fontSize * 1.15;
    const startY = centerY - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, idx) => {
      tCtx.fillText(line, centerX, startY + idx * lineHeight);
    });

    tCtx.textBaseline = 'alphabetic';
  }

  function drawPlayers(gameState) {
    if(!gameState || !gameState.players) return;

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

        ctx.fillStyle = player.color || '#38bdf8';
        ctx.beginPath();
        ctx.arc(px, py, 7.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(px, py, 7.5, 0, Math.PI * 2);
        ctx.stroke();

        let charIcon = '👤';
        if (typeof Skills !== 'undefined') {
          const charInfo = Skills.getCharacter(player.character);
          if (charInfo) charIcon = charInfo.icon;
        }
        ctx.font = '8px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(charIcon, px, py);
        ctx.textBaseline = 'alphabetic';

        ctx.fillStyle = '#ffffff';
        ctx.font = `800 8px 'Inter', sans-serif`;
        const tag = player.name ? player.name.substring(0, 4) : 'P';
        ctx.fillText(tag, px, py - 9.5);
      });
    });
  }

  function roundRect(tCtx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    tCtx.beginPath();
    tCtx.moveTo(x + r, y);
    tCtx.lineTo(x + w - r, y); tCtx.quadraticCurveTo(x + w, y, x + w, y + r);
    tCtx.lineTo(x + w, y + h - r); tCtx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    tCtx.lineTo(x + r, y + h); tCtx.quadraticCurveTo(x, y + h, x, y + h - r);
    tCtx.lineTo(x, y + r); tCtx.quadraticCurveTo(x, y, x + r, y);
    tCtx.closePath();
  }

  function getCamera() { return camera; }
  function setCamera(x, y, z) { camera.x = x; camera.y = y; if(z) camera.zoom = z; }
  function invalidateBoardCache() { isCacheDirty = true; }

  return { 
    init, render, resize, getCamera, setCamera, getTilePosition, GROUP_COLORS, setQuality, getQuality, invalidateBoardCache 
  };
})();
