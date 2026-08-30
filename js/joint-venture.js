const JointVenture = (function() {
  'use strict';
  
  function proposeJV(fromId, toId, tileIndex, ratio, gameState) {
    if (!canProposeJV(fromId, gameState)) return null;
    
    const tile = gameState.tiles[tileIndex];
    if (tile.owner !== fromId) return null;
    
    const proposal = { fromId, toId, tileIndex, ratio, id: Date.now() };
    if (!gameState.jvProposals) gameState.jvProposals = [];
    gameState.jvProposals.push(proposal);
    
    if (typeof Events !== 'undefined') Events.emit('jvProposed', proposal);
    return proposal;
  }
  
  function acceptJV(proposal, gameState) {
    const fromPlayer = gameState.players.find(p => p.id === proposal.fromId);
    const toPlayer = gameState.players.find(p => p.id === proposal.toId);
    
    if (!fromPlayer.jointVentures) fromPlayer.jointVentures = [];
    if (!toPlayer.jointVentures) toPlayer.jointVentures = [];
    
    const jvData = { partnerId: proposal.toId, tileIndex: proposal.tileIndex, ratio: proposal.ratio };
    const jvDataReverse = { partnerId: proposal.fromId, tileIndex: proposal.tileIndex, ratio: 100 - proposal.ratio };
    
    fromPlayer.jointVentures.push(jvData);
    toPlayer.jointVentures.push(jvDataReverse);
    
    gameState.jvProposals = gameState.jvProposals.filter(p => p.id !== proposal.id);
    if (typeof Events !== 'undefined') Events.emit('jvAccepted', proposal);
    return true;
  }
  
  function rejectJV(proposal, gameState) {
    gameState.jvProposals = gameState.jvProposals.filter(p => p.id !== proposal.id);
    if (typeof Events !== 'undefined') Events.emit('jvRejected', proposal);
  }
  
  function dissolveJV(playerId, tileIndex, gameState) {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player || !player.jointVentures) return false;
    
    const jvIndex = player.jointVentures.findIndex(j => j.tileIndex === tileIndex);
    if (jvIndex === -1) return false;
    
    const jv = player.jointVentures[jvIndex];
    const partner = gameState.players.find(p => p.id === jv.partnerId);
    
    const tile = gameState.tiles[tileIndex];
    let val = tile.price;
    const building = player.buildings ? player.buildings[tileIndex] : null;
    if (building) val += (tile.houseCost || 50) * building.level;
    
    const partnerShare = (100 - jv.ratio) / 100;
    const buyoutPrice = Math.floor(val * partnerShare);
    
    if (player.money < buyoutPrice) return false;
    player.money -= buyoutPrice;
    partner.money += buyoutPrice;
    
    player.jointVentures.splice(jvIndex, 1);
    const partnerJvIndex = partner.jointVentures.findIndex(j => j.tileIndex === tileIndex);
    if (partnerJvIndex > -1) partner.jointVentures.splice(partnerJvIndex, 1);
    
    if (typeof Events !== 'undefined') Events.emit('jvDissolved', { playerId, tileIndex, buyoutPrice });
    return true;
  }
  
  function splitRent(amount, tileIndex, gameState) {
    const tile = gameState.tiles[tileIndex];
    const owner = gameState.players.find(p => p.id === tile.owner);
    
    if (owner && owner.jointVentures) {
        const jv = owner.jointVentures.find(j => j.tileIndex === tileIndex);
        if (jv) {
            const ownerShare = Math.floor(amount * (jv.ratio / 100));
            const partnerShare = amount - ownerShare;
            return { [owner.id]: ownerShare, [jv.partnerId]: partnerShare };
        }
    }
    return { [tile.owner]: amount };
  }
  
  function splitBuildCost(cost, tileIndex, gameState) {
    const tile = gameState.tiles[tileIndex];
    const owner = gameState.players.find(p => p.id === tile.owner);
    if (owner && owner.jointVentures) {
        const jv = owner.jointVentures.find(j => j.tileIndex === tileIndex);
        if (jv) {
            const ownerShare = Math.floor(cost * (jv.ratio / 100));
            return { [owner.id]: ownerShare, [jv.partnerId]: cost - ownerShare };
        }
    }
    return { [tile.owner]: cost };
  }
  
  function getJVPartner(playerId, tileIndex, gameState) {
    const player = gameState.players.find(p => p.id === playerId);
    if (player && player.jointVentures) {
        const jv = player.jointVentures.find(j => j.tileIndex === tileIndex);
        if (jv) return jv.partnerId;
    }
    return null;
  }
  
  function getJVBonus() { 
      return 1.2; 
  }
  
  function canProposeJV(playerId, gameState) { 
      const player = gameState.players.find(p => p.id === playerId);
      return (player.jointVentures || []).length < 3; 
  }
  
  return { proposeJV, acceptJV, rejectJV, dissolveJV, splitRent, splitBuildCost, getJVPartner, getJVBonus, canProposeJV };
})();
