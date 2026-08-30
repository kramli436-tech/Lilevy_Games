const Stock = (function() {
  'use strict';
  
  const STOCKS = {
    NeonCorp: { name:'NeonCorp', icon:'💜', basePrice:100, volatility:0.15 },
    CyberTech: { name:'CyberTech', icon:'💙', basePrice:80, volatility:0.2 },
    DataFlow: { name:'DataFlow', icon:'💚', basePrice:120, volatility:0.1 },
    QuantumAI: { name:'QuantumAI', icon:'💛', basePrice:60, volatility:0.25 },
  };
  
  function init(gameState) {
    gameState.stocks = {};
    for (let key in STOCKS) {
        gameState.stocks[key] = {
            price: STOCKS[key].basePrice,
            history: [STOCKS[key].basePrice]
        };
    }
  }
  
  function tickPrices(gameState) {
    for (let key in STOCKS) {
        let stock = gameState.stocks[key];
        let def = STOCKS[key];
        
        let drift = (Math.random() - 0.5) * 2 * def.volatility * stock.price;
        stock.price = Math.max(10, Math.floor(stock.price + drift));
        
        stock.history.push(stock.price);
        if(stock.history.length > 20) stock.history.shift();
    }
    if (typeof Events !== 'undefined') Events.emit('stocksUpdated', gameState.stocks);
  }
  
  function buyStock(playerId, stockName, quantity, gameState) {
    const owner = gameState.players.find(p => p.id === playerId);
    if (!owner) return { success: false, cost: 0, reason: 'Player not found' };
    
    const stock = gameState.stocks[stockName];
    if (!stock) return { success: false, cost: 0, reason: 'Stock not found' };
    
    const cost = stock.price * quantity;
    if (owner.money < cost) return { success: false, cost, reason: 'Insufficient funds' };
    
    owner.money -= cost;
    owner.stocks[stockName] = (owner.stocks[stockName] || 0) + quantity;
    if (typeof Events !== 'undefined') Events.emit('stockBought', { playerId, stockName, quantity, cost });
    return { success: true, cost };
  }
  
  function sellStock(playerId, stockName, quantity, gameState) {
    const owner = gameState.players.find(p => p.id === playerId);
    if (!owner) return { success: false, proceeds: 0, reason: 'Player not found' };
    
    if ((owner.stocks[stockName] || 0) < quantity) {
        return { success: false, proceeds: 0, reason: 'Insufficient shares' };
    }
    
    const stock = gameState.stocks[stockName];
    const proceeds = stock.price * quantity;
    
    owner.stocks[stockName] -= quantity;
    owner.money += proceeds;
    if (typeof Events !== 'undefined') Events.emit('stockSold', { playerId, stockName, quantity, proceeds });
    return { success: true, proceeds };
  }
  
  function getPortfolioValue(playerId, gameState) {
    const owner = gameState.players.find(p => p.id === playerId);
    if (!owner) return 0;
    let val = 0;
    for (let key in owner.stocks) {
        if (gameState.stocks[key]) {
            val += owner.stocks[key] * gameState.stocks[key].price;
        }
    }
    return val;
  }
  
  function payDividends(gameState) {
    gameState.players.forEach(p => {
        let div = 0;
        for (let key in p.stocks) {
            let shares = p.stocks[key];
            if (shares > 0 && gameState.stocks[key].price > STOCKS[key].basePrice) {
                div += Math.floor(shares * gameState.stocks[key].price * 0.05); 
            }
        }
        if (div > 0) {
            p.money += div;
            if (typeof Events !== 'undefined') Events.emit('dividendPaid', { playerId: p.id, amount: div });
        }
    });
  }
  
  function applyEconomyEffect(eventId, gameState) {
      if(eventId === 'crash') {
          for(let key in gameState.stocks) gameState.stocks[key].price = Math.max(10, Math.floor(gameState.stocks[key].price * 0.6));
      } else if (eventId === 'bullMarket') {
          for(let key in gameState.stocks) gameState.stocks[key].price = Math.floor(gameState.stocks[key].price * 1.3);
      }
  }
  
  function getStockTrend(stockName, gameState) {
      const history = gameState.stocks[stockName].history;
      if (history.length < 3) return 'stable';
      const last = history[history.length - 1];
      const prev = history[history.length - 3];
      if (last > prev * 1.05) return 'up';
      if (last < prev * 0.95) return 'down';
      return 'stable';
  }
  
  return { init, tickPrices, buyStock, sellStock, getPortfolioValue, payDividends, applyEconomyEffect, getStockTrend, STOCKS };
})();
