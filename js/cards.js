const Cards = (function() {
  'use strict';
  
  const ACTION_CARDS = {
    attack: [
      { id:'hostile_takeover', name_id:'Pengambilalihan', name_en:'Hostile Takeover', desc_id:'Paksa beli properti lawan (bayar 1.5x)', desc_en:'Force buy opponent property (pay 1.5x)', type:'attack', execute(user, target, gs) { return { msg: 'Takeover complete' }; } },
      { id:'espionage', name_id:'Spionase', name_en:'Corporate Espionage', desc_id:'Lihat kartu & uang lawan', desc_en:'See opponent cards & money', type:'attack', execute(user,target,gs) { return { msg: 'Spied' }; } },
      { id:'sabotage', name_id:'Sabotase', name_en:'Sabotage', desc_id:'Hancurkan 1 level bangunan lawan', desc_en:'Destroy 1 building level', type:'attack', execute(user,target,gs) { return { msg: 'Sabotaged' }; } },
      { id:'tax_audit', name_id:'Audit Pajak', name_en:'Tax Audit', desc_id:'Target bayar 20% kekayaan', desc_en:'Target pays 20% net worth', type:'attack', execute(user,target,gs) { target.money -= target.netWorth*0.2; return { msg: 'Audited' }; } },
      { id:'cyber_attack', name_id:'Serangan Siber', name_en:'Cyber Attack', desc_id:'Disable skill lawan 3 giliran', desc_en:'Disable opponent skill 3 turns', type:'attack', execute(user,target,gs) { target.skillCooldown = 3; return { msg: 'Disabled' }; } },
    ],
    defense: [
      { id:'firewall', name_id:'Firewall', name_en:'Firewall', desc_id:'Blokir 1 kartu serangan', desc_en:'Block 1 attack card', type:'defense', execute(user,target,gs) { return { msg: 'Blocked' }; } },
      { id:'insurance', name_id:'Asuransi', name_en:'Insurance', desc_id:'Tidak bayar sewa 1x', desc_en:'Skip rent payment 1x', type:'defense', execute(user,target,gs) { return { msg: 'Insured' }; } },
      { id:'legal_shield', name_id:'Perisai Hukum', name_en:'Legal Shield', desc_id:'Imun dari audit & takeover 2 giliran', desc_en:'Immune to audit & takeover 2 turns', type:'defense', execute(user,target,gs) { return { msg: 'Shielded' }; } },
      { id:'bail_bond', name_id:'Jaminan Bebas', name_en:'Bail Bond', desc_id:'Keluar penjara gratis', desc_en:'Get out of jail free', type:'defense', execute(user,target,gs) { user.jailTurns = 0; return { msg: 'Freed' }; } },
      { id:'emergency_fund', name_id:'Dana Darurat', name_en:'Emergency Fund', desc_id:'Dapat $300', desc_en:'Receive $300', type:'defense', execute(user,target,gs) { user.money += 300; return { msg: '+300' }; } },
    ],
    economy: [
      { id:'market_manipulation', name_id:'Manipulasi Pasar', name_en:'Market Manipulation', desc_id:'Ubah harga 1 saham ±30%', desc_en:'Change 1 stock price ±30%', type:'economy', execute(user,target,gs) { return { msg: 'Manipulated' }; } },
      { id:'stimulus', name_id:'Stimulus', name_en:'Stimulus Package', desc_id:'Semua pemain dapat $200', desc_en:'All players get $200', type:'economy', execute(user,target,gs) { gs.players.forEach(p => p.money += 200); return { msg: 'Stimulus' }; } },
      { id:'embargo', name_id:'Embargo', name_en:'Embargo', desc_id:'1 district tidak generate sewa 2 giliran', desc_en:'1 district no rent 2 turns', type:'economy', execute(user,target,gs) { return { msg: 'Embargoed' }; } },
      { id:'gentrification', name_id:'Gentrifikasi', name_en:'Gentrification', desc_id:'1 district sewa +50% 3 giliran', desc_en:'1 district rent +50% 3 turns', type:'economy', execute(user,target,gs) { return { msg: 'Gentrified' }; } },
    ],
    special: [
      { id:'teleport', name_id:'Teleportasi', name_en:'Teleport', desc_id:'Pindah ke tile manapun', desc_en:'Move to any tile', type:'special', execute(user,target,gs) { return { msg: 'Teleported' }; } },
      { id:'reverse', name_id:'Balik Arah', name_en:'Reverse', desc_id:'Balik arah 3 giliran', desc_en:'Reverse direction 3 turns', type:'special', execute(user,target,gs) { user.direction *= -1; return { msg: 'Reversed' }; } },
      { id:'double_dice', name_id:'Dadu Ganda', name_en:'Double Dice', desc_id:'Lempar 3 dadu giliran ini', desc_en:'Roll 3 dice this turn', type:'special', execute(user,target,gs) { return { msg: 'Double Dice' }; } },
      { id:'hack_bank', name_id:'Retas Bank', name_en:'Hack the Bank', desc_id:'Curi $100/giliran dari bank (3 giliran)', desc_en:'Steal $100/turn from bank (3 turns)', type:'special', execute(user,target,gs) { user.money += 100; return { msg: 'Hacked' }; } },
    ]
  };
  
  const SECRET_OBJECTIVES = [
    { id:'district_baron', name_id:'Baron Distrik', name_en:'District Baron', desc_id:'Punya 4+ properti di 1 distrik', desc_en:'Own 4+ properties in 1 district', reward:800, check(player, gs) {
        if (!player.properties || !gs.tiles) return false;
        const counts = {};
        player.properties.forEach(idx => {
            const t = gs.tiles[idx];
            if (t && t.district !== undefined) counts[t.district] = (counts[t.district] || 0) + 1;
        });
        return Object.values(counts).some(c => c >= 4);
    } },
    { id:'casino_mogul', name_id:'Raja Kasino', name_en:'Casino Mogul', desc_id:'Bangun minimal 2 Kasino', desc_en:'Build at least 2 Casinos', reward:600, check(player, gs) {
        if (!player.buildings) return false;
        let casinos = Object.values(player.buildings).filter(b => b === 'casino' || (b && b.type === 'casino')).length;
        return casinos >= 2;
    } },
    { id:'stock_tycoon', name_id:'Konglomerat Saham', name_en:'Stock Tycoon', desc_id:'Miliki total nilai saham minimal $1000', desc_en:'Own at least $1000 in total stock value', reward:500, check(player, gs) {
        if (!player.stocks || !gs.stocks) return false;
        let total = 0;
        Object.entries(player.stocks).forEach(([sym, qty]) => {
            if (gs.stocks[sym]) total += qty * gs.stocks[sym].price;
        });
        return total >= 1000;
    } },
    { id:'monopoly_king', name_id:'Raja Monopoli', name_en:'Monopoly King', desc_id:'Kuasai 2 grup warna properti lengkap', desc_en:'Own 2 complete color group monopolies', reward:900, check(player, gs) {
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
    { id:'jv_master', name_id:'Master Kerjasama', name_en:'JV Master', desc_id:'Jalankan 2 Joint Venture aktif', desc_en:'Maintain 2 active Joint Ventures', reward:500, check(player, gs) {
        return player.jointVentures && player.jointVentures.length >= 2;
    } },
    { id:'cash_king', name_id:'Raja Likuiditas', name_en:'Cash King', desc_id:'Capai saldo kas $3000 tanpa hutang', desc_en:'Reach $3000 cash with zero active loans', reward:750, check(player, gs) {
        const hasLoans = player.loans && player.loans.length > 0;
        return player.money >= 3000 && !hasLoans;
    } },
  ];
  
  const CHANCE_CARDS = [
    { id:'ch1', name_id:'Maju ke GO', name_en:'Advance to GO', desc_id:'Pindah langsung ke petak GO dan terima bonus', desc_en:'Move directly to GO and collect bonus', execute(player, gs) { player.position = 0; player.money += gs.settings.goBonus; } },
    { id:'ch2', name_id:'Ekspres Metro', name_en:'Hyperloop Express', desc_id:'Maju ke Stasiun Hyperloop terdekat', desc_en:'Advance to nearest Hyperloop Station', execute(player, gs) { 
        const stations = [5, 18, 31, 44];
        let nextSt = stations.find(s => s > player.position) || stations[0];
        player.position = nextSt;
    } },
    { id:'ch3', name_id:'Koneksi Jaringan', name_en:'Grid Connection', desc_id:'Maju ke Pembangkit Listrik terdekat', desc_en:'Advance to nearest Power Utility', execute(player, gs) { 
        const utils = [12, 38];
        let nextUt = utils.find(u => u > player.position) || utils[0];
        player.position = nextUt;
    } },
    { id:'ch4', name_id:'Denda Kecepatan Siber', name_en:'Cyber Speeding Fine', desc_id:'Bayar denda $100 ke Bank', desc_en:'Pay $100 speed fine to Bank', execute(player, gs) { player.money = Math.max(0, player.money - 100); } },
    { id:'ch5', name_id:'Sayembara Hacker', name_en:'Bug Bounty Reward', desc_id:'Dapatkan hadiah $250 dari korporat', desc_en:'Collect $250 bug bounty from corporate', execute(player, gs) { player.money += 250; } },
    { id:'ch6', name_id:'Razia Penjara', name_en:'Go to Jail', desc_id:'Masuk penjara seketika, jangan lewati GO', desc_en:'Go directly to Jail, do not pass GO', execute(player, gs) { player.position = 13; player.inJail = true; player.jailTurns = 3; } },
    { id:'ch7', name_id:'Dividen Bangunan', name_en:'Building Dividend', desc_id:'Terima $50 untuk setiap bangunan yang Anda miliki', desc_en:'Receive $50 for each building you own', execute(player, gs) { 
        const count = player.buildings ? Object.keys(player.buildings).length : 0;
        player.money += Math.max(50, count * 50);
    } },
    { id:'ch8', name_id:'Glitch Warp', name_en:'Warp Glitch', desc_id:'Warp acak ke petak nomor 26 (Distrik Kuantum)', desc_en:'Warp to tile 26 (Quantum District)', execute(player, gs) { player.position = 26; } },
  ];
  
  const CHEST_CARDS = [
    { id:'cc1', name_id:'Bonus Bank', name_en:'Bank Bonus', desc_id:'Terima deviden bank $200', desc_en:'Receive bank dividend $200', execute(player, gs) { player.money += 200; } },
    { id:'cc2', name_id:'Airdrop Kripto', name_en:'Crypto Airdrop', desc_id:'Terima airdrop $150', desc_en:'Receive $150 airdrop', execute(player, gs) { player.money += 150; } },
    { id:'cc3', name_id:'Pengembalian Pajak', name_en:'Tax Refund', desc_id:'Klaim pengembalian pajak $100', desc_en:'Claim $100 tax refund', execute(player, gs) { player.money += 100; } },
    { id:'cc4', name_id:'Biaya Perawatan', name_en:'Maintenance Fee', desc_id:'Bayar $30 per properti untuk audit listrik', desc_en:'Pay $30 per property for electrical audit', execute(player, gs) { 
        const count = player.properties ? player.properties.length : 0;
        player.money = Math.max(0, player.money - count * 30);
    } },
    { id:'cc5', name_id:'Warisan Konglomerat', name_en:'Inheritance', desc_id:'Terima warisan $300', desc_en:'Receive $300 inheritance', execute(player, gs) { player.money += 300; } },
    { id:'cc6', name_id:'Hibah Ventura', name_en:'Venture Grant', desc_id:'Dapatkan grant teknologi $400', desc_en:'Collect $400 tech venture grant', execute(player, gs) { player.money += 400; } },
    { id:'cc7', name_id:'Biaya Asuransi Server', name_en:'Server Insurance', desc_id:'Bayar premi asuransi $80', desc_en:'Pay $80 insurance premium', execute(player, gs) { player.money = Math.max(0, player.money - 80); } },
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
          player.money += (obj.reward || 500);
          if (typeof Events !== 'undefined') {
            Events.emit('objectiveComplete', { player, objective: obj });
          }
        }
      }
    });
  }
  
  return { init, drawActionCard, drawChanceCard, drawChestCard, getSecretObjectives, checkObjectives, ACTION_CARDS, SECRET_OBJECTIVES, CHANCE_CARDS, CHEST_CARDS };
})();
