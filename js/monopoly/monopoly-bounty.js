/**
 * LILEVY GAMES - MONOPOLI PRO: SISTEM BOUNTY & MISI TANTANGAN (BOUNTY QUESTS)
 * Memberikan target objektif berhadiah uang tunai raksasa & EXP peringkat.
 */

class MonopolyBounty {
  constructor() {
    this.quests = [
      {
        id: 'q_hotel',
        title: 'Arsitek Megah',
        icon: '🏨',
        desc: 'Bangun minimal 1 Hotel Megah di atas papan.',
        rewardMoney: 5000000,
        rewardExp: 400,
        isCompleted: false,
        check: (engine, player) => {
          return engine.activeTiles.some(t => engine.propertyState[t.id]?.ownerId === player.id && engine.propertyState[t.id]?.isHotel);
        }
      },
      {
        id: 'q_monopoly_2',
        title: 'Kaisar Dua Benua',
        icon: '🌍',
        desc: 'Kuasai seluruh kawasan dalam 2 kelompok warna berbeda.',
        rewardMoney: 6000000,
        rewardExp: 500,
        isCompleted: false,
        check: (engine, player) => {
          const ownedGroups = new Set();
          Object.keys(engine.activeGroups).forEach(g => {
            if (engine.checkFullGroupOwnership(player.id, g)) {
              ownedGroups.add(g);
            }
          });
          return ownedGroups.size >= 2;
        }
      },
      {
        id: 'q_cash_king',
        title: 'Sultan Likuiditas',
        icon: '💰',
        desc: 'Capai saldo uang kas tunai minimal Rp 25.000.000.',
        rewardMoney: 4000000,
        rewardExp: 350,
        isCompleted: false,
        check: (engine, player) => player.money >= 25000000
      },
      {
        id: 'q_bounty_hunter',
        title: 'Bounty Hunter',
        icon: '🎯',
        desc: 'Singkirkan minimal 1 lawan hingga mengalami kebangkrutan.',
        rewardMoney: 8000000,
        rewardExp: 600,
        isCompleted: false,
        check: (engine) => {
          return engine.players.some(p => p.isBankrupt);
        }
      }
    ];
  }

  checkAllQuests(engine, player) {
    if (!player || player.isBankrupt) return;

    this.quests.forEach(q => {
      if (!q.isCompleted && q.check(engine, player)) {
        q.isCompleted = true;
        player.money += q.rewardMoney;
        if (window.rankingEngine && !player.isAI) {
          window.rankingEngine.addPoints(q.rewardExp);
        }

        engine.log(`🏆 [BOUNTY TERCAPAI] ${player.name} menyelesaikan misi [${q.title}]! Hadiah: ${engine.formatRupiah(q.rewardMoney)} + ${q.rewardExp} EXP!`, 'success');
        if (window.soundEngine) window.soundEngine.playVictory();

        if (typeof confetti === 'function' && !player.isAI) {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
        }
      }
    });
  }
}

window.monopolyBounty = new MonopolyBounty();
