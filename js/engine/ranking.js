/**
 * LILEVY GAMES - MULTI-GAME LEADERBOARD & RANKING ENGINE
 * Mengelola papan peringkat pemain asli terdaftar (TTS Pintar & Monopoli Pro).
 * Akun pemain tersimpan permanen dan hanya user terdaftar yang masuk ranking.
 */

class RankingEngine {
  constructor() {
    this.TIERS = [
      { min: 0, max: 500, title: 'Pemula Kata & Properti', badge: 'Bronze', icon: '🥉', color: 'text-amber-700 dark:text-amber-500', bg: 'bg-amber-100 dark:bg-amber-950/60' },
      { min: 501, max: 2000, title: 'Investor Muda', badge: 'Silver', icon: '🥈', color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-200 dark:bg-slate-800' },
      { min: 2001, max: 5000, title: 'Konglomerat Kota', badge: 'Gold', icon: '🥇', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-950/60' },
      { min: 5001, max: 10000, title: 'Taipan Properti', badge: 'Platinum', icon: '💎', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-950/60' },
      { min: 10001, max: Infinity, title: 'Kaisar Monopoli Global', badge: 'Grandmaster', icon: '👑', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-950/60' }
    ];
  }

  getTierInfo(points = 0) {
    for (let i = 0; i < this.TIERS.length; i++) {
      const tier = this.TIERS[i];
      if (points >= tier.min && points <= tier.max) {
        const nextTier = this.TIERS[i + 1] || null;
        let progress = 100;
        let pointsNeeded = 0;

        if (nextTier) {
          const range = tier.max - tier.min;
          const currentInRange = points - tier.min;
          progress = Math.min(100, Math.max(0, Math.round((currentInRange / range) * 100)));
          pointsNeeded = (tier.max + 1) - points;
        }

        return {
          ...tier,
          progress,
          pointsNeeded,
          nextTier
        };
      }
    }
    return this.TIERS[0];
  }

  // Ambil daftar seluruh user terdaftar untuk disusun dalam leaderboard
  getFullLeaderboard() {
    const auth = window.authEngine;
    if (!auth) return [];

    const usersDb = auth.users || {};
    const leaderboardList = [];

    Object.values(usersDb).forEach(user => {
      const totalPoints = user.stats?.totalPoints || 0;
      const tier = this.getTierInfo(totalPoints);
      leaderboardList.push({
        id: user.id,
        name: user.username,
        avatar: user.avatar || '🧠',
        favoriteToken: user.favoriteToken || '🚗',
        totalPoints: totalPoints,
        ttsSolved: user.stats?.ttsSolved || 0,
        monopolyWins: user.stats?.monopolyWins || 0,
        monopolyGames: user.stats?.monopolyGames || 0,
        monopolyNetWorth: user.stats?.monopolyTotalNetWorth || 0,
        rankBadge: tier.badge,
        tierTitle: tier.title,
        isCurrentUser: (auth.currentUser && auth.currentUser.id === user.id)
      });
    });

    // Urutkan berdasarkan total poin tertinggi
    leaderboardList.sort((a, b) => b.totalPoints - a.totalPoints);
    return leaderboardList;
  }

  getUserRank(userId) {
    const list = this.getFullLeaderboard();
    const idx = list.findIndex(p => p.id === userId);
    return idx !== -1 ? idx + 1 : list.length + 1;
  }

  syncUserRanking(user) {
    // Dipanggil saat authEngine memperbarui skor pemain
    if (window.appController && window.appController.renderLeaderboard) {
      window.appController.renderLeaderboard();
    }
  }
}

window.rankingEngine = new RankingEngine();
