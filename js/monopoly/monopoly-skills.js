/**
 * MONOPOLI NUSANTARA, DUNIA & GALAKSI - CHARACTER ABILITIES MODULE
 * Mengelola kemampuan pasif dan efek khusus dari 16 token karakter unik.
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

  // 1. Diskon Pembelian Properti Baru
  getPurchaseCostModifier(player, originalPrice) {
    if (player.token === '🎩') {
      // Sultan: Diskon 10%
      return Math.floor(originalPrice * 0.90);
    }
    if (player.token === '👑') {
      // Kaisar: Diskon 15%
      return Math.floor(originalPrice * 0.85);
    }
    if (player.token === '🤖') {
      // AI Master: Diskon 10%
      return Math.floor(originalPrice * 0.90);
    }
    return originalPrice;
  }

  // 2. Bonus Gaji Petak MULAI
  getPassGoBonus(player, defaultReward) {
    if (player.token === '🎩' || player.token === '👑') {
      return defaultReward + 500000;
    }
    if (player.token === '🛸') {
      return defaultReward + 750000;
    }
    return defaultReward;
  }

  // 3. Diskon / Bebas Pajak
  isTaxExempt(player, tile) {
    if (player.token === '🚗' && tile.type === 'tax') return 0.5; // Diskon 50%
    if (player.token === '🐕' && tile.type === 'tax') return 0.5; // Diskon 50%
    if (player.token === '👑' && tile.type === 'tax') return 0.5; // Diskon 50%
    if (player.token === '🧙‍♂️' && tile.type === 'tax') return 0.0; // Bebas Pajak 100%
    return 1.0;
  }

  // 4. Bebas Sewa Stasiun & Bandara
  isStationRentExempt(player, tile) {
    if (player.token === '🚢' && (tile.group === 'STATION' || tile.group === 'WORLD_STATION')) {
      return true;
    }
    if (player.token === '✈️' && (tile.group === 'STATION' || tile.group === 'WORLD_STATION')) {
      return true;
    }
    return false;
  }

  // 5. Modifikasi Pendapatan Sewa Pemilik (Owner Rent Boost)
  modifyRentByOwner(owner, tile, baseRent) {
    // Kapten Maritim: +25% sewa wilayah kepulauan / pantai
    if (owner.token === '🚢' && ['YELLOW', 'GREEN', 'BLUE', 'OCEANIA', 'LATIN_AFRICA'].includes(tile.group)) {
      return Math.floor(baseRent * 1.25);
    }
    // Visioner Teknologi: Sewa Utilitas 2x lipat
    if (owner.token === '🚀' && (tile.group === 'UTILITY' || tile.group === 'WORLD_UTILITY')) {
      return baseRent * 2;
    }
    // Juara Formula: +30% sewa kota metropolitan utama
    if (owner.token === '🏎️' && ['BROWN', 'ASIA_EAST', 'EUROPE_WEST', 'NORTH_AMERICA_EAST'].includes(tile.group)) {
      return Math.floor(baseRent * 1.30);
    }
    // Raja Rimba: +35% sewa destinasi alam & fauna nusantara
    if (owner.token === '🦁' && ['ORANGE', 'PINK', 'RED', 'AFRICA_MIDDLE_EAST'].includes(tile.group)) {
      return Math.floor(baseRent * 1.35);
    }
    return baseRent;
  }

  // 6. Diskon Pembayaran Sewa untuk Penyewa (Visitor Rent Reduction)
  getPayRentDiscount(player, rent) {
    if (player.token === '🛡️') {
      // Ksatria Pelindung: Diskon 20% seluruh sewa
      return Math.floor(rent * 0.80);
    }
    if (player.token === '✈️') {
      // Pilot Elit: Diskon 15% sewa lintas wilayah
      return Math.floor(rent * 0.85);
    }
    return rent;
  }

  // 7. Diskon Konstruksi Bangunan (Rumah, Hotel & Skyscraper)
  getHouseBuildingCost(player, baseCost) {
    if (player.token === '🚀' || player.token === '👑') {
      return Math.floor(baseCost * 0.85); // Diskon 15%
    }
    if (player.token === '🤖') {
      return Math.floor(baseCost * 0.80); // Diskon 20%
    }
    return baseCost;
  }

  // 8. Kebal Masuk Penjara (1x Per Game)
  checkJailImmunity(player) {
    if (player.token === '🐕' && !this.usedJailImmunities.has(player.id)) {
      this.usedJailImmunities.add(player.id);
      return true;
    }
    return false;
  }

  // 9. Kaisar Properti Bebas Sewa 1x
  checkEmperorFreeRent(player) {
    if (player.token === '👑' && !this.usedEmperorShields.has(player.id)) {
      this.usedEmperorShields.add(player.id);
      return true;
    }
    return false;
  }

  // 10. Ratu Permata (Gem Queen): Dividen Kas saat Pemain Lain Mendarat di Asetnya
  triggerLandingPerks(owner, visitor, tile, engine) {
    if (owner.token === '💎' && owner.id !== visitor.id) {
      const dividend = 500000;
      owner.money += dividend;
      engine.log(`💎 [DIVIDEN RATU PERMATA] ${owner.name} menerima royalti tamu ${engine.formatRupiah(dividend)} dari Kas Pusat!`, 'success');
    }
  }

  // 11. Penjelajah Antariksa / Pegasus: Bonus Langkah & Jalur
  triggerPassingTileBonus(player, tile, engine) {
    if (player.token === '🛸' && (tile.type === 'station' || tile.type === 'utility')) {
      const bonus = 500000;
      player.money += bonus;
      engine.log(`🛸 [SUBSIDI ANTARIKSA] ${player.name} mengisi daya energi di [${tile.name}] dan menerima bonus ${engine.formatRupiah(bonus)}!`, 'success');
    }
  }
}

window.monopolySkills = new MonopolySkills();
