/**
 * ============================================================================
 * MONOPOLY CYBERPUNK - WEBASSEMBLY HIGH PERFORMANCE CORE ENGINE
 * Bridge between Browser JavaScript and Compiled WebAssembly Binary Module
 * HARDCORE GRANDMASTER AI & ZERO-OVERHEAD GAME SIMULATION CORE
 * ============================================================================
 */

const WasmEngine = (function() {
  'use strict';
  
  let wasmInstance = null;
  let isLoaded = false;
  let isInitializing = false;
  let engineVersion = 0;

  // Embedded Wasm bytecode (base64) for zero-config local / file:// execution fallback
  const EMBEDDED_WASM_BASE64 = "AGFzbQEAAAABMgZgA39/fwF/YAd/f39/f39/AX9gBn9/f39/fwF/YAV/f39/fwF/YAR/f39/AX9gAAF/AwkIAAECAwQEBAUHrwEICGZhc3Rfcm5nAAATY2FsY3VsYXRlX3JlbnRfd2FzbQABFWV2YWx1YXRlX2J1eV9kZWNpc2lvbgACFGV2YWx1YXRlX2F1Y3Rpb25fYmlkAAMOZXZhbHVhdGVfdHJhZGUABBhzaW11bGF0ZV9iYW5rcnVwdGN5X3Jpc2sABRpldmFsdWF0ZV9idWlsZGluZ19wcmlvcml0eQAGEmdldF9lbmdpbmVfdmVyc2lvbgAHCtYCCCoAIAEgAk4EfyABBSAAIABBDXRzIABBEXZzQX9xIAIgAWtBAWpvIAFqCwsyAQF/IAAgAUUgAkEAR3EEf0ECbAULIANsQWRtIARsQWRtIAVsQWRtIAZsQWRtIQcgBws3ACABIABrIAVIBH9BAAVBpgQgAiADQQFrTgR/QcIDBSACQQBKBH9ByAEFQQALC2ogBEFabGoLCz4AIAIgA0EBa04Ef0G0AQVBWgsgAGxBZG0gBEFubEFkbSAEQW5sQWRtIAFByAFrTAR/IARBbmxBZG0FQQALCyIAIAAgAWsgAgR/QdgEBUEAC2ogAwR/QaAGBUEAC2tBAE4LIAAgAEEASAR/QWQFIAAgAkEEbCADak4Ef0EABUEoCwsLNQAgAkH6AUgEf0EABUGQAyAAQQFqQVBsaiAAQQRGIAFBAEdxBH9B3gIFQQALaiADQWRsagsLBQBB6g8L";

  function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function init() {
    if (isLoaded || isInitializing) return true;
    isInitializing = true;

    if (typeof WebAssembly === 'undefined') {
      console.warn('[WasmEngine] WebAssembly is not supported in this browser. Using JS fallback.');
      isInitializing = false;
      return false;
    }

    try {
      // 1. First attempt: Fetch and instantiate streaming from wasm/engine.wasm
      try {
        if (typeof fetch === 'function') {
          const response = await fetch('wasm/engine.wasm');
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            const module = await WebAssembly.instantiate(buffer, {});
            wasmInstance = module.instance.exports;
            isLoaded = true;
            engineVersion = wasmInstance.get_engine_version ? wasmInstance.get_engine_version() : 2026;
            console.log(`%c[WasmEngine] ⚡ Hardcore WebAssembly Core Loaded from file (v${engineVersion})`, 'color:#00ffff;font-weight:bold;');
            onEngineReady();
            return true;
          }
        }
      } catch (fetchErr) {
        // Fetch failed (e.g. CORS on local file:// or network error), continue to embedded bytecode
      }

      // 2. Second attempt: Instant embedded bytecode initialization
      const wasmBytes = base64ToUint8Array(EMBEDDED_WASM_BASE64);
      const module = await WebAssembly.instantiate(wasmBytes, {});
      wasmInstance = module.instance.exports;
      isLoaded = true;
      engineVersion = wasmInstance.get_engine_version ? wasmInstance.get_engine_version() : 2026;
      console.log(`%c[WasmEngine] ⚡ Hardcore WebAssembly Core Loaded from embedded binary (v${engineVersion})`, 'color:#00ffff;font-weight:bold;');
      onEngineReady();
      return true;

    } catch (e) {
      console.warn('[WasmEngine] WebAssembly initialization error, falling back to JS:', e);
      isLoaded = false;
    } finally {
      isInitializing = false;
    }
    return isLoaded;
  }

  function onEngineReady() {
    if (typeof Events !== 'undefined') {
      Events.emit('wasmEngineReady', { version: engineVersion, active: true });
    }
  }

  // High performance API methods with seamless JS fallbacks

  function isReady() {
    return isLoaded && wasmInstance !== null;
  }

  function getVersion() {
    return engineVersion || 2026;
  }

  /**
   * Fast high-entropy PRNG
   */
  function fastRng(min, max, seed = null) {
    if (seed === null) {
      seed = (Math.random() * 0xFFFFFFFF) >>> 0;
    }
    if (isReady() && wasmInstance.fast_rng) {
      return wasmInstance.fast_rng(seed, min, max);
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 7-Tier Fast Rent Calculator
   */
  function calculateRent(baseRent, buildingLevel, hasMonopoly, synergyPct = 100, economyModPct = 100, weatherModPct = 100, skillModPct = 100) {
    if (isReady() && wasmInstance.calculate_rent_wasm) {
      return wasmInstance.calculate_rent_wasm(
        baseRent,
        buildingLevel,
        hasMonopoly ? 1 : 0,
        Math.round(synergyPct),
        Math.round(economyModPct),
        Math.round(weatherModPct),
        Math.round(skillModPct)
      );
    }
    // JS Fallback
    let rent = baseRent;
    if (hasMonopoly && buildingLevel === 0) rent *= 2;
    rent = (rent * synergyPct) / 100;
    rent = (rent * economyModPct) / 100;
    rent = (rent * weatherModPct) / 100;
    rent = (rent * skillModPct) / 100;
    return Math.floor(rent);
  }

  /**
   * Hardcore AI Buy Evaluator (Returns Score 0-1000)
   */
  function evaluateBuyDecision(price, cash, ownedInGroup, groupSize, districtProps, minBuffer = 250) {
    if (isReady() && wasmInstance.evaluate_buy_decision) {
      return wasmInstance.evaluate_buy_decision(price, cash, ownedInGroup, groupSize, districtProps, minBuffer);
    }
    // JS Fallback
    if (cash - price < minBuffer) return 0;
    let score = 550;
    if (groupSize > 0 && ownedInGroup >= groupSize - 1) score += 450;
    else if (ownedInGroup > 0) score += 200;
    score += districtProps * 90;
    return score;
  }

  /**
   * Hardcore AI Auction Bid Evaluator (Snipe & Denial)
   */
  function evaluateAuctionBid(propertyPrice, cash, ownedInGroup, groupSize, currentBid) {
    if (isReady() && wasmInstance.evaluate_auction_bid) {
      return wasmInstance.evaluate_auction_bid(propertyPrice, cash, ownedInGroup, groupSize, currentBid);
    }
    // JS Fallback
    const maxRatio = (groupSize > 0 && ownedInGroup >= groupSize - 1) ? 1.8 : 0.90;
    const maxBid = Math.floor(propertyPrice * maxRatio);
    const nextBid = Math.floor(currentBid * 1.1) + 15;
    if (nextBid <= maxBid && cash - nextBid >= 200) {
      return nextBid;
    }
    return 0;
  }

  /**
   * Hardcore AI Trade Evaluator (Anti-Exploit & Monopoly Denial)
   */
  function evaluateTrade(offerValue, requestValue, myMonopoly = false, oppMonopoly = false) {
    if (isReady() && wasmInstance.evaluate_trade) {
      return wasmInstance.evaluate_trade(offerValue, requestValue, myMonopoly ? 1 : 0, oppMonopoly ? 1 : 0) === 1;
    }
    let net = offerValue - requestValue;
    if (myMonopoly) net += 600;
    if (oppMonopoly) net -= 800; // Hard denial
    return net >= 0;
  }

  /**
   * Bankruptcy Risk Simulator (0-100%)
   */
  function simulateBankruptcyRisk(cash, netWorth, avgOpponentRent, totalDebt = 0) {
    if (isReady() && wasmInstance.simulate_bankruptcy_risk) {
      return wasmInstance.simulate_bankruptcy_risk(cash, netWorth, avgOpponentRent, totalDebt);
    }
    if (cash < 0 || netWorth < 0) return 100;
    if (cash >= avgOpponentRent * 4 + totalDebt) return 0;
    return 35;
  }

  /**
   * Building Upgrade Priority Evaluator (Score 0-1000)
   */
  function evaluateBuildingPriority(currentLevel, hasMonopoly, cashAfterBuild, opponentsInRange = 0) {
    if (isReady() && wasmInstance.evaluate_building_priority) {
      return wasmInstance.evaluate_building_priority(currentLevel, hasMonopoly ? 1 : 0, cashAfterBuild, opponentsInRange);
    }
    if (cashAfterBuild < 250) return 0;
    let score = 400 + (currentLevel + 1) * 80;
    if (currentLevel === 4 && hasMonopoly) score += 350;
    if (opponentsInRange > 0) score += opponentsInRange * 100;
    return Math.min(1000, score);
  }

  // Auto initialize when loaded
  if (typeof window !== 'undefined') {
    init();
  }

  return {
    init,
    isReady,
    getVersion,
    fastRng,
    calculateRent,
    evaluateBuyDecision,
    evaluateAuctionBid,
    evaluateTrade,
    simulateBankruptcyRisk,
    evaluateBuildingPriority
  };
})();
