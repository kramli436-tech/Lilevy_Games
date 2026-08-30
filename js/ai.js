/**
 * ============================================================================
 * MONOPOLY CYBERPUNK - HARDCORE GRANDMASTER AI ENGINE
 * Powered by WebAssembly Core Calculations, MCTS Heuristics & Adaptive Strategy
 * ============================================================================
 */

const AI = (function() {
  'use strict';

  function takeTurn(player, gameState) {
    if(!player || player.isBankrupt) return;
    
    // 1. Tactical Jail Strategy
    handleJailStrategy(player, gameState);
    if(player.jailTurns > 0) {
      // Still in jail, turn skipped
      setTimeout(() => {
        if(typeof Game !== 'undefined') Game.endTurn();
      }, 1000);
      return;
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
      }, player);
    } else {
      const res = Game.rollDice(player);
      const moveTime = ((res ? res.total : 6) * 160) + 600;
      setTimeout(() => makeDecisions(player, gameState), moveTime);
    }
  }

  /**
   * Tactical Jail Decision:
   * Early game (tiles available) -> Pay $200 bail instantly to grab land.
   * Late game (hotels everywhere) -> Stay in jail safely to collect rent without risk.
   */
  function handleJailStrategy(player, gameState) {
    if(player.jailTurns <= 0) return;
    
    const unownedTiles = (gameState.tiles || []).filter(t => !t.owner && (t.type === 'property' || t.type === 'station' || t.type === 'utility')).length;
    const isEarlyGame = unownedTiles > 8;
    
    if(isEarlyGame && player.money > 350) {
      Player.payMoney(player, 200);
      player.jailTurns = 0;
      if(typeof UI !== 'undefined') {
        const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
        UI.showToast(`🤖 ${player.name} ${lang==='id'?'membayar jaminan keluar penjara ($200)':'paid $200 bail to leave jail'}!`, 'info');
      }
    } else if(!isEarlyGame && player.money > 1200) {
      // Very rich, pay bail
      Player.payMoney(player, 200);
      player.jailTurns = 0;
    }
  }

  /**
   * Main Decision Cycle for AI
   */
  function makeDecisions(player, gameState) {
    if(!player || player.isBankrupt) {
      if(typeof Game !== 'undefined') Game.endTurn();
      return;
    }
    
    try {
      // 1. Property Acquisition
      tryBuyLandingProperty(player, gameState);
      
      // 2. Proactive Trading & Monopoly Lockup
      tryProposeMonopolyTrades(player, gameState);
      
      // 3. Building Construction & Upgrades (Rush to 4 houses & Hotels)
      tryBuild(player, gameState);
      
      // 4. Financial Optimization (Unmortgage when rich, loan management)
      tryFinancialManagement(player, gameState);
      
      // 5. Stock Market & Dividend Accumulation
      tryStockActions(player, gameState);
      
      // 6. Joint Venture Tactical Partnerships
      tryJointVentureActions(player, gameState);
      
      // 7. Black Market Sabotage & Tactical Gear
      tryBlackMarketActions(player, gameState);
      
      // 8. Ruthless Character Active Skill Execution
      tryUseSkill(player, gameState);
      
      // 9. Tactical Action Cards Execution (Target the leader)
      tryUseCards(player, gameState);
      
    } catch(err) {
      console.error('Error during Hardcore AI decisions:', err);
    } finally {
      setTimeout(() => {
        try {
          if(typeof Game !== 'undefined') Game.endTurn();
        } catch(e) {
          console.error('Error ending AI turn:', e);
        }
      }, 1000);
    }
  }

  /**
   * 1. Property Acquisition Evaluator
   */
  function tryBuyLandingProperty(player, gameState) {
    const tile = gameState.tiles ? gameState.tiles[player.position] : null;
    if(tile && !tile.owner && (tile.type === 'property' || tile.type === 'station' || tile.type === 'utility') && shouldBuyProperty(player, tile, gameState)) {
      const bought = Game.buyProperty(player.id, tile.index);
      if(bought && typeof UI !== 'undefined') {
        const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
        const name = (lang === 'id' ? tile.name_id : tile.name_en) || tile.name_en;
        UI.showToast(`🤖 ${player.name} membeli ${name} ($${tile.price})!`, 'success');
      }
    }
  }

  function shouldBuyProperty(player, tile, gameState) {
    if(!player || !tile || player.money - tile.price < 150) return false;

    // Use WebAssembly Core Engine if ready
    if(typeof WasmEngine !== 'undefined' && WasmEngine.isReady()) {
      const groupTiles = tile.group ? gameState.tiles.filter(t => t.group === tile.group) : [];
      const ownedInGroup = groupTiles.filter(t => t.owner === player.id).length;
      const districtProps = gameState.tiles.filter(t => t.district === tile.district && t.owner === player.id).length;
      
      const score = WasmEngine.evaluateBuyDecision(
        tile.price,
        player.money,
        ownedInGroup,
        groupTiles.length,
        districtProps,
        200
      );
      return score >= 500;
    }

    // Hardcore JS Fallback
    if(tile.group) {
      const groupTiles = gameState.tiles.filter(t => t.group === tile.group);
      const owned = groupTiles.filter(t => t.owner === player.id).length;
      if(owned >= groupTiles.length - 1) return true; // Completes monopoly!
      if(owned > 0) return true; // Builds toward monopoly
    }
    return player.money - tile.price >= 200;
  }

  /**
   * 2. Proactive Trading & Monopoly Formation
   */
  function tryProposeMonopolyTrades(player, gameState) {
    if(typeof Trade === 'undefined' || !player.properties || player.properties.length === 0) return;
    if(gameState.activeTrade) return;

    // Scan for uncompleted monopolies where an opponent owns the missing piece
    const groups = {};
    (gameState.tiles || []).forEach(t => {
      if(t.group && t.type === 'property') {
        if(!groups[t.group]) groups[t.group] = [];
        groups[t.group].push(t);
      }
    });

    for(const groupName in groups) {
      const groupTiles = groups[groupName];
      const myOwned = groupTiles.filter(t => t.owner === player.id);
      const missing = groupTiles.filter(t => t.owner && t.owner !== player.id);

      // If AI owns all but 1 tile in this group, propose a lucrative trade to the owner
      if(myOwned.length === groupTiles.length - 1 && missing.length === 1) {
        const targetTile = missing[0];
        const targetOwner = gameState.players.find(p => p.id === targetTile.owner);
        if(!targetOwner || targetOwner.isBankrupt) continue;

        // Find a spare isolated tile to offer
        const spareTile = player.properties.find(ti => {
          const t = gameState.tiles[ti];
          if(!t || t.group === groupName) return false;
          const gTiles = groups[t.group] || [];
          return gTiles.filter(gt => gt.owner === player.id).length === 1;
        });

        const offerCash = Math.min(player.money - 300, Math.floor(targetTile.price * 1.5));
        if(offerCash > 0 || spareTile !== undefined) {
          const offerProps = spareTile !== undefined ? [spareTile] : [];
          Trade.proposeTrade(player.id, targetOwner.id, { money: Math.max(100, offerCash), properties: offerProps }, { money: 0, properties: [targetTile.index] }, gameState);
          break;
        }
      }
    }
  }

  /**
   * 3. Hardcore Building Construction (Compound Rent Multiplication)
   */
  function tryBuild(player, gameState) {
    if(typeof Property === 'undefined' || !player.properties) return;
    
    // Sort owned properties by strategic value (Monopoly first, then higher base rent)
    const sortedProps = [...player.properties].sort((a, b) => {
      const tileA = gameState.tiles[a];
      const tileB = gameState.tiles[b];
      const monoA = tileA ? Property.hasMonopoly(player.id, tileA.group, gameState) : false;
      const monoB = tileB ? Property.hasMonopoly(player.id, tileB.group, gameState) : false;
      if(monoA && !monoB) return -1;
      if(!monoA && monoB) return 1;
      return (tileB ? tileB.price : 0) - (tileA ? tileA.price : 0);
    });

    sortedProps.forEach(ti => {
      const tile = gameState.tiles[ti];
      if(!tile || tile.isMortgaged) return;
      
      const building = player.buildings ? player.buildings[ti] : null;
      const currentLevel = building ? building.level : 0;
      const hasMono = Property.hasMonopoly(player.id, tile.group, gameState);
      
      // Check if opponents are in striking distance (2-12 steps away)
      const oppsInRange = (gameState.players || []).filter(p => {
        if(p.id === player.id || p.isBankrupt) return false;
        const dist = (ti - p.position + 52) % 52;
        return dist >= 2 && dist <= 12;
      }).length;

      // Build houses (1 to 4)
      if(currentLevel < 4) {
        const canB = Property.canBuild(player.id, ti, 'house', gameState);
        if(canB && canB.canBuild && player.money > canB.cost + 200) {
          Property.build(player.id, ti, 'house', gameState);
        }
      } 
      // Upgrade to Hotel if monopoly held
      else if(currentLevel === 4 && hasMono) {
        const canH = Property.canBuild(player.id, ti, 'hotel', gameState);
        if(canH && canH.canBuild && player.money > canH.cost + 250) {
          Property.build(player.id, ti, 'hotel', gameState);
        }
      }
      // Tactical Special Buildings (Mall, HQ, Fortress, Casino)
      else if(currentLevel === 0 && !hasMono && player.money > 800) {
        if(player.character === 'banker' || player.character === 'engineer') {
          // Mall for +$50 passive dividend cashflow
          if(Property.canBuild(player.id, ti, 'mall', gameState)?.canBuild) {
            Property.build(player.id, ti, 'mall', gameState);
          }
        } else if(player.character === 'gambler') {
          // Casino for gamble rent
          if(Property.canBuild(player.id, ti, 'casino', gameState)?.canBuild) {
            Property.build(player.id, ti, 'casino', gameState);
          }
        }
      }
    });
  }

  /**
   * 4. Financial Management & Unmortgaging
   */
  function tryFinancialManagement(player, gameState) {
    if(typeof Loan === 'undefined' || !player.loans) return;
    
    // If AI has recovered cash (> $700), unmortgage properties to restore rent
    if(player.money > 700) {
      for(let i = player.loans.length - 1; i >= 0; i--) {
        const loan = player.loans[i];
        if(loan.type === 'mortgage' && player.money > loan.amount + 300) {
          Loan.repayLoan(player.id, i, gameState);
        }
      }
    }
  }

  /**
   * 5. Stock Market & Dividend Accumulation
   */
  function tryStockActions(player, gameState) {
    if (typeof Stock === 'undefined' || !gameState.stocks) return;
    
    Object.keys(gameState.stocks).forEach(name => {
      const stock = gameState.stocks[name];
      const trend = Stock.getStockTrend(name, gameState);
      const myShares = (player.stocks && player.stocks[name]) ? player.stocks[name] : 0;
      
      // Aggressive buy on rising trends
      if(trend === 'up' && player.money > 450 && myShares < 10) {
        Stock.buyStock(player.id, name, 2, gameState);
      } 
      // Cut loss on falling stocks
      else if(trend === 'down' && myShares > 0 && player.money < 500) {
        Stock.sellStock(player.id, name, myShares, gameState);
      }
    });
  }

  /**
   * 6. Joint Venture Tactical Partnerships
   */
  function tryJointVentureActions(player, gameState) {
    if(typeof JointVenture === 'undefined' || !player.properties) return;
    
    // Propose JV on high-value opponent tile if we have lots of cash
    if(player.money > 900 && (!player.jointVentures || player.jointVentures.length < 2)) {
      const candidateTile = (gameState.tiles || []).find(t => {
        return t.owner && t.owner !== player.id && t.type === 'property' && t.price >= 300 &&
          (!t.jointVentures || t.jointVentures.length === 0);
      });
      if(candidateTile) {
        JointVenture.proposeJV(player.id, candidateTile.owner, candidateTile.index, 50, gameState);
      }
    }
  }

  /**
   * 7. Black Market Gear & Sabotage
   */
  function tryBlackMarketActions(player, gameState) {
    if(typeof BlackMarket === 'undefined' || player.money < 1200) return;
    
    // If skill is on cooldown, buy Stimulant to reset cooldown!
    if(player.skillCooldown > 3 && player.money > 1500) {
      BlackMarket.buyItem(player.id, 'stimulant', null, gameState);
    }
    // If low on action cards, buy Dark Card Chip!
    else if((!player.cards || player.cards.length === 0) && player.money > 1600) {
      BlackMarket.buyItem(player.id, 'dark_card_chip', null, gameState);
    }
    // If no rent protection, buy Master Key!
    else if(!player.skipRentCount && player.money > 1800) {
      BlackMarket.buyItem(player.id, 'masterkey', null, gameState);
    }
  }

  /**
   * 8. Ruthless Character Active Skill Execution
   */
  function tryUseSkill(player, gameState) {
    if(typeof Skills === 'undefined' || !Skills.canUseActive(player) || (player.skillDisabledTurns && player.skillDisabledTurns > 0)) return;
    
    const char = player.character;
    const opps = (gameState.players || []).filter(p => p.id !== player.id && !p.isBankrupt);
    const leader = [...opps].sort((a,b) => (b.netWorth || 0) - (a.netWorth || 0))[0];

    try {
      // Banker: Freeze highest rent hotel of the human leader
      if(char === 'banker') {
        Skills.useActive(player, null, null, gameState);
      }
      // Engineer: Instant upgrade highest building for free
      else if(char === 'engineer') {
        if(player.properties && player.properties.length > 0) {
          Skills.useActive(player, null, null, gameState);
        }
      }
      // Politician: Trigger Emergency Tax when opponents hold juicy cash (> $700)
      else if(char === 'politician') {
        const totalOppCash = opps.reduce((sum, p) => sum + (p.money || 0), 0);
        if(totalOppCash >= 600 || (leader && leader.money > 450)) {
          Skills.useActive(player, null, null, gameState);
        }
      }
      // Gambler: Trigger Jackpot (2x rent) when opponents are in striking distance (2-12 steps)
      else if(char === 'gambler') {
        const hasHighRentProps = (player.properties || []).some(ti => {
          return opps.some(op => {
            const d = (ti - op.position + 52) % 52;
            return d >= 2 && d <= 12;
          });
        });
        if(hasHighRentProps) {
          Skills.useActive(player, null, null, gameState);
        }
      }
      // Guardian: Trigger Rent Shield if approaching danger
      else if(char === 'guardian') {
        const approachingDanger = (gameState.tiles || []).some((t, idx) => {
          if(!t.owner || t.owner === player.id) return false;
          const d = (idx - player.position + 52) % 52;
          return d >= 2 && d <= 12 && (t.price >= 250 || (gameState.players.find(p=>p.id===t.owner)?.buildings?.[idx]?.level || 0) >= 3);
        });
        if(approachingDanger) {
          Skills.useActive(player, null, null, gameState);
        }
      }
      // Trader: Force Trade
      else if(char === 'trader') {
        Skills.useActive(player, null, null, gameState);
      }
      // Hacker: Cyber Hijack richest opponent
      else if(char === 'hacker') {
        if(leader && (leader.money || 0) >= 300) {
          Skills.useActive(player, null, null, gameState);
        }
      }
      // Tycoon: Hostile Takeover to snipe non-monopoly tile
      else if(char === 'tycoon') {
        if((player.money || 0) >= 300) {
          Skills.useActive(player, null, null, gameState);
        }
      }
      // Cyborg: Overdrive Surge to rush across danger or pass GO
      else if(char === 'cyborg') {
        const nearDanger = (gameState.tiles || []).some((t, idx) => {
          if(!t.owner || t.owner === player.id) return false;
          const d = (idx - player.position + 52) % 52;
          return d >= 2 && d <= 8 && (t.price >= 200);
        });
        if(nearDanger || (52 - player.position) <= 6) {
          Skills.useActive(player, null, null, gameState);
        }
      }
      // Broker: Market Pump for instant stock surge and $250 cash
      else if(char === 'broker') {
        if((player.money || 0) < 600 || (player.stocks && Object.keys(player.stocks).length > 0)) {
          Skills.useActive(player, null, null, gameState);
        }
      }
      // Detective: District Quarantine to lock down opponent's core district
      else if(char === 'detective') {
        const topOpp = leader || opps[0];
        if(topOpp && topOpp.properties && topOpp.properties.length > 0) {
          const targetTile = topOpp.properties[0];
          Skills.useActive(player, null, targetTile, gameState);
        }
      }
      // Alchemist: Quantum Duplication to restock 2 action cards
      else if(char === 'alchemist') {
        if(!player.cards || player.cards.length <= 2) {
          Skills.useActive(player, null, null, gameState);
        }
      }
    } catch(e) {
      console.error('Error in AI tryUseSkill:', e);
    }
  }

  /**
   * 9. Tactical Action Cards Execution (Target the leader)
   */
  function tryUseCards(player, gameState) {
    if(!player.cards || player.cards.length === 0) return;
    try {
      const leader = [...(gameState.players || [])].filter(p => !p.isBankrupt && p.id !== player.id).sort((a,b) => (b.netWorth || 0) - (a.netWorth || 0))[0];
      for (let i = player.cards.length - 1; i >= 0; i--) {
        const card = player.cards[i];
        if(card && card.type === 'attack' && leader && card.execute) {
          try {
            card.execute(player, leader, gameState);
            player.cards.splice(i, 1);
            if(typeof UI !== 'undefined') {
              UI.showToast(`🃏 ${player.name} menggunakan kartu [${card.name_id || card.name_en}] kepada ${leader.name}!`, 'warning');
            }
          } catch(err) {
            console.error('Error executing AI attack card:', err);
          }
        }
      }
    } catch(e) {
      console.error('Error in AI tryUseCards:', e);
    }
  }

  /**
   * Emergency Cash Recovery (Anti-Bankruptcy System)
   * Prevents premature bot bankruptcy by liquidating assets strategically.
   */
  function handleEmergencyFunds(player, neededAmount, gameState) {
    if(!player || player.money >= neededAmount) return;

    // Step 1: Liquidate all stocks
    if(typeof Stock !== 'undefined' && player.stocks) {
      Object.keys(player.stocks).forEach(name => {
        if(player.stocks[name] > 0 && player.money < neededAmount) {
          Stock.sellStock(player.id, name, player.stocks[name], gameState);
        }
      });
    }
    if(player.money >= neededAmount) return;

    // Step 2: Take Bank Loan
    if(typeof Loan !== 'undefined' && Loan.canTakeLoan(player.id, 'bank', gameState)) {
      Loan.takeLoan(player.id, 'bank', 1000, null, gameState);
    }
    if(player.money >= neededAmount) return;

    // Step 3: Mortgage non-monopoly properties
    if(typeof Loan !== 'undefined' && player.properties) {
      player.properties.forEach(ti => {
        const tile = gameState.tiles[ti];
        if(tile && !tile.isMortgaged && player.money < neededAmount) {
          const hasMono = Property.hasMonopoly(player.id, tile.group, gameState);
          if(!hasMono) {
            Loan.takeLoan(player.id, 'mortgage', 0, ti, gameState);
          }
        }
      });
    }
  }

  /**
   * Auction Decision
   */
  function decideBid(player, tileIndex, currentBid, gameState) {
    const tile = gameState.tiles[tileIndex];
    if(!tile || !player) return 0;

    // Use WebAssembly Core Engine if ready
    if(typeof WasmEngine !== 'undefined' && WasmEngine.isReady()) {
      const groupTiles = tile.group ? gameState.tiles.filter(t => t.group === tile.group) : [];
      const ownedInGroup = groupTiles.filter(t => t.owner === player.id).length;
      return WasmEngine.evaluateAuctionBid(tile.price, player.money, ownedInGroup, groupTiles.length, currentBid);
    }

    // Hardcore JS Fallback
    let maxBid = tile.price * 0.9;
    if(tile.group) {
      const groupTiles = gameState.tiles.filter(t => t.group === tile.group);
      const owned = groupTiles.filter(t => t.owner === player.id).length;
      if(owned >= groupTiles.length - 1) maxBid = tile.price * 1.8;
      else if(owned > 0) maxBid = tile.price * 1.25;
    }
    if(currentBid < maxBid && player.money > currentBid * 1.1 + 200) {
      return Math.floor(currentBid * 1.1) + 15;
    }
    return 0;
  }

  /**
   * Trade Response Decision (Anti-Exploit & Monopoly Denial)
   */
  function decideTradeResponse(player, trade, gameState) {
    let offerValue = trade.offerMoney || 0;
    let requestValue = trade.requestMoney || 0;
    (trade.offerTiles || []).forEach(ti => offerValue += (gameState.tiles[ti] ? gameState.tiles[ti].price * 1.2 : 0));
    (trade.requestTiles || []).forEach(ti => requestValue += (gameState.tiles[ti] ? gameState.tiles[ti].price * 1.5 : 0));

    let completesMyMonopoly = false;
    let completesOppMonopoly = false;
    (trade.offerTiles || []).forEach(ti => {
      const t = gameState.tiles[ti];
      if(t && t.group) {
        const gTiles = gameState.tiles.filter(gt => gt.group === t.group);
        const owned = gTiles.filter(gt => gt.owner === player.id).length;
        if(owned >= gTiles.length - 1) completesMyMonopoly = true;
      }
    });
    (trade.requestTiles || []).forEach(ti => {
      const t = gameState.tiles[ti];
      if(t && t.group && trade.from) {
        const gTiles = gameState.tiles.filter(gt => gt.group === t.group);
        const owned = gTiles.filter(gt => gt.owner === trade.from).length;
        if(owned >= gTiles.length - 1) completesOppMonopoly = true;
      }
    });

    if(typeof WasmEngine !== 'undefined' && WasmEngine.isReady()) {
      return WasmEngine.evaluateTrade(Math.round(offerValue), Math.round(requestValue), completesMyMonopoly, completesOppMonopoly);
    }

    // Hardcore denial: if trade gives human monopoly, reject unless human offers massive cash
    if(completesOppMonopoly && !completesMyMonopoly) {
      return offerValue >= requestValue + 800;
    }

    return offerValue >= requestValue;
  }

  return {
    takeTurn,
    makeDecisions,
    shouldBuyProperty,
    decideBid,
    decideTradeResponse,
    handleEmergencyFunds
  };
})();
