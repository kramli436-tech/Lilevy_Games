const AI = (function() {
  function takeTurn(player, gameState) {
    if(!player || player.isBankrupt) return;
    
    // 1. Handle jail
    if(player.jailTurns > 0) {
      if(player.money > 400) {
        Player.payMoney(player, 200);
        player.jailTurns = 0;
        if(typeof UI !== 'undefined') {
          UI.showToast(player.name + ' keluar dari penjara ($200)', 'info');
        }
      }
    }
    
    // 2. Animate dice and roll
    if(typeof Dice !== 'undefined') {
      Dice.animateRoll((result) => {
        Game.rollDice(player, result);
        if(typeof UI !== 'undefined') {
          UI.showToast(`🤖 ${player.name} [ ${result.dice1} + ${result.dice2} = ${result.total} ]`, 'info');
        }
        // 3. Wait for walking animation to finish before making decisions
        const moveTime = ((result.total || 6) * 160) + 600;
        setTimeout(() => makeDecisions(player, gameState), moveTime);
      });
    } else {
      const res = Game.rollDice(player);
      const moveTime = ((res ? res.total : 6) * 160) + 600;
      setTimeout(() => makeDecisions(player, gameState), moveTime);
    }
  }
  
  function makeDecisions(player, gameState) {
    if(!player || player.isBankrupt) return;
    
    // Buy property if beneficial
    const tile = gameState.tiles[player.position];
    if(tile && !tile.owner && (tile.type === 'property' || tile.type === 'station' || tile.type === 'utility') && shouldBuyProperty(player, tile, gameState)) {
      const bought = Game.buyProperty(player.id, tile.index);
      if(bought && typeof UI !== 'undefined') {
        const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
        const name = (lang === 'id' ? tile.name_id : tile.name_en) || tile.name_en;
        UI.showToast(`🤖 ${player.name} membeli ${name} ($${tile.price})!`, 'success');
      }
    }
    
    // Build if possible
    tryBuild(player, gameState);
    // Stock market
    tryStockActions(player, gameState);
    
    // End turn after natural thinking delay
    setTimeout(() => {
      Game.endTurn();
    }, 1000);
  }
  
  function shouldBuyProperty(player, tile, gameState) {
    // Strategy: Buy if we can afford it AND
    // - It completes a monopoly
    // - It's in a district we're building synergy in
    // - We have enough cash reserves (keep $300 minimum)
    if(player.money - tile.price < 300) return false;
    // Check if it helps monopoly
    if(tile.group) {
      const groupTiles = gameState.tiles.filter(t => t.group === tile.group);
      const owned = groupTiles.filter(t => t.owner === player.id).length;
      if(owned >= groupTiles.length - 1) return true; // completes monopoly!
    }
    // Check district synergy
    const districtProps = gameState.tiles.filter(t => t.district === tile.district && t.owner === player.id).length;
    if(districtProps >= 1) return true; // builds synergy
    // General: buy if affordable
    return player.money - tile.price >= 500;
  }
  
  function tryBuild(player, gameState) {
    if(typeof Property === 'undefined') return;
    // Build houses on monopolized groups (prioritize 3 houses = sweet spot)
    player.properties.forEach(ti => {
      const tile = gameState.tiles[ti];
      if(!tile || !Property.hasMonopoly(player.id, tile.group, gameState)) return;
      const building = player.buildings[ti];
      const currentLevel = building ? building.level : 0;
      if(currentLevel < 3) { // prioritize getting to 3 houses
        const result = Property.canBuild(player.id, ti, 'house', gameState);
        if(result && result.canBuild) {
          Property.build(player.id, ti, 'house', gameState);
        }
      }
    });
  }
  
  function tryTrade(player, gameState) {
    if(typeof Trade === 'undefined') return;
    gameState.tiles.forEach(tile => {
      if (tile.group && tile.owner && tile.owner !== player.id) {
        const groupTiles = gameState.tiles.filter(t => t.group === tile.group);
        const ownedByMe = groupTiles.filter(t => t.owner === player.id).length;
        if (ownedByMe === groupTiles.length - 1) {
          const owner = gameState.players.find(p => p.id === tile.owner);
          if (owner && player.money > tile.price * 1.5) {
            const tradeOffer = {
              from: player.id,
              to: owner.id,
              offerMoney: Math.floor(tile.price * 1.5),
              offerTiles: [],
              requestMoney: 0,
              requestTiles: [tile.index]
            };
            if(Trade.proposeTrade) {
               Trade.proposeTrade(tradeOffer, gameState);
            }
          }
        }
      }
    });
  }
  
  function tryStockActions(player, gameState) {
    if (typeof Stock === 'undefined') return;
    Object.keys(gameState.stocks).forEach(name => {
      const stock = gameState.stocks[name];
      const trend = Stock.getStockTrend(name, gameState);
      if(trend === 'up' && player.money > 500 && player.stocks[name] < 5) {
        Stock.buyStock(player.id, name, 1, gameState);
      } else if(trend === 'down' && player.stocks[name] > 0) {
        Stock.sellStock(player.id, name, player.stocks[name], gameState);
      }
    });
  }
  
  function tryUseSkill(player, gameState) {
    if(typeof Skills === 'undefined' || !Skills.canUseActive(player) || player.skillDisabledTurns > 0) return;
    if(Skills.useActive) {
      Skills.useActive(player, gameState);
    }
  }
  
  function tryUseCards(player, gameState) {
    if(player.cards.length === 0) return;
    const leader = [...gameState.players].filter(p=>!p.isBankrupt && p.id !== player.id).sort((a,b)=>b.netWorth-a.netWorth)[0];
    player.cards.forEach((card, i) => {
      if(card.type === 'attack' && leader) {
        card.execute(player, leader, gameState);
        player.cards.splice(i, 1);
      }
    });
  }
  
  function decideBid(player, tileIndex, currentBid, gameState) {
    const tile = gameState.tiles[tileIndex];
    let maxBid = tile.price * 0.8; // default: bid up to 80% of price
    if(tile.group) {
      const groupTiles = gameState.tiles.filter(t => t.group === tile.group);
      const owned = groupTiles.filter(t => t.owner === player.id).length;
      if(owned >= groupTiles.length - 1) maxBid = tile.price * 1.5;
    }
    if(currentBid < maxBid && player.money > currentBid * 1.1 + 300) {
      return Math.floor(currentBid * 1.1); // bid 10% more
    }
    return 0; // pass
  }
  
  function decideTradeResponse(player, trade, gameState) {
    let offerValue = trade.offerMoney || 0;
    let requestValue = trade.requestMoney || 0;
    (trade.offerTiles || []).forEach(ti => offerValue += gameState.tiles[ti].price * 1.2);
    (trade.requestTiles || []).forEach(ti => requestValue += gameState.tiles[ti].price * 1.5);
    return offerValue > requestValue;
  }
  
  return { takeTurn, makeDecisions, shouldBuyProperty, decideBid, decideTradeResponse };
})();
