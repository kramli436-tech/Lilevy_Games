const BlackMarket = (function() {
  'use strict';
  
  const ITEMS = [
    { id:'spy', name_id:'Alat Mata-mata', name_en:'Spy Device', price:300, riskChance:0.20, desc_id:'Lihat kartu & uang 1 lawan', desc_en:'See cards & money of 1 opponent', penalty:200, effect(user,target,gs){} },
    { id:'counterfeit', name_id:'Uang Palsu', name_en:'Counterfeit Cash', price:200, riskChance:0.30, desc_id:'Dapat $500', desc_en:'Get $500', penalty:400, penaltyExtra:'jail', effect(user,target,gs){ user.money += 500; } },
    { id:'masterkey', name_id:'Kunci Master', name_en:'Master Key', price:250, riskChance:0.15, desc_id:'Lewati sewa 1x', desc_en:'Skip rent 1x', penalty:0, penaltyExtra:'doubleRent', effect(user,target,gs){} },
    { id:'forged', name_id:'Surat Palsu', name_en:'Forged Deed', price:400, riskChance:0.25, desc_id:'Klaim 1 properti tanpa bayar', desc_en:'Claim 1 unowned property free', penalty:0, penaltyExtra:'loseProperty', effect(user,target,gs){} },
    { id:'protection', name_id:'Perlindungan', name_en:'Protection', price:350, riskChance:0, desc_id:'Imun attack card 3 giliran', desc_en:'Immune to attack cards 3 turns', penalty:0, effect(user,target,gs){} },
    { id:'stimulant', name_id:'Stimulan', name_en:'Stimulant', price:150, riskChance:0.10, desc_id:'Reset cooldown skill', desc_en:'Reset skill cooldown', penalty:0, penaltyExtra:'disableSkill', effect(user,target,gs){ user.skillCooldown = 0; } },
  ];
  
  function canAccess(playerPosition, gameState) {
      const tile = gameState.tiles[playerPosition];
      if (tile && tile.type === 'black_market') return true;
      return false;
  }
  
  function buyItem(playerId, itemId, targetId, gameState) {
    const user = gameState.players.find(p => p.id === playerId);
    const item = ITEMS.find(i => i.id === itemId);
    if (!user || !item) return { success: false, caught: false, item: null };
    
    if (user.money < item.price) return { success: false, caught: false, item: null };
    user.money -= item.price;
    
    if (Math.random() < item.riskChance) {
        user.money -= item.penalty;
        if(item.penaltyExtra === 'jail') user.jailTurns = 3;
        else if(item.penaltyExtra === 'disableSkill') user.skillCooldown = 999;
        if (typeof Events !== 'undefined') Events.emit('blackMarketCaught', { playerId, penalty: item.penalty, extra: item.penaltyExtra });
        return { success: false, caught: true, item: null };
    }
    
    const target = targetId ? gameState.players.find(p => p.id === targetId) : null;
    item.effect(user, target, gameState);
    
    if (!user.blackMarketItems) user.blackMarketItems = [];
    user.blackMarketItems.push({ id: itemId, turnsLeft: 3 });
    
    if (typeof Events !== 'undefined') Events.emit('blackMarketSuccess', { playerId, itemId });
    return { success: true, caught: false, item };
  }
  
  function getAvailableItems() { return ITEMS; }
  
  function hasActiveItem(playerId, itemId, gameState) {
      const user = gameState.players.find(p => p.id === playerId);
      if (!user || !user.blackMarketItems) return false;
      return user.blackMarketItems.some(i => i.id === itemId);
  }
  
  function tickItems(playerId, gameState) {
      const user = gameState.players.find(p => p.id === playerId);
      if (!user || !user.blackMarketItems) return;
      for (let i = user.blackMarketItems.length - 1; i >= 0; i--) {
          user.blackMarketItems[i].turnsLeft--;
          if (user.blackMarketItems[i].turnsLeft <= 0) {
              user.blackMarketItems.splice(i, 1);
          }
      }
  }
  
  return { canAccess, buyItem, getAvailableItems, hasActiveItem, tickItems, ITEMS };
})();
