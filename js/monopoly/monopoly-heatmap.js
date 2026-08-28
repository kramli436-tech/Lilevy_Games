/**
 * LILEVY GAMES - MONOPOLI PRO: MONTE CARLO SIMULATION & HEATMAP OVERLAY
 * Menghitung dan menampilkan peta panas (heatmap) probabilitas pendaratan 3 dadu
 * berdasarkan 100.000 simulasi stokastik (Python/C++ Engine).
 */

class MonopolyHeatmap {
  constructor() {
    this.apiUrl = 'http://localhost:8000/api/simulation/monte-carlo';
    this.currentProbabilities = [];
  }

  async openHeatmapModal(engine) {
    const modal = document.getElementById('modal-mono-heatmap');
    if (!modal) return;

    modal.classList.add('modal-open');
    this.renderLoading(true);

    try {
      const resp = await fetch(`${this.apiUrl}?map=${engine.currentMapId}`);
      if (resp.ok) {
        const data = await resp.json();
        this.currentProbabilities = data.probabilities;
        this.renderHeatmapResults(engine, data);
        return;
      }
    } catch (e) {
      // Fallback simulasi Monte Carlo lokal di JavaScript
      const data = this.runLocalMonteCarlo(engine.totalTiles, 50000);
      this.currentProbabilities = data.probabilities;
      this.renderHeatmapResults(engine, data);
    }
  }

  runLocalMonteCarlo(tileCount, iterations = 50000) {
    const visits = new Array(tileCount).fill(0);
    let pos = 0;
    const jailTile = tileCount === 40 ? 10 : 13;
    const goToJailTile = tileCount === 40 ? 30 : 39;

    for (let i = 0; i < iterations; i++) {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const d3 = Math.floor(Math.random() * 6) + 1;

      if (d1 === d2 && d2 === d3) {
        pos = jailTile;
      } else {
        pos = (pos + d1 + d2 + d3) % tileCount;
        if (pos === goToJailTile) pos = jailTile;
      }
      visits[pos]++;
    }

    const probabilities = visits.map(v => parseFloat(((v / iterations) * 100).toFixed(2)));
    return {
      tileCount,
      iterations,
      probabilities,
      hottestTile: probabilities.indexOf(Math.max(...probabilities)),
      maxProbability: Math.max(...probabilities)
    };
  }

  renderLoading(isLoading) {
    const listEl = document.getElementById('heatmap-ranking-list');
    if (listEl && isLoading) {
      listEl.innerHTML = '<div class="text-center py-6 text-xs text-indigo-600 animate-pulse">⚡ Menjalankan 50.000+ Simulasi Monte Carlo Dadu...</div>';
    }
  }

  renderHeatmapResults(engine, data) {
    const listEl = document.getElementById('heatmap-ranking-list');
    const subtitleEl = document.getElementById('heatmap-sim-info');
    if (subtitleEl) {
      subtitleEl.textContent = `Berdasarkan ${data.iterations.toLocaleString('id-ID')} iterasi lemparan 3 dadu (${engine.activeMap.name})`;
    }

    if (!listEl) return;
    listEl.innerHTML = '';

    // Buat daftar terurut dari probabilitas tertinggi ke terendah
    const rankedTiles = engine.activeTiles.map((t, idx) => ({
      tile: t,
      prob: data.probabilities[idx] || 0
    }));

    rankedTiles.sort((a, b) => b.prob - a.prob);

    rankedTiles.slice(0, 12).forEach((item, rank) => {
      const row = document.createElement('div');
      const isTop3 = rank < 3;
      row.className = `p-2.5 rounded-xl border flex items-center justify-between text-xs ${
        isTop3 ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      }`;

      row.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="w-6 h-6 rounded-lg font-black flex items-center justify-center text-xs ${
            rank === 0 ? 'bg-rose-600 text-white' : rank === 1 ? 'bg-amber-500 text-slate-950' : rank === 2 ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
          }">#${rank + 1}</span>
          <div>
            <span class="font-bold text-slate-900 dark:text-white block truncate max-w-[180px] sm:max-w-[240px]">${item.tile.name}</span>
            <span class="text-[10px] text-slate-500">${item.tile.city || item.tile.group || ''}</span>
          </div>
        </div>
        <div class="text-right">
          <span class="font-black font-mono text-sm ${isTop3 ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}">${item.prob}%</span>
          <span class="text-[9px] text-slate-400 block font-semibold">Peluang Singgah</span>
        </div>
      `;
      listEl.appendChild(row);
    });
  }
}

window.monopolyHeatmap = new MonopolyHeatmap();

