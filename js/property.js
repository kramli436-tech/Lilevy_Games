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
    
    let rent = tile.rent ? tile.rent[0] : 10; 
    const building = owner.buildings ? owner.buildings[tile.index] : null;
    let buildingLevel = 0;
    
    if(building) {
      buildingLevel = building.level || 0;
      if(building.type === 'house') rent = tile.rent[building.level] || tile.rent[0];
      else if(building.type === 'hotel') rent = tile.rent[5] || (tile.rent[0] * 40);
      else if(building.type === 'mall') rent = (tile.rent[Math.min(building.level, 2)] || tile.rent[0]) * 1.5;
      else if(building.type === 'hq') rent = (tile.rent[Math.min(building.level, 2)] || tile.rent[0]) * 1.3;
      else if(building.type === 'casino') rent = (tile.rent[1] || tile.rent[0]) * (0.5 + Math.random() * 2.5);
      else if(building.type === 'fortress') rent = (tile.rent[Math.min(building.level, 3)] || tile.rent[0]) * 1.2;
    }

    const isMono = hasMonopoly(tile.owner, tile.group, gameState);
    const synergyMult = (typeof District !== 'undefined' && District.getSynergyMultiplier) ? District.getSynergyMultiplier(tile.owner, tile.district, gameState) : 1;
    const econMult = (gameState.economy && gameState.economy.modifiers && gameState.economy.modifiers.rent) ? gameState.economy.modifiers.rent : 1;
    const weatherMult = (typeof Weather !== 'undefined' && Weather.getRentModifier) ? Weather.getRentModifier(tile.district, gameState) : 1;
    const skillMult = (owner.character === 'gambler' && gameState.activeSkills && gameState.activeSkills[owner.id] === 'doubleRent') ? 2 : 1;

    // Use WebAssembly core if ready
    if(typeof WasmEngine !== 'undefined' && WasmEngine.isReady()) {
      let finalRent = WasmEngine.calculateRent(
        Math.round(rent),
        buildingLevel,
        isMono && !building,
        synergyMult * 100,
        econMult * 100,
        weatherMult * 100,
        skillMult * 100
      );
      const jv = owner.jointVentures ? owner.jointVentures.find(j => j.tileIndex === tile.index) : null;
      if(jv) finalRent = Math.floor(finalRent * 1.2);
      return finalRent;
    }

    // JS Fallback
    if(isMono && !building) rent *= 2;
    rent *= synergyMult;
    rent *= econMult;
    rent *= weatherMult;
    rent *= skillMult;

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
    if (!tile || tile.owner !== playerId) return { canBuild: false, reason: 'Not the owner', cost: 0 };
    if (tile.isMortgaged) return { canBuild: false, reason: 'Property is mortgaged', cost: 0 };

    const owner = gameState.players.find(p => p.id === playerId);
    if (!owner) return { canBuild: false, reason: 'Owner not found', cost: 0 };

    const currentBuilding = owner.buildings ? owner.buildings[tileIndex] : null;
    const currentLevel = currentBuilding ? currentBuilding.level : 0;
    const currentType = currentBuilding ? currentBuilding.type : 'none';

    // Hotel requires full color monopoly and 4 houses
    if (buildingType === 'hotel') {
      if (!hasMonopoly(playerId, tile.group, gameState)) {
        return { canBuild: false, reason: 'Requires full color monopoly to build Hotel', cost: 0 };
      }
      if (currentLevel < 4) {
        return { canBuild: false, reason: 'Requires 4 houses before upgrading to Hotel', cost: 0 };
      }
      if (currentType === 'hotel') {
        return { canBuild: false, reason: 'Already a hotel', cost: 0 };
      }
    } else if (buildingType === 'house') {
      if (currentType === 'hotel' || currentLevel >= 4) {
        return { canBuild: false, reason: 'Max 4 houses reached (Hotel requires full color monopoly)', cost: 0 };
      }
    } else if (BUILDING_PATHS[buildingType]) {
      const path = BUILDING_PATHS[buildingType];
      if (currentLevel < path.requires) {
        return { canBuild: false, reason: `Requires at least ${path.requires} houses`, cost: 0 };
      }
    }

    if (typeof Weather !== 'undefined' && !Weather.canBuildInWeather(tile.district, gameState)) {
        return { canBuild: false, reason: 'Weather prevents building', cost: 0 };
    }

    const cost = getBuildCost(tile, buildingType, gameState);
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
    const currentLevel = currentBuilding ? currentBuilding.level : 0;
    
    let available = [];
    if (!currentBuilding || currentBuilding.type === 'house') {
      if (currentLevel < 4) {
        available.push('house');
      }
      Object.keys(BUILDING_PATHS).forEach(key => {
        if (currentLevel >= BUILDING_PATHS[key].requires) {
          if (key === 'hotel') {
            if (hasMonopoly(owner.id, tile.group, gameState)) {
              available.push(key);
            }
          } else {
            available.push(key);
          }
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
