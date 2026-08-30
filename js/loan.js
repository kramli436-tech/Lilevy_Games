const Loan = (function() {
  'use strict';
  
  const TYPES = {
    bank: { name_id:'Bank', name_en:'Bank', interest:0.05, maxAmount:1000, maxTurns:10, requiresCollateral:false },
    shark: { name_id:'Lintah Darat', name_en:'Loan Shark', interest:0.15, maxAmount:5000, maxTurns:5, requiresCollateral:false },
    mortgage: { name_id:'Gadai', name_en:'Mortgage', interest:0, maxAmount:0, maxTurns:999, requiresCollateral:true },
  };
  
  function canTakeLoan(playerId, type, gameState) {
    const owner = gameState.players.find(p => p.id === playerId);
    if (!owner) return false;
    
    if (owner.loans && owner.loans.length >= 3) return false;
    return true;
  }
  
  function takeLoan(playerId, type, amount, tileIndex, gameState) {
    if (!canTakeLoan(playerId, type, gameState)) return false;
    
    const owner = gameState.players.find(p => p.id === playerId);
    const loanDef = TYPES[type];
    
    let finalAmount = Math.min(amount, loanDef.maxAmount);
    
    if (type === 'mortgage') {
        const tile = gameState.tiles[tileIndex];
        if(!tile || tile.owner !== playerId || tile.isMortgaged) return false;
        finalAmount = tile.price * 0.5;
        tile.isMortgaged = true;
    }
    
    if (!owner.loans) owner.loans = [];
    owner.loans.push({
        type,
        amount: finalAmount,
        originalAmount: finalAmount,
        turnsLeft: loanDef.maxTurns,
        collateral: tileIndex
    });
    
    owner.money += finalAmount;
    if (typeof Events !== 'undefined') Events.emit('loanTaken', { playerId, type, amount: finalAmount });
    return true;
  }
  
  function repayLoan(playerId, loanIndex, gameState) {
    const owner = gameState.players.find(p => p.id === playerId);
    if (!owner || !owner.loans || !owner.loans[loanIndex]) return false;
    
    const loan = owner.loans[loanIndex];
    if (owner.money < loan.amount) return false;
    
    owner.money -= loan.amount;
    
    if (loan.type === 'mortgage' && loan.collateral != null) {
        const tile = gameState.tiles[loan.collateral];
        if (tile) tile.isMortgaged = false;
    }
    
    owner.loans.splice(loanIndex, 1);
    if (typeof Events !== 'undefined') Events.emit('loanRepaid', { playerId, loanIndex });
    return true;
  }
  
  function tickLoans(playerId, gameState) {
    const owner = gameState.players.find(p => p.id === playerId);
    if (!owner || !owner.loans) return;
    
    owner.loans.forEach(loan => {
        if (loan.type !== 'mortgage') {
            let intRate = TYPES[loan.type].interest;
            if (owner.character === 'banker') intRate *= 0.5;
            loan.amount += Math.floor(loan.amount * intRate);
            loan.turnsLeft--;
        }
    });
    checkForeclosure(playerId, gameState);
  }
  
  function checkForeclosure(playerId, gameState) {
    const owner = gameState.players.find(p => p.id === playerId);
    if (!owner || !owner.loans) return;
    
    for (let i = owner.loans.length - 1; i >= 0; i--) {
        const loan = owner.loans[i];
        if (loan.turnsLeft <= 0 && loan.type !== 'mortgage') {
            owner.money -= loan.amount;
            if (typeof Events !== 'undefined') Events.emit('loanForeclosed', { playerId, loan });
            owner.loans.splice(i, 1);
        }
    }
  }
  
  function getTotalDebt(playerId, gameState) {
    const owner = gameState.players.find(p => p.id === playerId);
    if (!owner || !owner.loans) return 0;
    return owner.loans.reduce((sum, l) => sum + l.amount, 0);
  }
  
  function getLoanDetails(playerId, gameState) {
    const owner = gameState.players.find(p => p.id === playerId);
    return owner ? (owner.loans || []) : [];
  }
  
  return { canTakeLoan, takeLoan, repayLoan, tickLoans, checkForeclosure, getTotalDebt, getLoanDetails, TYPES };
})();
