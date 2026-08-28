/**
 * LILEVY GAMES - COMPREHENSIVE MULTI-LANGUAGE & I18N ENGINE
 * Mengelola penerjemahan SEMUA teks antarmuka, view, modal, aturan, dan kontrol (ID 🇮🇩 & EN 🇬🇧).
 */

class I18nEngine {
  constructor() {
    this.currentLang = localStorage.getItem('lilevy_lang') || 'id';
    this.translations = {
      id: {
        appName: 'LILEVY GAMES',
        appTagline: 'Portal TTS & Monopoli Multi-Player',
        btnHome: 'Beranda',
        btnTts: 'Teka-Teki Silang',
        btnMonopoly: 'Monopoli Pro',
        btnRank: 'Peringkat',
        btnAchievements: 'Prestasi',
        btnBgm: 'Musik',
        btnLang: 'Bahasa',
        btnAuth: 'Masuk / Daftar',
        onlinePlayers: 'Online',
        
        // Home View (Hero & Bento Cards)
        heroTitle: 'Tantang Wawasan & Strategi Anda',
        heroDesc: 'Nikmati permainan Teka-Teki Silang interaktif dan simulasi Monopoli Pro multiplayer lengkap dengan 16 karakter unik, bursa efek saham, pasar gelap, dan lelang terbuka!',
        startTts: 'Mainkan TTS Edukatif ✍️',
        startMono: 'Mainkan Monopoli Pro 🎲',
        badgeTts: '9+ Kategori Soal',
        badgeMono: 'Multi-Player & AI',
        bentoTtsTitle: 'Teka-Teki Silang Pintar',
        bentoTtsDesc: 'Uji wawasan budaya nusantara, sains, sejarah, kuliner, dan geografi dunia dalam tata letak silang kata algoritmik.',
        bentoMonoTitle: 'Monopoli Dunia & Galaksi',
        bentoMonoDesc: 'Kuasai properti dunia, bangun Gedung Pencakar Langit (Skyscraper), manfaatkan event ekonomi makro, dan menangkan lelang terbuka!',
        bentoQuickTitle: 'Fitur Cepat & Eksklusif',
        bentoQuickTimeAttack: '⚡ Time-Attack (60 Detik)',
        bentoQuickCustom: '🧩 Pembuat TTS Kustom',
        bentoQuickHeatmap: '🔥 Peta Panas Monte Carlo',
        bentoRankTitle: 'Top 5 Jawara Global',
        bentoFeaturesTitle: 'Sistem Inovasi Terdepan',
        featTokens: '🎭 16 Karakter Bidak & Skill Unik',
        featStocks: '📈 Investasi Saham & Dividen',
        featBlackmarket: '🕵️‍♂️ Pasar Gelap & Sabotase',
        featEconomy: '🌐 20+ Siklus Ekonomi Makro',
        
        // TTS View
        ttsHeaderTitle: 'Teka-Teki Silang Nusantara & Dunia',
        ttsCategoryBadge: 'Budaya & Sains',
        ttsTimeAttackBadge: 'Mode Cepat',
        btnCheckTts: 'Periksa Jawaban 🔍',
        btnHintLetter: 'Buka Huruf (3x/hari)',
        btnHintWord: 'Buka Kata (2x/hari)',
        btnResetTts: 'Kosongkan 🔄',
        btnCustomTts: 'Buat TTS Sendiri 🧩',
        btnPrintPdf: 'Cetak PDF 🖨️',
        cluesAcrossTitle: 'Pertanyaan Mendatar',
        cluesDownTitle: 'Pertanyaan Menurun',
        timerLabel: 'Waktu',
        scoreLabel: 'Skor EXP',
        
        // Monopoly Top Bar & Board
        monoHeaderTitle: 'Monopoli Dunia Global',
        modeAi: 'Lawan AI',
        modeRoom: 'Room Multi-Player',
        roomIdLabel: 'ID Room:',
        btnCopyRoom: 'Salin ID Room',
        btnRoomChat: 'Chat 💬',
        btnAddBot: '+ Bot',
        btnBlackmarket: '🕵️‍♂️ Pasar Gelap',
        btnStocks: '📈 Saham',
        btnBounty: '🎯 Bounty',
        btnTrade: 'Barter 🤝',
        btnHeatmap: 'Heatmap 🔥',
        btnRules: 'Rules 📖',
        btnBank: 'Bank 🏦',
        btnSkills: 'Skill ⚡',
        btnRoomSetup: 'Room ⚙️',
        btnRestartMono: 'Mulai Ulang Game',
        
        // Disconnect & Game Actions
        dcBadge: 'Disconnect',
        dcTitle: 'Pemain Terputus',
        dcDesc: 'Menunggu pemain tersambung kembali (1 menit 30 detik) sebelum otomatis dikeluarkan.',
        dcTimeLeft: 'Sisa Waktu Tunggu',
        btnRollDice: 'Lempar Dadu 🎲',
        btnEndTurn: 'Selesai Giliran ⏭️',
        btnManageAssets: 'Kelola Aset 📋',
        btnMortgage: 'Gadaikan Tanah 📜',
        btnBuildHouse: 'Bangun Rumah 🏗️',
        
        // Buy Property Modal
        buyModalTitle: 'Peluang Investasi Properti',
        buyPriceLabel: 'Harga Pembelian:',
        buyRentLabel: 'Tarif Sewa Dasar:',
        btnBuyConfirm: 'Beli Sekarang 💰',
        btnBuyAuction: 'Buka Lelang Terbuka 🔨',
        btnBuySkip: 'Lewati / Tutup ❌',
        
        // Auction Modal
        auctionModalTitle: 'Lelang Terbuka Publik',
        auctionSubTitle: 'Penawaran tertinggi sebelum waktu 15 detik habis akan memenangkan properti!',
        auctionTimerLabel: 'Waktu Lelang:',
        auctionHighestBidLabel: 'Tawaran Tertinggi:',
        btnBid100: '+100.000',
        btnBid500: '+500.000',
        btnBid1M: '+1.000.000',
        btnAuctionPass: 'Mundur / Pass 🏳️',
        
        // Rules Modal (5 Tabs)
        rulesModalTitle: 'Buku Panduan & Aturan Monopoli Pro',
        rulesTab1: '📜 Aturan Inti',
        rulesTab2: '🌐 Ekonomi Global',
        rulesTab3: '🚀 Fitur Inovatif',
        rulesTab4: '🎭 16 Karakter',
        rulesTab5: '💡 Taktik Juara',
        
        // Achievements Modal
        achievementsTitle: 'Prestasi & Lencana Juara',
        achievementsDesc: 'Kumpulkan semua medali dan tingkatkan EXP akun Anda!',
        achTotalUnlocked: 'Total Terbuka:',
        badgeUnlocked: 'TERBUKA ✨',
        badgeLocked: 'TERKUNCI 🔒',
        
        // BGM Modal
        bgmModalTitle: 'Musik Latar Synthesizer',
        bgmModalDesc: 'Pilih tema melodi Web Audio tanpa buffering',
        bgmTrack1: '🎶 Lofi Chill & Study',
        bgmTrack2: '🎺 Nusantara Ethno Beat',
        bgmTrack3: '🕹️ Retro 8-Bit Arcade',
        bgmTrack4: '🌌 Cyberpunk Synthwave',
        bgmVolLabel: 'Volume Musik',
        btnBgmPlay: 'Putar Musik 🎵',
        btnBgmPause: 'Jeda Musik ⏸️',
        
        // Auth Modal
        authModalTitle: 'Masuk ke Lilevy Games',
        authModalDesc: 'Daftarkan akun agar skor, kemenangan, dan ranking Anda tersimpan permanen!',
        tabLogin: 'Masuk (Login)',
        tabRegister: 'Daftar Akun Baru',
        lblUsername: 'Username Pemain',
        lblPassword: 'Kata Sandi (Password)',
        lblAvatar: 'Pilih Avatar Pemain',
        lblFavToken: 'Bidak Karakter Monopoli Favorit',
        btnLoginSubmit: 'Masuk Sekarang 🚀',
        btnRegisterSubmit: 'Daftar Akun Permanen ✨',
        
        // Room Setup Modal
        setupModalTitle: 'Pengaturan Room Permainan',
        setupTabCreate: '🎲 Buat Room Baru',
        setupTabJoin: '🚀 Gabung Room Teman',
        lblPlayerName: 'Nama Pemain Anda',
        lblSelectMap: 'Pilih Peta Permainan',
        lblGameMode: 'Mode Permainan',
        modeRoomMulti: '👥 Room Multi-Player Asli',
        modeAiBot: '🤖 Lawan AI Bot',
        lblSelectToken: 'Pilih Token Karakter (16 Pilihan Bidak & Skill Unik)',
        lblStartMoney: 'Modal Awal Setiap Pemain',
        btnCreateRoomSubmit: 'Buat Room & Mulai Permainan 🎲',
        lblRoomCode: 'Kode ID Room Monopoli',
        btnJoinRoomSubmit: 'Gabung ke Room Game 🚀'
      },
      en: {
        appName: 'LILEVY GAMES',
        appTagline: 'Crossword & Multiplayer Monopoly Pro Platform',
        btnHome: 'Home',
        btnTts: 'Crossword',
        btnMonopoly: 'Monopoly Pro',
        btnRank: 'Leaderboard',
        btnAchievements: 'Achievements',
        btnBgm: 'Music',
        btnLang: 'Language',
        btnAuth: 'Login / Register',
        onlinePlayers: 'Online',
        
        // Home View (Hero & Bento Cards)
        heroTitle: 'Challenge Your Mind & Strategy',
        heroDesc: 'Enjoy interactive NLP Crossword puzzles and Pro Multiplayer Monopoly simulations with 16 unique character tokens, stock market investing, black market sabotage, and live auctions!',
        startTts: 'Play Crossword ✍️',
        startMono: 'Play Monopoly Pro 🎲',
        badgeTts: '9+ Categories',
        badgeMono: 'Multi-Player & AI',
        bentoTtsTitle: 'Smart Crossword Puzzle',
        bentoTtsDesc: 'Test your knowledge in culture, science, history, culinary, and world geography with dynamic algorithmic grid layouts.',
        bentoMonoTitle: 'World & Galaxy Monopoly',
        bentoMonoDesc: 'Dominate global properties, construct Sky Level 6 Skyscrapers, capitalize on macroeconomic cycles, and win public auctions!',
        bentoQuickTitle: 'Quick & Exclusive Modes',
        bentoQuickTimeAttack: '⚡ Time-Attack (60s)',
        bentoQuickCustom: '🧩 Custom Crossword Creator',
        bentoQuickHeatmap: '🔥 Monte Carlo Heatmap',
        bentoRankTitle: 'Top 5 Global Champions',
        bentoFeaturesTitle: 'Cutting-Edge Game Innovations',
        featTokens: '🎭 16 Character Tokens & Unique Skills',
        featStocks: '📈 Stock Investing & Dividends',
        featBlackmarket: '🕵️‍♂️ Black Market & Sabotage Cards',
        featEconomy: '🌐 20+ Macro-Economy Cycles',
        
        // TTS View
        ttsHeaderTitle: 'World & Indonesian Crossword',
        ttsCategoryBadge: 'Culture & Science',
        ttsTimeAttackBadge: 'Speed Mode',
        btnCheckTts: 'Check Answers 🔍',
        btnHintLetter: 'Reveal Letter (3x/day)',
        btnHintWord: 'Reveal Word (2x/day)',
        btnResetTts: 'Reset Puzzle 🔄',
        btnCustomTts: 'Create Custom Puzzle 🧩',
        btnPrintPdf: 'Print PDF 🖨️',
        cluesAcrossTitle: 'Across Clues',
        cluesDownTitle: 'Down Clues',
        timerLabel: 'Time',
        scoreLabel: 'EXP Score',
        
        // Monopoly Top Bar & Board
        monoHeaderTitle: 'Global World Monopoly',
        modeAi: 'Versus AI',
        modeRoom: 'Multi-Player Room',
        roomIdLabel: 'Room ID:',
        btnCopyRoom: 'Copy Room ID',
        btnRoomChat: 'Chat 💬',
        btnAddBot: '+ Bot',
        btnBlackmarket: '🕵️‍♂️ Black Market',
        btnStocks: '📈 Stocks',
        btnBounty: '🎯 Bounty',
        btnTrade: 'Trade 🤝',
        btnHeatmap: 'Heatmap 🔥',
        btnRules: 'Rules 📖',
        btnBank: 'Bank 🏦',
        btnSkills: 'Skills ⚡',
        btnRoomSetup: 'Room ⚙️',
        btnRestartMono: 'Restart Game',
        
        // Disconnect & Game Actions
        dcBadge: 'Disconnect',
        dcTitle: 'Player Disconnected',
        dcDesc: 'Waiting for player to reconnect (1 min 30 sec) before auto-kick.',
        dcTimeLeft: 'Time Remaining',
        btnRollDice: 'Roll Dice 🎲',
        btnEndTurn: 'End Turn ⏭️',
        btnManageAssets: 'Manage Assets 📋',
        btnMortgage: 'Mortgage Tile 📜',
        btnBuildHouse: 'Build Houses 🏗️',
        
        // Buy Property Modal
        buyModalTitle: 'Property Investment Opportunity',
        buyPriceLabel: 'Purchase Price:',
        buyRentLabel: 'Base Rent Rate:',
        btnBuyConfirm: 'Buy Property Now 💰',
        btnBuyAuction: 'Start Public Auction 🔨',
        btnBuySkip: 'Pass / Close ❌',
        
        // Auction Modal
        auctionModalTitle: 'Live Public Auction',
        auctionSubTitle: 'Highest bidder when the 15-second countdown ends wins the property!',
        auctionTimerLabel: 'Auction Time:',
        auctionHighestBidLabel: 'Highest Bid:',
        btnBid100: '+100,000',
        btnBid500: '+500,000',
        btnBid1M: '+1,000,000',
        btnAuctionPass: 'Withdraw / Pass 🏳️',
        
        // Rules Modal (5 Tabs)
        rulesModalTitle: 'Monopoly Pro Master Guide & Rules',
        rulesTab1: '📜 Core Rules',
        rulesTab2: '🌐 Global Economy',
        rulesTab3: '🚀 Innovative Features',
        rulesTab4: '🎭 16 Characters',
        rulesTab5: '💡 Champion Tactics',
        
        // Achievements Modal
        achievementsTitle: 'Achievements & Trophy Badges',
        achievementsDesc: 'Collect all trophies and level up your player account EXP!',
        achTotalUnlocked: 'Total Unlocked:',
        badgeUnlocked: 'UNLOCKED ✨',
        badgeLocked: 'LOCKED 🔒',
        
        // BGM Modal
        bgmModalTitle: 'Background Music Synthesizer',
        bgmModalDesc: 'Select instant zero-buffer Web Audio melody themes',
        bgmTrack1: '🎶 Lofi Chill & Study',
        bgmTrack2: '🎺 Nusantara Ethno Beat',
        bgmTrack3: '🕹️ Retro 8-Bit Arcade',
        bgmTrack4: '🌌 Cyberpunk Synthwave',
        bgmVolLabel: 'Music Volume',
        btnBgmPlay: 'Play Music 🎵',
        btnBgmPause: 'Pause Music ⏸️',
        
        // Auth Modal
        authModalTitle: 'Sign In to Lilevy Games',
        authModalDesc: 'Create an account to save your scores, wins, and leaderboard rank permanently!',
        tabLogin: 'Sign In (Login)',
        tabRegister: 'Create New Account',
        lblUsername: 'Player Username',
        lblPassword: 'Password',
        lblAvatar: 'Choose Player Avatar',
        lblFavToken: 'Favorite Monopoly Character Token',
        btnLoginSubmit: 'Sign In Now 🚀',
        btnRegisterSubmit: 'Register Permanent Account ✨',
        
        // Room Setup Modal
        setupModalTitle: 'Game Room Settings',
        setupTabCreate: '🎲 Create New Room',
        setupTabJoin: '🚀 Join Friend\'s Room',
        lblPlayerName: 'Your Player Name',
        lblSelectMap: 'Choose Game Map',
        lblGameMode: 'Game Mode',
        modeRoomMulti: '👥 Real Multi-Player Room',
        modeAiBot: '🤖 Play vs AI Bots',
        lblSelectToken: 'Choose Character Token (16 Unique Tokens & Skills)',
        lblStartMoney: 'Starting Capital for Each Player',
        btnCreateRoomSubmit: 'Create Room & Start Game 🎲',
        lblRoomCode: 'Monopoly Room ID Code',
        btnJoinRoomSubmit: 'Join Game Room 🚀'
      }
    };
  }

  t(key, defaultVal = '') {
    const langDict = this.translations[this.currentLang] || this.translations['id'];
    return langDict[key] || defaultVal || key;
  }

  setLanguage(lang) {
    if (lang !== 'id' && lang !== 'en') return;
    this.currentLang = lang;
    localStorage.setItem('lilevy_lang', lang);
    this.applyTranslations();
    
    // Callback event
    if (window.onLanguageChanged) {
      window.onLanguageChanged(lang);
    }
  }

  toggleLanguage() {
    const nextLang = this.currentLang === 'id' ? 'en' : 'id';
    this.setLanguage(nextLang);
    return nextLang;
  }

  applyTranslations() {
    // 1. Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        const text = this.t(key);
        if (text) el.textContent = text;
      }
    });

    // 2. Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        const text = this.t(key);
        if (text) el.placeholder = text;
      }
    });

    // 3. Update title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        const text = this.t(key);
        if (text) el.title = text;
      }
    });

    // 4. Update language badge in UI if present
    const langBadge = document.getElementById('current-lang-badge');
    if (langBadge) {
      langBadge.textContent = this.currentLang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN';
    }

    // 5. Update HTML lang tag
    document.documentElement.lang = this.currentLang;
  }
}

window.i18n = new I18nEngine();
