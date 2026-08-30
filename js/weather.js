const Weather = (function() {
  'use strict';
  
  const TYPES = [
    { id:'sunny', icon:'☀️', weight:20, effects:{ rentMod:1.15, canBuild:true, moveMod:0, utilityCostMod:1, extraCost:0, visibilityReduced:false, bonusMod:1 } },
    { id:'rain', icon:'🌧️', weight:15, effects:{ rentMod:0.8, canBuild:true, moveMod:0, utilityCostMod:1, extraCost:0, visibilityReduced:false, bonusMod:1 } },
    { id:'storm', icon:'⛈️', weight:8, effects:{ rentMod:1, canBuild:false, moveMod:0, utilityCostMod:1, extraCost:0, visibilityReduced:false, bonusMod:1, damageChance:0.1 } },
    { id:'fog', icon:'🌫️', weight:12, effects:{ rentMod:1, canBuild:true, moveMod:0, utilityCostMod:1, extraCost:0, visibilityReduced:true, bonusMod:1 } },
    { id:'blizzard', icon:'❄️', weight:6, effects:{ rentMod:1, canBuild:true, moveMod:-2, utilityCostMod:1, extraCost:0, visibilityReduced:false, bonusMod:1 } },
    { id:'heatwave', icon:'🔥', weight:8, effects:{ rentMod:1, canBuild:true, moveMod:0, utilityCostMod:2, extraCost:50, visibilityReduced:false, bonusMod:1 } },
    { id:'clear', icon:'🌈', weight:15, effects:{ rentMod:1, canBuild:true, moveMod:0, utilityCostMod:1, extraCost:0, visibilityReduced:false, bonusMod:1.1 } },
    { id:'aurora', icon:'🌌', weight:8, effects:{ rentMod:1.25, canBuild:true, moveMod:1, utilityCostMod:1, extraCost:0, visibilityReduced:false, bonusMod:1.2 } },
    { id:'acidRain', icon:'🧪', weight:8, effects:{ rentMod:0.85, canBuild:false, moveMod:0, utilityCostMod:1, extraCost:30, visibilityReduced:false, bonusMod:1 } },
    { id:'solarEclipse', icon:'🌑', weight:6, effects:{ rentMod:0.7, canBuild:true, moveMod:0, utilityCostMod:1, extraCost:0, visibilityReduced:true, bonusMod:0.9 } },
    { id:'cyberSmog', icon:'💨', weight:8, effects:{ rentMod:1, canBuild:true, moveMod:0, utilityCostMod:1.5, extraCost:20, visibilityReduced:true, bonusMod:1 } },
  ];
  
  function init(gameState) {
      gameState.weather = { current: 'clear', districts: [], turnsLeft: 4 };
  }
  
  function changeWeather(gameState) {
    let totalWeight = TYPES.reduce((sum, t) => sum + t.weight, 0);
    let rand = Math.random() * totalWeight;
    let selected = TYPES[0];
    for (let t of TYPES) {
        if (rand < t.weight) { selected = t; break; }
        rand -= t.weight;
    }
    
    gameState.weather.current = selected.id;
    gameState.weather.turnsLeft = 3 + Math.floor(Math.random() * 3);
    
    if (Math.random() < 0.1) {
        gameState.weather.districts = []; 
    } else {
        const numDistricts = 1 + Math.floor(Math.random() * 2);
        let districts = new Set();
        while(districts.size < numDistricts) {
            districts.add(Math.floor(Math.random() * 6));
        }
        gameState.weather.districts = Array.from(districts);
    }
    
    if (typeof Events !== 'undefined') Events.emit('weatherChanged', gameState.weather);
  }
  
  function tickWeather(gameState) { 
      gameState.weather.turnsLeft--;
      if (gameState.weather.turnsLeft <= 0) {
          changeWeather(gameState);
      }
  }
  
  function getRentModifier(districtId, gameState) {
    if(!gameState.weather || !gameState.weather.current) return 1;
    if(gameState.weather.districts.length === 0 || gameState.weather.districts.includes(districtId)) {
      const w = TYPES.find(t => t.id === gameState.weather.current);
      return w ? w.effects.rentMod : 1;
    }
    return 1;
  }
  
  function canBuildInWeather(districtId, gameState) {
      if(!gameState.weather || !gameState.weather.current) return true;
      if(gameState.weather.districts.length === 0 || gameState.weather.districts.includes(districtId)) {
          const w = TYPES.find(t => t.id === gameState.weather.current);
          if (w && !w.effects.canBuild) return false;
      }
      return true;
  }
  
  function getMovementModifier(gameState) {
      const w = TYPES.find(t => t.id === gameState.weather.current);
      return w ? w.effects.moveMod : 0;
  }
  
  function getWeatherInfo(weatherId) { 
      return TYPES.find(t => t.id === weatherId); 
  }
  
  function getExtraCost(gameState) {
      const w = TYPES.find(t => t.id === gameState.weather.current);
      return w ? w.effects.extraCost : 0;
  }
  
  return { init, changeWeather, tickWeather, getRentModifier, canBuildInWeather, getMovementModifier, getWeatherInfo, getExtraCost, TYPES };
})();
