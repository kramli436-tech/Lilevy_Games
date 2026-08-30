const Skills = (function() {
  'use strict';
  
  const CHARACTERS = {
    banker: {
      id: 'banker',
      name_id: 'Banker (Bankir)',
      name_en: 'Banker',
      icon: '💼',
      color: '#00ffcc',
      passive: {
        name_id: 'Bunga Rendah', name_en: 'Low Interest',
        desc_id: 'Bunga pinjaman bank 3% (biasanya 5%)', desc_en: 'Bank loan interest 3% (normally 5%)',
        apply(player, context) { if(context.type === 'loan') context.rate = 0.03; }
      },
      active: {
        name_id: 'Bekukan Sewa', name_en: 'Freeze Rent',
        desc_id: 'Bekukan sewa 1 properti termahal lawan selama 3 giliran', desc_en: 'Freeze rent on 1 opponent property for 3 turns',
        cooldown: 6,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 6;
          if (!gs && typeof Game !== 'undefined') gs = Game.getState();
          if (!gs) return;
          if(target && tileIndex !== undefined) {
            if(!target.rentFrozenTiles) target.rentFrozenTiles = [];
            target.rentFrozenTiles.push(tileIndex);
          } else {
            const opps = (gs.players || []).filter(p => p.id !== user.id && !p.isBankrupt);
            let bestTile = null, bestOwner = null, maxRent = 0;
            opps.forEach(op => {
              (op.properties || []).forEach(ti => {
                const t = gs.tiles ? gs.tiles[ti] : null;
                if(t && t.price > maxRent) { maxRent = t.price; bestTile = ti; bestOwner = op; }
              });
            });
            if(bestOwner && bestTile !== null) {
              if(!bestOwner.rentFrozenTiles) bestOwner.rentFrozenTiles = [];
              bestOwner.rentFrozenTiles.push(bestTile);
            }
          }
        }
      }
    },
    engineer: {
      id: 'engineer',
      name_id: 'Engineer (Insinyur)',
      name_en: 'Engineer',
      icon: '🔧',
      color: '#ffcc00',
      passive: {
        name_id: 'Efisiensi Konstruksi', name_en: 'Efficiency',
        desc_id: 'Biaya bangun rumah & hotel diskon 20%', desc_en: 'Build cost -20%',
        apply(player, context) { if(context.type === 'build') context.cost *= 0.8; }
      },
      active: {
        name_id: 'Upgrade Instan', name_en: 'Instant Upgrade',
        desc_id: 'Menaikkan 1 level bangunan properti sendiri secara gratis', desc_en: 'Upgrade 1 building for free',
        cooldown: 7,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 7;
          if(user.properties && user.properties.length > 0) {
            let targetProp = user.properties[0];
            if(tileIndex !== undefined && user.properties.includes(tileIndex)) targetProp = tileIndex;
            if(!user.buildings) user.buildings = {};
            if(!user.buildings[targetProp]) {
              user.buildings[targetProp] = { type: 'house', level: 1 };
            } else if(user.buildings[targetProp].level < 4) {
              user.buildings[targetProp].level += 1;
            } else if(user.buildings[targetProp].level === 4) {
              user.buildings[targetProp].level = 5;
              user.buildings[targetProp].type = 'hotel';
            }
          }
        }
      }
    },
    trader: {
      id: 'trader',
      name_id: 'Trader (Pedagang)',
      name_en: 'Trader',
      icon: '📈',
      color: '#ff66ff',
      passive: {
        name_id: 'Insting Pasar', name_en: 'Market Instinct',
        desc_id: 'Nilai evaluasi tukar tambah properti naik +15%', desc_en: 'Trade valuation bonus +15%',
        apply(player, context) { if(context.type === 'trade_eval') context.value *= 1.15; }
      },
      active: {
        name_id: 'Paksa Tukar', name_en: 'Force Trade',
        desc_id: 'Memaksa pertukaran 1 properti lawan untuk melengkapi monopoli', desc_en: 'Force trade property of equal value',
        cooldown: 8,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 8;
          user.forceTradeReady = true;
        }
      }
    },
    politician: {
      id: 'politician',
      name_id: 'Politician (Politisi)',
      name_en: 'Politician',
      icon: '🎩',
      color: '#00ccff',
      passive: {
        name_id: 'Bebas Pajak', name_en: 'Tax Exempt',
        desc_id: 'Kebal 100% dari seluruh petak denda pajak kota', desc_en: 'Ignore tax tiles',
        apply(player, context) { if(context.type === 'tax') context.amount = 0; }
      },
      active: {
        name_id: 'Pajak Darurat', name_en: 'Emergency Tax',
        desc_id: 'Menarik 15% saldo uang tunai dari seluruh lawan ke kas pribadi', desc_en: 'All opponents pay 15% cash to you',
        cooldown: 6,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 6;
          if (!gs && typeof Game !== 'undefined') gs = Game.getState();
          if (!gs) return;
          let totalTax = 0;
          (gs.players || []).forEach(p => {
            if(p.id !== user.id && !p.isBankrupt) {
              let tax = Math.floor((p.money || 0) * 0.15);
              p.money = Math.max(0, p.money - tax);
              totalTax += tax;
            }
          });
          user.money = (user.money || 0) + totalTax;
        }
      }
    },
    gambler: {
      id: 'gambler',
      name_id: 'Gambler (Penjudi)',
      name_en: 'Gambler',
      icon: '🎲',
      color: '#ff3333',
      passive: {
        name_id: 'Reroll Dadu', name_en: 'Lucky Reroll',
        desc_id: 'Peluang 25% mendapatkan lemparan dadu Double gratis', desc_en: '25% chance for free Double dice roll',
        apply(player, context) { if(context.type === 'dice') context.luckyDouble = true; }
      },
      active: {
        name_id: 'Jackpot Sewa', name_en: 'Jackpot',
        desc_id: 'Menggandakan seluruh uang sewa properti sendiri (2x lipat) selama 2 giliran', desc_en: 'Rent doubled for 2 turns',
        cooldown: 7,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 7;
          user.doubleRentTurns = 2;
          if (!gs && typeof Game !== 'undefined') gs = Game.getState();
          if (gs) {
            if(!gs.activeSkills) gs.activeSkills = {};
            gs.activeSkills[user.id] = 'doubleRent';
          }
        }
      }
    },
    guardian: {
      id: 'guardian',
      name_id: 'Guardian (Pelindung)',
      name_en: 'Guardian',
      icon: '🛡️',
      color: '#33ff33',
      passive: {
        name_id: 'Anti Lelang', name_en: 'Anti-Auction',
        desc_id: 'Kebal lelang paksa dan sabotase properti', desc_en: 'Immune to forced auction & sabotage',
        apply(player, context) { if(context.type === 'sabotage') context.immune = true; }
      },
      active: {
        name_id: 'Perisai Sewa', name_en: 'Rent Shield',
        desc_id: 'Abaikan 2 pembayaran sewa berikutnya saat melintasi hotel lawan', desc_en: 'Ignore next 2 rent payments',
        cooldown: 5,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 5;
          user.skipRentCount = (user.skipRentCount || 0) + 2;
        }
      }
    },
    hacker: {
      id: 'hacker',
      name_id: 'Hacker (Netrunner)',
      name_en: 'Cyber Hacker',
      icon: '💻',
      color: '#00ff88',
      passive: {
        name_id: 'Data Breach', name_en: 'Data Breach',
        desc_id: 'Diskon 30% Pasar Gelap & kebal 100% razia polisi', desc_en: '30% off Black Market & 100% raid immunity',
        apply(player, context) { 
          if(context.type === 'black_market_buy') context.cost *= 0.7;
          if(context.type === 'black_market_raid') context.immune = true;
        }
      },
      active: {
        name_id: 'Cyber Hijack', name_en: 'Cyber Hijack',
        desc_id: 'Meretas rekening lawan terkaya dan menyedot $350 langsung ke kas pribadi', desc_en: 'Siphon $350 from richest opponent',
        cooldown: 6,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 6;
          if (!gs && typeof Game !== 'undefined') gs = Game.getState();
          if (!gs) return;
          const opps = (gs.players || []).filter(p => p.id !== user.id && !p.isBankrupt);
          if(opps.length > 0) {
            let richest = opps[0];
            opps.forEach(p => { if((p.money || 0) > (richest.money || 0)) richest = p; });
            const siphonAmt = Math.min(350, Math.max(50, richest.money || 0));
            richest.money = Math.max(0, (richest.money || 0) - siphonAmt);
            user.money = (user.money || 0) + siphonAmt;
            if(typeof UI !== 'undefined' && UI.showToast) {
              UI.showToast(`💻 ${user.name} meretas $${siphonAmt} dari ${richest.name}!`, 'success');
            }
          }
        }
      }
    },
    tycoon: {
      id: 'tycoon',
      name_id: 'Tycoon (Konglomerat)',
      name_en: 'Megacorp Tycoon',
      icon: '👑',
      color: '#ffd700',
      passive: {
        name_id: 'Dividen Kerajaan', name_en: 'Empire Dividend',
        desc_id: 'Menerima bonus ekstra +$100 setiap melewati MULAI (Total +$400)', desc_en: '+$100 extra bonus passing GO (Total +$400)',
        apply(player, context) { if(context.type === 'go_pass') context.bonus += 100; }
      },
      active: {
        name_id: 'Akuisisi Paksa', name_en: 'Hostile Takeover',
        desc_id: 'Membeli paksa 1 properti non-monopoli milik lawan seharga 1.5x nilai pasar', desc_en: 'Buy 1 opponent non-monopoly tile at 1.5x price',
        cooldown: 8,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 8;
          if (!gs && typeof Game !== 'undefined') gs = Game.getState();
          if (!gs) return;
          const opps = (gs.players || []).filter(p => p.id !== user.id && !p.isBankrupt);
          let targetTile = null, targetOwner = null;
          if(tileIndex !== undefined && gs.tiles[tileIndex]) {
            targetTile = gs.tiles[tileIndex];
            targetOwner = opps.find(p => p.id === targetTile.owner);
          } else {
            for(let op of opps) {
              const freeTile = (op.properties || []).find(ti => gs.tiles[ti] && !gs.tiles[ti].isMortgaged);
              if(freeTile !== undefined) {
                targetTile = gs.tiles[freeTile];
                targetOwner = op;
                break;
              }
            }
          }
          if(targetOwner && targetTile) {
            const buyoutPrice = Math.floor((targetTile.price || 100) * 1.5);
            if((user.money || 0) >= buyoutPrice) {
              user.money -= buyoutPrice;
              targetOwner.money = (targetOwner.money || 0) + buyoutPrice;
              targetOwner.properties = (targetOwner.properties || []).filter(ti => ti !== targetTile.index);
              if(!user.properties) user.properties = [];
              user.properties.push(targetTile.index);
              targetTile.owner = user.id;
              if(typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(`👑 ${user.name} mengakuisisi paksa ${targetTile.name_id || targetTile.name_en}!`, 'success');
              }
            }
          }
        }
      }
    },
    cyborg: {
      id: 'cyborg',
      name_id: 'Cyborg (Vanguard)',
      name_en: 'Mecha Cyborg',
      icon: '🦾',
      color: '#ff0055',
      passive: {
        name_id: 'Armor Platina', name_en: 'Platinum Armor',
        desc_id: 'Mengurangi 40% denda kerusakan event bencana dan krisis', desc_en: '40% disaster & crisis damage reduction',
        apply(player, context) { if(context.type === 'disaster_penalty') context.penalty *= 0.6; }
      },
      active: {
        name_id: 'Overdrive Surge', name_en: 'Overdrive Surge',
        desc_id: 'Dorongan +6 langkah dadu ekstra dan kebal sewa di petak pendaratan berikutnya', desc_en: '+6 extra movement steps and free landing',
        cooldown: 5,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 5;
          user.overdriveSteps = 6;
          user.skipRentCount = (user.skipRentCount || 0) + 1;
          if(typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast(`🦾 ${user.name} mengaktifkan Overdrive Surge (+6 Langkah)!`, 'success');
          }
        }
      }
    },
    broker: {
      id: 'broker',
      name_id: 'Broker (Pialang Saham)',
      name_en: 'Stock Broker',
      icon: '📊',
      color: '#38bdf8',
      passive: {
        name_id: 'Bocoran Saham', name_en: 'Insider Trading',
        desc_id: 'Diskon 25% membeli saham korporasi & hasil dividen +50%', desc_en: '25% stock discount & +50% dividend yields',
        apply(player, context) { 
          if(context.type === 'stock_buy') context.price *= 0.75;
          if(context.type === 'stock_dividend') context.amount *= 1.5;
        }
      },
      active: {
        name_id: 'Pompa Pasar (Pump)', name_en: 'Market Pump',
        desc_id: 'Memompa seluruh harga saham portofolio +40% dan mencairkan bonus kas instan $250', desc_en: '+40% stock portfolio surge & instant $250 bonus',
        cooldown: 7,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 7;
          user.money = (user.money || 0) + 250;
          if (!gs && typeof Game !== 'undefined') gs = Game.getState();
          if (gs && gs.stocks) {
            Object.values(gs.stocks).forEach(st => {
              st.price = Math.floor((st.price || 100) * 1.4);
            });
          }
          if(typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast(`📊 ${user.name} memompa pasar saham (+40%) & panen dividen $250!`, 'success');
          }
        }
      }
    },
    detective: {
      id: 'detective',
      name_id: 'Detective (Penyelidik)',
      name_en: 'Cyber Detective',
      icon: '🕵️',
      color: '#a855f7',
      passive: {
        name_id: 'Bounty Penjara', name_en: 'Bounty Hunter',
        desc_id: 'Menerima hadiah uang +$200 setiap kali ada lawan yang masuk penjara', desc_en: 'Earn +$200 bounty whenever an opponent is jailed',
        apply(player, context) { if(context.type === 'opponent_jailed') player.money = (player.money || 0) + 200; }
      },
      active: {
        name_id: 'Karantina Distrik', name_en: 'District Quarantine',
        desc_id: 'Mengunci 1 distrik lawan selama 2 giliran (lawan tidak bisa menarik sewa & tidak bisa membangun)', desc_en: 'Lock down an opponent district for 2 turns',
        cooldown: 7,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 7;
          if (!gs && typeof Game !== 'undefined') gs = Game.getState();
          if (!gs) return;
          const targetDist = (tileIndex !== undefined && gs.tiles[tileIndex]) ? gs.tiles[tileIndex].district : 1;
          if(!gs.quarantineDistricts) gs.quarantineDistricts = {};
          gs.quarantineDistricts[targetDist] = 2;
          if(typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast(`🕵️ ${user.name} memasang Karantina Polisi di Distrik ${targetDist}!`, 'warning');
          }
        }
      }
    },
    alchemist: {
      id: 'alchemist',
      name_id: 'Alchemist (Nanotech)',
      name_en: 'Nanotech Alchemist',
      icon: '🧪',
      color: '#00ffff',
      passive: {
        name_id: 'Transmutasi Nanotech', name_en: 'Nanotech Transmute',
        desc_id: 'Mendapatkan cashback 10% pinjaman bank & diskon 30% tebus gadai aset', desc_en: '10% loan cashback & 30% unmortgage discount',
        apply(player, context) { 
          if(context.type === 'loan') context.cashback = 0.10;
          if(context.type === 'unmortgage') context.cost *= 0.7;
        }
      },
      active: {
        name_id: 'Duplikasi Kuantum', name_en: 'Quantum Duplication',
        desc_id: 'Menarik 2 kartu taktis (Chance/Chest) secara instan ke inventaris tangan', desc_en: 'Instantly draw 2 tactical Action cards',
        cooldown: 6,
        execute(user, target, tileIndex, gs) {
          user.skillCooldown = 6;
          if (!gs && typeof Game !== 'undefined') gs = Game.getState();
          if (!gs) return;
          if(typeof Cards !== 'undefined') {
            const c1 = Cards.drawCard('chance', gs);
            const c2 = Cards.drawCard('chest', gs);
            if(!user.cards) user.cards = [];
            if(c1) user.cards.push(c1);
            if(c2) user.cards.push(c2);
            if(typeof UI !== 'undefined' && UI.showToast) {
              UI.showToast(`🧪 ${user.name} menduplikasi 2 kartu taktis kuantum!`, 'success');
            }
          }
        }
      }
    }
  };
  
  function init(deps) {}
  function getCharacter(id) { return CHARACTERS[id]; }
  function applyPassive(player, context) { 
    if(player && player.character && CHARACTERS[player.character]) {
      CHARACTERS[player.character].passive.apply(player, context);
    }
  }
  function canUseActive(player) { return player && player.skillCooldown <= 0; }
  function useActive(player, target, data, gs) {
    if (!gs && (target && target.players)) {
      gs = target;
      target = null;
    }
    if (!gs && typeof Game !== 'undefined') {
      gs = Game.getState();
    }
    if(canUseActive(player) && player.character && CHARACTERS[player.character]) {
      try {
        const skill = CHARACTERS[player.character].active;
        skill.execute(player, target, data, gs);
        if(typeof Events !== 'undefined') {
          Events.emit('skillUsed', { player, character: player.character, skill, target });
        }
      } catch(e) {
        console.error('Error in useActive:', e);
      }
    }
  }
  function reduceCooldowns(player) { if(player && player.skillCooldown > 0) player.skillCooldown--; }
  function getAllCharacters() { return CHARACTERS; }
  
  return { init, getCharacter, applyPassive, canUseActive, useActive, reduceCooldowns, getAllCharacters, CHARACTERS };
})();
