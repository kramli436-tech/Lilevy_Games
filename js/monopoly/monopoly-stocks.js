/**
 * LILEVY GAMES - MONOPOLI PRO: BURSA EFEK & INVESTASI SAHAM GLOBAL (STOCK MARKET)
 * Sistem investasi pasar modal 4 sektor global dengan fluktuasi harga dinamis & deviden.
 */

class MonopolyStocks {
  constructor() {
    this.stocks = [
      { id: 'AIR', name: 'AeroGlobal Airlines', icon: '✈️', price: 500000, prevPrice: 500000, changePct: 0 },
      { id: 'NEX', name: 'Nexus Energy Corp', icon: '⚡', price: 800000, prevPrice: 800000, changePct: 0 },
      { id: 'APX', name: 'Apex Real Estate', icon: '🏙️', price: 1200000, prevPrice: 1200000, changePct: 0 },
      { id: 'AIX', name: 'CyberTech AI Silicon', icon: '🤖', price: 1500000, prevPrice: 1500000, changePct: 0 }
    ];

    this.playerPortfolios = {}; // { playerId: { 'AIR': 5, 'NEX': 2 } }
    this.turnCounter = 0;
  }

  getPortfolio(playerId) {
    if (!this.playerPortfolios[playerId]) {
      this.playerPortfolios[playerId] = { AIR: 0, NEX: 0, APX: 0, AIX: 0 };
    }
    return this.playerPortfolios[playerId];
  }

  // Dipanggil setiap putaran untuk memperbarui harga saham
  updateMarket(engine) {
    this.turnCounter++;

    this.stocks.forEach(s => {
      s.prevPrice = s.price;
      // Fluktuasi harga acak antara -25% sampai +30%
      const change = (Math.random() * 0.55) - 0.25;
      let newPrice = Math.max(100000, Math.floor(s.price * (1 + change)));
      s.price = newPrice;
      s.changePct = parseFloat((( (s.price - s.prevPrice) / s.prevPrice ) * 100).toFixed(1));
    });

    // Setiap 5 putaran, bagi deviden kepada pemegang saham!
    if (this.turnCounter % 5 === 0) {
      engine.players.forEach(p => {
        if (!p.isBankrupt) {
          const port = this.getPortfolio(p.id);
          let totalDiv = 0;
          this.stocks.forEach(s => {
            const shares = port[s.id] || 0;
            if (shares > 0) {
              totalDiv += Math.floor(shares * s.price * 0.1); // Deviden 10%
            }
          });
          if (totalDiv > 0) {
            p.money += totalDiv;
            engine.log(`💵 [DEVIDEN SAHAM] ${p.name} menerima deviden investasi saham ${engine.formatRupiah(totalDiv)}!`, 'success');
          }
        }
      });
    }
  }

  buyStock(engine, player, stockId, count = 1) {
    const stock = this.stocks.find(s => s.id === stockId);
    if (!stock) return { success: false, message: 'Saham tidak ditemukan.' };

    const totalCost = stock.price * count;
    if (player.money < totalCost) {
      return { success: false, message: `Saldo Anda tidak mencukupi untuk membeli ${count} lot saham (${engine.formatRupiah(totalCost)}).` };
    }

    player.money -= totalCost;
    const port = this.getPortfolio(player.id);
    port[stockId] = (port[stockId] || 0) + count;

    engine.log(`📈 [BURSA EFEK] ${player.name} membeli ${count} lot saham [${stock.name}] seharga ${engine.formatRupiah(totalCost)}.`, 'info');
    if (window.soundEngine) window.soundEngine.playType();

    if (engine.onStateChange) engine.onStateChange();
    return { success: true };
  }

  sellStock(engine, player, stockId, count = 1) {
    const stock = this.stocks.find(s => s.id === stockId);
    if (!stock) return { success: false, message: 'Saham tidak ditemukan.' };

    const port = this.getPortfolio(player.id);
    const owned = port[stockId] || 0;
    if (owned < count) {
      return { success: false, message: `Anda hanya memiliki ${owned} lot saham [${stock.name}].` };
    }

    const totalRevenue = stock.price * count;
    player.money += totalRevenue;
    port[stockId] -= count;

    engine.log(`💰 [JUAL SAHAM] ${player.name} menjual ${count} lot [${stock.name}] dan mencairkan dana ${engine.formatRupiah(totalRevenue)}!`, 'success');
    if (window.soundEngine) window.soundEngine.playWordSuccess();

    if (engine.onStateChange) engine.onStateChange();
    return { success: true };
  }
}

window.monopolyStocks = new MonopolyStocks();
