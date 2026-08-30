const BlackMarket = (function() {
  'use strict';
  
  const ITEMS = [
    { 
      id:'stimulant', name_id:'Stimulan Energi', name_en:'Stimulant', price:1000, riskChance:0.10, 
      desc_id:'Reset cooldown skill karakter seketika (Siap Pakai)', desc_en:'Reset skill cooldown instantly', 
      penalty:600, penaltyExtra:'disableSkill', 
      effect(user, target, gs) { 
        user.skillCooldown = 0; 
      } 
    },
    { 
      id:'dark_card_chip', name_id:'Chip Kartu Gelap', name_en:'Dark Card Chip', price:1100, riskChance:0.10, 
      desc_id:'Cetak & dapatkan 1 Kartu Aksi Taktis (Action Card) langka', desc_en:'Print & draw 1 rare Action Card to hand', 
      penalty:700, 
      effect(user, target, gs) { 
        if(typeof Cards !== 'undefined' && Cards.drawActionCard) {
          const card = Cards.drawActionCard();
          if(!user.cards) user.cards = [];
          if(user.cards.length < 3) {
            user.cards.push(card);
            if(typeof UI !== 'undefined') UI.showToast(`🃏 Mendapatkan kartu aksi: ${card.name_id || card.name_en}!`, 'success', 5000);
          } else {
            if(typeof UI !== 'undefined') UI.showToast(`🃏 Kartu di tangan penuh (Maks 3), kartu diuangkan +$1000!`, 'info', 5000);
            user.money += 1000;
          }
        }
      } 
    },
    { 
      id:'loaded_dice', name_id:'Dadu Magnetik', name_en:'Loaded Dice', price:1200, riskChance:0.15, 
      desc_id:'Manipulasi lemparan dadu berikutnya agar selalu tinggi (11/12)', desc_en:'Rig next dice roll to guarantee high roll (11/12)', 
      penalty:800, 
      effect(user, target, gs) { 
        user.loadedDice = true;
        if(typeof UI !== 'undefined') UI.showToast('🎲 Dadu Magnetik dipasang! Lemparan berikutnya dijamin tinggi!', 'success', 4000);
      } 
    },
    { 
      id:'masterkey', name_id:'Kunci Master', name_en:'Master Key', price:1300, riskChance:0.15, 
      desc_id:'Lewati 1x pembayaran sewa berikutnya saat mendarat di lawan', desc_en:'Skip next 1 rent payment', 
      penalty:900, penaltyExtra:'doubleRent', 
      effect(user, target, gs) { 
        user.skipRentCount = (user.skipRentCount || 0) + 1;
      } 
    },
    { 
      id:'spy', name_id:'Alat Mata-mata', name_en:'Spy Device', price:1400, riskChance:0.20, 
      desc_id:'Lihat saldo & jumlah kartu seluruh lawan secara live', desc_en:'See cards & money of all opponents', 
      penalty:950, 
      effect(user, target, gs) {
        if(typeof UI !== 'undefined') {
          const info = gs.players.filter(p => p.id !== user.id).map(p => `${p.name}: $${p.money} (${(p.cards||[]).length} kartu)`).join(' | ');
          UI.showToast(`🕵️ Data Lawan: ${info}`, 'info', 6000);
        }
      } 
    },
    { 
      id:'stock_jammer', name_id:'Pengacau Bursa', name_en:'Stock Jammer', price:1500, riskChance:0.20, 
      desc_id:'Naikkan harga seluruh saham yang Anda miliki sebesar +50%', desc_en:'Boost price of all owned stocks by +50%', 
      penalty:1000, 
      effect(user, target, gs) { 
        if(user.stocks && gs.stocks) {
          let boosted = false;
          Object.keys(user.stocks).forEach(sym => {
            if(user.stocks[sym] > 0 && gs.stocks[sym]) {
              gs.stocks[sym].price = Math.round(gs.stocks[sym].price * 1.50);
              boosted = true;
            }
          });
          if(typeof UI !== 'undefined') UI.showToast(boosted ? '📈 Harga saham portofolio Anda melonjak +50%!' : '📈 Sinyal bursa teracak!', 'success', 4000);
        }
      } 
    },
    { 
      id:'protection', name_id:'Perlindungan Siber', name_en:'Protection', price:1600, riskChance:0, 
      desc_id:'Kebal dari seluruh kartu serangan lawan selama 3 giliran', desc_en:'Immune to attack cards 3 turns', 
      penalty:0, 
      effect(user, target, gs) { 
        user.attackImmunity = 3;
      } 
    },
    { 
      id:'bank_siphon', name_id:'Kabel Sedot Kas', name_en:'Bank Siphon Wire', price:1750, riskChance:0.25, 
      desc_id:'Sedot $400 langsung dari kas setiap pemain lawan', desc_en:'Drain $400 directly from each opponent cash', 
      penalty:1200, 
      effect(user, target, gs) { 
        let totalDrained = 0;
        gs.players.forEach(p => {
          if(p.id !== user.id && !p.isBankrupt) {
            const drain = Math.min(400, p.money || 0);
            p.money -= drain;
            totalDrained += drain;
          }
        });
        user.money += totalDrained;
        if(typeof UI !== 'undefined') UI.showToast(`🧲 Berhasil menyedot total +$${totalDrained} dari kas lawan!`, 'success', 5000);
      } 
    },
    { 
      id:'counterfeit', name_id:'Uang Palsu', name_en:'Counterfeit Cash', price:1800, riskChance:0.30, 
      desc_id:'Dapatkan dana bersih +$3500 seketika (Risiko Penjara 30%)', desc_en:'Get +$3500 instant (30% Jail Risk)', 
      penalty:2500, penaltyExtra:'jail', 
      effect(user, target, gs) { 
        user.money += 3500; 
      } 
    },
    { 
      id:'emp_grenade', name_id:'Granat EMP', name_en:'EMP Grenade', price:2000, riskChance:0.25, 
      desc_id:'Padamkan sewa seluruh properti lawan terkaya selama 2 giliran', desc_en:'Freeze rent on all properties of richest opponent for 2 turns', 
      penalty:1400, 
      effect(user, target, gs) { 
        const opps = gs.players.filter(p => p.id !== user.id && !p.isBankrupt).sort((a, b) => (b.money || 0) - (a.money || 0));
        if(opps.length > 0) {
          const targetOpp = opps[0];
          if(!targetOpp.rentFrozenTiles) targetOpp.rentFrozenTiles = [];
          (targetOpp.properties || []).forEach(ti => {
            if(!targetOpp.rentFrozenTiles.includes(ti)) targetOpp.rentFrozenTiles.push(ti);
          });
          if(typeof UI !== 'undefined') UI.showToast(`💣 EMP meledak! Sewa milik ${targetOpp.name} dibekukan!`, 'warning', 5000);
        }
      } 
    },
    { 
      id:'forged', name_id:'Sertifikat Palsu', name_en:'Forged Deed', price:2200, riskChance:0.25, 
      desc_id:'Klaim 1 properti belum dibeli secara gratis', desc_en:'Claim 1 unowned property free', 
      penalty:1500, penaltyExtra:'loseProperty', 
      effect(user, target, gs) {
        const unowned = (gs.tiles || []).filter(t => (t.type === 'property' || t.type === 'station' || t.type === 'utility') && !t.owner);
        if(unowned.length > 0) {
          const chosen = unowned[0];
          chosen.owner = user.id;
          if(!user.properties) user.properties = [];
          user.properties.push(chosen.index);
          if(typeof UI !== 'undefined') UI.showToast(`📜 Berhasil klaim sertifikat ${chosen.name_id || chosen.name_en}!`, 'success', 5000);
        }
      } 
    },
    { 
      id:'building_overdrive', name_id:'Injektor Konstruksi', name_en:'Building Overdrive', price:2500, riskChance:0.30, 
      desc_id:'Upgrade 1 tingkat bangunan (rumah/hotel) gratis seketika', desc_en:'Instantly upgrade 1 building level for free', 
      penalty:1800, 
      effect(user, target, gs) { 
        if(user.properties && user.properties.length > 0) {
          const propId = user.properties[0];
          if(!user.buildings) user.buildings = {};
          if(!user.buildings[propId]) {
            user.buildings[propId] = { type: 'house', level: 1 };
          } else if(user.buildings[propId].level < 4) {
            user.buildings[propId].level += 1;
          } else if(user.buildings[propId].level === 4) {
            user.buildings[propId].level = 5;
            user.buildings[propId].type = 'hotel';
          }
          if(typeof UI !== 'undefined') UI.showToast(`🏗️ Bangunan pada ${gs.tiles[propId].name_id || 'Properti'} berhasil di-upgrade!`, 'success', 5000);
        }
      } 
    },
  ];
  
  function canAccess(playerPosition, gameState) {
      const tile = gameState.tiles[playerPosition];
      if (tile && tile.type === 'black_market') return true;
      return false;
  }
  
  function buyItem(playerId, itemId, targetId, gameState) {
    const user = gameState.players.find(p => p.id === playerId);
    const item = ITEMS.find(i => i.id === itemId);
    if (!user || !item) return { success: false, caught: false, item: null };
    
    if (user.money < item.price) return { success: false, caught: false, item: null };
    user.money -= item.price;
    
    if (Math.random() < item.riskChance) {
        user.money -= item.penalty;
        if(item.penaltyExtra === 'jail') user.jailTurns = 3;
        else if(item.penaltyExtra === 'disableSkill') user.skillCooldown = 999;
        if (typeof Events !== 'undefined') Events.emit('blackMarketCaught', { playerId, penalty: item.penalty, extra: item.penaltyExtra });
        return { success: false, caught: true, item: null };
    }
    
    const target = targetId ? gameState.players.find(p => p.id === targetId) : null;
    item.effect(user, target, gameState);
    
    if (!user.blackMarketItems) user.blackMarketItems = [];
    user.blackMarketItems.push({ id: itemId, turnsLeft: 3 });
    
    if (typeof Events !== 'undefined') Events.emit('blackMarketSuccess', { playerId, itemId });
    return { success: true, caught: false, item };
  }
  
  function getAvailableItems() { return ITEMS; }
  
  function hasActiveItem(playerId, itemId, gameState) {
      const user = gameState.players.find(p => p.id === playerId);
      if (!user || !user.blackMarketItems) return false;
      return user.blackMarketItems.some(i => i.id === itemId);
  }
  
  function tickItems(playerId, gameState) {
      const user = gameState.players.find(p => p.id === playerId);
      if (!user || !user.blackMarketItems) return;
      for (let i = user.blackMarketItems.length - 1; i >= 0; i--) {
          user.blackMarketItems[i].turnsLeft--;
          if (user.blackMarketItems[i].turnsLeft <= 0) {
              user.blackMarketItems.splice(i, 1);
          }
      }
  }
  
  return { canAccess, buyItem, getAvailableItems, hasActiveItem, tickItems, ITEMS };
})();
