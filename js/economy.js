const Economy = (function() {
  'use strict';
  
  const EVENTS = [
    { id:'bullMarket', weight:10, duration:3, modifiers:{rent:1.2,buildCost:1.3,tax:1}, apply(gs){}, remove(gs){} },
    { id:'crash', weight:8, duration:3, modifiers:{rent:0.6,buildCost:0.7,tax:1}, apply(gs){ 
        if (gs.stocks) {
            Object.values(gs.stocks).forEach(stock => stock.price = Math.max(10, Math.floor(stock.price * 0.6)));
        }
    }, remove(gs){} },
    { id:'inflation', weight:10, duration:4, modifiers:{rent:1.25,buildCost:1.25,tax:1.25}, apply(gs){}, remove(gs){} },
    { id:'constructionBoom', weight:10, duration:3, modifiers:{rent:1,buildCost:0.5,tax:1}, apply(gs){}, remove(gs){} },
    { id:'pandemic', weight:6, duration:3, modifiers:{rent:0.5,buildCost:1,tax:1}, apply(gs){}, remove(gs){} },
    { id:'techRevolution', weight:8, duration:3, modifiers:{rent:1,buildCost:1,tax:1}, apply(gs){}, remove(gs){} },
    { id:'bailout', weight:7, duration:1, modifiers:{rent:1,buildCost:1,tax:1}, apply(gs){ 
        let poorest = gs.players[0];
        gs.players.forEach(p => { if(p.money < poorest.money) poorest = p; });
        if(poorest) poorest.money += 500;
    }, remove(gs){} },
    { id:'fire', weight:5, duration:1, modifiers:{rent:1,buildCost:1,tax:1}, apply(gs){
        let builtTiles = gs.tiles.filter(t => t.owner && gs.players.find(p => p.id === t.owner)?.buildings?.[t.index]);
        if(builtTiles.length > 0) {
            const target = builtTiles[Math.floor(Math.random() * builtTiles.length)];
            const owner = gs.players.find(p => p.id === target.owner);
            if (owner && owner.buildings) {
                delete owner.buildings[target.index];
            }
            if(typeof Events !== 'undefined') Events.emit('buildingDestroyed', { tileIndex: target.index });
        }
    }, remove(gs){} },
    { id:'goldRush', weight:8, duration:3, modifiers:{rent:1,buildCost:1,tax:1}, apply(gs){ gs.settings.goBonus *= 2; }, remove(gs){ gs.settings.goBonus = Math.floor(gs.settings.goBonus / 2); } },
    { id:'disaster', weight:5, duration:1, modifiers:{rent:1,buildCost:1,tax:1}, apply(gs){
        gs.players.forEach(p => p.money = Math.max(0, p.money - 200));
    }, remove(gs){} },
    { id:'cyberWarfare', weight:7, duration:3, modifiers:{rent:0.85,buildCost:1,tax:1.2}, apply(gs){
        gs.players.forEach(p => p.money = Math.max(0, p.money - 150));
        if (gs.stocks) {
            Object.values(gs.stocks).forEach(stock => stock.price = Math.max(10, Math.floor(stock.price * 0.75)));
        }
    }, remove(gs){} },
    { id:'cryptoBoom', weight:8, duration:3, modifiers:{rent:1.3,buildCost:1,tax:1}, apply(gs){
        gs.players.forEach(p => p.money += 300);
        if (gs.stocks) {
            Object.values(gs.stocks).forEach(stock => stock.price = Math.floor(stock.price * 1.35));
        }
    }, remove(gs){} },
    { id:'taxHoliday', weight:8, duration:3, modifiers:{rent:1.1,buildCost:0.7,tax:0}, apply(gs){}, remove(gs){} },
    { id:'megaMerger', weight:7, duration:3, modifiers:{rent:1.25,buildCost:1,tax:1}, apply(gs){}, remove(gs){} },
    { id:'quantumGlitch', weight:6, duration:2, modifiers:{rent:1.15,buildCost:1,tax:1}, apply(gs){
        gs.players.forEach(p => { p.skillCooldown = 0; });
    }, remove(gs){} },
    { id:'hyperInflation', weight:6, duration:3, modifiers:{rent:1.4,buildCost:1.5,tax:1.3}, apply(gs){ gs.settings.goBonus += 400; }, remove(gs){ gs.settings.goBonus = Math.max(200, gs.settings.goBonus - 400); } },
  ];
  
  function init(gameState) {
    gameState.economy = {
        currentEvent: null,
        modifiers: { rent: 1, buildCost: 1, tax: 1 },
        turnsUntilNext: 5,
        duration: 0
    };
  }
  
  function triggerEvent(gameState) {
    if (gameState.economy.currentEvent) {
        const oldEv = EVENTS.find(e => e.id === gameState.economy.currentEvent);
        if (oldEv) oldEv.remove(gameState);
    }
    
    let totalWeight = EVENTS.reduce((sum, e) => sum + e.weight, 0);
    let rand = Math.random() * totalWeight;
    let selected = EVENTS[0];
    for (let ev of EVENTS) {
        if (rand < ev.weight) { selected = ev; break; }
        rand -= ev.weight;
    }
    
    gameState.economy.currentEvent = selected.id;
    gameState.economy.duration = selected.duration;
    gameState.economy.modifiers = { ...selected.modifiers };
    selected.apply(gameState);
    
    if (typeof Events !== 'undefined') Events.emit('economyEventTriggered', { eventId: selected.id });
  }
  
  function tickEvent(gameState) {
    if (gameState.economy.duration > 0) {
        gameState.economy.duration--;
        if (gameState.economy.duration === 0) {
            const oldEv = EVENTS.find(e => e.id === gameState.economy.currentEvent);
            if (oldEv) oldEv.remove(gameState);
            gameState.economy.currentEvent = null;
            gameState.economy.modifiers = { rent: 1, buildCost: 1, tax: 1 };
            if (typeof Events !== 'undefined') Events.emit('economyEventEnded', {});
        }
    } else {
        gameState.economy.turnsUntilNext--;
        if (gameState.economy.turnsUntilNext <= 0) {
            triggerEvent(gameState);
            gameState.economy.turnsUntilNext = 4 + Math.floor(Math.random() * 4); 
        }
    }
  }
  
  function getCurrentModifiers(gameState) { 
      return gameState.economy.modifiers; 
  }
  
  function getEventInfo(eventId) { 
      return EVENTS.find(e => e.id === eventId); 
  }
  
  return { init, triggerEvent, tickEvent, getCurrentModifiers, getEventInfo, EVENTS };
})();
