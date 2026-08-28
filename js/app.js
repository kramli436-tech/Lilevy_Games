/**
 * LILEVY GAMES - MAIN APPLICATION CONTROLLER
 * Mengorkestrasi navigasi SPA, TTS Pintar Pro (AI Generator), Monopoli Pro
 * dengan Barter & Negosiasi AI Cerdas, Peta Panas Monte Carlo, Struktur Sewa Bertingkat,
 * Modal Rules & Panduan Lengkap Bermain, Room ID murni, dan Leaderboard Player Asli.
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. SPA VIEW ROUTER (HOME ↔ TTS ↔ MONOPOLY)
  // =========================================================================
  const viewHome = document.getElementById('view-home');
  const viewTTS = document.getElementById('view-tts');
  const viewMonopoly = document.getElementById('view-monopoly');

  function switchView(viewName) {
    [viewHome, viewTTS, viewMonopoly].forEach(v => {
      if (v) v.classList.remove('active-view');
    });

    if (viewName === 'home') {
      if (viewHome) viewHome.classList.add('active-view');
      window.ttsEngine?.stopTimer();
    } else if (viewName === 'tts') {
      if (viewTTS) viewTTS.classList.add('active-view');
      window.ttsEngine?.startTimer();
    } else if (viewName === 'monopoly') {
      if (viewMonopoly) viewMonopoly.classList.add('active-view');
      window.ttsEngine?.stopTimer();
      window.monopolyUI?.init();
      window.monopolyUI?.renderBoard();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) window.lucide.createIcons();
  }

  // Navigasi Beranda Lilevy Games
  document.getElementById('nav-brand-logo')?.addEventListener('click', () => switchView('home'));
  document.getElementById('btn-home-play-tts')?.addEventListener('click', () => switchView('tts'));
  document.getElementById('btn-tts-back-home')?.addEventListener('click', () => switchView('home'));
  document.getElementById('btn-mono-back-home')?.addEventListener('click', () => switchView('home'));

  document.getElementById('btn-home-play-mono-ai')?.addEventListener('click', () => {
    switchView('monopoly');
    startMonopolyAIGame('world');
  });

  document.getElementById('btn-home-play-mono-room')?.addEventListener('click', () => {
    switchView('monopoly');
    openCreateRoomModal();
  });

  document.getElementById('btn-home-play-mono-join')?.addEventListener('click', () => {
    switchView('monopoly');
    openJoinRoomModal();
  });

  // =========================================================================
  // 2. GLOBAL THEME SELECTOR & PROFILE HEADER (DESKTOP & MOBILE)
  // =========================================================================
  const themeSelect = document.getElementById('theme-select');
  const mobileThemeSelect = document.getElementById('mobile-theme-select');

  const savedTheme = localStorage.getItem('tts_theme') || 'modern';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (themeSelect) themeSelect.value = savedTheme;
  if (mobileThemeSelect) mobileThemeSelect.value = savedTheme;

  function applyTheme(selected) {
    document.documentElement.setAttribute('data-theme', selected);
    localStorage.setItem('tts_theme', selected);
    if (themeSelect) themeSelect.value = selected;
    if (mobileThemeSelect) mobileThemeSelect.value = selected;
  }

  themeSelect?.addEventListener('change', (e) => applyTheme(e.target.value));
  mobileThemeSelect?.addEventListener('change', (e) => applyTheme(e.target.value));

  function updateHeaderProfile() {
    const auth = window.authEngine;
    const ranking = window.rankingEngine;
    if (!auth || !ranking) return;

    const user = auth.getUser();
    const isLogged = auth.isLoggedIn();
    const points = user.stats?.totalPoints || 0;
    const tier = ranking.getTierInfo(points);

    // Desktop Navbar Elements
    const navAvatar = document.getElementById('nav-user-avatar');
    const navName = document.getElementById('nav-user-name');
    const badgeEl = document.getElementById('nav-user-tier-badge');
    const navPoints = document.getElementById('nav-user-points');
    const authBtnLabel = document.getElementById('btn-header-auth-label');

    if (navAvatar) navAvatar.textContent = user.avatar || (isLogged ? '🧠' : '👤');
    if (navName) navName.textContent = user.username || (isLogged ? 'Pemain' : 'Tamu');
    if (badgeEl) {
      badgeEl.textContent = tier.badge;
      badgeEl.className = `px-1.5 py-0.2 text-[9px] font-extrabold rounded ${tier.bg} ${tier.color}`;
    }
    if (navPoints) navPoints.textContent = `${points.toLocaleString()} EXP`;

    if (authBtnLabel) {
      authBtnLabel.textContent = isLogged ? 'Akun Anda' : 'Masuk / Daftar';
    }

    // Mobile Navbar Pill & Drawer Elements
    const mobilePillAvatar = document.getElementById('mobile-pill-avatar');
    const mobilePillLabel = document.getElementById('mobile-pill-label');
    const mobileDrawerAvatar = document.getElementById('mobile-drawer-avatar');
    const mobileDrawerName = document.getElementById('mobile-drawer-name');
    const mobileDrawerTier = document.getElementById('mobile-drawer-tier');
    const mobileDrawerPoints = document.getElementById('mobile-drawer-points');
    const mobileAuthBtnLabel = document.getElementById('btn-mobile-auth-label');

    if (mobilePillAvatar) mobilePillAvatar.textContent = user.avatar || (isLogged ? '🧠' : '👤');
    if (mobilePillLabel) mobilePillLabel.textContent = isLogged ? user.username : 'Masuk';

    if (mobileDrawerAvatar) mobileDrawerAvatar.textContent = user.avatar || (isLogged ? '🧠' : '👤');
    if (mobileDrawerName) mobileDrawerName.textContent = user.username || (isLogged ? 'Pemain' : 'Tamu (Guest)');
    if (mobileDrawerTier) {
      mobileDrawerTier.textContent = tier.badge;
      mobileDrawerTier.className = `px-1.5 py-0.2 text-[9px] font-extrabold rounded ${tier.bg} ${tier.color}`;
    }
    if (mobileDrawerPoints) mobileDrawerPoints.textContent = `${points.toLocaleString()} EXP`;
    if (mobileAuthBtnLabel) {
      mobileAuthBtnLabel.textContent = isLogged ? 'Kelola Akun / Profil' : 'Masuk / Daftar Akun';
    }
  }
  updateHeaderProfile();

  // SINKRONISASI REALTIME JUMLAH PEMAIN ONLINE
  if (window.presenceEngine) {
    window.presenceEngine.calculateLocalOnlineCount();
  }

  // =========================================================================
  // 3. MOBILE NAVIGATION DRAWER TOGGLE & EVENTS
  // =========================================================================
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const btnMobileMenuToggle = document.getElementById('btn-mobile-menu-toggle');
  const mobileMenuIcon = document.getElementById('mobile-menu-icon');

  function closeMobileDrawer() {
    if (mobileNavDrawer && !mobileNavDrawer.classList.contains('hidden')) {
      mobileNavDrawer.classList.add('hidden');
      if (mobileMenuIcon) {
        mobileMenuIcon.setAttribute('data-lucide', 'menu');
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  btnMobileMenuToggle?.addEventListener('click', () => {
    if (!mobileNavDrawer) return;
    const isHidden = mobileNavDrawer.classList.toggle('hidden');
    if (mobileMenuIcon) {
      mobileMenuIcon.setAttribute('data-lucide', isHidden ? 'menu' : 'x');
      if (window.lucide) window.lucide.createIcons();
    }
  });

  document.getElementById('btn-lang-toggle-mobile')?.addEventListener('click', () => {
    window.i18n?.toggleLanguage();
  });
  // =========================================================================
  function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('modal-open');
    if (window.lucide) window.lucide.createIcons();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('modal-open');
    modal.classList.add('hidden');
  }

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(document.getElementById(modalId));
    });
  });

  function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.add('translate-y-24', 'opacity-0');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3200);
  }

  // =========================================================================
  // 4. AUTENTIKASI PENGGUNA (LOGIN, REGISTER, PERSISTENSI & PROFIL)
  // =========================================================================
  const modalAuth = document.getElementById('modal-auth');
  const modalProfile = document.getElementById('modal-profile');
  const modalLeaderboard = document.getElementById('modal-leaderboard');

  // Handler Autentikasi / Buka Profil Pengguna
  function handleAuthOrProfile() {
    closeMobileDrawer();
    if (window.authEngine?.isLoggedIn()) {
      renderProfileModal();
      openModal(modalProfile);
    } else {
      openModal(modalAuth);
    }
  }

  // Tombol Header Auth & Profil (Desktop & Mobile)
  document.getElementById('btn-header-auth')?.addEventListener('click', handleAuthOrProfile);
  document.getElementById('btn-open-profile')?.addEventListener('click', handleAuthOrProfile);
  document.getElementById('btn-mobile-auth-pill')?.addEventListener('click', handleAuthOrProfile);
  document.getElementById('btn-mobile-open-profile-card')?.addEventListener('click', handleAuthOrProfile);
  document.getElementById('btn-mobile-auth')?.addEventListener('click', handleAuthOrProfile);

  document.getElementById('btn-mobile-leaderboard')?.addEventListener('click', () => {
    closeMobileDrawer();
    renderLeaderboardModal();
    openModal(modalLeaderboard);
  });

  document.getElementById('btn-mobile-rules')?.addEventListener('click', () => {
    closeMobileDrawer();
    openRulesModal('overview');
  });

  document.getElementById('btn-close-auth-modal')?.addEventListener('click', () => {
    closeModal(modalAuth);
  });

  document.getElementById('btn-leaderboard-auth-prompt')?.addEventListener('click', () => {
    closeModal(modalLeaderboard);
    openModal(modalAuth);
  });

  // Tab Switcher Login ↔ Register
  const tabLogin = document.getElementById('tab-auth-login');
  const tabRegister = document.getElementById('tab-auth-register');
  const formLogin = document.getElementById('form-auth-login');
  const formRegister = document.getElementById('form-auth-register');
  const authTitle = document.getElementById('auth-modal-title');
  const authSubtitle = document.getElementById('auth-modal-subtitle');

  tabLogin?.addEventListener('click', () => {
    tabLogin.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-300 transition';
    tabRegister.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition';
    formLogin.classList.remove('hidden');
    formRegister.classList.add('hidden');
    if (authTitle) authTitle.textContent = 'Masuk ke Lilevy Games';
    if (authSubtitle) authSubtitle.textContent = 'Masuk untuk memuat profil dan mencatatkan skor ranking.';
  });

  tabRegister?.addEventListener('click', () => {
    tabRegister.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-300 transition';
    tabLogin.className = 'flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition';
    formRegister.classList.remove('hidden');
    formLogin.classList.add('hidden');
    if (authTitle) authTitle.textContent = 'Daftar Akun Baru';
    if (authSubtitle) authSubtitle.textContent = 'Daftarkan akun agar skor & ranking Anda tersimpan permanen!';
  });

  // Avatar & Token Selector di Register Form
  let regAvatar = '🧠';
  let regToken = '🚗';

  document.querySelectorAll('#reg-avatar-picker .avatar-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#reg-avatar-picker .avatar-option').forEach(b => {
        b.className = 'avatar-option w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-lg flex items-center justify-center transition';
      });
      btn.className = 'avatar-option w-9 h-9 rounded-xl border-2 border-indigo-600 bg-indigo-50 dark:bg-slate-800 text-lg flex items-center justify-center transition';
      regAvatar = btn.getAttribute('data-avatar') || '🧠';
    });
  });

  document.querySelectorAll('#reg-token-picker .token-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#reg-token-picker .token-option').forEach(b => {
        b.className = 'token-option w-8 h-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm flex items-center justify-center';
      });
      btn.className = 'token-option w-8 h-8 rounded-xl border-2 border-indigo-600 bg-indigo-50 dark:bg-slate-800 text-sm flex items-center justify-center';
      regToken = btn.getAttribute('data-token') || '🚗';
    });
  });

  // Form Submit: Login
  formLogin?.addEventListener('submit', (e) => {
    e.preventDefault();
    const userInp = document.getElementById('login-username')?.value.trim();
    const passInp = document.getElementById('login-password')?.value;

    const res = window.authEngine?.login(userInp, passInp);
    if (res?.success) {
      updateHeaderProfile();
      closeModal(modalAuth);
      showToast(res.message);
      if (window.soundEngine) window.soundEngine.playVictory();
    } else {
      showToast(`⚠️ ${res?.message || 'Login gagal'}`);
      if (window.soundEngine) window.soundEngine.playError();
    }
  });

  // Form Submit: Register
  formRegister?.addEventListener('submit', (e) => {
    e.preventDefault();
    const userInp = document.getElementById('reg-username')?.value.trim();
    const passInp = document.getElementById('reg-password')?.value;

    const res = window.authEngine?.register(userInp, passInp, regAvatar, regToken);
    if (res?.success) {
      updateHeaderProfile();
      closeModal(modalAuth);
      showToast(res.message);
      if (typeof confetti === 'function') confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      if (window.soundEngine) window.soundEngine.playVictory();
    } else {
      showToast(`⚠️ ${res?.message || 'Pendaftaran gagal'}`);
      if (window.soundEngine) window.soundEngine.playError();
    }
  });

  // Logout Button
  document.getElementById('btn-prof-logout')?.addEventListener('click', () => {
    window.authEngine?.logout();
    updateHeaderProfile();
    closeModal(modalProfile);
    showToast('👋 Anda telah keluar dari akun.');
  });

  // 1-Click Export Data Akun ke File JSON Langsung
  document.getElementById('btn-export-users-file')?.addEventListener('click', () => {
    const res = window.authEngine?.exportDataToFile();
    if (res?.success) {
      showToast(res.message);
    } else {
      showToast(res?.message || 'Gagal ekspor data');
    }
  });

  // 1-Click Import Data Akun dari File JSON
  document.getElementById('input-import-users-file')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = window.authEngine?.importDataFromFile(content);
      if (res?.success) {
        updateHeaderProfile();
        renderProfileModal();
        showToast(res.message);
      } else {
        showToast(`⚠️ ${res?.message || 'Gagal memulihkan file'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  function renderProfileModal() {
    const user = window.authEngine?.getUser();
    if (!user) return;

    const points = user.stats?.totalPoints || 0;
    const tier = window.rankingEngine?.getTierInfo(points);
    const rankNum = window.rankingEngine?.getUserRank(user.id) || 1;

    const profAvatar = document.getElementById('prof-modal-avatar');
    const profName = document.getElementById('prof-modal-name');
    const profTier = document.getElementById('prof-modal-tier');
    const profPoints = document.getElementById('prof-modal-points');
    const profTTS = document.getElementById('prof-modal-tts');
    const profMono = document.getElementById('prof-modal-mono');
    const profRank = document.getElementById('prof-modal-rank');

    if (profAvatar) profAvatar.textContent = user.avatar || '🧠';
    if (profName) profName.textContent = user.username || 'Pemain';
    if (profTier) profTier.textContent = `Gelar: ${tier?.title || 'Bronze'}`;
    if (profPoints) profPoints.textContent = points.toLocaleString();
    if (profTTS) profTTS.textContent = (user.stats?.ttsSolved || 0).toString();
    if (profMono) profMono.textContent = `${user.stats?.monopolyGames || 0} Main / ${user.stats?.monopolyWins || 0} Menang`;
    if (profRank) profRank.textContent = `#${rankNum}`;
  }

  // =========================================================================
  // 5. PAPAN PERINGKAT RESMI PEMAIN TERDAFTAR (LEADERBOARD)
  // =========================================================================
  document.getElementById('btn-open-leaderboard')?.addEventListener('click', () => {
    renderLeaderboardModal();
    openModal(modalLeaderboard);
  });

  function renderLeaderboardModal() {
    if (!window.rankingEngine) return;
    const tableBody = document.getElementById('leaderboard-table-body');
    const emptyState = document.getElementById('leaderboard-empty-state');
    const leaderboard = window.rankingEngine.getFullLeaderboard();

    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (!leaderboard || leaderboard.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    } else {
      if (emptyState) emptyState.classList.add('hidden');
    }

    leaderboard.forEach((item, idx) => {
      const rankIndex = idx + 1;
      const row = document.createElement('tr');
      const isMe = item.isCurrentUser;
      const medal = rankIndex === 1 ? '🥇' : rankIndex === 2 ? '🥈' : rankIndex === 3 ? '🥉' : `#${rankIndex}`;

      row.className = `border-b border-slate-100 dark:border-slate-800/60 ${isMe ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'} transition`;
      row.innerHTML = `
        <td class="py-2.5 pl-2 font-black text-xs ${rankIndex <= 3 ? 'text-base' : 'text-slate-500'}">${medal}</td>
        <td class="py-2.5">
          <div class="flex items-center gap-2">
            <span class="text-lg">${item.avatar || '🧠'}</span>
            <div>
              <span class="font-bold text-slate-800 dark:text-slate-200 block leading-tight">${item.name}</span>
              ${isMe ? '<span class="text-[9px] text-indigo-600 font-extrabold">Akun Anda ✨</span>' : `<span class="text-[9px] text-slate-400 font-mono">${item.favoriteToken || '🚗'}</span>`}
            </div>
          </div>
        </td>
        <td class="py-2.5 text-center">
          <span class="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${item.rankBadge || 'Bronze'}</span>
        </td>
        <td class="py-2.5 text-center text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
          🏆 ${item.monopolyWins || 0}
        </td>
        <td class="py-2.5 pr-2 text-right font-mono font-black text-xs text-indigo-600 dark:text-indigo-400">
          ${item.totalPoints.toLocaleString()} EXP
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  // =========================================================================
  // 6. TTS ENGINE & AI GENERATOR (PYTHON NLP ENGINE)
  // =========================================================================
  let currentTTSIndex = 0;
  const ttsGridElement = document.getElementById('tts-grid');
  const ttsTimerElement = document.getElementById('timer-display');
  const ttsPauseBtn = document.getElementById('btn-pause');
  const ttsClueBanner = document.getElementById('current-clue-banner');
  const ttsAcrossList = document.getElementById('across-clues-list');
  const ttsDownList = document.getElementById('down-clues-list');

  window.ttsEngine.onTimerTick = (totalSeconds) => {
    if (ttsTimerElement) ttsTimerElement.textContent = window.ttsEngine.formatTime(totalSeconds);
  };

  window.ttsEngine.onCellChange = (cell) => {
    const cellEl = document.getElementById(`cell-${cell.row}-${cell.col}`);
    if (cellEl) {
      const charSpan = cellEl.querySelector('.cell-char');
      if (charSpan) charSpan.textContent = cell.letter;
      cellEl.classList.toggle('cell-revealed', cell.isRevealed);
      cellEl.classList.toggle('cell-error', cell.isError);
    }
  };

  window.ttsEngine.onSelectionChange = () => {
    updateTTSHighlights();
    updateTTSActiveClue();
  };

  window.ttsEngine.onWordCompleted = (word) => {
    if (!word) return;
    const clueEl = document.getElementById(`clue-${word.id}`);
    if (clueEl) {
      clueEl.classList.toggle('completed-clue', window.ttsEngine.completedWords.has(word.id));
    }
  };

  window.ttsEngine.onPuzzleCompleted = (stats) => {
    updateHeaderProfile();
    showVictoryModal(stats);
  };

  function renderPuzzle(puzzleData) {
    window.ttsEngine.loadPuzzle(puzzleData);

    document.getElementById('puzzle-title').textContent = puzzleData.title;
    const diffBadge = document.getElementById('puzzle-badge-difficulty');
    if (diffBadge) {
      diffBadge.textContent = puzzleData.difficulty;
      diffBadge.className = `px-3 py-1 text-xs font-semibold rounded-full ${
        puzzleData.difficulty === 'Mudah' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' :
        puzzleData.difficulty === 'Sedang' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' :
        'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
      }`;
    }
    document.getElementById('puzzle-badge-category').textContent = puzzleData.category;

    if (ttsGridElement) {
      ttsGridElement.innerHTML = '';
      ttsGridElement.style.gridTemplateColumns = `repeat(${puzzleData.cols}, minmax(0, 1fr))`;
      ttsGridElement.style.gridTemplateRows = `repeat(${puzzleData.rows}, minmax(0, 1fr))`;

      for (let r = 0; r < puzzleData.rows; r++) {
        for (let c = 0; c < puzzleData.cols; c++) {
          const cell = window.ttsEngine.grid[r][c];
          const cellDiv = document.createElement('div');
          cellDiv.id = `cell-${r}-${c}`;
          cellDiv.className = `tts-cell ${cell.isBlocked ? 'cell-blocked' : ''} ${cell.isRevealed ? 'cell-revealed' : ''}`;

          if (!cell.isBlocked) {
            if (cell.number) {
              const numSpan = document.createElement('span');
              numSpan.className = 'cell-number';
              numSpan.textContent = cell.number;
              cellDiv.appendChild(numSpan);
            }
            const charSpan = document.createElement('span');
            charSpan.className = 'cell-char';
            charSpan.textContent = cell.letter;
            cellDiv.appendChild(charSpan);

            cellDiv.addEventListener('click', () => window.ttsEngine.selectCell(r, c));
          }
          ttsGridElement.appendChild(cellDiv);
        }
      }
    }

    renderTTSClues();
    updateTTSHighlights();
    updateTTSActiveClue();
  }

  function renderTTSClues() {
    if (!ttsAcrossList || !ttsDownList) return;
    ttsAcrossList.innerHTML = '';
    ttsDownList.innerHTML = '';

    const acrossWords = window.ttsEngine.puzzle.words.filter(w => w.direction === 'across');
    const downWords = window.ttsEngine.puzzle.words.filter(w => w.direction === 'down');
    acrossWords.sort((a, b) => a.number - b.number);
    downWords.sort((a, b) => a.number - b.number);

    acrossWords.forEach(w => ttsAcrossList.appendChild(createTTSClueItem(w)));
    downWords.forEach(w => ttsDownList.appendChild(createTTSClueItem(w)));
  }

  function createTTSClueItem(word) {
    const item = document.createElement('div');
    item.id = `clue-${word.id}`;
    item.className = `clue-item ${window.ttsEngine.completedWords.has(word.id) ? 'completed-clue' : ''}`;
    item.innerHTML = `
      <span class="clue-badge">${word.number}</span>
      <div class="flex-1 text-sm">
        <p class="leading-snug">${word.clue}</p>
        <span class="text-[11px] font-medium opacity-60">(${word.answer.length} Huruf)</span>
      </div>
    `;
    item.addEventListener('click', () => window.ttsEngine.selectWord(word));
    return item;
  }

  function updateTTSHighlights() {
    const selected = window.ttsEngine.selectedCell;
    const activeWordCells = window.ttsEngine.getActiveWordCells();

    document.querySelectorAll('.tts-cell').forEach(el => el.classList.remove('cell-selected', 'cell-word-active'));
    activeWordCells.forEach(c => document.getElementById(`cell-${c.row}-${c.col}`)?.classList.add('cell-word-active'));
    if (selected) document.getElementById(`cell-${selected.row}-${selected.col}`)?.classList.add('cell-selected');
  }

  function updateTTSActiveClue() {
    const activeWord = window.ttsEngine.getActiveWord();
    document.querySelectorAll('.clue-item').forEach(el => el.classList.remove('active-clue'));

    if (activeWord) {
      const clueEl = document.getElementById(`clue-${activeWord.id}`);
      if (clueEl) {
        clueEl.classList.add('active-clue');
        clueEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (ttsClueBanner) {
        ttsClueBanner.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 bg-indigo-600 text-white rounded text-xs font-bold">${activeWord.number} ${activeWord.direction === 'across' ? 'Mendatar' : 'Menurun'}</span>
            <span class="text-xs text-slate-500 font-semibold">(${activeWord.answer.length} Huruf)</span>
          </div>
          <p class="text-sm font-medium text-slate-800 dark:text-slate-100 mt-1 leading-snug">${activeWord.clue}</p>
        `;
      }
    }
  }

  // Tombol AI Generator TTS (Python API / Local Fallback)
  document.getElementById('btn-tts-ai-generate')?.addEventListener('click', async () => {
    const categories = ['budaya', 'dunia', 'sains'];
    const chosenCat = categories[Math.floor(Math.random() * categories.length)];
    showToast(`🤖 Menghubungi Python NLP AI Engine: Kategori ${chosenCat}...`);

    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const backendUrl = isLocal && window.location.port !== '8000' ? 'http://localhost:8000' : '';
      const resp = await fetch(`${backendUrl}/api/tts/generate?category=${chosenCat}`);
      if (resp.ok) {
        const aiPuzzle = await resp.json();
        renderPuzzle(aiPuzzle);
        showToast(`✨ Soal AI Python "${aiPuzzle.title}" berhasil dimuat!`);
        return;
      }
    } catch (e) {
      // Fallback acak jika Python server belum running
      let randomIdx = Math.floor(Math.random() * PUZZLE_DATA.length);
      currentTTSIndex = randomIdx;
      renderPuzzle(PUZZLE_DATA[randomIdx]);
      showToast(`🎲 Memulai TTS Tematik: ${PUZZLE_DATA[randomIdx].title}`);
    }
  });

  // Controls TTS
  document.getElementById('btn-random-puzzle')?.addEventListener('click', () => {
    let randomIdx;
    do {
      randomIdx = Math.floor(Math.random() * PUZZLE_DATA.length);
    } while (PUZZLE_DATA.length > 1 && randomIdx === currentTTSIndex);
    currentTTSIndex = randomIdx;
    renderPuzzle(PUZZLE_DATA[randomIdx]);
    showToast(`🎲 Memulai TTS: ${PUZZLE_DATA[randomIdx].title}`);
  });

  ttsPauseBtn?.addEventListener('click', () => {
    const isPaused = window.ttsEngine.togglePause();
    ttsPauseBtn.innerHTML = isPaused ? '<i data-lucide="play" class="w-4 h-4"></i><span>Lanjut</span>' : '<i data-lucide="pause" class="w-4 h-4"></i><span>Jeda</span>';
    if (window.lucide) window.lucide.createIcons();
  });

  document.getElementById('btn-hint-letter')?.addEventListener('click', () => window.ttsEngine.revealCurrentLetter());
  document.getElementById('btn-hint-word')?.addEventListener('click', () => window.ttsEngine.revealCurrentWord());
  document.getElementById('btn-check-errors')?.addEventListener('click', () => {
    const errs = window.ttsEngine.checkErrors();
    showToast(errs === 0 ? '🎉 Semua huruf terisi sudah benar!' : `⚠️ Ditemukan ${errs} huruf yang belum tepat.`);
  });
  document.getElementById('btn-reset-puzzle')?.addEventListener('click', () => {
    if (confirm('Kosongkan kembali isian teka-teki silang ini?')) window.ttsEngine.resetPuzzle();
  });
  document.getElementById('btn-print-puzzle')?.addEventListener('click', () => window.print());

  // Keyboard Handlers TTS
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (viewTTS?.classList.contains('active-view')) {
      if (e.key === 'ArrowUp') { e.preventDefault(); window.ttsEngine.moveArrow(-1, 0); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); window.ttsEngine.moveArrow(1, 0); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); window.ttsEngine.moveArrow(0, -1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); window.ttsEngine.moveArrow(0, 1); }
      else if (e.key === 'Backspace') { e.preventDefault(); window.ttsEngine.handleBackspace(); }
      else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); window.ttsEngine.toggleDirection(); }
      else if (/^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); window.ttsEngine.inputLetter(e.key); }
    }
  });

  document.querySelectorAll('.vk-key').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = btn.getAttribute('data-action');
      const key = btn.getAttribute('data-key');
      if (action === 'backspace') window.ttsEngine.handleBackspace();
      else if (action === 'space') window.ttsEngine.toggleDirection();
      else if (key) window.ttsEngine.inputLetter(key);
    });
  });

  // Level Modal
  document.getElementById('btn-open-levels')?.addEventListener('click', () => {
    renderLevelsList();
    openModal(document.getElementById('modal-levels'));
  });

  function renderLevelsList() {
    const container = document.getElementById('levels-grid-container');
    if (!container) return;
    container.innerHTML = '';

    PUZZLE_DATA.forEach((p, idx) => {
      const highScore = window.ttsEngine.getHighScore(p.id);
      const card = document.createElement('div');
      const isCurrent = window.ttsEngine.puzzle && window.ttsEngine.puzzle.id === p.id;

      card.className = `p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
        isCurrent ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md'
      }`;
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="px-2.5 py-0.5 text-xs font-bold rounded-full ${p.difficulty === 'Mudah' ? 'bg-emerald-100 text-emerald-800' : p.difficulty === 'Sedang' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}">${p.difficulty}</span>
            <span class="text-xs font-semibold text-slate-500">${p.words.length} Kata</span>
          </div>
          <h4 class="font-bold text-base text-slate-800 dark:text-slate-100 mb-1">${p.title}</h4>
          <p class="text-xs text-slate-500 line-clamp-2">${p.description}</p>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-xs text-slate-500">${highScore ? `⭐ ${highScore.score} Poin (${highScore.formattedTime})` : 'Belum dimainkan'}</span>
          <button class="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold">${isCurrent ? 'Lanjut' : 'Mainkan'}</button>
        </div>
      `;
      card.addEventListener('click', () => {
        currentTTSIndex = idx;
        renderPuzzle(PUZZLE_DATA[idx]);
        closeModal(document.getElementById('modal-levels'));
      });
      container.appendChild(card);
    });
  }

  function showVictoryModal(stats) {
    const modal = document.getElementById('modal-victory');
    if (!modal) return;

    document.getElementById('vic-score').textContent = `+${stats.score} EXP`;
    document.getElementById('vic-time').textContent = stats.formattedTime;
    document.getElementById('vic-hints').textContent = stats.hintsUsed;
    document.getElementById('vic-accuracy').textContent = stats.accuracy + '%';

    const banner = document.getElementById('vic-levelup-banner');
    if (stats.rankingResult && stats.rankingResult.hasLeveledUp) {
      document.getElementById('vic-new-rank-title').textContent = stats.rankingResult.currentTier.title;
      banner?.classList.remove('hidden');
    } else {
      banner?.classList.add('hidden');
    }

    const starsContainer = document.getElementById('vic-stars');
    if (starsContainer) {
      starsContainer.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = i < stats.stars ? '⭐' : '☆';
        starsContainer.appendChild(star);
      }
    }

    if (typeof confetti === 'function') {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    openModal(modal);
  }

  document.getElementById('btn-next-level')?.addEventListener('click', () => {
    closeModal(document.getElementById('modal-victory'));
    currentTTSIndex = (currentTTSIndex + 1) % PUZZLE_DATA.length;
    renderPuzzle(PUZZLE_DATA[currentTTSIndex]);
  });

  // Builder TTS
  document.getElementById('btn-open-builder')?.addEventListener('click', () => {
    window.customTTSBuilder.reset(10, 10);
    renderBuilderUI();
    openModal(document.getElementById('modal-builder'));
  });

  function renderBuilderUI() {
    const listEl = document.getElementById('builder-words-list');
    const previewGrid = document.getElementById('builder-preview-grid');
    const p = window.customTTSBuilder.customPuzzle;

    if (listEl) {
      listEl.innerHTML = p.words.length === 0 ? '<p class="text-xs text-slate-400 italic p-3 text-center">Belum ada kata.</p>' : '';
      p.words.forEach((w, idx) => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs border';
        item.innerHTML = `
          <div class="flex-1 mr-2">
            <span class="font-bold text-indigo-600">${w.number}. ${w.answer}</span>
            <span class="text-slate-500">(${w.direction === 'across' ? 'Mendatar' : 'Menurun'} [${w.row + 1},${w.col + 1}])</span>
            <p class="text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">${w.clue}</p>
          </div>
          <button data-del-word="${idx}" class="text-rose-500 hover:text-rose-700 font-bold">✕</button>
        `;
        listEl.appendChild(item);
      });

      listEl.querySelectorAll('[data-del-word]').forEach(btn => {
        btn.addEventListener('click', () => {
          window.customTTSBuilder.removeWord(parseInt(btn.getAttribute('data-del-word'), 10));
          renderBuilderUI();
        });
      });
    }

    if (previewGrid) {
      previewGrid.innerHTML = '';
      previewGrid.style.gridTemplateColumns = `repeat(${p.cols}, minmax(0, 1fr))`;
      const gridLetters = {};
      p.words.forEach(w => {
        for (let i = 0; i < w.answer.length; i++) {
          const r = w.direction === 'across' ? w.row : w.row + i;
          const c = w.direction === 'across' ? w.col + i : w.col;
          gridLetters[`${r},${c}`] = w.answer[i];
        }
      });
      for (let r = 0; r < p.rows; r++) {
        for (let c = 0; c < p.cols; c++) {
          const cell = document.createElement('div');
          const char = gridLetters[`${r},${c}`];
          cell.className = `w-6 h-6 border flex items-center justify-center text-xs font-bold rounded ${char ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-transparent'}`;
          cell.textContent = char || '·';
          previewGrid.appendChild(cell);
        }
      }
    }
  }

  document.getElementById('form-builder-add')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const clueInput = document.getElementById('b-clue');
    const answerInput = document.getElementById('b-answer');
    const res = window.customTTSBuilder.addWord(
      clueInput.value, answerInput.value,
      parseInt(document.getElementById('b-row').value, 10) - 1,
      parseInt(document.getElementById('b-col').value, 10) - 1,
      document.getElementById('b-dir').value
    );
    if (res.success) {
      clueInput.value = '';
      answerInput.value = '';
      renderBuilderUI();
    } else alert(res.message);
  });

  document.getElementById('btn-builder-play')?.addEventListener('click', () => {
    const valid = window.customTTSBuilder.validateEntirePuzzle();
    if (!valid.valid) { alert(valid.error); return; }
    closeModal(document.getElementById('modal-builder'));
    renderPuzzle(window.customTTSBuilder.customPuzzle);
  });

  // =========================================================================
  // 6. MONOPOLI GLOBAL, RULES, BARTER & HEATMAP
  // =========================================================================
  let selectedTokenInSetup = '🚗';
  let selectedTokenInJoin = '🚗';

  // Barter & Heatmap Buttons
  document.getElementById('btn-mono-trade-modal')?.addEventListener('click', () => {
    window.monopolyTrade?.openTradeModal(window.monopolyEngine);
  });

  document.getElementById('btn-trade-execute')?.addEventListener('click', () => {
    window.monopolyTrade?.executeTradeOffer(window.monopolyEngine);
  });

  document.getElementById('btn-mono-heatmap-modal')?.addEventListener('click', () => {
    window.monopolyHeatmap?.openHeatmapModal(window.monopolyEngine);
  });

  // Modal Rules & Panduan Handlers
  function openRulesModal(defaultTab = 'overview') {
    switchRuleTab(defaultTab);
    openModal(document.getElementById('modal-mono-rules'));
  }

  function switchRuleTab(tabName) {
    const tabs = {
      overview: { btn: 'rule-tab-btn-overview', content: 'rule-tab-overview' },
      hardcore: { btn: 'rule-tab-btn-hardcore', content: 'rule-tab-hardcore' },
      features: { btn: 'rule-tab-btn-features', content: 'rule-tab-features' },
      skills: { btn: 'rule-tab-btn-skills', content: 'rule-tab-skills' },
      tips: { btn: 'rule-tab-btn-tips', content: 'rule-tab-tips' }
    };

    Object.keys(tabs).forEach(k => {
      const b = document.getElementById(tabs[k].btn);
      const c = document.getElementById(tabs[k].content);
      if (b && c) {
        if (k === tabName) {
          b.className = 'rule-tab-btn px-4 py-2.5 text-indigo-600 border-b-2 border-indigo-600 whitespace-nowrap flex items-center gap-1.5 font-bold';
          c.classList.remove('hidden');
        } else {
          b.className = 'rule-tab-btn px-4 py-2.5 text-slate-400 hover:text-slate-600 whitespace-nowrap flex items-center gap-1.5 font-semibold';
          c.classList.add('hidden');
        }
      }
    });
  }

  document.getElementById('btn-mono-rules-modal')?.addEventListener('click', () => openRulesModal('overview'));
  document.getElementById('btn-home-mono-rules')?.addEventListener('click', () => openRulesModal('overview'));
  document.getElementById('btn-setup-open-rules')?.addEventListener('click', () => openRulesModal('overview'));

  document.getElementById('rule-tab-btn-overview')?.addEventListener('click', () => switchRuleTab('overview'));
  document.getElementById('rule-tab-btn-hardcore')?.addEventListener('click', () => switchRuleTab('hardcore'));
  document.getElementById('rule-tab-btn-features')?.addEventListener('click', () => switchRuleTab('features'));
  document.getElementById('rule-tab-btn-skills')?.addEventListener('click', () => switchRuleTab('skills'));
  document.getElementById('rule-tab-btn-tips')?.addEventListener('click', () => switchRuleTab('tips'));

  // Token Selector in Create Room
  document.querySelectorAll('#mono-token-select-grid button').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedTokenInSetup = btn.getAttribute('data-token');
      document.querySelectorAll('#mono-token-select-grid button').forEach(b => {
        b.classList.remove('border-2', 'border-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-950');
        b.classList.add('border', 'border-slate-300', 'dark:border-slate-700');
      });
      btn.classList.add('border-2', 'border-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-950');
      btn.classList.remove('border', 'border-slate-300', 'dark:border-slate-700');
    });
  });

  // Token Selector in Join Room
  document.querySelectorAll('#mono-join-token-grid button').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedTokenInJoin = btn.getAttribute('data-token');
      document.querySelectorAll('#mono-join-token-grid button').forEach(b => {
        b.classList.remove('border-2', 'border-emerald-600', 'bg-emerald-50', 'dark:bg-emerald-950');
        b.classList.add('border', 'border-slate-300', 'dark:border-slate-700');
      });
      btn.classList.add('border-2', 'border-emerald-600', 'bg-emerald-50', 'dark:bg-emerald-950');
      btn.classList.remove('border', 'border-slate-300', 'dark:border-slate-700');
    });
  });

  // Tabs Switching: Buat Room vs Gabung Room
  const tabBtnCreate = document.getElementById('tab-btn-create-room');
  const tabBtnJoin = document.getElementById('tab-btn-join-room');
  const formCreate = document.getElementById('form-mono-setup');
  const formJoin = document.getElementById('form-mono-join');

  function openCreateRoomModal() {
    tabBtnCreate?.classList.add('text-indigo-600', 'border-b-2', 'border-indigo-600');
    tabBtnCreate?.classList.remove('text-slate-400');
    tabBtnJoin?.classList.remove('text-indigo-600', 'border-b-2', 'border-indigo-600');
    tabBtnJoin?.classList.add('text-slate-400');
    formCreate?.classList.remove('hidden');
    formJoin?.classList.add('hidden');

    const nameInput = document.getElementById('mono-input-player-name');
    if (nameInput && !nameInput.value) {
      nameInput.value = window.rankingEngine?.profile?.name || 'Pemain Pintar';
    }
    openModal(document.getElementById('modal-mono-setup'));
  }

  function openJoinRoomModal(prefilledCode = '') {
    tabBtnJoin?.classList.add('text-indigo-600', 'border-b-2', 'border-indigo-600');
    tabBtnJoin?.classList.remove('text-slate-400');
    tabBtnCreate?.classList.remove('text-indigo-600', 'border-b-2', 'border-indigo-600');
    tabBtnCreate?.classList.add('text-slate-400');
    formJoin?.classList.remove('hidden');
    formCreate?.classList.add('hidden');

    const joinName = document.getElementById('mono-join-player-name');
    if (joinName && !joinName.value) {
      joinName.value = window.rankingEngine?.profile?.name || 'Pemain Tamu';
    }
    const joinCodeInput = document.getElementById('mono-join-room-code');
    if (joinCodeInput && prefilledCode) {
      joinCodeInput.value = prefilledCode;
    }
    openModal(document.getElementById('modal-mono-setup'));
  }

  tabBtnCreate?.addEventListener('click', openCreateRoomModal);
  tabBtnJoin?.addEventListener('click', () => openJoinRoomModal());

  // Salin Kode Room
  // Salin Kode Room & Tautan Undangan Domain
  document.getElementById('mono-room-badge-btn')?.addEventListener('click', () => {
    const code = window.monopolyEngine?.roomId || 'ROOM-1';
    const isVercelOrDomain = window.location.hostname.includes('vercel.app') || (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1'));
    const originUrl = isVercelOrDomain ? window.location.origin : 'https://lilevy-games.vercel.app';
    const inviteLink = `${originUrl}/?room=${code}`;
    
    navigator.clipboard?.writeText(inviteLink).then(() => {
      showToast(`📋 Link Undangan Room [${code}] berhasil disalin!\n${inviteLink}`);
    }).catch(() => {
      showToast(`ID Room: ${code}`);
    });
  });

  // Tombol Tambah Bot Terpisah
  document.getElementById('btn-mono-add-bot')?.addEventListener('click', () => {
    const res = window.monopolyEngine.addBotPlayer();
    if (res.success) {
      showToast(`🤖 ${res.bot.name} (${res.bot.token}) berhasil bergabung ke Room!`);
    } else {
      showToast(`⚠️ ${res.message}`);
    }
  });

  // Switch Map Event (Hanya Pembuat Room / Host yang Berwenang)
  const mapSelectEl = document.getElementById('mono-map-select');
  mapSelectEl?.addEventListener('change', (e) => {
    const activeUser = window.authEngine?.getUser();
    const isHost = (!window.monopolyEngine.hostId || window.monopolyEngine.hostId === activeUser?.id || window.monopolyEngine.hostId === 'p_host' || !activeUser || activeUser.id === 'p_host');
    
    if (!isHost) {
      showToast('🔒 Akses Terkunci: Hanya Pembuat Room (Host) yang memiliki wewenang mengganti Peta / Dunia!');
      e.target.value = window.monopolyEngine.currentMapId || 'world';
      return;
    }

    const selectedMapId = e.target.value;
    startMonopolyAIGame(selectedMapId);
    showToast(`🗺️ Berhasil beralih ke ${MONOPOLY_MAPS[selectedMapId]?.name}`);
  });

  // Action Buttons Monopoly
  document.getElementById('btn-mono-roll')?.addEventListener('click', () => window.monopolyEngine.rollDice());
  document.getElementById('btn-mono-end-turn')?.addEventListener('click', () => window.monopolyEngine.endTurn());

  document.getElementById('btn-mono-restart')?.addEventListener('click', () => {
    const activeUser = window.authEngine?.getUser();
    const isHost = (!window.monopolyEngine.hostId || window.monopolyEngine.hostId === activeUser?.id || window.monopolyEngine.hostId === 'p_host' || !activeUser || activeUser.id === 'p_host');
    if (!isHost) {
      showToast('🔒 Akses Terkunci: Hanya Pembuat Room (Host) yang dapat me-restart game!');
      return;
    }
    if (confirm('Mulai ulang permainan Monopoli saat ini?')) {
      startMonopolyAIGame(window.monopolyEngine.currentMapId);
    }
  });

  document.getElementById('btn-mono-open-setup')?.addEventListener('click', () => {
    const activeUser = window.authEngine?.getUser();
    const isHost = (!window.monopolyEngine.hostId || window.monopolyEngine.hostId === activeUser?.id || window.monopolyEngine.hostId === 'p_host' || !activeUser || activeUser.id === 'p_host');
    if (!isHost) {
      showToast('🔒 Akses Terkunci: Hanya Pembuat Room (Host) yang dapat membuka Pengaturan Room!');
      return;
    }
    openCreateRoomModal();
  });

  // Form Submit: Buat Room Baru (TANPA BOT OTOMATIS jika mode Room)
  formCreate?.addEventListener('submit', (e) => {
    e.preventDefault();
    const activeUser = window.authEngine?.getUser();
    const customName = document.getElementById('mono-input-player-name')?.value.trim() || activeUser?.username || 'Pemain Anda';
    const mapId = document.querySelector('input[name="mono-setup-map"]:checked')?.value || 'world';
    const mode = document.querySelector('input[name="mono-mode"]:checked')?.value || 'room';
    const startMoney = parseInt(document.getElementById('mono-start-money').value, 10) || 15000000;

    const hostId = activeUser?.id || 'p_host';
    const configs = [];

    // Pemain Utama (Host)
    configs.push({
      id: hostId,
      name: customName,
      avatar: activeUser?.avatar || '🧠',
      token: selectedTokenInSetup,
      isAI: false
    });

    // Jika user memilih mode 'ai', tambahkan 3 bot pendamping
    if (mode === 'ai') {
      const allTokens = ['🚗', '🚢', '✈️', '🎩', '🐕', '🚀', '🏎️', '👑', '🤖', '💎', '🐉', '🛡️', '🛸', '🦁', '🧙‍♂️', '🦄'];
      const otherTokens = allTokens.filter(t => t !== selectedTokenInSetup);
      const botNames = ['Budi Bot 🤖', 'Siti Bot 🤖', 'Rian Bot 🤖'];
      for (let i = 0; i < 3; i++) {
        configs.push({
          id: 'bot_' + (i + 1),
          name: botNames[i],
          avatar: '🤖',
          token: otherTokens[i % otherTokens.length],
          isAI: true,
          aiLevel: 'smart'
        });
      }
    }

    if (mapSelectEl) mapSelectEl.value = mapId;
    window.monopolyEngine.initGame(configs, { startingMoney: startMoney, mapId, hostId });
    
    document.getElementById('mono-title-text').textContent = MONOPOLY_MAPS[mapId]?.name || 'Monopoli Pro';
    document.getElementById('mono-game-mode-badge').textContent = mode === 'ai' ? 'Lawan AI' : 'Room ID (Host)';
    
    closeModal(document.getElementById('modal-mono-setup'));
    window.monopolyUI?.renderBoard();
    showToast(`👑 Room Berhasil Dibuat! Anda adalah HOST pengelola peta.`);
  });

  // Form Submit: Gabung Room Teman (Join with Code)
  formJoin?.addEventListener('submit', (e) => {
    e.preventDefault();
    const activeUser = window.authEngine?.getUser();
    const joinName = document.getElementById('mono-join-player-name')?.value.trim() || activeUser?.username || 'Pemain Tamu';
    const roomCode = document.getElementById('mono-join-room-code')?.value.trim().toUpperCase() || 'ROOM-1';

    const configs = [
      { id: activeUser?.id || 'p_guest', name: joinName, avatar: activeUser?.avatar || '👤', token: selectedTokenInJoin, isAI: false }
    ];

    window.monopolyEngine.initGame(configs, { roomId: roomCode, mapId: 'world', hostId: 'other_host' });
    document.getElementById('mono-title-text').textContent = 'Monopoli Dunia Global';
    document.getElementById('mono-game-mode-badge').textContent = `Join Room`;

    closeModal(document.getElementById('modal-mono-setup'));
    window.monopolyUI?.renderBoard();
    showToast(`🚀 Berhasil bergabung ke Room [${roomCode}] sebagai "${joinName}"! (Peta diatur oleh Host)`);
  });

  function startMonopolyAIGame(mapId = 'world') {
    const activeUser = window.authEngine?.getUser() || { id: 'p_host', username: 'Pemain Anda', avatar: '🧠', favoriteToken: '🚗' };
    const myToken = activeUser.favoriteToken || '🚗';
    const allTokens = ['🚗', '🚢', '✈️', '🎩', '🐕', '🚀', '🏎️', '👑', '🤖', '💎', '🐉', '🛡️', '🛸', '🦁', '🧙‍♂️', '🦄'];
    const otherTokens = allTokens.filter(t => t !== myToken);

    const configs = [
      { id: activeUser.id || 'p_host', name: activeUser.username, avatar: activeUser.avatar || '🧠', token: myToken, isAI: false },
      { id: 'bot_1', name: 'Budi Bot 🤖', avatar: '🤖', token: otherTokens[0], isAI: true, aiLevel: 'smart' },
      { id: 'bot_2', name: 'Siti Bot 🤖', avatar: '🤖', token: otherTokens[1], isAI: true, aiLevel: 'smart' },
      { id: 'bot_3', name: 'Rian Bot 🤖', avatar: '🤖', token: otherTokens[2], isAI: true, aiLevel: 'smart' }
    ];

    if (mapSelectEl) mapSelectEl.value = mapId;
    window.monopolyEngine.initGame(configs, { mapId, hostId: activeUser.id || 'p_host' });
    document.getElementById('mono-title-text').textContent = MONOPOLY_MAPS[mapId]?.name || 'Monopoli Pro';
    document.getElementById('mono-game-mode-badge').textContent = 'Lawan AI (Host)';
    window.monopolyUI?.renderBoard();
  }

  // Event Deteksi Jaringan Offline & Online (Auto-Kick Disconnect 1m 30s)
  window.addEventListener('offline', () => {
    if (window.monopolyEngine && window.monopolyEngine.players?.length > 0) {
      const human = window.monopolyEngine.players.find(p => !p.isAI && !p.isBankrupt);
      if (human) {
        window.monopolyEngine.markPlayerDisconnected(human);
        showToast('⚠️ Jaringan Terputus! Menunggu 1 menit 30 detik untuk tersambung kembali...');
      }
    }
  });

  window.addEventListener('online', () => {
    if (window.monopolyEngine && window.monopolyEngine.players?.length > 0) {
      const human = window.monopolyEngine.players.find(p => !p.isAI && p.isDisconnected);
      if (human) {
        window.monopolyEngine.markPlayerReconnected(human);
        showToast('✅ Tersambung kembali ke room game!');
      }
    }
  });

  // =========================================================================
  // 7. LELANG TERBUKA BUTTONS
  // =========================================================================
  document.getElementById('btn-auc-bid-100k')?.addEventListener('click', () => {
    const auc = window.monopolyAuction;
    const current = window.monopolyEngine.getCurrentPlayer();
    if (auc && auc.isActive && current) {
      auc.placeBid(window.monopolyEngine, current, auc.highestBid + 100000);
    }
  });

  document.getElementById('btn-auc-bid-500k')?.addEventListener('click', () => {
    const auc = window.monopolyAuction;
    const current = window.monopolyEngine.getCurrentPlayer();
    if (auc && auc.isActive && current) {
      auc.placeBid(window.monopolyEngine, current, auc.highestBid + 500000);
    }
  });

  document.getElementById('btn-auc-pass')?.addEventListener('click', () => {
    const auc = window.monopolyAuction;
    const current = window.monopolyEngine.getCurrentPlayer();
    if (auc && auc.isActive && current) {
      auc.passBid(window.monopolyEngine, current);
    }
  });

  document.getElementById('btn-auc-close')?.addEventListener('click', () => {
    window.monopolyAuction?.closeOrCancelAuction(window.monopolyEngine);
  });

  // =========================================================================
  // 8. BANK & GADAI PROPERTI
  // =========================================================================
  document.getElementById('btn-mono-bank-modal')?.addEventListener('click', () => {
    renderBankModal();
    openModal(document.getElementById('modal-mono-bank'));
  });

  function renderBankModal() {
    const engine = window.monopolyEngine;
    const player = engine.getCurrentPlayer();
    if (!player) return;

    const limit = window.monopolyBank.getMaxLoanLimit(engine, player);
    document.getElementById('bank-loan-limit-text').textContent = `Limit: ${engine.formatRupiah(limit)}`;

    const mortgageList = document.getElementById('bank-mortgage-list');
    if (mortgageList) {
      mortgageList.innerHTML = '';
      const ownedTiles = engine.activeTiles.filter(t => engine.propertyState[t.id]?.ownerId === player.id);

      if (ownedTiles.length === 0) {
        mortgageList.innerHTML = '<p class="text-xs text-slate-400 italic text-center p-3">Anda belum memiliki properti yang dapat digadaikan.</p>';
      } else {
        ownedTiles.forEach(t => {
          const prop = engine.propertyState[t.id];
          const mortgageVal = Math.floor(t.price * 0.5);
          const redeemCost = Math.floor(t.price * 0.55);

          const item = document.createElement('div');
          item.className = 'p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between text-xs';
          item.innerHTML = `
            <div>
              <span class="font-bold text-slate-900 dark:text-white block">${t.name}</span>
              <span class="text-[10px] text-slate-500">${prop.isMortgaged ? '🔒 Digadaikan' : 'Aktif'}</span>
            </div>
            <div>
              ${prop.isMortgaged 
                ? `<button data-unmortgage-id="${t.id}" class="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold">Tebus (${engine.formatRupiah(redeemCost)})</button>`
                : `<button data-mortgage-id="${t.id}" class="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-bold">Gadai (+${engine.formatRupiah(mortgageVal)})</button>`
              }
            </div>
          `;
          mortgageList.appendChild(item);
        });

        mortgageList.querySelectorAll('[data-mortgage-id]').forEach(b => {
          b.addEventListener('click', () => {
            const tileId = parseInt(b.getAttribute('data-mortgage-id'), 10);
            window.monopolyBank.mortgageProperty(engine, player, tileId);
            renderBankModal();
          });
        });

        mortgageList.querySelectorAll('[data-unmortgage-id]').forEach(b => {
          b.addEventListener('click', () => {
            const tileId = parseInt(b.getAttribute('data-unmortgage-id'), 10);
            window.monopolyBank.unmortgageProperty(engine, player, tileId);
            renderBankModal();
          });
        });
      }
    }
  }

  document.getElementById('btn-bank-take-1m')?.addEventListener('click', () => {
    const engine = window.monopolyEngine;
    const player = engine.getCurrentPlayer();
    const res = window.monopolyBank.takeLoan(engine, player, 1000000);
    if (!res.success) alert(res.message);
    renderBankModal();
  });

  document.getElementById('btn-bank-repay-1m')?.addEventListener('click', () => {
    const engine = window.monopolyEngine;
    const player = engine.getCurrentPlayer();
    const res = window.monopolyBank.repayLoan(engine, player, 1000000);
    if (!res.success) alert(res.message);
    renderBankModal();
  });

  // Skills Modal
  document.getElementById('btn-mono-skills-modal')?.addEventListener('click', () => {
    openModal(document.getElementById('modal-mono-skills'));
  });

  // Build House Modal
  document.getElementById('btn-mono-build-modal')?.addEventListener('click', () => {
    const modal = document.getElementById('modal-mono-build');
    const container = document.getElementById('mono-buildable-list');
    const engine = window.monopolyEngine;
    const player = engine.getCurrentPlayer();
    if (!container || !player) return;

    container.innerHTML = '';
    const monopolyTiles = engine.activeTiles.filter(t => {
      const prop = engine.propertyState[t.id];
      return prop && prop.ownerId === player.id && engine.checkFullGroupOwnership(player.id, t.group);
    });

    if (monopolyTiles.length === 0) {
      container.innerHTML = '<p class="text-xs text-slate-400 italic p-3 text-center">Anda belum menguasai seluruh kawasan dalam satu warna untuk membangun rumah.</p>';
    } else {
      monopolyTiles.forEach(t => {
        const prop = engine.propertyState[t.id];
        const group = engine.activeGroups[t.group];
        let cost = group.houseCost;
        if (prop.isHotel && !prop.isSkyscraper) cost = Math.floor(cost * 1.5);
        if (window.monopolyEconomy) cost = window.monopolyEconomy.getModifiedHouseCost(cost);
        if (window.monopolySkills) cost = window.monopolySkills.getHouseBuildingCost(player, cost);

        let statusText = '📍 Tanah Kosong';
        let btnText = `+ Bangun Rumah 1 (${engine.formatRupiah(cost)})`;
        let isMax = false;

        if (prop.isSkyscraper) {
          statusText = '🏢 Gedung Pencakar Langit (Sky Maksimal)';
          btnText = 'Tingkat Maksimal (Sky) ✨';
          isMax = true;
        } else if (prop.isHotel) {
          statusText = '🏨 Hotel Megah';
          btnText = `🏢 Upgrade Skyscraper (${engine.formatRupiah(cost)})`;
        } else if (prop.houses === 4) {
          statusText = '🏠🏠🏠🏠 4 Rumah';
          btnText = `🏨 Upgrade ke Hotel (${engine.formatRupiah(cost)})`;
        } else if (prop.houses > 0) {
          statusText = `${'🏠'.repeat(prop.houses)} ${prop.houses} Rumah`;
          btnText = `+ Bangun Rumah ke-${prop.houses + 1} (${engine.formatRupiah(cost)})`;
        }

        const canAfford = player.money >= cost;

        const item = document.createElement('div');
        item.className = 'p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2';
        item.innerHTML = `
          <div>
            <span class="text-xs font-bold text-slate-900 dark:text-white block">${t.name}</span>
            <span class="text-[11px] font-semibold text-slate-500">${statusText}</span>
          </div>
          <button data-build-tile="${t.id}" class="px-3 py-1.5 rounded-lg text-xs font-bold shadow transition ${
            isMax ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed' :
            canAfford ? (prop.isHotel ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/30' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30') :
            'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
          }" ${isMax || !canAfford ? 'disabled' : ''}>
            ${btnText}
          </button>
        `;
        container.appendChild(item);
      });

      container.querySelectorAll('[data-build-tile]:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
          const tileId = parseInt(btn.getAttribute('data-build-tile'), 10);
          engine.buildHouse(player, tileId);
          closeModal(modal);
        });
      });
    }

    openModal(modal);
  });

  // =========================================================================
  // 9. PASAR GELAP & KARTU SABOTASE
  // =========================================================================
  document.getElementById('btn-mono-blackmarket-modal')?.addEventListener('click', () => {
    renderBlackMarketModal();
    openModal(document.getElementById('modal-mono-blackmarket'));
  });

  function renderBlackMarketModal() {
    const engine = window.monopolyEngine;
    const player = engine.getCurrentPlayer();
    const bm = window.monopolyBlackMarket;
    if (!player || !bm) return;

    // 1. Render Kartu di Tangan
    const handContainer = document.getElementById('blackmarket-my-hand');
    const myCards = bm.getPlayerCards(player.id);
    if (handContainer) {
      handContainer.innerHTML = '';
      if (myCards.length === 0) {
        handContainer.innerHTML = '<p class="text-xs text-slate-400 italic col-span-3 text-center py-2">Belum ada kartu sabotase di saku Anda.</p>';
      } else {
        myCards.forEach((card, idx) => {
          const cardEl = document.createElement('div');
          cardEl.className = 'p-2.5 bg-slate-900 text-slate-100 rounded-xl border border-amber-500/40 text-xs flex flex-col justify-between';
          cardEl.innerHTML = `
            <div>
              <div class="flex items-center gap-1.5 mb-1 font-bold text-amber-400">
                <span>${card.icon}</span>
                <span>${card.name}</span>
              </div>
              <p class="text-[10px] text-slate-300 line-clamp-2">${card.desc}</p>
            </div>
            <button data-use-card-idx="${idx}" class="mt-2 w-full py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] shadow transition">
              Gunakan Sekarang ⚡
            </button>
          `;
          handContainer.appendChild(cardEl);
        });

        handContainer.querySelectorAll('[data-use-card-idx]').forEach(b => {
          b.addEventListener('click', () => {
            const idx = parseInt(b.getAttribute('data-use-card-idx'), 10);
            const res = bm.useCard(engine, player, idx);
            if (!res.success) alert(res.message);
            renderBlackMarketModal();
          });
        });
      }
    }

    // 2. Render Katalog
    const catalogContainer = document.getElementById('blackmarket-catalog');
    if (catalogContainer) {
      catalogContainer.innerHTML = '';
      bm.catalog.forEach(card => {
        const item = document.createElement('div');
        item.className = 'p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs';
        item.innerHTML = `
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">${card.icon}</span>
            <div>
              <span class="font-bold text-slate-900 dark:text-white block">${card.name}</span>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">${card.desc}</p>
              <span class="font-mono font-bold text-amber-600 dark:text-amber-400 text-[11px]">${engine.formatRupiah(card.cost)}</span>
            </div>
          </div>
          <button data-buy-card-id="${card.id}" class="px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-amber-400 hover:bg-slate-800 rounded-xl font-bold text-xs shadow shrink-0">
            Beli Kartu 🛒
          </button>
        `;
        catalogContainer.appendChild(item);
      });

      catalogContainer.querySelectorAll('[data-buy-card-id]').forEach(b => {
        b.addEventListener('click', () => {
          const cardId = b.getAttribute('data-buy-card-id');
          const res = bm.buyCard(engine, player, cardId);
          if (!res.success) alert(res.message);
          renderBlackMarketModal();
        });
      });
    }
  }

  // =========================================================================
  // 10. BURSA EFEK & INVESTASI SAHAM GLOBAL
  // =========================================================================
  document.getElementById('btn-mono-stocks-modal')?.addEventListener('click', () => {
    renderStocksModal();
    openModal(document.getElementById('modal-mono-stocks'));
  });

  function renderStocksModal() {
    const engine = window.monopolyEngine;
    const player = engine.getCurrentPlayer();
    const sm = window.monopolyStocks;
    if (!player || !sm) return;

    const list = document.getElementById('stocks-market-list');
    if (!list) return;

    list.innerHTML = '';
    const portfolio = sm.getPortfolio(player.id);

    sm.stocks.forEach(stock => {
      const owned = portfolio[stock.id] || 0;
      const isUp = stock.changePct >= 0;
      const item = document.createElement('div');
      item.className = 'p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs';
      item.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">${stock.icon}</span>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-slate-900 dark:text-white">${stock.name} (${stock.id})</span>
              <span class="px-1.5 py-0.2 rounded text-[10px] font-mono font-black ${isUp ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}">
                ${isUp ? '▲ +' : '▼ '}${stock.changePct}%
              </span>
            </div>
            <div class="flex items-center gap-3 mt-0.5">
              <span class="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">Harga: ${engine.formatRupiah(stock.price)} / lot</span>
              <span class="text-[11px] font-semibold text-slate-500">Milik Anda: <strong>${owned} lot</strong></span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button data-buy-stock="${stock.id}" class="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow">
            Beli (+1)
          </button>
          <button data-sell-stock="${stock.id}" class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow ${owned <= 0 ? 'opacity-40 pointer-events-none' : ''}">
            Jual (-1)
          </button>
        </div>
      `;
      list.appendChild(item);
    });

    list.querySelectorAll('[data-buy-stock]').forEach(b => {
      b.addEventListener('click', () => {
        const sid = b.getAttribute('data-buy-stock');
        const res = sm.buyStock(engine, player, sid, 1);
        if (!res.success) alert(res.message);
        renderStocksModal();
      });
    });

    list.querySelectorAll('[data-sell-stock]').forEach(b => {
      b.addEventListener('click', () => {
        const sid = b.getAttribute('data-sell-stock');
        const res = sm.sellStock(engine, player, sid, 1);
        if (!res.success) alert(res.message);
        renderStocksModal();
      });
    });
  }

  // =========================================================================
  // 11. MISI TANTANGAN & BOUNTY QUESTS
  // =========================================================================
  document.getElementById('btn-mono-bounty-modal')?.addEventListener('click', () => {
    renderBountyModal();
    openModal(document.getElementById('modal-mono-bounty'));
  });

  function renderBountyModal() {
    const engine = window.monopolyEngine;
    const player = engine.getCurrentPlayer();
    const bq = window.monopolyBounty;
    if (!player || !bq) return;

    const list = document.getElementById('bounty-quests-list');
    if (!list) return;

    list.innerHTML = '';
    bq.quests.forEach(quest => {
      const item = document.createElement('div');
      item.className = `p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${quest.isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'}`;
      item.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-2xl">${quest.icon}</span>
          <div>
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="font-bold text-slate-900 dark:text-white">${quest.title}</span>
              ${quest.isCompleted ? '<span class="px-1.5 py-0.2 rounded bg-emerald-600 text-white font-bold text-[9px]">SELESAI ✓</span>' : '<span class="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[9px]">BERLANGSUNG</span>'}
            </div>
            <p class="text-[11px] text-slate-600 dark:text-slate-300">${quest.desc}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">Hadiah: ${engine.formatRupiah(quest.rewardMoney)}</span>
              <span class="text-indigo-600 dark:text-indigo-400 font-mono font-bold">+${quest.rewardExp} EXP</span>
            </div>
          </div>
        </div>
      `;
      list.appendChild(item);
    });
  }

  // =========================================================================
  // 12. LIVE ROOM CHAT & EMOTE SYSTEM (MONOPOLI PRO)
  // =========================================================================
  if (window.monopolyChat) {
    window.monopolyChat.init();
  }

  const chatToggleBtn = document.getElementById('btn-mono-chat-toggle');
  const chatModal = document.getElementById('modal-mono-chat');

  chatToggleBtn?.addEventListener('click', () => {
    if (window.monopolyChat) {
      window.monopolyChat.isOpen = true;
      window.monopolyChat.unreadCount = 0;
      window.monopolyChat.updateUnreadBadge();
      window.monopolyChat.renderMessages();
    }
    openModal(chatModal);
  });

  chatModal?.querySelector('[data-close-modal]')?.addEventListener('click', () => {
    if (window.monopolyChat) window.monopolyChat.isOpen = false;
  });

  document.getElementById('form-mono-chat')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('input-mono-chat');
    const text = input?.value;
    if (!text || !window.monopolyChat) return;

    const cur = window.monopolyEngine?.getCurrentPlayer() || { name: 'Pemain', token: '👤' };
    window.monopolyChat.sendMessage(cur.name, text, false, cur.token);
    input.value = '';
  });

  document.querySelectorAll('[data-chat-emote]').forEach(btn => {
    btn.addEventListener('click', () => {
      const emote = btn.getAttribute('data-chat-emote');
      const cur = window.monopolyEngine?.getCurrentPlayer() || { name: 'Pemain', token: '👤' };
      if (window.monopolyChat && emote) {
        window.monopolyChat.sendEmote(cur.name, emote, false, cur.token);
      }
    });
  });

  // =========================================================================
  // 13. KASINO RODA KEBERUNTUNGAN (PARKIR BEBAS)
  // =========================================================================
  document.getElementById('btn-casino-spin')?.addEventListener('click', () => {
    const engine = window.monopolyEngine;
    const player = engine?.getCurrentPlayer();
    if (window.monopolyCasino && engine && player) {
      window.monopolyCasino.spinWheel(engine, player);
    }
  });

  // =========================================================================
  // 14. TTS TIME-ATTACK MODE (60 DETIK)
  // =========================================================================
  document.getElementById('btn-tts-time-attack')?.addEventListener('click', () => {
    const randomIdx = Math.floor(Math.random() * PUZZLE_DATA.length);
    renderPuzzle(PUZZLE_DATA[randomIdx]);
    showToast('⚡ Mode Time-Attack 60 Detik Aktif! Selesaikan sebanyak mungkin kata!');
  });

  // =========================================================================
  // 15. SISTEM MULTI-BAHASA (I18N LANGUAGE SWITCHER)
  // =========================================================================
  document.getElementById('btn-lang-toggle')?.addEventListener('click', () => {
    const nextLang = window.i18n?.toggleLanguage();
    showToast(nextLang === 'en' ? '🇬🇧 Switched language to English!' : '🇮🇩 Bahasa diubah ke Indonesia!');
  });

  window.onLanguageChanged = () => {
    if (window.rankingEngine) window.rankingEngine.render();
    if (window.monopolyUI) window.monopolyUI.updateUI();
    if (document.getElementById('modal-achievements') && !document.getElementById('modal-achievements').classList.contains('hidden')) {
      renderAchievementsModal();
    }
  };

  // =========================================================================
  // 16. SISTEM PRESTASI & LENCANA (ACHIEVEMENTS)
  // =========================================================================
  function renderAchievementsModal() {
    const container = document.getElementById('achievements-list-container');
    if (!container || !window.achievementEngine) return;
    const isEn = window.i18n?.currentLang === 'en';
    const progress = window.achievementEngine.getProgress();

    const countEl = document.getElementById('ach-progress-count');
    const barEl = document.getElementById('ach-progress-bar');
    const pctEl = document.getElementById('ach-progress-percent');
    if (countEl) countEl.textContent = `${progress.unlocked} / ${progress.total}`;
    if (barEl) barEl.style.width = `${progress.percent}%`;
    if (pctEl) pctEl.textContent = `${progress.percent}%`;

    container.innerHTML = window.achievementEngine.list.map(ach => {
      const isUnlocked = !!window.achievementEngine.unlocked[ach.id];
      const title = isEn ? ach.titleEn : ach.title;
      const desc = isEn ? ach.descEn : ach.desc;

      return `
        <div class="p-3 rounded-xl border ${isUnlocked ? 'border-amber-300 bg-amber-50/60 dark:bg-slate-800 dark:border-amber-500/50' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 opacity-60'} flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl ${isUnlocked ? 'bg-amber-100 dark:bg-slate-700' : 'bg-slate-200 dark:bg-slate-800'} flex items-center justify-center text-xl shadow-inner">
              ${ach.icon}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-xs font-bold text-slate-900 dark:text-white">${title}</h4>
                <span class="px-1.5 py-0.5 rounded text-[9px] font-black ${isUnlocked ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}">${isUnlocked ? 'TERBUKA ✨' : 'TERKUNCI 🔒'}</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">${desc}</p>
            </div>
          </div>
          <div class="text-right whitespace-nowrap">
            <span class="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">+${ach.exp} EXP</span>
          </div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('btn-open-achievements')?.addEventListener('click', () => {
    renderAchievementsModal();
    document.getElementById('modal-achievements')?.classList.remove('hidden');
  });

  document.getElementById('btn-mobile-achievements')?.addEventListener('click', () => {
    closeMobileDrawer();
    renderAchievementsModal();
    document.getElementById('modal-achievements')?.classList.remove('hidden');
  });

  document.getElementById('btn-close-achievements-modal')?.addEventListener('click', () => {
    document.getElementById('modal-achievements')?.classList.add('hidden');
  });

  // =========================================================================
  // 17. REGISTRASI PROGRESSIVE WEB APP (PWA) SERVICE WORKER
  // =========================================================================
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').then(() => {
      console.log('🚀 PWA Service Worker terdaftar dengan sukses!');
    }).catch(err => {
      console.log('PWA Service Worker note:', err);
    });
  }

  // =========================================================================
  // 18. HIGH-PERFORMANCE MICRO-INTERACTIONS (60 FPS 3D TILT & RIPPLE)
  // =========================================================================
  document.querySelectorAll('.home-game-card').forEach(card => {
    let rafId = null;
    card.addEventListener('mousemove', (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = '';
    });
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .shimmer-btn, .btn-modern-primary, .btn-modern-emerald, .btn-modern-amber');
    if (!btn) return;
    const ripple = document.createElement('span');
    ripple.className = 'ripple-wave';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 550);
  });

  // URL Parameter Check for Auto-Join
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get('room');
  if (roomParam) {
    switchView('monopoly');
    openJoinRoomModal(roomParam);
  } else {
    renderPuzzle(PUZZLE_DATA[0]);
    startMonopolyAIGame('world');
    switchView('home');
  }

  // Inisialisasi terjemahan bahasa
  if (window.i18n) window.i18n.applyTranslations();

  if (window.lucide) window.lucide.createIcons();
});
