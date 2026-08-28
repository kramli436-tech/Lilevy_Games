/**
 * MONOPOLI NUSANTARA & DUNIA - BANK & MORTGAGE SYSTEM
 * Mengelola pinjaman darurat bank, cicilan bunga, gadai tanah (50% harga),
 * serta tebus gadai properti pada Peta Nusantara & Dunia.
 */

class MonopolyBank {
  constructor() {
    this.loans = {}; // { [playerId]: { amount: number, interestRate: 0.08 } }
  }

  reset() {
    this.loans = {};
  }

  // Hitung Limit Pinjaman Maksimal (Maks 35% dari Net Worth)
  getMaxLoanLimit(engine, player) {
    const netWorth = engine.calculateNetWorth(player);
    const existingLoan = this.loans[player.id]?.amount || 0;
    const maxLimit = Math.floor(netWorth * 0.35);
    return Math.max(0, maxLimit - existingLoan);
  }

  takeLoan(engine, player, amount) {
    const maxLimit = this.getMaxLoanLimit(engine, player);
    if (amount <= 0 || amount > maxLimit) return { success: false, message: 'Jumlah pinjaman melebihi batas limit kredit Anda.' };

    if (!this.loans[player.id]) {
      this.loans[player.id] = { amount: 0, interestRate: 0.08 };
    }

    this.loans[player.id].amount += amount;
    player.money += amount;

    engine.log(`🏦 ${player.name} mengambil Pinjaman Bank sebesar ${engine.formatRupiah(amount)} (Bunga 8% per putaran).`, 'warning');
    if (window.soundEngine) window.soundEngine.playWordSuccess();
    if (engine.onStateChange) engine.onStateChange();
    return { success: true };
  }

  repayLoan(engine, player, amount) {
    const currentLoan = this.loans[player.id]?.amount || 0;
    if (currentLoan <= 0) return { success: false, message: 'Anda tidak memiliki pinjaman aktif di Bank.' };

    const payAmount = Math.min(amount, currentLoan);
    if (player.money < payAmount) return { success: false, message: 'Saldo uang tunai tidak mencukupi untuk membayar cicilan.' };

    player.money -= payAmount;
    this.loans[player.id].amount -= payAmount;

    engine.log(`💳 ${player.name} membayar pinjaman Bank sebesar ${engine.formatRupiah(payAmount)}. Sisa utang: ${engine.formatRupiah(this.loans[player.id].amount)}.`, 'success');
    if (engine.onStateChange) engine.onStateChange();
    return { success: true };
  }

  processLoanInterest(engine, player) {
    const loan = this.loans[player.id];
    if (loan && loan.amount > 0) {
      const interest = Math.floor(loan.amount * loan.interestRate);
      if (player.money >= interest) {
        player.money -= interest;
        engine.log(`📉 ${player.name} membayar bunga pinjaman Bank sebesar ${engine.formatRupiah(interest)}.`);
      } else {
        loan.amount += interest;
        engine.log(`⚠️ Saldo ${player.name} tidak cukup bayar bunga, bunga ${engine.formatRupiah(interest)} diakumulasikan ke pokok utang.`, 'danger');
      }
    }
  }

  mortgageProperty(engine, player, tileId) {
    const tile = engine.activeTiles[tileId];
    const prop = engine.propertyState[tileId];

    if (!tile || !prop || prop.ownerId !== player.id) return { success: false, message: 'Anda bukan pemilik properti ini.' };
    if (prop.isMortgaged) return { success: false, message: 'Properti ini sudah dalam status digadaikan.' };
    if (prop.houses > 0 || prop.isHotel) return { success: false, message: 'Jual semua rumah terlebih dahulu sebelum menggadaikan tanah.' };

    const mortgageValue = Math.floor((tile.price || 0) * 0.5);
    prop.isMortgaged = true;
    player.money += mortgageValue;

    engine.log(`📜 ${player.name} MENGGADAIKAN [${tile.name}] dan menerima dana ${engine.formatRupiah(mortgageValue)}. (Bebas sewa)`, 'warning');
    if (engine.onStateChange) engine.onStateChange();
    return { success: true, amount: mortgageValue };
  }

  unmortgageProperty(engine, player, tileId) {
    const tile = engine.activeTiles[tileId];
    const prop = engine.propertyState[tileId];

    if (!tile || !prop || prop.ownerId !== player.id || !prop.isMortgaged) return { success: false, message: 'Properti tidak dalam status gadai.' };

    const redeemCost = Math.floor((tile.price || 0) * 0.55);
    if (player.money < redeemCost) return { success: false, message: `Saldo tidak mencukupi untuk menebus gadai (${engine.formatRupiah(redeemCost)}).` };

    player.money -= redeemCost;
    prop.isMortgaged = false;

    engine.log(`✨ ${player.name} MENEBUS GADAI [${tile.name}] seharga ${engine.formatRupiah(redeemCost)}. Sewa aktif kembali!`, 'success');
    if (engine.onStateChange) engine.onStateChange();
    return { success: true };
  }
}

window.monopolyBank = new MonopolyBank();
