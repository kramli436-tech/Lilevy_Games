/**
 * LILEVY GAMES - MONOPOLI PRO: BARTER & NEGOSIASI PROPERTI (AI & MULTIPLAYER)
 * Mengelola sistem pertukaran properti & uang tunai antar pemain dengan evaluasi cerdas AI.
 */

class MonopolyTrade {
  constructor() {
    this.apiUrl = 'http://localhost:8000/api/ai/negotiate';
  }

  // Buka modal barter
  openTradeModal(engine) {
    const current = engine.getCurrentPlayer();
    if (!current) return;

    const modal = document.getElementById('modal-mono-trade');
    const targetSelect = document.getElementById('trade-target-player');
    if (!modal || !targetSelect) return;

    // Isi daftar target pemain lain (yang belum bangkrut)
    targetSelect.innerHTML = '';
    const otherPlayers = engine.players.filter(p => p.id !== current.id && !p.isBankrupt);

    if (otherPlayers.length === 0) {
      alert('Tidak ada pemain lain yang tersedia untuk diajak barter.');
      return;
    }

    otherPlayers.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.token} ${p.name} (${engine.formatRupiah(p.money)})`;
      targetSelect.appendChild(opt);
    });

    targetSelect.onchange = () => this.renderTradeAssetLists(engine);
    this.renderTradeAssetLists(engine);

    modal.classList.add('modal-open');
  }

  // Render daftar aset yang bisa ditukarkan
  renderTradeAssetLists(engine) {
    const current = engine.getCurrentPlayer();
    const targetId = document.getElementById('trade-target-player')?.value;
    const targetPlayer = engine.players.find(p => p.id === targetId);

    const myPropsContainer = document.getElementById('trade-my-properties');
    const targetPropsContainer = document.getElementById('trade-target-properties');
    if (!myPropsContainer || !targetPropsContainer || !targetPlayer) return;

    // Properti milik pemain saat ini
    myPropsContainer.innerHTML = '';
    const myOwned = engine.activeTiles.filter(t => engine.propertyState[t.id]?.ownerId === current.id && !engine.propertyState[t.id]?.isHotel && engine.propertyState[t.id]?.houses === 0);
    if (myOwned.length === 0) {
      myPropsContainer.innerHTML = '<p class="text-xs text-slate-400 italic p-2">Anda tidak memiliki tanah kosong untuk ditawarkan.</p>';
    } else {
      myOwned.forEach(t => {
        const item = document.createElement('label');
        item.className = 'flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs cursor-pointer border border-slate-200 dark:border-slate-700';
        item.innerHTML = `
          <input type="checkbox" name="my-trade-prop" value="${t.id}" class="text-indigo-600 rounded">
          <span class="font-bold flex-1">${t.name}</span>
          <span class="text-[10px] font-mono text-slate-500">${engine.formatRupiah(t.price)}</span>
        `;
        myPropsContainer.appendChild(item);
      });
    }

    // Properti milik target pemain
    targetPropsContainer.innerHTML = '';
    const targetOwned = engine.activeTiles.filter(t => engine.propertyState[t.id]?.ownerId === targetPlayer.id && !engine.propertyState[t.id]?.isHotel && engine.propertyState[t.id]?.houses === 0);
    if (targetOwned.length === 0) {
      targetPropsContainer.innerHTML = `<p class="text-xs text-slate-400 italic p-2">${targetPlayer.name} tidak memiliki tanah yang bisa dibarter.</p>`;
    } else {
      targetOwned.forEach(t => {
        const item = document.createElement('label');
        item.className = 'flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs cursor-pointer border border-slate-200 dark:border-slate-700';
        item.innerHTML = `
          <input type="checkbox" name="target-trade-prop" value="${t.id}" class="text-indigo-600 rounded">
          <span class="font-bold flex-1">${t.name}</span>
          <span class="text-[10px] font-mono text-slate-500">${engine.formatRupiah(t.price)}</span>
        `;
        targetPropsContainer.appendChild(item);
      });
    }
  }

  // Eksekusi penawaran barter
  async executeTradeOffer(engine) {
    const current = engine.getCurrentPlayer();
    const targetId = document.getElementById('trade-target-player')?.value;
    const targetPlayer = engine.players.find(p => p.id === targetId);
    if (!current || !targetPlayer) return;

    const mySelectedIds = Array.from(document.querySelectorAll('input[name="my-trade-prop"]:checked')).map(el => parseInt(el.value, 10));
    const targetSelectedIds = Array.from(document.querySelectorAll('input[name="target-trade-prop"]:checked')).map(el => parseInt(el.value, 10));
    const cashOffer = parseInt(document.getElementById('trade-cash-offer')?.value, 10) || 0;
    const cashRequest = parseInt(document.getElementById('trade-cash-request')?.value, 10) || 0;

    if (mySelectedIds.length === 0 && targetSelectedIds.length === 0 && cashOffer === 0 && cashRequest === 0) {
      alert('Pilihlah minimal satu properti atau uang tunai untuk ditransaksikan.');
      return;
    }

    if (cashOffer > current.money) {
      alert('Saldo tunai Anda tidak mencukupi untuk menawarkan uang tunai tersebut.');
      return;
    }

    const offeredProps = mySelectedIds.map(id => engine.activeTiles[id]);
    const requestedProps = targetSelectedIds.map(id => engine.activeTiles[id]);
    const moneyDiff = cashOffer - cashRequest;

    let tradeDecision = null;

    // Jika target adalah AI Bot -> Evaluasi via Python Backend atau Fallback AI Logika
    if (targetPlayer.isAI) {
      engine.log(`🤝 ${current.name} mengajukan tawaran barter kepada ${targetPlayer.name}...`, 'info');
      try {
        const resp = await fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            botName: targetPlayer.name,
            botMoney: targetPlayer.money,
            offeredProps,
            requestedProps,
            moneyDiff
          })
        });
        if (resp.ok) {
          tradeDecision = await resp.json();
        }
      } catch (e) {
        // Fallback evaluasi lokal jika server Python belum menyala
        tradeDecision = this.evaluateLocalAITrade(targetPlayer, offeredProps, requestedProps, moneyDiff);
      }
    } else {
      // Barter antar manusia (disetujui langsung untuk local room)
      tradeDecision = {
        accepted: true,
        decision: 'ACCEPT',
        message: `🤝 ${targetPlayer.name} menyetujui kesepakatan barter dengan ${current.name}!`
      };
    }

    if (tradeDecision && tradeDecision.accepted) {
      // Lakukan transfer kepemilikan aset
      mySelectedIds.forEach(id => {
        engine.propertyState[id].ownerId = targetPlayer.id;
      });
      targetSelectedIds.forEach(id => {
        engine.propertyState[id].ownerId = current.id;
      });

      // Transfer uang tunai
      if (cashOffer > 0) {
        current.money -= cashOffer;
        targetPlayer.money += cashOffer;
      }
      if (cashRequest > 0) {
        targetPlayer.money -= cashRequest;
        current.money += cashRequest;
      }

      engine.log(tradeDecision.message, 'success');
      if (window.soundEngine) window.soundEngine.playWordSuccess();
      if (engine.onStateChange) engine.onStateChange();

      const modal = document.getElementById('modal-mono-trade');
      if (modal) modal.classList.remove('modal-open');
    } else if (tradeDecision) {
      engine.log(tradeDecision.message, 'warning');
      alert(tradeDecision.message);
    }
  }

  evaluateLocalAITrade(bot, offeredProps, requestedProps, moneyDiff) {
    const totalOffered = offeredProps.reduce((a, b) => a + (b.price || 1000000), 0) + (moneyDiff > 0 ? moneyDiff : 0);
    const totalRequested = requestedProps.reduce((a, b) => a + (b.price || 1000000), 0) + (moneyDiff < 0 ? -moneyDiff : 0);

    const ratio = totalOffered / Math.max(1, totalRequested);
    if (ratio >= 1.1) {
      return {
        accepted: true,
        decision: 'ACCEPT',
        message: `🤝 ${bot.name}: "Tawaran yang sangat bagus! Saya terima kesepakatan barter ini!"`
      };
    } else {
      return {
        accepted: false,
        decision: 'REJECT',
        message: `❌ ${bot.name}: "Tawaran Anda belum cukup bernilai bagi saya. Negosiasi ditolak."`
      };
    }
  }
}

window.monopolyTrade = new MonopolyTrade();

