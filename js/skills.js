const Skills = (function() {
  'use strict';
  
  const CHARACTERS = {
    banker: {
      id: 'banker',
      icon: '🏦',
      color: '#00ffcc',
      passive: {
        name_id: 'Bunga Rendah', name_en: 'Low Interest',
        desc_id: 'Bunga pinjaman bank 3% (biasanya 5%)', desc_en: 'Bank loan interest 3% (normally 5%)',
        apply(player, context) { if(context.type === 'loan') context.rate = 0.03; }
      },
      active: {
        name_id: 'Bekukan Sewa', name_en: 'Freeze Rent',
        desc_id: 'Bekukan sewa 1 properti lawan selama 3 giliran', desc_en: 'Freeze rent on 1 opponent property for 3 turns',
        cooldown: 6,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 6;
        }
      }
    },
    engineer: {
      id: 'engineer',
      icon: '🔧',
      color: '#ffcc00',
      passive: {
        name_id: 'Efisiensi', name_en: 'Efficiency',
        desc_id: 'Biaya bangun -20%', desc_en: 'Build cost -20%',
        apply(player, context) { if(context.type === 'build') context.cost *= 0.8; }
      },
      active: {
        name_id: 'Upgrade Instan', name_en: 'Instant Upgrade',
        desc_id: 'Upgrade 1 bangunan gratis', desc_en: 'Upgrade 1 building for free',
        cooldown: 8,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 8;
        }
      }
    },
    trader: {
      id: 'trader',
      icon: '📈',
      color: '#ff66ff',
      passive: {
        name_id: 'Insting Pasar', name_en: 'Market Instinct',
        desc_id: 'Lihat tren saham', desc_en: 'See stock trends',
        apply(player, context) { }
      },
      active: {
        name_id: 'Paksa Tukar', name_en: 'Force Trade',
        desc_id: 'Paksa tukar properti dengan nilai setara', desc_en: 'Force trade property of equal value',
        cooldown: 10,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 10;
        }
      }
    },
    politician: {
      id: 'politician',
      icon: '🏛️',
      color: '#00ccff',
      passive: {
        name_id: 'Bebas Pajak', name_en: 'Tax Exempt',
        desc_id: 'Abaikan tile pajak', desc_en: 'Ignore tax tiles',
        apply(player, context) { if(context.type === 'tax') context.amount = 0; }
      },
      active: {
        name_id: 'Pajak Darurat', name_en: 'Emergency Tax',
        desc_id: 'Semua lawan bayar 15%', desc_en: 'All opponents pay 15%',
        cooldown: 6,
        execute(user, target, tileIndex, gs) {
          gs.players.forEach(p => { if(p.id !== user.id) { let tax = p.money * 0.15; p.money -= tax; user.money += tax; }});
          user.skillCooldown = 6;
        }
      }
    },
    gambler: {
      id: 'gambler',
      icon: '🎲',
      color: '#ff3333',
      passive: {
        name_id: 'Reroll', name_en: 'Reroll',
        desc_id: 'Bisa lempar ulang 1x per giliran', desc_en: 'Can reroll 1x per turn',
        apply(player, context) { }
      },
      active: {
        name_id: 'Jackpot', name_en: 'Jackpot',
        desc_id: 'Sewa digandakan 2 giliran', desc_en: 'Rent doubled 2 turns',
        cooldown: 8,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 8;
        }
      }
    },
    guardian: {
      id: 'guardian',
      icon: '🛡️',
      color: '#33ff33',
      passive: {
        name_id: 'Anti Lelang', name_en: 'Anti-Auction',
        desc_id: 'Kebal lelang paksa', desc_en: 'Immune to forced auction',
        apply(player, context) { }
      },
      active: {
        name_id: 'Perisai Sewa', name_en: 'Rent Shield',
        desc_id: 'Abaikan 2 pembayaran sewa berikutnya', desc_en: 'Ignore next 2 rent payments',
        cooldown: 5,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 5;
        }
      }
    }
  };
  
  function init(deps) {}
  function getCharacter(id) { return CHARACTERS[id]; }
  function applyPassive(player, context) { 
    if(player.character && CHARACTERS[player.character]) {
      CHARACTERS[player.character].passive.apply(player, context);
    }
  }
  function canUseActive(player) { return player.skillCooldown <= 0; }
  function useActive(player, target, data, gs) { 
    if(canUseActive(player) && player.character && CHARACTERS[player.character]) {
      CHARACTERS[player.character].active.execute(player, target, data, gs);
    }
  }
  function reduceCooldowns(player) { if(player.skillCooldown > 0) player.skillCooldown--; }
  function getAllCharacters() { return CHARACTERS; }
  
  return { init, getCharacter, applyPassive, canUseActive, useActive, reduceCooldowns, getAllCharacters, CHARACTERS };
})();
