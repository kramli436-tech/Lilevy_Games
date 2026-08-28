/**
 * LILEVY GAMES - ACHIEVEMENTS & TROPHY BADGES SYSTEM
 * Mengelola pencapaian prestasi, tracking kemajuan, lencana interaktif, dan hadiah EXP.
 */

class AchievementEngine {
  constructor() {
    this.storageKey = 'lilevy_achievements';
    this.unlocked = this.loadUnlocked();
    
    this.list = [
      {
        id: 'TYCOON_CASH',
        title: 'Sultan Konglomerat',
        titleEn: 'Tycoon Master',
        desc: 'Memiliki saldo kas tunai mencapai Rp 30.000.000 di Monopoli.',
        descEn: 'Accumulate a cash balance of Rp 30,000,000 in Monopoly.',
        icon: '👑',
        exp: 250,
        category: 'monopoly'
      },
      {
        id: 'SKYSCRAPER_BUILDER',
        title: 'Arsitek Langit',
        titleEn: 'Sky Architect',
        desc: 'Membangun minimal 1 Gedung Pencakar Langit (Skyscraper Level 6).',
        descEn: 'Build at least 1 Skyscraper (Level 6).',
        icon: '🏢',
        exp: 200,
        category: 'monopoly'
      },
      {
        id: 'COLOR_MONOPOLY',
        title: 'Raja Monopoli',
        titleEn: 'Color Monopolist',
        desc: 'Menguasai seluruh petak dalam 1 set warna yang sama.',
        descEn: 'Own all property tiles of the same color set.',
        icon: '🎨',
        exp: 150,
        category: 'monopoly'
      },
      {
        id: 'SMART_TRADER',
        title: 'Negosiator Ulung',
        titleEn: 'Savvy Negotiator',
        desc: 'Berhasil melakukan kesepakatan barter properti dengan pemain lain.',
        descEn: 'Successfully complete a property trade deal.',
        icon: '🤝',
        exp: 150,
        category: 'monopoly'
      },
      {
        id: 'AUCTION_MASTER',
        title: 'Pemenang Lelang',
        titleEn: 'Auction Victor',
        desc: 'Memenangkan penawaran properti di lelang terbuka publik.',
        descEn: 'Win a property bid in the live public auction.',
        icon: '🔨',
        exp: 150,
        category: 'monopoly'
      },
      {
        id: 'CASINO_JACKPOT',
        title: 'Keberuntungan Kasino',
        titleEn: 'Casino High Roller',
        desc: 'Memutar roda keberuntungan di kasino dan mendapatkan hadiah.',
        descEn: 'Spin the fortune wheel at the casino and win a prize.',
        icon: '🎰',
        exp: 100,
        category: 'monopoly'
      },
      {
        id: 'STOCK_INVESTOR',
        title: 'Investor Saham Global',
        titleEn: 'Global Stock Investor',
        desc: 'Membeli lembar saham di Bursa Efek Monopoli.',
        descEn: 'Purchase stock shares in the Monopoly Stock Market.',
        icon: '📈',
        exp: 100,
        category: 'monopoly'
      },
      {
        id: 'DARK_AGENT',
        title: 'Operasi Bawah Tanah',
        titleEn: 'Underground Agent',
        desc: 'Membeli kartu sabotase rahasia di Pasar Gelap.',
        descEn: 'Buy a secret sabotage card at the Black Market.',
        icon: '🕵️‍♂️',
        exp: 100,
        category: 'monopoly'
      },
      {
        id: 'TTS_NO_HINT',
        title: 'Pikiran Murni',
        titleEn: 'Pure Mind',
        desc: 'Menyelesaikan 1 papan Teka-Teki Silang tanpa memakai kuota bantuan.',
        descEn: 'Solve a Crossword puzzle without using any hints.',
        icon: '🧠',
        exp: 200,
        category: 'tts'
      },
      {
        id: 'TTS_SOLVE_3',
        title: 'Master Kata',
        titleEn: 'Word Master',
        desc: 'Menyelesaikan total minimal 3 teka-teki silang.',
        descEn: 'Solve at least 3 crossword puzzles.',
        icon: '✍️',
        exp: 250,
        category: 'tts'
      },
      {
        id: 'CUSTOM_TTS_CREATOR',
        title: 'Pencipta Teka-Teki',
        titleEn: 'Puzzle Creator',
        desc: 'Membuat dan memainkan teka-teki silang buatan sendiri.',
        descEn: 'Create and play your own custom crossword puzzle.',
        icon: '🧩',
        exp: 150,
        category: 'tts'
      },
      {
        id: 'MULTI_TOKEN_PRO',
        title: 'Eksplorator Bidak',
        titleEn: 'Token Explorer',
        desc: 'Mencoba bermain dengan salah satu dari 16 karakter token unik.',
        descEn: 'Play with one of the 16 unique character tokens.',
        icon: '🎭',
        exp: 100,
        category: 'general'
      }
    ];
  }

  loadUnlocked() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  saveUnlocked() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.unlocked));
    } catch (e) {}
  }

  unlock(achievementId) {
    if (this.unlocked[achievementId]) return false; // Sudah terbuka

    const ach = this.list.find(a => a.id === achievementId);
    if (!ach) return false;

    this.unlocked[achievementId] = {
      unlockedAt: new Date().toISOString(),
      exp: ach.exp
    };
    this.saveUnlocked();

    // Tambahkan exp ke ranking pengguna
    if (window.rankingEngine) {
      window.rankingEngine.addPoints(ach.exp);
    }

    // Suara keberhasilan
    if (window.soundEngine) {
      window.soundEngine.playLevelComplete();
    }

    // Tampilkan notifikasi pencapaian
    this.showAchievementToast(ach);
    return true;
  }

  showAchievementToast(ach) {
    const isEn = window.i18n?.currentLang === 'en';
    const title = isEn ? ach.titleEn : ach.title;
    const desc = isEn ? ach.descEn : ach.desc;

    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl flex items-center gap-3 border border-indigo-400/40 animate-bounce duration-300';
    toast.innerHTML = `
      <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl shadow-inner font-black">
        ✨
      </div>
      <div>
        <span class="text-[10px] font-black tracking-widest uppercase text-amber-200 block">PRESTASI TERBUKA! (+${ach.exp} EXP)</span>
        <h4 class="font-bold text-sm">${title}</h4>
        <p class="text-xs text-white/90">${desc}</p>
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'all 0.5s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 500);
    }, 4500);
  }

  getProgress() {
    const total = this.list.length;
    const unlockedCount = Object.keys(this.unlocked).length;
    return {
      unlocked: unlockedCount,
      total: total,
      percent: Math.round((unlockedCount / total) * 100)
    };
  }
}

window.achievementEngine = new AchievementEngine();

