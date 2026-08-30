const Cards = (function() {
  'use strict';
  
  const ACTION_CARDS = {
    attack: [
      { id:'hostile_takeover', name_id:'Pengambilalihan Paksa', name_en:'Hostile Takeover', desc_id:'Paksa beli properti non-monopoli lawan (bayar 1.5x harga)', desc_en:'Force buy opponent property (pay 1.5x)', type:'attack', execute(user, target, gs) { return { msg: 'Takeover complete' }; } },
      { id:'espionage', name_id:'Spionase Korporat', name_en:'Corporate Espionage', desc_id:'Lihat kartu & saldo kas rahasia lawan', desc_en:'See opponent cards & money', type:'attack', execute(user,target,gs) { return { msg: 'Spied' }; } },
      { id:'sabotage', name_id:'Sabotase Bangunan', name_en:'Sabotage', desc_id:'Hancurkan 1 level bangunan properti lawan', desc_en:'Destroy 1 building level', type:'attack', execute(user,target,gs) { return { msg: 'Sabotaged' }; } },
      { id:'tax_audit', name_id:'Audit Pajak Paksa', name_en:'Tax Audit', desc_id:'Target membayar denda 20% total kekayaannya', desc_en:'Target pays 20% net worth', type:'attack', execute(user,target,gs) { if(target) target.money = Math.max(0, (target.money || 0) - Math.floor((target.netWorth || 1000) * 0.2)); return { msg: 'Audited' }; } },
      { id:'cyber_attack', name_id:'Serangan Siber', name_en:'Cyber Attack', desc_id:'Lumpuhkan (disable) skill karakter lawan selama 3 giliran', desc_en:'Disable opponent skill for 3 turns', type:'attack', execute(user,target,gs) { if(target) target.skillCooldown = 3; return { msg: 'Disabled' }; } },
    ],
    defense: [
      { id:'firewall', name_id:'Firewall Siber', name_en:'Firewall', desc_id:'Blokir 1 serangan kartu dari pemain lawan', desc_en:'Block 1 incoming attack card', type:'defense', execute(user,target,gs) { return { msg: 'Blocked' }; } },
      { id:'insurance', name_id:'Klaim Bebas Sewa', name_en:'Insurance', desc_id:'Abaikan 1x kewajiban membayar sewa di properti lawan', desc_en:'Skip 1 rent payment', type:'defense', execute(user,target,gs) { user.skipRentCount = (user.skipRentCount || 0) + 1; return { msg: 'Insured' }; } },
      { id:'legal_shield', name_id:'Perisai Hukum', name_en:'Legal Shield', desc_id:'Kebal dari audit & akuisisi paksa selama 2 giliran', desc_en:'Immune to audit & takeover 2 turns', type:'defense', execute(user,target,gs) { user.legalShieldTurns = 2; return { msg: 'Shielded' }; } },
      { id:'bail_bond', name_id:'Jaminan Bebas Penjara', name_en:'Bail Bond', desc_id:'Keluar dari penjara seketika tanpa denda', desc_en:'Get out of jail free', type:'defense', execute(user,target,gs) { user.inJail = false; user.jailTurns = 0; return { msg: 'Freed' }; } },
      { id:'emergency_fund', name_id:'Dana Darurat', name_en:'Emergency Fund', desc_id:'Terima suntikan likuiditas $300 dari cadangan darurat', desc_en:'Receive $300 emergency cash', type:'defense', execute(user,target,gs) { user.money = (user.money || 0) + 300; return { msg: '+300' }; } },
    ],
    economy: [
      { id:'market_manipulation', name_id:'Manipulasi Bursa', name_en:'Market Manipulation', desc_id:'Ubah harga 1 saham emiten sebesar ±30%', desc_en:'Change 1 stock price ±30%', type:'economy', execute(user,target,gs) { return { msg: 'Manipulated' }; } },
      { id:'stimulus', name_id:'Paket Stimulus', name_en:'Stimulus Package', desc_id:'Seluruh pemain di dalam game menerima bantuan kas $200', desc_en:'All players receive $200 grant', type:'economy', execute(user,target,gs) { if(gs.players) gs.players.forEach(p => p.money = (p.money || 0) + 200); return { msg: 'Stimulus' }; } },
      { id:'embargo', name_id:'Embargo Distrik', name_en:'Embargo', desc_id:'1 distrik dibekukan sehingga tidak menghasilkan sewa selama 2 giliran', desc_en:'1 district generates no rent for 2 turns', type:'economy', execute(user,target,gs) { return { msg: 'Embargoed' }; } },
      { id:'gentrification', name_id:'Gentrifikasi Wilayah', name_en:'Gentrification', desc_id:'Sewa seluruh properti di 1 distrik melonjak +50% selama 3 giliran', desc_en:'1 district rent +50% for 3 turns', type:'economy', execute(user,target,gs) { return { msg: 'Gentrified' }; } },
    ],
    special: [
      { id:'teleport', name_id:'Teleportasi Glitch', name_en:'Teleport', desc_id:'Pindah bebas ke petak manapun di seluruh papan', desc_en:'Move to any tile on board', type:'special', execute(user,target,gs) { return { msg: 'Teleported' }; } },
      { id:'reverse', name_id:'Balik Arah Gerak', name_en:'Reverse', desc_id:'Memutarbalikkan arah langkah bidak selama 3 giliran', desc_en:'Reverse direction 3 turns', type:'special', execute(user,target,gs) { user.direction = (user.direction || 1) * -1; return { msg: 'Reversed' }; } },
      { id:'double_dice', name_id:'Dadu Magnetik Triple', name_en:'Double Dice', desc_id:'Melempar 3 dadu sekaligus pada giliran ini', desc_en:'Roll 3 dice this turn', type:'special', execute(user,target,gs) { return { msg: 'Double Dice' }; } },
      { id:'hack_bank', name_id:'Retas Server Bank', name_en:'Hack the Bank', desc_id:'Sedot $100 per giliran dari kas bank (selama 3 giliran)', desc_en:'Steal $100/turn from bank (3 turns)', type:'special', execute(user,target,gs) { user.money = (user.money || 0) + 100; return { msg: 'Hacked' }; } },
    ]
  };
  
  const SECRET_OBJECTIVES = [
    { id:'district_baron', name_id:'Baron Distrik', name_en:'District Baron', desc_id:'Punya 4+ properti di 1 distrik yang sama', desc_en:'Own 4+ properties in 1 district', reward:800, check(player, gs) {
        if (!player.properties || !gs.tiles) return false;
        const counts = {};
        player.properties.forEach(idx => {
            const t = gs.tiles[idx];
            if (t && t.district !== undefined) counts[t.district] = (counts[t.district] || 0) + 1;
        });
        return Object.values(counts).some(c => c >= 4);
    } },
    { id:'casino_mogul', name_id:'Raja Kasino', name_en:'Casino Mogul', desc_id:'Bangun minimal 2 Kasino Mewah', desc_en:'Build at least 2 Casinos', reward:600, check(player, gs) {
        if (!player.buildings) return false;
        let casinos = Object.values(player.buildings).filter(b => b === 'casino' || (b && b.type === 'casino')).length;
        return casinos >= 2;
    } },
    { id:'stock_tycoon', name_id:'Konglomerat Saham', name_en:'Stock Tycoon', desc_id:'Miliki total nilai saham minimal $1000', desc_en:'Own at least $1000 in total stock value', reward:500, check(player, gs) {
        if (!player.stocks || !gs.stocks) return false;
        let total = 0;
        Object.entries(player.stocks).forEach(([sym, qty]) => {
            if (gs.stocks[sym]) total += qty * (gs.stocks[sym].price || 100);
        });
        return total >= 1000;
    } },
    { id:'monopoly_king', name_id:'Raja Monopoli', name_en:'Monopoly King', desc_id:'Kuasai 2 grup warna properti lengkap (Monopoli Penuh)', desc_en:'Own 2 complete color group monopolies', reward:900, check(player, gs) {
        if (!player.properties || !gs.tiles) return false;
        const groupTotal = {}, groupOwned = {};
        gs.tiles.forEach(t => {
            if (t.group) {
                groupTotal[t.group] = (groupTotal[t.group] || 0) + 1;
                if (player.properties.includes(t.index)) groupOwned[t.group] = (groupOwned[t.group] || 0) + 1;
            }
        });
        let monopolies = Object.keys(groupTotal).filter(g => groupTotal[g] > 0 && groupOwned[g] === groupTotal[g]).length;
        return monopolies >= 2;
    } },
    { id:'jv_master', name_id:'Master Kerjasama', name_en:'JV Master', desc_id:'Jalankan 2 Joint Venture aktif secara bersamaan', desc_en:'Maintain 2 active Joint Ventures', reward:500, check(player, gs) {
        return player.jointVentures && player.jointVentures.length >= 2;
    } },
    { id:'cash_king', name_id:'Raja Likuiditas', name_en:'Cash King', desc_id:'Capai saldo kas $3000 tanpa hutang aktif', desc_en:'Reach $3000 cash with zero active loans', reward:750, check(player, gs) {
        const hasLoans = player.loans && player.loans.length > 0;
        return (player.money || 0) >= 3000 && !hasLoans;
    } },
  ];
  
  const CHANCE_CARDS = [
    { 
      id:'ch1', 
      name_id:'🚀 Maju ke GO', 
      name_en:'🚀 Advance to GO', 
      desc_id:'Pindah langsung ke petak GO dan terima bonus gaji $300!', 
      desc_en:'Move directly to GO and collect $300 salary bonus!', 
      execute(player, gs) { 
        player.position = 0; 
        const bonus = (gs.settings && gs.settings.goBonus) ? gs.settings.goBonus : 300;
        player.money = (player.money || 0) + bonus; 
      } 
    },
    { 
      id:'ch2', 
      name_id:'🚄 Hyperloop Express', 
      name_en:'🚄 Hyperloop Express', 
      desc_id:'Maju cepat ke Stasiun Hyperloop terdekat dan klaim diskon tiket!', 
      desc_en:'Advance to the nearest Hyperloop Station!', 
      execute(player, gs) { 
        const stations = [5, 18, 31, 44];
        let nextSt = stations.find(s => s > player.position);
        if (nextSt === undefined) nextSt = stations[0];
        player.position = nextSt;
        if(typeof Game !== 'undefined' && Game.handleLanding) {
          Game.handleLanding(player, nextSt);
        }
      } 
    },
    { 
      id:'ch3', 
      name_id:'⚡ Koneksi Jaringan Utilitas', 
      name_en:'⚡ Grid Connection', 
      desc_id:'Maju langsung ke Pembangkit Listrik terdekat!', 
      desc_en:'Advance to nearest Power Utility!', 
      execute(player, gs) { 
        const utils = [12, 29];
        let nextUt = utils.find(u => u > player.position);
        if (nextUt === undefined) nextUt = utils[0];
        player.position = nextUt;
        if(typeof Game !== 'undefined' && Game.handleLanding) {
          Game.handleLanding(player, nextUt);
        }
      } 
    },
    { 
      id:'ch4', 
      name_id:'💸 Denda Kecepatan Siber', 
      name_en:'💸 Cyber Speeding Fine', 
      desc_id:'Terdeteksi radar tilang kecepatan tinggi, bayar denda $100 ke Bank!', 
      desc_en:'Caught speeding on data highway, pay $100 fine to Bank!', 
      execute(player, gs) { 
        player.money = Math.max(0, (player.money || 0) - 100); 
      } 
    },
    { 
      id:'ch5', 
      name_id:'💰 Sayembara Bug Bounty', 
      name_en:'💰 Bug Bounty Reward', 
      desc_id:'Menemukan celah keamanan di firewall bank, dapatkan hadiah tunai +$250!', 
      desc_en:'Discovered security exploit, collect +$250 bug bounty!', 
      execute(player, gs) { 
        player.money = (player.money || 0) + 250; 
      } 
    },
    { 
      id:'ch6', 
      name_id:'🔒 Razia Penjara Siber', 
      name_en:'🔒 Police Raid - Go to Jail', 
      desc_id:'Terjaring razia aparat kota! Masuk penjara seketika tanpa melewati GO.', 
      desc_en:'Caught in city raid! Go directly to Jail, do not pass GO.', 
      execute(player, gs) { 
        player.position = 13; 
        player.inJail = true; 
        player.jailTurns = 3; 
      } 
    },
    { 
      id:'ch7', 
      name_id:'🏢 Dividen Bangunan Kota', 
      name_en:'🏢 Building Dividend', 
      desc_id:'Terima royalti +$50 untuk setiap bangunan yang Anda miliki di kota.', 
      desc_en:'Receive +$50 royalty for each building you own.', 
      execute(player, gs) { 
        const count = player.buildings ? Object.keys(player.buildings).length : 0;
        player.money = (player.money || 0) + Math.max(50, count * 50);
      } 
    },
    { 
      id:'ch8', 
      name_id:'🌌 Warp Glitch Kuantum', 
      name_en:'🌌 Quantum Warp Glitch', 
      desc_id:'Mengalami anomali ruang waktu, teleportasi seketika ke Parkir Bebas (Petak 26)!', 
      desc_en:'Spacetime glitch teleported you to Free Parking (Tile 26)!', 
      execute(player, gs) { 
        player.position = 26; 
      } 
    },
    { 
      id:'ch9', 
      name_id:'🃏 Penemuan Kartu Aksi', 
      name_en:'🃏 Secret Action Card', 
      desc_id:'Menemukan kartu aksi taktis rahasia dan menyimpannya ke inventaris tangan!', 
      desc_en:'Acquired a tactical action card stored into your inventory!', 
      execute(player, gs) { 
        const actionCard = drawActionCard();
        if(!player.cards) player.cards = [];
        if(actionCard) player.cards.push(actionCard);
      } 
    },
    { 
      id:'ch10', 
      name_id:'🎁 Suntikan Likuiditas', 
      name_en:'🎁 Liquidity Tribute', 
      desc_id:'Sebagai tokoh berpengaruh kota, setiap pemain lain membayar Anda $50!', 
      desc_en:'Every other player pays you a $50 tribute!', 
      execute(player, gs) { 
        let total = 0;
        (gs.players || []).forEach(p => {
          if(p.id !== player.id && !p.isBankrupt) {
            const pay = Math.min(50, Math.max(0, p.money || 0));
            p.money = Math.max(0, (p.money || 0) - pay);
            total += pay;
          }
        });
        player.money = (player.money || 0) + total;
      } 
    }
  ];
  
  const CHEST_CARDS = [
    { 
      id:'cc1', 
      name_id:'🏦 Bonus Dividen Bank', 
      name_en:'🏦 Bank Dividend Bonus', 
      desc_id:'Bank pusat membagikan dividen keuntungan tahunan sebesar +$200!', 
      desc_en:'Central bank distributes +$200 annual profit dividend!', 
      execute(player, gs) { 
        player.money = (player.money || 0) + 200; 
      } 
    },
    { 
      id:'cc2', 
      name_id:'💎 Airdrop Kripto Neon', 
      name_en:'💎 Neon Crypto Airdrop', 
      desc_id:'Dompet digital Anda menerima transferan airdrop token senilai +$150!', 
      desc_en:'Your digital wallet received +$150 crypto airdrop!', 
      execute(player, gs) { 
        player.money = (player.money || 0) + 150; 
      } 
    },
    { 
      id:'cc3', 
      name_id:'📜 Pengembalian Pajak Kota', 
      name_en:'📜 City Tax Refund', 
      desc_id:'Departemen Keuangan mengembalikan kelebihan bayar pajak Anda sebesar +$120.', 
      desc_en:'Revenue department refunds +$120 tax surplus to your account.', 
      execute(player, gs) { 
        player.money = (player.money || 0) + 120; 
      } 
    },
    { 
      id:'cc4', 
      name_id:'🛠️ Biaya Audit Server', 
      name_en:'🛠️ Server Maintenance Audit', 
      desc_id:'Bayar biaya perawatan jaringan $30 per properti yang Anda kuasai.', 
      desc_en:'Pay $30 maintenance fee per property you control.', 
      execute(player, gs) { 
        const count = player.properties ? player.properties.length : 0;
        player.money = Math.max(0, (player.money || 0) - (count * 30));
      } 
    },
    { 
      id:'cc5', 
      name_id:'👑 Warisan Konglomerat', 
      name_en:'👑 Megacorp Inheritance', 
      desc_id:'Menerima warisan aset keluarga konglomerat senilai +$300!', 
      desc_en:'Inherit +$300 estate trust fund from corporate dynasty!', 
      execute(player, gs) { 
        player.money = (player.money || 0) + 300; 
      } 
    },
    { 
      id:'cc6', 
      name_id:'🚀 Hibah Riset Teknologi', 
      name_en:'🚀 Tech Venture Grant', 
      desc_id:'Yayasan inovasi memberikan hibah riset tanpa syarat sebesar +$400!', 
      desc_en:'Tech innovation foundation awards you +$400 venture grant!', 
      execute(player, gs) { 
        player.money = (player.money || 0) + 400; 
      } 
    },
    { 
      id:'cc7', 
      name_id:'🛡️ Klaim Asuransi Siber', 
      name_en:'🛡️ Cyber Insurance Payout', 
      desc_id:'Klaim asuransi perlindungan siber disetujui, terima pencairan dana +$180.', 
      desc_en:'Cyber insurance claim approved, payout +$180 cash.', 
      execute(player, gs) { 
        player.money = (player.money || 0) + 180; 
      } 
    },
    { 
      id:'cc8', 
      name_id:'🔓 Kartu Jaminan Bebas Penjara', 
      name_en:'🔓 Get Out of Jail Free Card', 
      desc_id:'Mendapatkan kartu jaminan bebas penjara yang disimpan di inventaris kartu!', 
      desc_en:'Received a Get Out of Jail Free card stored in your hand!', 
      execute(player, gs) { 
        const bailCard = ACTION_CARDS.defense.find(c => c.id === 'bail_bond');
        if(!player.cards) player.cards = [];
        if(bailCard) player.cards.push(bailCard);
      } 
    },
    { 
      id:'cc9', 
      name_id:'🏥 Biaya Tune-Up Cyberware', 
      name_en:'🏥 Cyberware Checkup', 
      desc_id:'Waktunya servis implan biomekanik, bayar biaya perawatan $75 ke klinik.', 
      desc_en:'Maintenance checkup for implants, pay $75 to clinic.', 
      execute(player, gs) { 
        player.money = Math.max(0, (player.money || 0) - 75); 
      } 
    },
    { 
      id:'cc10', 
      name_id:'🤝 Bagi Hasil Komunitas', 
      name_en:'🤝 Community Fund Split', 
      desc_id:'Koperasi distrik memberikan bonus sosial +$200 langsung ke kas Anda.', 
      desc_en:'District cooperative awards +$200 social dividend grant.', 
      execute(player, gs) { 
        player.money = (player.money || 0) + 200; 
      } 
    }
  ];
  
  function init(deps) {}
  
  function drawActionCard() {
    const types = Object.keys(ACTION_CARDS);
    const type = types[Math.floor(Math.random() * types.length)];
    const cards = ACTION_CARDS[type];
    return cards[Math.floor(Math.random() * cards.length)];
  }
  
  function drawChanceCard() {
    return CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
  }
  
  function drawChestCard() {
    return CHEST_CARDS[Math.floor(Math.random() * CHEST_CARDS.length)];
  }

  function drawCard(type) {
    if (type === 'chance') return drawChanceCard();
    if (type === 'chest') return drawChestCard();
    return drawActionCard();
  }
  
  function getSecretObjectives(count) {
    const shuffled = [...SECRET_OBJECTIVES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  function checkObjectives(player, gs) {
    if (!player || !player.secretObjectives) return;
    if (!player.completedObjectives) player.completedObjectives = [];
    player.secretObjectives.forEach(obj => {
      if (obj && typeof obj.check === 'function' && !player.completedObjectives.includes(obj.id)) {
        if (obj.check(player, gs)) {
          player.completedObjectives.push(obj.id);
          player.money = (player.money || 0) + (obj.reward || 500);
          if (typeof Events !== 'undefined') {
            Events.emit('objectiveComplete', { player, objective: obj });
          }
        }
      }
    });
  }
  
  return { 
    init, 
    drawCard,
    drawActionCard, 
    drawChanceCard, 
    drawChestCard, 
    getSecretObjectives, 
    checkObjectives, 
    ACTION_CARDS, 
    SECRET_OBJECTIVES, 
    CHANCE_CARDS, 
    CHEST_CARDS 
  };
})();
