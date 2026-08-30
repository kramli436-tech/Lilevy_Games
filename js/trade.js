const Trade = (function() {
  'use strict';
  
  function proposeTrade(fromId, toId, offer, request, gameState) {
    if (!canTrade(gameState)) return null;
    if (!validateOffer(fromId, offer, gameState)) return null;
    
    const tradeObj = { fromId, toId, offer, request, status: 'pending' };
    gameState.activeTrade = tradeObj;
    
    if (typeof Events !== 'undefined') Events.emit('tradeProposed', tradeObj);
    return tradeObj;
  }
  
  function acceptTrade(gameState) {
    const trade = gameState.activeTrade;
    if (!trade) return false;
    
    const fromPlayer = gameState.players.find(p => p.id === trade.fromId);
    const toPlayer = gameState.players.find(p => p.id === trade.toId);
    
    fromPlayer.money -= trade.offer.money || 0;
    toPlayer.money += trade.offer.money || 0;
    
    toPlayer.money -= trade.request.money || 0;
    fromPlayer.money += trade.request.money || 0;
    
    if (trade.offer.properties) {
        trade.offer.properties.forEach(tIndex => {
            gameState.tiles[tIndex].owner = toPlayer.id;
        });
    }
    if (trade.request.properties) {
        trade.request.properties.forEach(tIndex => {
            gameState.tiles[tIndex].owner = fromPlayer.id;
        });
    }
    
    gameState.activeTrade = null;
    if (typeof Events !== 'undefined') Events.emit('tradeCompleted', trade);
    return true;
  }
  
  function rejectTrade(gameState) {
    gameState.activeTrade = null;
    if (typeof Events !== 'undefined') Events.emit('tradeRejected', {});
  }
  
  function counterOffer(newOffer, newRequest, gameState) {
    if (!gameState.activeTrade) return;
    const oldTrade = gameState.activeTrade;
    
    gameState.activeTrade = {
        fromId: oldTrade.toId,
        toId: oldTrade.fromId,
        offer: newOffer,
        request: newRequest,
        status: 'counter'
    };
    if (typeof Events !== 'undefined') Events.emit('tradeCountered', gameState.activeTrade);
  }
  
  function canTrade(gameState) {
    return !gameState.economy.currentEvent || gameState.economy.currentEvent !== 'pandemic';
  }
  
  function validateOffer(playerId, offer, gameState) {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return false;
    if ((offer.money || 0) > player.money) return false;
    if (offer.properties) {
        for (let tIndex of offer.properties) {
            if (gameState.tiles[tIndex].owner !== playerId) return false;
        }
    }
    return true;
  }
  
  function forceTrade(traderId, targetId, offer, request, gameState) {
    const trader = gameState.players.find(p => p.id === traderId);
    if (trader && trader.character === 'trader') {
        const tradeObj = proposeTrade(traderId, targetId, offer, request, gameState);
        if (tradeObj) {
            acceptTrade(gameState);
            return true;
        }
    }
    return false;
  }
  
  return { proposeTrade, acceptTrade, rejectTrade, counterOffer, canTrade, validateOffer, forceTrade };
})();
