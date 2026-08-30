const Property = (function() {
  'use strict';
  
  const BUILDING_PATHS = {
    hotel: { requires: 4, name_id:'Hotel', name_en:'Hotel', icon:'🏨', rentMultiplier: 40 },
    mall: { requires: 2, name_id:'Mall', name_en:'Mall', icon:'🏬', passiveIncome: 50 },
    hq: { requires: 2, name_id:'Markas', name_en:'HQ', icon:'🏢', skillMultiplier: 2 },
    casino: { requires: 1, name_id:'Kasino', name_en:'Casino', icon:'🎰', rentRange: [0.5, 3.0] },
    fortress: { requires: 3, name_id:'Benteng', name_en:'Fortress', icon:'🏰', immune: true }
  };
  
  function calculateRent(tile, diceTotal, gameState) {
    if(!tile || tile.type !== 'property' || !tile.owner || tile.isMortgaged) return 0;
    const owner = gameState.players.find(p => p.id === tile.owner);
    if(!owner) return 0;
    
    let rent = tile.rent[0]; 
    const building = owner.buildings[tile.index];
    
    if(building) {
      if(building.type === 'house') rent = tile.rent[building.level];
      else if(building.type === 'hotel') rent = tile.rent[5];
      else if(building.type === 'mall') rent = tile.rent[Math.min(building.level, 2)] * 1.5;
      else if(building.type === 'hq') rent = tile.rent[Math.min(building.level, 2)] * 1.3;
      else if(building.type === 'casino') rent = tile.rent[1] * (0.5 + Math.random() * 2.5);
      else if(building.type === 'fortress') rent = tile.rent[Math.min(building.level, 3)] * 1.2;
    }
    
    if(hasMonopoly(tile.owner, tile.group, gameState) && !building) rent *= 2;
    rent *= District.getSynergyMultiplier(tile.owner, tile.district, gameState);
    if (gameState.economy && gameState.economy.modifiers) {
        rent *= gameState.economy.modifiers.rent || 1;
    }
    if (typeof Weather !== 'undefined') {
        rent *= Weather.getRentModifier(tile.district, gameState);
    }
    
    if (owner.character === 'gambler' && gameState.activeSkills && gameState.activeSkills[owner.id] === 'doubleRent') {
        rent *= 2;
    }

    const jv = owner.jointVentures ? owner.jointVentures.find(j => j.tileIndex === tile.index) : null;
    if(jv) rent *= 1.2;
    
    return Math.floor(rent);
  }
  
  function calculateStationRent(owner, gameState) {
    const stationsOwned = gameState.tiles.filter(t => t.type === 'station' && t.owner === owner.id).length;
    return stationsOwned * 50;
  }
  
  function calculateUtilityRent(owner, diceTotal, gameState) {
    const utilsOwned = gameState.tiles.filter(t => t.type === 'utility' && t.owner === owner.id).length;
    let multiplier = utilsOwned === 1 ? 6 : 12;
    if(gameState.economy && gameState.economy.currentEvent === 'techRevolution') multiplier *= 3;
    return (diceTotal || 0) * multiplier;
  }
  
  function hasMonopoly(playerId, group, gameState) {
    if(!group) return false;
    const groupTiles = gameState.tiles.filter(t => t.group === group);
    return groupTiles.every(t => t.owner === playerId);
  }
  
  function canBuild(playerId, tileIndex, buildingType, gameState) {
    const tile = gameState.tiles[tileIndex];
    if (tile.owner !== playerId) return { canBuild: false, reason: 'Not the owner', cost: 0 };
    if (!hasMonopoly(playerId, tile.group, gameState)) return { canBuild: false, reason: 'No monopoly', cost: 0 };
    if (typeof Weather !== 'undefined' && !Weather.canBuildInWeather(tile.district, gameState)) {
        return { canBuild: false, reason: 'Weather prevents building', cost: 0 };
    }

    const cost = getBuildCost(tile, buildingType, gameState);
    const owner = gameState.players.find(p => p.id === playerId);
    if (owner.money < cost) return { canBuild: false, reason: 'Insufficient funds', cost };

    return { canBuild: true, reason: '', cost };
  }
  
  function build(playerId, tileIndex, buildingType, gameState) {
    const check = canBuild(playerId, tileIndex, buildingType, gameState);
    if (!check.canBuild) return false;
    
    const owner = gameState.players.find(p => p.id === playerId);
    owner.money -= check.cost;
    
    if (!owner.buildings) owner.buildings = {};
    if (!owner.buildings[tileIndex]) {
        owner.buildings[tileIndex] = { type: buildingType, level: 1 };
    } else {
        owner.buildings[tileIndex].level += 1;
        if (buildingType !== 'house') owner.buildings[tileIndex].type = buildingType;
    }
    
    if (typeof Events !== 'undefined') Events.emit('buildingAdded', { playerId, tileIndex, buildingType });
    return true;
  }
  
  function getBuildCost(tile, buildingType, gameState) {
    let cost = tile.houseCost || 50;
    if (gameState.economy && gameState.economy.modifiers) {
        cost *= gameState.economy.modifiers.buildCost || 1;
    }
    const owner = gameState.players.find(p => p.id === tile.owner);
    if (owner && owner.character === 'engineer') cost *= 0.8;
    return Math.floor(cost);
  }
  
  function mortgageProperty(playerId, tileIndex, gameState) {
    const tile = gameState.tiles[tileIndex];
    if (tile.owner !== playerId || tile.isMortgaged) return false;
    const owner = gameState.players.find(p => p.id === playerId);
    
    const mValue = tile.mortgageValue || (tile.price / 2);
    owner.money += mValue;
    tile.isMortgaged = true;
    
    if (typeof Events !== 'undefined') Events.emit('propertyMortgaged', { playerId, tileIndex });
    return true;
  }
  
  function unmortgageProperty(playerId, tileIndex, gameState) {
    const tile = gameState.tiles[tileIndex];
    if (tile.owner !== playerId || !tile.isMortgaged) return false;
    const owner = gameState.players.find(p => p.id === playerId);
    
    const cost = Math.floor((tile.mortgageValue || (tile.price / 2)) * 1.1);
    if (owner.money < cost) return false;
    
    owner.money -= cost;
    tile.isMortgaged = false;
    if (typeof Events !== 'undefined') Events.emit('propertyUnmortgaged', { playerId, tileIndex });
    return true;
  }
  
  function getPropertyValue(tileIndex, gameState) {
    const tile = gameState.tiles[tileIndex];
    let value = tile.price || 0;
    const owner = gameState.players.find(p => p.id === tile.owner);
    if (owner && owner.buildings && owner.buildings[tileIndex]) {
        const b = owner.buildings[tileIndex];
        value += (tile.houseCost || 50) * b.level;
    }
    return value;
  }
  
  function getAvailableBuildings(tileIndex, gameState) {
    const tile = gameState.tiles[tileIndex];
    const owner = gameState.players.find(p => p.id === tile.owner);
    const currentBuilding = owner && owner.buildings ? owner.buildings[tileIndex] : null;
    
    let available = ['house'];
    if (currentBuilding && currentBuilding.type === 'house') {
        Object.keys(BUILDING_PATHS).forEach(key => {
            if (currentBuilding.level >= BUILDING_PATHS[key].requires) {
                available.push(key);
            }
        });
    }
    return available;
  }
  
  function getPassiveIncome(playerId, gameState) {
    const owner = gameState.players.find(p => p.id === playerId);
    if (!owner || !owner.buildings) return 0;
    
    let income = 0;
    Object.values(owner.buildings).forEach(b => {
        if (b.type === 'mall') {
            income += BUILDING_PATHS.mall.passiveIncome * b.level;
        }
    });
    return income;
  }
  
  return { calculateRent, calculateStationRent, calculateUtilityRent, hasMonopoly, canBuild, build, getBuildCost, mortgageProperty, unmortgageProperty, getPropertyValue, getAvailableBuildings, getPassiveIncome, BUILDING_PATHS };
})();
