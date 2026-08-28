/**
 * MONOPOLI NUSANTARA & DUNIA - CHARACTER ABILITIES MODULE
 * Mengelola kemampuan pasif dan efek khusus dari 8+ token karakter.
 */

class MonopolySkills {
  constructor() {
    this.usedJailImmunities = new Set();
    this.usedEmperorShields = new Set();
  }

  reset() {
    this.usedJailImmunities.clear();
    this.usedEmperorShields.clear();
  }

  getPurchaseCostModifier(player, originalPrice) {
    if (player.token === '🎩') {
      // Sultan: Diskon 10%
      return Math.floor(originalPrice * 0.9);
    }
    if (player.token === '👑') {
      // Kaisar: Diskon 15%
      return Math.floor(originalPrice * 0.85);
    }
    return originalPrice;
  }

  getPassGoBonus(player, defaultReward) {
    if (player.token === '🎩' || player.token === '👑') {
      return defaultReward + 500000;
    }
    return defaultReward;
  }

  isTaxExempt(player, tile) {
    if (player.token === '🚗' && tile.type === 'tax') {
      return 0.5; // Diskon 50%
    }
    if (player.token === '🐕' && tile.type === 'tax') {
      return 0.5; // Diskon 50%
    }
    if (player.token === '👑' && tile.type === 'tax') {
      return 0.5; // Diskon 50%
    }
    return 1.0;
  }

  isStationRentExempt(player, tile) {
    if (player.token === '🚢' && (tile.group === 'STATION' || tile.group === 'WORLD_STATION')) {
      return true;
    }
    return false;
  }

  modifyRentByOwner(owner, tile, baseRent) {
    if (owner.token === '🚢' && ['YELLOW', 'GREEN', 'BLUE', 'OCEANIA', 'LATIN_AFRICA'].includes(tile.group)) {
      return Math.floor(baseRent * 1.25);
    }
    if (owner.token === '🚀' && (tile.group === 'UTILITY' || tile.group === 'WORLD_UTILITY')) {
      return baseRent * 2;
    }
    if (owner.token === '🏎️' && ['BROWN', 'ASIA_EAST', 'EUROPE_WEST', 'NORTH_AMERICA_EAST'].includes(tile.group)) {
      // Juara Formula: +30% sewa kota metropolitan utama
      return Math.floor(baseRent * 1.3);
    }
    return baseRent;
  }

  getHouseBuildingCost(player, baseCost) {
    if (player.token === '🚀' || player.token === '👑') {
      return Math.floor(baseCost * 0.85); // Diskon 15%
    }
    return baseCost;
  }

  checkJailImmunity(player) {
    if (player.token === '🐕' && !this.usedJailImmunities.has(player.id)) {
      this.usedJailImmunities.add(player.id);
      return true;
    }
    return false;
  }

  // Cek Kaisar Properti Bebas Sewa 1x
  checkEmperorFreeRent(player) {
    if (player.token === '👑' && !this.usedEmperorShields.has(player.id)) {
      this.usedEmperorShields.add(player.id);
      return true;
    }
    return false;
  }
}

window.monopolySkills = new MonopolySkills();
