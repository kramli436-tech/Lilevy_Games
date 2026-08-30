/**
 * ============================================================================
 * MONOPOLY CYBERPUNK - MATCH HISTORY & LIVE EVENT TIMELINE ENGINE
 * Tracks real-time game logs, event explanations, category filters & archives
 * ============================================================================
 */

const MatchHistory = (function() {
  'use strict';

  let logs = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let matchStartTime = Date.now();

  // Comprehensive Event & Mechanism Explanation Dictionary
  const EXPLANATIONS = {
    economy: {
      bullMarket: {
        title_id: '📈 Bull Market (Pasar Menguat)',
        title_en: '📈 Bull Market',
        desc_id: 'Pertumbuhan ekonomi pesat! Seluruh sewa properti naik +20% dan biaya pembangunan naik +30%. Waktu terbaik memanen sewa dari lawan.',
        desc_en: 'Rapid economic growth! All property rents +20%, build costs +30%. Best time to harvest rents.'
      },
      crash: {
        title_id: '📉 Market Crash (Krisis Keuangan)',
        title_en: '📉 Market Crash',
        desc_id: 'Krisis melanda kota! Seluruh harga saham rontok -40%, sewa turun -40%, dan biaya konstruksi diskon -30%.',
        desc_en: 'Economic crash! All stock prices plunge -40%, rents drop -40%, build costs discounted -30%.'
      },
      inflation: {
        title_id: '💸 Inflasi Tinggi',
        title_en: '💸 High Inflation',
        desc_id: 'Harga barang melambung! Biaya sewa +25%, biaya pembangunan +25%, dan pajak kota naik +25%.',
        desc_en: 'Prices soar! Rents +25%, build costs +25%, city taxes +25%.'
      },
      constructionBoom: {
        title_id: '🏗️ Boom Konstruksi',
        title_en: '🏗️ Construction Boom',
        desc_id: 'Subsidi material konstruksi besar-besaran! Biaya membangun rumah dan hotel DISKON 50%. Waktu emas untuk upgrade properti!',
        desc_en: 'Massive building subsidy! House and hotel construction costs DISCOUNTED 50%. Golden time to build!'
      },
      pandemic: {
        title_id: '☣️ Pandemi Global',
        title_en: '☣️ Global Pandemic',
        desc_id: 'Kota lockdown! Aktivitas ekonomi lesu, seluruh sewa properti dipotong -50%.',
        desc_en: 'City lockdown! Economic activity slows, all property rents reduced by -50%.'
      },
      techRevolution: {
        title_id: '🤖 Revolusi Teknologi',
        title_en: '🤖 Tech Revolution',
        desc_id: 'Inovasi AI & Cybernetics memuncak! Emiten saham teknologi dan utilitas melonjak pesat.',
        desc_en: 'AI & Cybernetics innovation peak! Tech stocks and utilities surge.'
      },
      bailout: {
        title_id: '🏛️ Bailout Pemerintah',
        title_en: '🏛️ Government Bailout',
        desc_id: 'Paket stimulus darurat! Pemain dengan saldo kas terendah menerima suntikan dana darurat +$500 dari kas negara.',
        desc_en: 'Emergency stimulus! The player with the lowest cash receives +$500 bailout fund.'
      },
      fire: {
        title_id: '🔥 Kebakaran Distrik',
        title_en: '🔥 District Fire Disaster',
        desc_id: 'Kebakaran hebat melanda! 1 bangunan acak di papan hancur total dan harus dibangun ulang.',
        desc_en: 'Fierce fire struck! 1 random building on the board was destroyed and must be rebuilt.'
      },
      goldRush: {
        title_id: '🪙 Demam Emas (Gold Rush)',
        title_en: '🪙 Gold Rush',
        desc_id: 'Demam emas cyber! Bonus uang saat melewati petak MULAI / GO digandakan menjadi 2x lipat!',
        desc_en: 'Cyber gold rush! Bonus cash when passing GO is DOUBLED (2x)!'
      },
      disaster: {
        title_id: '🌋 Bencana Alam Kuantum',
        title_en: '🌋 Quantum Disaster',
        desc_id: 'Anomali magnetik kota! Seluruh pemain terkena denda perbaikan darurat sebesar -$200.',
        desc_en: 'City magnetic anomaly! All players suffer emergency repair costs of -$200.'
      },
      cyberWarfare: {
        title_id: '🛡️ Perang Siber (Cyber Warfare)',
        title_en: '🛡️ Cyber Warfare',
        desc_id: 'Serangan peretas massal! Seluruh pemain kehilangan -$150, harga saham turun -25%, dan pajak naik +20%.',
        desc_en: 'Mass hacker assault! All players lose -$150, stock prices drop -25%, taxes +20%.'
      },
      cryptoBoom: {
        title_id: '🚀 Ledakan Kripto (Crypto Boom)',
        title_en: '🚀 Crypto Boom',
        desc_id: 'Pasar kripto melonjak liar! Setiap pemain menerima dividen kas +$300 dan saham naik +35%.',
        desc_en: 'Crypto market surges! Every player receives +$300 dividend and stocks rise +35%.'
      },
      taxHoliday: {
        title_id: '🏖️ Libur Pajak (Tax Holiday)',
        title_en: '🏖️ Tax Holiday',
        desc_id: 'Pemerintah membebaskan seluruh petak pajak (Pajak 0%) dan diskon pembangunan -30%!',
        desc_en: 'Government waives all taxes (0% Tax) and gives -30% construction discount!'
      },
      megaMerger: {
        title_id: '🤝 Mega Merger Korporasi',
        title_en: '🤝 Mega Merger',
        desc_id: 'Konsolidasi konglomerat raksasa! Sewa seluruh distrik meningkat +25%.',
        desc_en: 'Giant conglomerate consolidation! Rents across all districts increase +25%.'
      },
      quantumGlitch: {
        title_id: '⚡ Glitch Kuantum',
        title_en: '⚡ Quantum Glitch',
        desc_id: 'Fluktuasi energi kuantum me-reset cooldown skill seluruh karakter menjadi 0 (Siap Pakai)!',
        desc_en: 'Quantum energy fluctuation resets all character skill cooldowns to 0 (Ready)!'
      },
      hyperInflation: {
        title_id: '💥 Hiperinflasi Ekstrem',
        title_en: '💥 Hyperinflation',
        desc_id: 'Krisis moneter parah! Sewa naik +40%, biaya bangun naik +50%, pajak naik +30%, dan bonus GO bertambah +$400.',
        desc_en: 'Severe monetary crisis! Rents +40%, build costs +50%, taxes +30%, GO bonus +$400.'
      }
    },
    weather: {
      sunny: { title_id: '☀️ Cerah Optimal', title_en: '☀️ Sunny', desc_id: 'Cuaca cerah optimal: Sewa distrik +15%, aktivitas turis tinggi.', desc_en: 'Optimal sunny weather: District rents +15%, high tourist activity.' },
      rain: { title_id: '🌧️ Hujan Deras', title_en: '🌧️ Heavy Rain', desc_id: 'Hujan deras membasahi kota: Sewa distrik turun -20%.', desc_en: 'Heavy rain across city: District rents -20%.' },
      storm: { title_id: '⛈️ Badai Petir', title_en: '⛈️ Thunderstorm', desc_id: 'Badai petir berbahaya: Dilarang mendirikan bangunan baru, ada risiko 10% kerusakan instalasi.', desc_en: 'Dangerous storm: Construction disabled, 10% risk of damage.' },
      fog: { title_id: '🌫️ Kabut Tebal', title_en: '🌫️ Dense Fog', desc_id: 'Kabut tebal menutupi jalan: Jarak pandang berkurang, pergerakan lebih hati-hati.', desc_en: 'Dense fog: Reduced visibility, cautious movement.' },
      blizzard: { title_id: '❄️ Badai Salju', title_en: '❄️ Blizzard', desc_id: 'Jalanan membeku parah: Langkah pergerakan dadu pemain berkurang -2 langkah.', desc_en: 'Freezing streets: Dice movement reduced by -2 steps.' },
      heatwave: { title_id: '🔥 Gelombang Panas', title_en: '🔥 Heatwave', desc_id: 'Panas ekstrem: Biaya utilitas listrik dan pendingin naik 2x lipat (+ $50).', desc_en: 'Extreme heat: Utility costs doubled (+ $50).' },
      clear: { title_id: '🌈 Langit Cerah Neon', title_en: '🌈 Clear Neon Sky', desc_id: 'Udara segar dan langit cerah: Bonus ekstra +10% pada seluruh reward.', desc_en: 'Fresh air and clear sky: +10% extra bonus on all rewards.' },
      aurora: { title_id: '🌌 Aurora Kuantum', title_en: '🌌 Quantum Aurora', desc_id: 'Fenomena langit langka: Sewa distrik melonjak +25% dan langkah dadu +1 langkah ekstra.', desc_en: 'Rare sky phenomenon: District rents +25%, dice roll +1 step.' },
      acidRain: { title_id: '🧪 Hujan Asam Korosif', title_en: '🧪 Acid Rain', desc_id: 'Polusi berbahaya: Sewa turun -15%, dilarang membangun, denda dekontaminasi $30.', desc_en: 'Corrosive pollution: Rents -15%, building disabled, $30 decontamination fee.' },
      solarEclipse: { title_id: '🌑 Gerhana Matahari', title_en: '🌑 Solar Eclipse', desc_id: 'Kegelapan total menyelimuti kota: Sewa properti dipotong -30%.', desc_en: 'Total darkness: Property rents reduced by -30%.' },
      cyberSmog: { title_id: '💨 Asap Siber Pekat', title_en: '💨 Cyber Smog', desc_id: 'Asap pabrik korporasi: Biaya utilitas naik +50% dan biaya operasional +$20.', desc_en: 'Corporate smog: Utility costs +50%, operating costs +$20.' }
    },
    skills: {
      banker: { name: 'Freeze Rent (Bekukan Sewa)', desc: 'Membekukan sewa 1 properti lawan selama 3 giliran sehingga lawan tidak bisa menarik uang sewa.' },
      engineer: { name: 'Instant Upgrade (Upgrade Instan)', desc: 'Menaikkan 1 level bangunan secara gratis tanpa mengeluarkan saldo kas sepeser pun.' },
      trader: { name: 'Force Trade (Paksa Tukar)', desc: 'Memaksa pertukaran properti dengan lawan secara instan untuk merebut petak strategis.' },
      politician: { name: 'Emergency Tax (Pajak Darurat)', desc: 'Menarik pajak wajib sebesar 15% dari saldo kas seluruh pemain lawan ke kas pribadi.' },
      gambler: { name: 'Jackpot (Sewa Ganda)', desc: 'Menggandakan seluruh perolehan sewa properti sendiri (2x lipat) selama 2 giliran.' },
      guardian: { name: 'Rent Shield (Perisai Sewa)', desc: 'Menciptakan perisai pelindung yang mengabaikan 2 pembayaran sewa berikutnya.' },
      hacker: { name: 'Cyber Hijack (Retas Kas)', desc: 'Meretas rekening lawan terkaya dan menyedot $350 langsung ke saldo kas pribadi.' },
      tycoon: { name: 'Hostile Takeover (Akuisisi Paksa)', desc: 'Membeli paksa 1 properti lawan non-monopoli seharga 1.5x harga pasar tanpa izin.' },
      cyborg: { name: 'Overdrive Surge (+6 Langkah)', desc: 'Memberikan akselerasi instan +6 langkah dadu ekstra dan kebal sewa di petak pendaratan.' },
      broker: { name: 'Market Pump (Pompa Saham)', desc: 'Memompa harga seluruh portofolio saham +40% dan langsung mencairkan dividen tunai $250.' },
      detective: { name: 'District Quarantine (Karantina Distrik)', desc: 'Mengunci 1 distrik lawan selama 2 giliran sehingga distrik tersebut tidak menghasilkan sewa dan dilarang membangun.' },
      alchemist: { name: 'Quantum Duplication (Duplikasi Kartu)', desc: 'Menarik 2 kartu taktis Chance & Chest secara instan langsung ke tangan pemain.' }
    }
  };

  function init() {
    logs = [];
    matchStartTime = Date.now();
    setupEventListeners();
  }

  function addLog(entry) {
    const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    
    const gs = (typeof Game !== 'undefined') ? Game.getState() : null;
    const turn = gs ? (gs.turnCount || 1) : 1;
    const round = gs ? (gs.roundCount || 1) : 1;

    const logItem = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      time: timeStr,
      turn: turn,
      round: round,
      category: entry.category || 'all', // 'property' | 'finance' | 'combat' | 'event' | 'all'
      icon: entry.icon || '📌',
      title: entry.title || '',
      description: entry.description || '',
      badge: entry.badge || '',
      badgeType: entry.badgeType || 'info', // 'success' | 'warning' | 'danger' | 'info' | 'primary'
      details: entry.details || null,
      player: entry.player || null
    };

    logs.unshift(logItem); // Newest on top
    if (logs.length > 200) logs.pop();

    // Stream directly to live match feed on screen
    updateLiveFeed(logItem);

    // Update live drawer UI if open
    updateHistoryUI();
  }

  function updateLiveFeed(logItem) {
    const feed = document.getElementById('live-match-feed');
    const iconEl = document.getElementById('live-feed-icon');
    const badgeEl = document.getElementById('live-feed-badge');
    const textEl = document.getElementById('live-feed-text');
    if (!feed || !logItem) return;

    if (iconEl) iconEl.textContent = logItem.icon || '📌';
    if (badgeEl) {
      badgeEl.textContent = logItem.badge || 'EVENT';
      badgeEl.className = `live-feed-badge badge-${logItem.badgeType || 'info'}`;
    }
    if (textEl) {
      textEl.textContent = `${logItem.title} — ${logItem.description}`;
    }

    // Trigger subtle glowing pulse animation
    feed.classList.remove('feed-pulse');
    void feed.offsetWidth;
    feed.classList.add('feed-pulse');
  }

  function toggleHistoryModal() {
    if (typeof UI !== 'undefined') {
      const modal = document.getElementById('modal-history');
      if (modal && modal.classList.contains('active')) {
        UI.hideModal('history');
      } else {
        UI.showModal('history');
        updateHistoryUI();
      }
    }
  }

  function setupEventListeners() {
    // 1. Game Started
    Events.on('gameStarted', (state) => {
      init();
      addLog({
        category: 'event',
        icon: '🚀',
        title: 'Permainan Dimulai / Game Started',
        description: 'Pertandingan Monopoli Cyberpunk Hardcore dimulai! Sebanyak ' + (state.players?.length || 0) + ' pemain bertanding merebut dominasi 6 distrik.',
        badge: 'START',
        badgeType: 'primary'
      });
    });

    // 2. Dice Roll & Movement
    Events.on('diceRolled', (data) => {
      const p = data.player;
      const res = data.result;
      if (!p || !res) return;
      addLog({
        category: 'property',
        icon: '🎲',
        title: `${p.name} Melempar Dadu [ ${res.dice1} + ${res.dice2} = ${res.total} ]`,
        description: `${p.name} melangkah ${res.total} petak.${res.isDouble ? ' 🔥 Mendapatkan DOUBLE! Giliran ekstra setelah langkah ini.' : ''}`,
        badge: res.isDouble ? 'DOUBLE' : `LANGKAH +${res.total}`,
        badgeType: res.isDouble ? 'warning' : 'info',
        player: p.name
      });
    });

    // 3. Property Purchase
    Events.on('propertyBought', (data) => {
      const p = data.player || { name: 'Player' };
      const t = data.tile || {};
      const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
      const tileName = (lang === 'id' ? t.name_id : t.name_en) || t.name_en || 'Properti';
      addLog({
        category: 'property',
        icon: '🏠',
        title: `${p.name} Membeli ${tileName}`,
        description: `${p.name} mengakuisisi ${tileName} seharga $${data.price || t.price}. Properti ini kini menghasilkan uang sewa bagi ${p.name}.`,
        badge: `BELI $${data.price || t.price}`,
        badgeType: 'success',
        player: p.name
      });
    });

    // 4. Building Upgrade (Houses / Hotel / Special)
    Events.on('buildingAdded', (data) => {
      const gs = typeof Game !== 'undefined' ? Game.getState() : null;
      const p = gs ? gs.players.find(pl => pl.id === data.playerId) : null;
      const t = gs && gs.tiles ? gs.tiles[data.tileIndex] : null;
      const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
      const tileName = t ? ((lang === 'id' ? t.name_id : t.name_en) || t.name_en) : 'Properti';
      const bType = data.buildingType || 'house';
      
      const bName = bType === 'hotel' ? 'Hotel 🏨' : bType === 'mall' ? 'Mall Bisnis 🏬' : bType === 'hq' ? 'Markas Besar (HQ) 🏢' : bType === 'casino' ? 'Kasino Mewah 🎰' : bType === 'fortress' ? 'Benteng Pertahanan 🏰' : 'Rumah 🏠';
      addLog({
        category: 'property',
        icon: '🏗️',
        title: `${p ? p.name : 'Pemain'} Membangun ${bName} di ${tileName}`,
        description: `Konstruksi ${bName} selesai! Nilai sewa ${tileName} melonjak drastis saat lawan mendarat.`,
        badge: `UPGRADE: ${bType.toUpperCase()}`,
        badgeType: 'warning',
        player: p ? p.name : null
      });
    });

    // 5. Rent Payment
    Events.on('rentPaid', (data) => {
      const gs = typeof Game !== 'undefined' ? Game.getState() : null;
      const payer = gs ? gs.players.find(p => p.id === data.payerId) : null;
      const owner = gs ? gs.players.find(p => p.id === data.ownerId) : null;
      const t = gs && gs.tiles ? gs.tiles[data.tileIndex] : null;
      const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
      const tileName = t ? ((lang === 'id' ? t.name_id : t.name_en) || t.name_en) : 'Properti';

      addLog({
        category: 'property',
        icon: '💸',
        title: `${payer ? payer.name : 'Penyewa'} Membayar Sewa $${data.amount} ke ${owner ? owner.name : 'Pemilik'}`,
        description: `${payer ? payer.name : 'Pemain'} mendarat di ${tileName} dan membayar sewa wajib sebesar $${data.amount} kepada ${owner ? owner.name : 'pemilik'}.`,
        badge: `SEWA $${data.amount}`,
        badgeType: 'danger',
        player: payer ? payer.name : null
      });
    });

    // 6. Character Active Skill
    Events.on('skillUsed', (data) => {
      const p = data.player;
      const char = data.character;
      const skillInfo = EXPLANATIONS.skills[char] || { name: 'Active Skill', desc: 'Mengaktifkan kemampuan taktis khusus karakter.' };
      addLog({
        category: 'combat',
        icon: '⚡',
        title: `${p ? p.name : 'Karakter'} Mengaktifkan Skill: [${skillInfo.name}]`,
        description: `${p ? p.name : 'Pemain'} (${char.toUpperCase()}) menggunakan skill aktif: ${skillInfo.desc}`,
        badge: `SKILL: ${char.toUpperCase()}`,
        badgeType: 'primary',
        player: p ? p.name : null
      });
    });

    // 7. Global Economy Event
    Events.on('economyEventTriggered', (data) => {
      const ev = EXPLANATIONS.economy[data.eventId] || { title_id: 'Event Ekonomi', title_en: 'Economy Event', desc_id: 'Kondisi ekonomi kota berubah.', desc_en: 'City economy changed.' };
      const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
      addLog({
        category: 'event',
        icon: '🌐',
        title: `EVENT GLOBAL: ${lang === 'id' ? ev.title_id : ev.title_en}`,
        description: lang === 'id' ? ev.desc_id : ev.desc_en,
        badge: 'ECONOMY EVENT',
        badgeType: 'warning'
      });
    });

    // 8. District Weather Change
    Events.on('weatherChanged', (data) => {
      const wId = data.current || 'sunny';
      const wInfo = EXPLANATIONS.weather[wId] || { title_id: 'Cuaca Berubah', title_en: 'Weather Changed', desc_id: 'Kondisi atmosfer kota berubah.', desc_en: 'City weather changed.' };
      const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
      addLog({
        category: 'event',
        icon: '🌩️',
        title: `CUACA DISTRIK: ${lang === 'id' ? wInfo.title_id : wInfo.title_en}`,
        description: `${lang === 'id' ? wInfo.desc_id : wInfo.desc_en} (Berlaku selama ${data.turnsLeft || 3} giliran ke depan).`,
        badge: 'WEATHER ALERT',
        badgeType: 'info'
      });
    });

    // 9. Black Market Purchase
    Events.on('blackMarketSuccess', (data) => {
      const gs = typeof Game !== 'undefined' ? Game.getState() : null;
      const p = gs ? gs.players.find(pl => pl.id === data.playerId) : null;
      addLog({
        category: 'combat',
        icon: '🕶️',
        title: `${p ? p.name : 'Pemain'} Menyelundupkan Item Pasar Gelap: [${data.itemId}]`,
        description: `${p ? p.name : 'Pemain'} berhasil melakukan transaksi ilegal di Pasar Gelap dan memperoleh item selundupan [${data.itemId}] tanpa tertangkap razia kepolisian.`,
        badge: 'BLACK MARKET',
        badgeType: 'danger',
        player: p ? p.name : null
      });
    });

    Events.on('blackMarketCaught', (data) => {
      const gs = typeof Game !== 'undefined' ? Game.getState() : null;
      const p = gs ? gs.players.find(pl => pl.id === data.playerId) : null;
      addLog({
        category: 'combat',
        icon: '🚨',
        title: `RAZIA POLISI! ${p ? p.name : 'Pemain'} Tertangkap di Pasar Gelap`,
        description: `Razia mendadak kepolisian siber! ${p ? p.name : 'Pemain'} tertangkap basah dan dijatuhi denda penalti sebesar -$${data.penalty || 600}.`,
        badge: 'RAZIA POLISI',
        badgeType: 'danger',
        player: p ? p.name : null
      });
    });

    // 10. Loan Taken & Repaid
    Events.on('loanTaken', (data) => {
      const gs = typeof Game !== 'undefined' ? Game.getState() : null;
      const p = gs ? gs.players.find(pl => pl.id === data.playerId) : null;
      addLog({
        category: 'finance',
        icon: '🏦',
        title: `${p ? p.name : 'Pemain'} Mengambil Pinjaman ${data.type.toUpperCase()} ($${data.amount})`,
        description: `${p ? p.name : 'Pemain'} mencairkan pinjaman dana likuiditas sebesar $${data.amount}. Bunga akan dikenakan setiap giliran.`,
        badge: `PINJAMAN: ${data.type.toUpperCase()}`,
        badgeType: 'warning',
        player: p ? p.name : null
      });
    });

    Events.on('loanRepaid', (data) => {
      const gs = typeof Game !== 'undefined' ? Game.getState() : null;
      const p = gs ? gs.players.find(pl => pl.id === data.playerId) : null;
      addLog({
        category: 'finance',
        icon: '✅',
        title: `${p ? p.name : 'Pemain'} Melunasi Hutang Pinjaman`,
        description: `${p ? p.name : 'Pemain'} berhasil melunasi kewajiban pinjaman dan membebaskan aset yang dijadikan jaminan.`,
        badge: 'LUNAS',
        badgeType: 'success',
        player: p ? p.name : null
      });
    });

    // 11. Property Mortgaged & Unmortgaged
    Events.on('propertyMortgaged', (data) => {
      const gs = typeof Game !== 'undefined' ? Game.getState() : null;
      const p = gs ? gs.players.find(pl => pl.id === data.playerId) : null;
      const t = gs && gs.tiles ? gs.tiles[data.tileIndex] : null;
      const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
      const tileName = t ? ((lang === 'id' ? t.name_id : t.name_en) || t.name_en) : 'Properti';
      addLog({
        category: 'finance',
        icon: '🔒',
        title: `${p ? p.name : 'Pemain'} Menggadaikan ${tileName}`,
        description: `${p ? p.name : 'Pemain'} menggadaikan sertifikat ${tileName} untuk mendapatkan dana darurat 50% nilai aset. Properti tidak menghasilkan sewa selama digadaikan.`,
        badge: 'GADAI ASET',
        badgeType: 'warning',
        player: p ? p.name : null
      });
    });

    Events.on('propertyUnmortgaged', (data) => {
      const gs = typeof Game !== 'undefined' ? Game.getState() : null;
      const p = gs ? gs.players.find(pl => pl.id === data.playerId) : null;
      const t = gs && gs.tiles ? gs.tiles[data.tileIndex] : null;
      const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
      const tileName = t ? ((lang === 'id' ? t.name_id : t.name_en) || t.name_en) : 'Properti';
      addLog({
        category: 'finance',
        icon: '🔓',
        title: `${p ? p.name : 'Pemain'} Menebus Sertifikat ${tileName}`,
        description: `${p ? p.name : 'Pemain'} melunasi tebusan gadai ${tileName}. Properti kini aktif kembali menghasilkan uang sewa!`,
        badge: 'TEBUS GADAI',
        badgeType: 'success',
        player: p ? p.name : null
      });
    });

    // 12. Trade Completed
    Events.on('tradeCompleted', (trade) => {
      const gs = typeof Game !== 'undefined' ? Game.getState() : null;
      const pFrom = gs ? gs.players.find(pl => pl.id === trade.fromId) : null;
      const pTo = gs ? gs.players.find(pl => pl.id === trade.toId) : null;
      addLog({
        category: 'finance',
        icon: '🤝',
        title: `Pertukaran Properti Sukses: ${pFrom ? pFrom.name : 'P1'} ↔ ${pTo ? pTo.name : 'P2'}`,
        description: `Kesepakatan pertukaran properti dan transfer dana disepakati bersama oleh kedua belah pihak.`,
        badge: 'TRADE SUKSES',
        badgeType: 'success'
      });
    });

    // 13. Joint Venture
    Events.on('jvAccepted', (proposal) => {
      const gs = typeof Game !== 'undefined' ? Game.getState() : null;
      const p1 = gs ? gs.players.find(pl => pl.id === proposal.fromId) : null;
      const p2 = gs ? gs.players.find(pl => pl.id === proposal.toId) : null;
      const t = gs && gs.tiles ? gs.tiles[proposal.tileIndex] : null;
      const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
      const tileName = t ? ((lang === 'id' ? t.name_id : t.name_en) || t.name_en) : 'Properti';

      addLog({
        category: 'finance',
        icon: '🏢',
        title: `Kemitraan Joint Venture (JV): ${tileName}`,
        description: `${p1 ? p1.name : 'P1'} dan ${p2 ? p2.name : 'P2'} resmi bermitra mengelola ${tileName} dengan rasio bagi hasil ${proposal.ratio}% / ${100 - proposal.ratio}%.`,
        badge: 'JOINT VENTURE',
        badgeType: 'primary'
      });
    });

    // 14. Auction Completed
    Events.on('auctionEnded', (data) => {
      const gs = typeof Game !== 'undefined' ? Game.getState() : null;
      const t = gs && gs.tiles ? gs.tiles[data.tileIndex] : null;
      const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
      const tileName = t ? ((lang === 'id' ? t.name_id : t.name_en) || t.name_en) : 'Properti';

      addLog({
        category: 'property',
        icon: '⚖️',
        title: `Lelang Ditutup: ${tileName} Dimenangkan oleh ${data.winner ? data.winner.name : 'Pemenang'} ($${data.winningBid})`,
        description: `Setelah proses penawaran sengit, ${data.winner ? data.winner.name : 'pemenang'} memenangkan lelang properti ${tileName} dengan penawaran tertinggi $${data.winningBid}.`,
        badge: `LELANG: $${data.winningBid}`,
        badgeType: 'warning',
        player: data.winner ? data.winner.name : null
      });
    });

    // 15. Player Bankrupt
    Events.on('playerBankrupt', (data) => {
      const p = data.player;
      addLog({
        category: 'combat',
        icon: '💀',
        title: `PEMAIN BANGKRUT: ${p ? p.name : 'Pemain'} Telah Tereliminasi!`,
        description: `${p ? p.name : 'Pemain'} kehabisan seluruh kas dan aset berharga, sehingga terpaksa dinyatakan bangkrut dan keluar dari arena pertandingan. Seluruh aset dikembalikan ke pasar kota.`,
        badge: 'BANGKRUT 💀',
        badgeType: 'danger',
        player: p ? p.name : null
      });
    });

    // 16. Chance & Cyber Chest Card Drawn
    Events.on('cardDrawn', (data) => {
      const p = data.player || { name: 'Player' };
      const card = data.card || {};
      const type = data.type || 'chance';
      const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
      const cardTitle = (lang === 'id' ? card.name_id : card.name_en) || card.name_en || 'Kartu Aksi';
      const cardDesc = (lang === 'id' ? card.desc_id : card.desc_en) || card.desc_en || '';
      const isChance = type === 'chance';

      addLog({
        category: isChance ? 'combat' : 'finance',
        icon: isChance ? '❓' : '📦',
        title: `${p.name} Menarik ${isChance ? 'Kartu Kesempatan' : 'Peti Siber'}: [${cardTitle}]`,
        description: `${p.name} mendarat di petak ${isChance ? 'Kesempatan' : 'Cyber Chest'} dan memicu efek: ${cardDesc}`,
        badge: isChance ? 'KESEMPATAN ❓' : 'CYBER CHEST 📦',
        badgeType: isChance ? 'warning' : 'primary',
        player: p.name
      });
    });

    // 17. Game Over / Match Summary Archival
    Events.on('gameOver', (data) => {
      const winner = data.winner;
      const durationSec = Math.floor((Date.now() - matchStartTime) / 1000);
      const gs = typeof Game !== 'undefined' ? Game.getState() : null;

      addLog({
        category: 'event',
        icon: '👑',
        title: `VICTORY! ${winner ? winner.name : 'Pemenang'} Menjuarai Pertandingan!`,
        description: `Pertandingan selesai! ${winner ? winner.name : 'Sang Juara'} menguasai perekonomian kota dan memenangkan turnamen Monopoli Hardcore.`,
        badge: 'WINNER 🏆',
        badgeType: 'success',
        player: winner ? winner.name : null
      });

      // Save match record into localStorage
      saveMatchRecord({
        date: new Date().toLocaleDateString('id-ID', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }),
        winnerName: winner ? winner.name : 'Unknown',
        winnerChar: winner ? winner.character : 'banker',
        winnerNetWorth: winner ? winner.netWorth : 0,
        totalTurns: gs ? gs.turnCount : 1,
        totalRounds: gs ? gs.roundCount : 1,
        durationSeconds: durationSec,
        playersCount: gs ? (gs.players ? gs.players.length : 1) : 1
      });
    });
  }

  function saveMatchRecord(record) {
    try {
      let history = JSON.parse(localStorage.getItem('monopoly_match_history') || '[]');
      history.unshift(record);
      if(history.length > 30) history.pop();
      localStorage.setItem('monopoly_match_history', JSON.stringify(history));
    } catch(e) {
      console.warn('Failed to save match history to localStorage:', e);
    }
  }

  function getMatchRecords() {
    try {
      return JSON.parse(localStorage.getItem('monopoly_match_history') || '[]');
    } catch(e) {
      return [];
    }
  }

  function setFilter(cat) {
    currentFilter = cat || 'all';
    updateHistoryUI();
  }

  function setSearch(query) {
    searchQuery = (query || '').toLowerCase();
    updateHistoryUI();
  }

  function getFilteredLogs() {
    return logs.filter(item => {
      // Category filter
      if (currentFilter !== 'all' && item.category !== currentFilter) {
        return false;
      }
      // Search query filter
      if (searchQuery) {
        const text = `${item.title} ${item.description} ${item.player || ''} ${item.badge || ''}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });
  }

  function updateHistoryUI() {
    const listEl = document.getElementById('history-feed-list');
    if (!listEl) return;

    const filtered = getFilteredLogs();

    // Update count badges on filter tabs
    const counts = {
      all: logs.length,
      property: logs.filter(l => l.category === 'property').length,
      finance: logs.filter(l => l.category === 'finance').length,
      combat: logs.filter(l => l.category === 'combat').length,
      event: logs.filter(l => l.category === 'event').length
    };

    ['all', 'property', 'finance', 'combat', 'event'].forEach(cat => {
      const tabEl = document.getElementById(`tab-hist-${cat}`);
      if (tabEl) {
        tabEl.classList.toggle('active', currentFilter === cat);
        const countSpan = tabEl.querySelector('.tab-count');
        if (countSpan) countSpan.textContent = counts[cat];
      }
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.6;">📜</div>
          <div style="font-size: 0.95rem; font-weight: bold; color: #94a3b8;">Belum ada catatan aktivitas</div>
          <div style="font-size: 0.8rem; margin-top: 0.25rem;">Aktivitas pergerakan, pembelian, sewa, event, dan skill akan tercatat otomatis di sini.</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(item => {
      const badgeColor = item.badgeType === 'danger' ? '#ef4444' :
                         item.badgeType === 'warning' ? '#f59e0b' :
                         item.badgeType === 'success' ? '#10b981' :
                         item.badgeType === 'primary' ? '#00ffff' : '#38bdf8';
      
      const badgeBg = item.badgeType === 'danger' ? 'rgba(239,68,68,0.12)' :
                      item.badgeType === 'warning' ? 'rgba(245,158,11,0.12)' :
                      item.badgeType === 'success' ? 'rgba(16,185,129,0.12)' :
                      item.badgeType === 'primary' ? 'rgba(0,255,255,0.12)' : 'rgba(56,189,248,0.12)';

      return `
        <div class="history-card" style="display:flex;gap:0.75rem;padding:0.75rem 0.9rem;background:rgba(15,23,42,0.65);border:1px solid rgba(255,255,255,0.08);border-left:3px solid ${badgeColor};border-radius:8px;margin-bottom:0.6rem;transition:all 0.2s;">
          <div style="font-size:1.5rem;line-height:1;display:flex;align-items:flex-start;padding-top:0.15rem;">
            ${item.icon}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.25rem;flex-wrap:wrap;">
              <div style="font-size:0.75rem;color:#94a3b8;display:flex;align-items:center;gap:0.4rem;">
                <span style="color:#00ffff;font-weight:600;">Turn ${item.turn}</span>
                <span>•</span>
                <span>${item.time}</span>
              </div>
              ${item.badge ? `<span style="font-size:0.7rem;font-weight:bold;color:${badgeColor};background:${badgeBg};border:1px solid ${badgeColor}40;padding:0.15rem 0.5rem;border-radius:12px;letter-spacing:0.5px;">${item.badge}</span>` : ''}
            </div>
            <div style="font-size:0.9rem;font-weight:bold;color:#f8fafc;margin-bottom:0.25rem;line-height:1.3;">
              ${item.title}
            </div>
            <div style="font-size:0.8rem;color:#cbd5e1;line-height:1.45;background:rgba(0,0,0,0.25);padding:0.45rem 0.6rem;border-radius:6px;border:1px solid rgba(255,255,255,0.04);">
              <span style="color:#38bdf8;font-weight:600;">💡 Penjelasan: </span>${item.description}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function showHistoryModal() {
    if (typeof UI !== 'undefined' && UI.showModal) {
      UI.showModal('history');
      updateHistoryUI();
    }
  }

  function showArchiveModal() {
    const records = getMatchRecords();
    const body = document.querySelector('#modal-archive .modal-body');
    if (!body) return;

    if (records.length === 0) {
      body.innerHTML = `
        <div style="text-align:center;padding:2rem;color:var(--text-muted);">
          <div style="font-size:2.5rem;margin-bottom:0.5rem;">📜</div>
          <div>Belum ada arsip riwayat pertandingan tersimpan.</div>
        </div>
      `;
    } else {
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:0.75rem;max-height:60vh;overflow-y:auto;padding-right:0.3rem;">
          ${records.map((r, i) => {
            const mins = Math.floor(r.durationSeconds / 60);
            const secs = r.durationSeconds % 60;
            return `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 1rem;background:rgba(15,23,42,0.8);border:1px solid rgba(0,255,255,0.2);border-radius:8px;">
                <div>
                  <div style="font-weight:bold;color:#00ffff;font-size:0.95rem;">👑 ${r.winnerName} <span style="font-size:0.8rem;color:#94a3b8;">(${r.winnerChar.toUpperCase()})</span></div>
                  <div style="font-size:0.75rem;color:#94a3b8;margin-top:0.2rem;">📅 ${r.date} • ⏱️ ${mins}m ${secs}s • 👥 ${r.playersCount} Pemain</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-weight:bold;color:#22c55e;font-size:0.95rem;">$${r.winnerNetWorth.toLocaleString()}</div>
                  <div style="font-size:0.75rem;color:#cbd5e1;">${r.totalTurns} Giliran</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    if (typeof UI !== 'undefined' && UI.showModal) {
      UI.showModal('archive');
    }
  }

  return {
    init,
    addLog,
    getLogs: () => logs,
    getFilteredLogs,
    setFilter,
    setSearch,
    updateHistoryUI,
    toggleHistoryModal,
    showHistoryModal,
    showArchiveModal,
    getMatchRecords,
    EXPLANATIONS
  };
})();

