const Player = (function() {
  function create(id, name, character, isAI, colorIndex) {
    const colors = ['#00ffff','#ff00ff','#ffff00','#00ff88','#ff6600','#ff3366'];
    return {
      id, name, character, position:0, money:2000,
      properties:[], buildings:{}, cards:[], secretObjectives:[],
      skillCooldown:0, jailTurns:0, loans:[],
      stocks:{NeonCorp:0,CyberTech:0,DataFlow:0,QuantumAI:0},
      jointVentures:[], blackMarketItems:[], completedObjectives:[],
      isAI, isBankrupt:false, isConnected:true,
      color:colors[colorIndex % colors.length], netWorth:0,
      doublesCount:0, direction:1,
      // Temporary effects
      skipRentCount:0, rentFrozenTiles:[], skillDisabledTurns:0,
      protectionTurns:0, hackBankTurns:0, reverseTurns:0,
      rerolledThisTurn:false,
    };
  }
  function calculateNetWorth(player, gameState) {
    let worth = player.money;
    // + property values
    if (typeof Property !== 'undefined' && Property.getPropertyValue) {
      player.properties.forEach(ti => { worth += Property.getPropertyValue(ti, gameState); });
    }
    // + stock portfolio
    if (typeof Stock !== 'undefined' && Stock.getPortfolioValue) {
      worth += Stock.getPortfolioValue(player.id, gameState);
    }
    // - debts
    if (typeof Loan !== 'undefined' && Loan.getTotalDebt) {
      worth -= Loan.getTotalDebt(player.id, gameState);
    }
    player.netWorth = worth;
    return worth;
  }
  function movePlayer(player, steps, gameState) {
    const totalTiles = 52;
    const direction = player.reverseTurns > 0 ? -1 : 1;
    const oldPos = player.position;
    let newPos = (player.position + steps * direction + totalTiles) % totalTiles;
    // Check if passed GO
    let passedGo = false;
    if(direction > 0 && newPos < oldPos) passedGo = true;
    if(direction < 0 && newPos > oldPos) passedGo = true;
    if(passedGo) {
      let goBonus = gameState.settings.goBonus;
      if(gameState.economy.currentEvent === 'goldRush') goBonus *= 2;
      player.money += goBonus;
    }
    player.position = newPos;
    return { from:oldPos, to:newPos, passedGo };
  }
  function payMoney(player, amount) { player.money -= amount; return player.money >= 0; }
  function receiveMoney(player, amount) { player.money += amount; }
  function isBankrupt(player) { return player.money < 0 && player.netWorth < 0; }
  function goToJail(player) { player.position = 13; player.jailTurns = 3; }
  function tryLeaveJail(player, method, gameState) {
    if (method === 'pay') {
      if (player.money >= 200) {
        payMoney(player, 200);
        player.jailTurns = 0;
        return true;
      }
    } else if (method === 'card') {
      const bailCardIndex = player.cards.findIndex(c => c.type === 'bail');
      if (bailCardIndex > -1) {
        player.cards.splice(bailCardIndex, 1);
        player.jailTurns = 0;
        return true;
      }
    }
    return false;
  }
  function tickEffects(player) {
    // Decrement all temporary effect counters
    if(player.rentFrozenTiles.length) { player.rentFrozenTiles = []; }
    if(player.skillDisabledTurns > 0) player.skillDisabledTurns--;
    if(player.protectionTurns > 0) player.protectionTurns--;
    if(player.hackBankTurns > 0) { player.hackBankTurns--; player.money += 100; }
    if(player.reverseTurns > 0) player.reverseTurns--;
    player.rerolledThisTurn = false;
  }
  
  return { create, calculateNetWorth, movePlayer, payMoney, receiveMoney, isBankrupt, goToJail, tryLeaveJail, tickEffects };
})();
