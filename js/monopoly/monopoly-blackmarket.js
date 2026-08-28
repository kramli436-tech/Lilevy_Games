/**
 * LILEVY GAMES - MONOPOLI PRO: PASAR GELAP & KARTU SABOTASE (BLACK MARKET)
 * Sistem kartu taktis rahasia untuk menyerang lawan, sabotase pajak, akuisisi paksa & perisai kebal.
 */

class MonopolyBlackMarket {
  constructor() {
    this.catalog = [
      {
        id: 'tax_audit',
        name: 'Audit Pajak Kejutan',
        icon: '💼',
        cost: 2000000,
        desc: 'Menyerang pemain terkaya dan mengenakan denda pajak 15% dari total kekayaan bersihnya ke kas negara.',
        action: (engine, user) => {
          const targets = engine.players.filter(p => p.id !== user.id && !p.isBankrupt);
          if (targets.length === 0) return { success: false, message: 'Tidak ada target pemain.' };
          targets.sort((a, b) => b.money - a.money);
          const victim = targets[0];
          const tax = Math.floor(victim.money * 0.15);
          victim.money -= tax;
          engine.log(`💼 [SABOTASE AUDIT PAJAK] ${user.name} meluncurkan audit pajak ke ${victim.name}! ${victim.name} didenda pajak ${engine.formatRupiah(tax)}!`, 'danger');
          if (window.soundEngine) window.soundEngine.playVictory();
          return { success: true };
        }
      },
      {
        id: 'hostile_takeover',
        name: 'Akuisisi Paksa (Hostile Takeover)',
        icon: '🏴‍☠️',
        cost: 3500000,
        desc: 'Membeli paksa 1 petak tanah kosong milik lawan seharga 2.5x lipat harga pasar.',
        action: (engine, user) => {
          const enemyProps = engine.activeTiles.filter(t => {
            const p = engine.propertyState[t.id];
            return p && p.ownerId && p.ownerId !== user.id && p.houses === 0 && !p.isHotel;
          });
          if (enemyProps.length === 0) return { success: false, message: 'Tidak ada tanah kosong lawan yang bisa diakuisisi.' };
          const target = enemyProps[Math.floor(Math.random() * enemyProps.length)];
          const owner = engine.players.find(p => p.id === engine.propertyState[target.id].ownerId);
          const buyoutPrice = Math.floor(target.price * 2.5);

          if (user.money < buyoutPrice) return { success: false, message: `Saldo Anda tidak cukup untuk akuisisi paksa (${engine.formatRupiah(buyoutPrice)}).` };

          user.money -= buyoutPrice;
          if (owner) owner.money += buyoutPrice;
          engine.propertyState[target.id].ownerId = user.id;

          engine.log(`🏴‍☠️ [AKUISISI PAKSA] ${user.name} merebut paksa properti [${target.name}] dari ${owner?.name || 'Lawan'} seharga ${engine.formatRupiah(buyoutPrice)}!`, 'success');
          if (window.soundEngine) window.soundEngine.playWordSuccess();
          return { success: true };
        }
      },
      {
        id: 'shield',
        name: 'Perisai Kebal Hukum',
        icon: '🛡️',
        cost: 1500000,
        desc: 'Memberikan perisai kebal 1x bebas sewa saat mendarat di properti musuh.',
        action: (engine, user) => {
          user.hasShield = true;
          engine.log(`🛡️ [PERISAI KEBAL] ${user.name} mengaktifkan perisai kebal sewa untuk 1x pendaratan berikutnya!`, 'success');
          if (window.soundEngine) window.soundEngine.playWordSuccess();
          return { success: true };
        }
      },
      {
        id: 'blackout_target',
        name: 'Pemadaman Listrik Sasaran',
        icon: '⚡',
        cost: 1800000,
        desc: 'Menonaktifkan tarif sewa seluruh properti milik 1 lawan selama 1 putaran penuh.',
        action: (engine, user) => {
          const targets = engine.players.filter(p => p.id !== user.id && !p.isBankrupt);
          if (targets.length === 0) return { success: false, message: 'Tidak ada target lawan.' };
          const victim = targets[Math.floor(Math.random() * targets.length)];
          victim.isBlackedOut = true;
          engine.log(`⚡ [SABOTASE LISTRIK] ${user.name} mematikan listrik seluruh kawasan [${victim.name}]! Bebas sewa selama 1 putaran!`, 'warning');
          if (window.soundEngine) window.soundEngine.playHint();
          return { success: true };
        }
      }
    ];

    this.playerHands = {}; // Inventori kartu pemain: { playerId: [cardId, cardId] }
  }

  getPlayerCards(playerId) {
    if (!this.playerHands[playerId]) this.playerHands[playerId] = [];
    return this.playerHands[playerId];
  }

  buyCard(engine, player, cardId) {
    const card = this.catalog.find(c => c.id === cardId);
    if (!card) return { success: false, message: 'Kartu tidak valid.' };

    const hand = this.getPlayerCards(player.id);
    if (hand.length >= 3) {
      return { success: false, message: 'Inventori kartu penuh (Maksimal 3 kartu sabotase).' };
    }

    if (player.money < card.cost) {
      return { success: false, message: `Saldo tunai tidak mencukupi (${engine.formatRupiah(card.cost)}).` };
    }

    player.money -= card.cost;
    hand.push(card);
    engine.log(`🕵️‍♂️ ${player.name} membeli kartu sabotase [${card.name}] dari Pasar Gelap seharga ${engine.formatRupiah(card.cost)}.`, 'info');
    if (window.soundEngine) window.soundEngine.playType();

    if (engine.onStateChange) engine.onStateChange();
    return { success: true, card };
  }

  useCard(engine, player, cardIndex) {
    const hand = this.getPlayerCards(player.id);
    if (cardIndex < 0 || cardIndex >= hand.length) return { success: false, message: 'Kartu tidak ditemukan.' };

    const card = hand[cardIndex];
    const res = card.action(engine, player);

    if (res.success) {
      hand.splice(cardIndex, 1);
      if (engine.onStateChange) engine.onStateChange();
      return { success: true };
    }
    return res;
  }
}

window.monopolyBlackMarket = new MonopolyBlackMarket();
