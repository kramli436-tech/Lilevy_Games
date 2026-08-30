const District = (function() {
  'use strict';
  
  const DISTRICTS = [
    { id:0, name_id:'Neon Utara', name_en:'Neon North', tiles:[] },
    { id:1, name_id:'Cyber Timur', name_en:'Cyber East', tiles:[] },
    { id:2, name_id:'Shadow Selatan', name_en:'Shadow South', tiles:[] },
    { id:3, name_id:'Data Barat', name_en:'Data West', tiles:[] },
    { id:4, name_id:'Pusat', name_en:'Central', tiles:[] },
    { id:5, name_id:'Zona Kuantum', name_en:'Quantum Zone', tiles:[] },
  ];
  
  function init(gameState) {
    DISTRICTS.forEach(d => d.tiles = []);
    if (gameState && gameState.tiles) {
        gameState.tiles.forEach(tile => {
            if (tile.district >= 0 && tile.district < DISTRICTS.length) {
                DISTRICTS[tile.district].tiles.push(tile.index);
            }
        });
    }
  }
  
  function getPlayerPropertiesInDistrict(playerId, districtId, gameState) {
    if (districtId < 0 || districtId >= DISTRICTS.length) return 0;
    let count = 0;
    DISTRICTS[districtId].tiles.forEach(tileIndex => {
        const tile = gameState.tiles[tileIndex];
        if (tile && tile.owner === playerId) count++;
    });
    return count;
  }
  
  function getSynergyLevel(playerId, districtId, gameState) {
    const count = getPlayerPropertiesInDistrict(playerId, districtId, gameState);
    if(count >= 4) return 'lord';
    if(count >= 3) return 'major';
    if(count >= 2) return 'minor';
    return 'none';
  }
  
  function getSynergyMultiplier(playerId, districtId, gameState) {
    const level = getSynergyLevel(playerId, districtId, gameState);
    return { none:1, minor:1.15, major:1.30, lord:1.50 }[level];
  }
  
  function getSynergyBonuses(playerId, gameState) {
    let bonuses = [];
    DISTRICTS.forEach(d => {
        const level = getSynergyLevel(playerId, d.id, gameState);
        if (level !== 'none') {
            bonuses.push({ district: d.id, level, multiplier: getSynergyMultiplier(playerId, d.id, gameState) });
        }
    });
    return bonuses;
  }
  
  function hasCrossDistrictSynergy(playerId, districtId, gameState) {
    const playerProps = getPlayerPropertiesInDistrict(playerId, districtId, gameState);
    const playerUtils = gameState.tiles.filter(t => t.type === 'utility' && t.owner === playerId).length;
    return playerProps > 0 && playerUtils > 0;
  }
  
  return { init, getPlayerPropertiesInDistrict, getSynergyLevel, getSynergyMultiplier, getSynergyBonuses, hasCrossDistrictSynergy, DISTRICTS };
})();
