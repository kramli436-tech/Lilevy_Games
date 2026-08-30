const Game = (function() {
  let state = null;
  
  function createState() {
    return {
      roomCode: '', phase: 'MENU', currentPlayerIndex: 0,
      turnPhase: 'ROLL', turnNumber: 0, roundNumber: 0, language: 'id',
      players: [], tiles: (typeof Board !== 'undefined') ? JSON.parse(JSON.stringify(Board.TILES)) : [],
      economy: { currentEvent:null, eventName:'', modifiers:{rent:1,buildCost:1,tax:1}, turnsUntilNext:5, duration:0 },
      weather: { current:'sunny', districts:[], turnsLeft:4 },
      stocks: { NeonCorp:{price:100,history:[100]}, CyberTech:{price:80,history:[80]}, DataFlow:{price:120,history:[120]}, QuantumAI:{price:60,history:[60]} },
      auction: null, activeTrade: null, auctionPool: [],
      settings: { startMoney:2000, goBonus:300, maxRounds:0, maxLoans:3, maxCards:3, maxJV:3 }
    };
  }
  
  function initGame(players) {
    state = createState();
    state.players = players || [];
    state.phase = 'PLAYING';
    // Assign secret objectives to each player
    if (typeof Cards !== 'undefined' && Cards.getSecretObjectives) {
      state.players.forEach(p => { p.secretObjectives = Cards.getSecretObjectives(2); });
    }
    // Initialize modules
    if (typeof District !== 'undefined') District.init(state);
    if (typeof Stock !== 'undefined') Stock.init(state);
    Events.emit('gameStarted', state);
    startTurn();
  }
  
  function startTurn() {
    if(!state || !state.players || state.players.length === 0) return;
    const player = getCurrentPlayer();
    if(!player) return;
    if(player.isBankrupt) { nextPlayer(); return; }
    
    state.turnPhase = 'ROLL';
    // Tick effects
    if(typeof Player !== 'undefined' && Player.tickEffects) Player.tickEffects(player);
    if(typeof Skills !== 'undefined' && Skills.reduceCooldowns) Skills.reduceCooldowns(player);
    if(typeof Loan !== 'undefined' && Loan.tickLoans) Loan.tickLoans(player.id, state);
    
    // Collect mall passive income
    let passiveIncome = 0;
    if(typeof Property !== 'undefined' && Property.getPassiveIncome) {
      passiveIncome = Property.getPassiveIncome(player.id, state);
    }
    if(passiveIncome > 0 && typeof Player !== 'undefined') Player.receiveMoney(player, passiveIncome);
    
    // Weather extra cost
    let weatherCost = 0;
    if (typeof Weather !== 'undefined' && Weather.getExtraCost) weatherCost = Weather.getExtraCost(state);
    if(weatherCost > 0 && typeof Player !== 'undefined') Player.payMoney(player, weatherCost);
    
    // Check economy event trigger
    state.economy.turnsUntilNext--;
    if(state.economy.turnsUntilNext <= 0) { 
      if(typeof Economy !== 'undefined' && Economy.triggerEvent) Economy.triggerEvent(state); 
      state.economy.turnsUntilNext = 5; 
    }
    
    // Check weather change
    state.weather.turnsLeft--;
    if(state.weather.turnsLeft <= 0) { 
      if(typeof Weather !== 'undefined' && Weather.changeWeather) Weather.changeWeather(state); 
    }
    
    // Stock price tick
    if(typeof Stock !== 'undefined' && Stock.tickPrices) Stock.tickPrices(state);
    // Dividends every 10 turns
    if(state.turnNumber % 10 === 0 && state.turnNumber > 0 && typeof Stock !== 'undefined' && Stock.payDividends) {
      Stock.payDividends(state);
    }
    
    // Check secret objectives
    if(typeof Cards !== 'undefined' && Cards.checkObjectives) Cards.checkObjectives(player, state);
    
    // Update net worth
    if(typeof Player !== 'undefined' && Player.calculateNetWorth) {
      state.players.forEach(p => Player.calculateNetWorth(p, state));
    }
    
    state.turnNumber++;
    const aliveCount = state.players.filter(p => !p.isBankrupt).length;
    if(state.turnNumber % Math.max(1, aliveCount) === 0) state.roundNumber++;
    
    Events.emit('turnStart', { playerIndex: state.currentPlayerIndex, player });
    Events.emit('stateUpdated', state);
    
    if(player.isAI && typeof AI !== 'undefined') { 
      setTimeout(() => AI.takeTurn(player, state), 800); 
    }
  }
  
  function rollDice(player, givenResult) {
    if(!player || state.turnPhase !== 'ROLL') return null;
    
    let result = givenResult;
    if(!result) {
      if (typeof Dice !== 'undefined') {
        const last = Dice.getLastRoll();
        if(last && !last.used) {
          result = last;
          last.used = true;
        } else {
          result = Dice.roll();
        }
      } else {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        result = { dice1: d1, dice2: d2, total: d1 + d2, isDouble: d1 === d2 };
      }
    }
    
    if(player.jailTurns > 0) {
      if(result.isDouble) {
        player.jailTurns = 0;
        state.turnPhase = 'MOVING';
        executeMove(player, result);
      } else {
        player.jailTurns--;
        if(player.jailTurns <= 0) { player.jailTurns = 0; }
        state.turnPhase = 'ACTION';
      }
      Events.emit('diceRolled', { player, result, inJail: true });
      Events.emit('stateUpdated', state);
      return result;
    }
    
    // Apply weather movement modifier (blizzard)
    let totalMove = result.total;
    if (typeof Weather !== 'undefined' && Weather.getMovementModifier) {
      totalMove += Weather.getMovementModifier(state);
    }
    if(totalMove < 1) totalMove = 1;
    
    // Double tracking
    if(result.isDouble) {
      player.doublesCount = (player.doublesCount || 0) + 1;
      if(player.doublesCount >= 3) {
        if(typeof Player !== 'undefined') Player.goToJail(player);
        player.doublesCount = 0;
        state.turnPhase = 'ACTION';
        Events.emit('diceRolled', { player, result, jailed: true });
        Events.emit('stateUpdated', state);
        if(typeof Network !== 'undefined') Network.broadcastState(state);
        return result;
      }
    } else {
      player.doublesCount = 0;
    }
    
    state.turnPhase = 'MOVING';
    Events.emit('diceRolled', { player, result });
    executeMove(player, { ...result, total: totalMove });
    return result;
  }
  
  function executeMove(player, diceResult) {
    if(!player || !state) return;
    const totalSteps = (diceResult && diceResult.total) ? Math.max(1, diceResult.total) : 1;
    const direction = (player.reverseTurns && player.reverseTurns > 0) ? -1 : 1;
    let stepCount = 0;
    
    state.turnPhase = 'MOVING';
    Events.emit('stateUpdated', state);
    if(typeof UI !== 'undefined' && UI.updateActionButtons) UI.updateActionButtons(state);
    
    const stepInterval = setInterval(() => {
      try {
        if(!state || !player) {
          clearInterval(stepInterval);
          return;
        }
        stepCount++;
        const oldPos = player.position || 0;
        player.position = (player.position + direction + 52) % 52;
        
        // Check GO bonus
        if ((direction > 0 && player.position === 0) || (direction < 0 && oldPos === 0)) {
          let goBonus = (state.settings && state.settings.goBonus) ? state.settings.goBonus : 300;
          if (state.economy && state.economy.currentEvent === 'goldRush') goBonus *= 2;
          if (typeof Player !== 'undefined' && Player.receiveMoney) {
            Player.receiveMoney(player, goBonus);
          } else {
            player.money = (player.money || 0) + goBonus;
          }
          if (typeof UI !== 'undefined' && UI.showToast) {
            const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
            const passMsg = lang === 'id' ? ('melewati MULAI (+ $' + goBonus + ')') : ('passed GO (+ $' + goBonus + ')');
            UI.showToast('🚀 ' + player.name + ' ' + passMsg, 'success');
          }
        }
        
        // Play audio if available
        if (typeof GameAudio !== 'undefined' && GameAudio.play) {
          try { GameAudio.play('move'); } catch(e) {}
        }
        
        // Render each hop step
        Events.emit('playerMoved', { player, from: oldPos, to: player.position, step: stepCount, totalSteps: totalSteps });
        if (typeof Renderer !== 'undefined' && Renderer.render) Renderer.render(state);
        if (typeof UI !== 'undefined' && UI.updateHUD) UI.updateHUD(state);
        
        if (stepCount >= totalSteps) {
          clearInterval(stepInterval);
          state.turnPhase = 'LAND';
          
          setTimeout(() => {
            try {
              handleLanding(player, diceResult);
            } catch(landErr) {
              console.error('Error in handleLanding:', landErr);
            } finally {
              state.turnPhase = 'ACTION';
              Events.emit('stateUpdated', state);
              if (typeof Network !== 'undefined' && Network.broadcastState) Network.broadcastState(state);
              if (typeof Renderer !== 'undefined' && Renderer.render) Renderer.render(state);
              if (typeof UI !== 'undefined') {
                if(UI.updateHUD) UI.updateHUD(state);
                if(UI.updateActionButtons) UI.updateActionButtons(state);
              }
            }
          }, 350);
        }
      } catch(err) {
        console.error('Error during stepInterval:', err);
        clearInterval(stepInterval);
        state.turnPhase = 'ACTION';
        Events.emit('stateUpdated', state);
      }
    }, 160);
  }
  
  function handleLanding(player, diceResult) {
    if(!player || !state || !state.tiles) return;
    const tile = state.tiles[player.position];
    if(!tile) return;
    state.turnPhase = 'ACTION';
    
    switch(tile.type) {
      case 'property': case 'station': case 'utility':
        if(!tile.owner) {
          // Add unowned tile to shared discovered auction pool
          if(!state.auctionPool) state.auctionPool = [];
          if(!state.auctionPool.includes(tile.index)) {
            state.auctionPool.push(tile.index);
          }
          // Offer to buy
          Events.emit('propertyOffer', { player, tile });
        } else if(tile.owner !== player.id && !tile.isMortgaged) {
          // Pay rent
          let rent = 0;
          const owner = state.players.find(p => p.id === tile.owner);
          if(owner && typeof Property !== 'undefined') {
            if(tile.type === 'station') rent = Property.calculateStationRent(owner, state);
            else if(tile.type === 'utility') rent = Property.calculateUtilityRent(owner, (diceResult ? diceResult.total : 7), state);
            else rent = Property.calculateRent(tile, (diceResult ? diceResult.total : 7), state);
          }
          
          // Check skip rent effects (insurance card, guardian shield)
          if(player.skipRentCount > 0) { player.skipRentCount--; rent = 0; }
          // Check frozen tile
          if(owner && owner.rentFrozenTiles && owner.rentFrozenTiles.includes(tile.index)) rent = 0;
          
          if(rent > 0 && owner) {
            Player.payMoney(player, rent);
            // Split rent if JV
            let splitHandled = false;
            if (typeof JointVenture !== 'undefined' && owner.jointVentures) {
              const jv = owner.jointVentures.find(j => j.tileIndex === tile.index);
              if(jv) {
                const split = JointVenture.splitRent(rent, tile.index, state);
                if(split && split.amounts) {
                  Object.entries(split.amounts).forEach(([pid, amt]) => {
                    const p = state.players.find(pp => pp.id === pid);
                    if(p && typeof Player !== 'undefined') Player.receiveMoney(p, amt);
                  });
                  splitHandled = true;
                }
              }
            }
            if(!splitHandled && owner && typeof Player !== 'undefined') {
              Player.receiveMoney(owner, rent);
            }
            Events.emit('rentPaid', { payerId:player.id, ownerId:tile.owner, amount:rent, tileIndex:tile.index });
          }
        }
        break;
      case 'chance':
        if (typeof Cards !== 'undefined' && Cards.drawChanceCard) {
          const chanceCard = Cards.drawChanceCard();
          if(chanceCard) { chanceCard.execute(player, state); Events.emit('cardDrawn', { player, card:chanceCard, type:'chance' }); }
        }
        break;
      case 'chest':
        if (typeof Cards !== 'undefined' && Cards.drawChestCard) {
          const chestCard = Cards.drawChestCard();
          if(chestCard) { chestCard.execute(player, state); Events.emit('cardDrawn', { player, card:chestCard, type:'chest' }); }
        }
        break;
      case 'tax':
        let taxAmount = tile.index < 26 ? 200 : 150; // income tax vs luxury tax
        if(player.character === 'politician') taxAmount = 0;
        if(state.economy && state.economy.modifiers && state.economy.modifiers.tax) {
          taxAmount *= state.economy.modifiers.tax;
        }
        if(taxAmount > 0 && typeof Player !== 'undefined') Player.payMoney(player, Math.floor(taxAmount));
        Events.emit('taxPaid', { player, amount: Math.floor(taxAmount) });
        break;
      case 'go_to_jail':
        if(typeof Player !== 'undefined') Player.goToJail(player);
        Events.emit('playerJailed', { player });
        break;
      case 'black_market':
        Events.emit('blackMarketAccess', { player });
        break;
      case 'free_parking': case 'go': case 'jail':
        break;
    }
    
    // Check bankruptcy
    if(player.money < 0) {
      if(typeof Player !== 'undefined' && Player.isBankrupt && Player.isBankrupt(player)) {
        player.isBankrupt = true;
        // Return all properties to unowned
        (player.properties || []).forEach(ti => { 
          if(state.tiles[ti]) {
            state.tiles[ti].owner = null; 
            state.tiles[ti].isMortgaged = false; 
          }
        });
        Events.emit('playerBankrupt', { player });
        checkWinCondition();
      } else {
        Events.emit('needFunds', { player, amount: Math.abs(player.money) });
      }
    }
    
    Events.emit('stateUpdated', state);
  }
  
  function buyProperty(playerId, tileIndex) {
    if(!state || !state.players || !state.tiles) return false;
    const player = state.players.find(p => p.id === playerId);
    const tile = state.tiles[tileIndex];
    if(!player || !tile) return false;
    if(tile.owner !== null && tile.owner !== undefined) return false;
    if(tile.type !== 'property' && tile.type !== 'station' && tile.type !== 'utility') return false;
    if(player.money < tile.price) return false;
    
    Player.payMoney(player, tile.price);
    tile.owner = playerId;
    if(state.auctionPool) {
      state.auctionPool = state.auctionPool.filter(ti => ti !== tileIndex);
    }
    if(!player.properties) player.properties = [];
    if(!player.properties.includes(tileIndex)) {
      player.properties.push(tileIndex);
    }
    Events.emit('propertyBought', { playerId, tileIndex, price: tile.price, player, tile });
    Events.emit('stateUpdated', state);
    return true;
  }
  
  function declineProperty(tileIndex) {
    // Start auction for declined property
    if(typeof Auction !== 'undefined') Auction.startAuction(tileIndex, state);
  }
  
  function endTurn() {
    if(!state || !state.players || state.players.length === 0) return;
    const player = getCurrentPlayer();
    if(!player) return;
    
    // Extra turn for doubles (if not in jail)
    if((player.doublesCount || 0) > 0 && (player.jailTurns || 0) <= 0) {
      state.turnPhase = 'ROLL';
      Events.emit('extraTurn', { player });
      if(player.isAI && typeof AI !== 'undefined') setTimeout(() => AI.takeTurn(player, state), 1000);
      return;
    }
    state.turnPhase = 'END';
    Events.emit('turnEnd', { playerIndex: state.currentPlayerIndex });
    nextPlayer();
  }
  
  function nextPlayer() {
    if(!state || !state.players || state.players.length === 0) return;
    const alivePlayers = state.players.filter(p => !p.isBankrupt);
    if(alivePlayers.length <= 1) {
      checkWinCondition();
      if(alivePlayers.length === 0) return;
    }
    
    let attempts = 0;
    do {
      state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
      attempts++;
    } while(state.players[state.currentPlayerIndex] && state.players[state.currentPlayerIndex].isBankrupt && attempts <= state.players.length);
    
    startTurn();
  }
  
  function getCurrentPlayer() { 
    if(!state || !state.players || state.players.length === 0) return null;
    return state.players[state.currentPlayerIndex] || state.players[0] || null; 
  }
  function getState() { return state; }
  function setState(newState) { state = newState; }
  
  function checkWinCondition() {
    if(!state || !state.players) return;
    const alive = state.players.filter(p => !p.isBankrupt);
    if(alive.length <= 1) {
      state.phase = 'ENDED';
      Events.emit('gameOver', { winner: alive[0] || null });
    }
    if(state.settings && state.settings.maxRounds > 0 && state.roundNumber >= state.settings.maxRounds) {
      state.phase = 'ENDED';
      const richest = [...state.players].sort((a,b) => (b.netWorth || 0) - (a.netWorth || 0))[0];
      Events.emit('gameOver', { winner: richest });
    }
  }
  
  function syncState(newState) {
    state = newState;
    Events.emit('stateUpdated', state);
  }
  
  return { 
    createState, initGame, startTurn, rollDice, buyProperty, declineProperty, 
    endTurn, getCurrentPlayer, getState, setState, syncState, checkWinCondition, handleLanding 
  };
})();
