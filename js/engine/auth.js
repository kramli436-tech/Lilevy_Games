/**
 * LILEVY GAMES - USER AUTHENTICATION & AUTOMATIC PERSISTENCE ENGINE
 * Menyimpan data akun pemain secara permanen (Local Storage & File Database)
 * Otomatis menyimpan progres game langsung ke file database tanpa perlu langkah yang rumit.
 */

class AuthEngine {
  constructor() {
    this.STORAGE_KEY_USERS = 'lilevy_users_db_v1';
    this.STORAGE_KEY_SESSION = 'lilevy_active_session_v1';
    this.STORAGE_KEY_LOCAL_USER = 'lilevy_local_user_v1';

    this.users = this.loadUsersDatabase();
    this.currentUser = this.loadActiveSession();

    // Jika belum ada user aktif, buat atau muat profil lokal otomatis
    if (!this.currentUser) {
      this.ensureLocalUser();
    }
  }

  // Muat database pengguna dari localStorage
  loadUsersDatabase() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY_USERS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Gagal memuat database user:', e);
    }
    return {};
  }

  // Simpan database pengguna ke localStorage dan auto-sync ke file disk backend
  saveUsersDatabase() {
    try {
      localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(this.users));
      this.syncAllWithBackend();
    } catch (e) {
      console.error('Gagal menyimpan database user:', e);
    }
  }

  // Muat sesi aktif
  loadActiveSession() {
    try {
      const savedSession = localStorage.getItem(this.STORAGE_KEY_SESSION);
      if (savedSession) {
        const user = JSON.parse(savedSession);
        if (user && this.users[user.username.toLowerCase()]) {
          return this.users[user.username.toLowerCase()];
        }
        return user;
      }
    } catch (e) {
      console.warn('Gagal memuat sesi aktif:', e);
    }
    return null;
  }

  // Simpan sesi aktif
  saveActiveSession(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.STORAGE_KEY_SESSION);
    }
  }

  // Buat profil lokal otomatis agar semua pemain langsung tersimpan tanpa ribet
  ensureLocalUser() {
    let localSaved = null;
    try {
      localSaved = JSON.parse(localStorage.getItem(this.STORAGE_KEY_LOCAL_USER));
    } catch (e) {}

    if (!localSaved) {
      localSaved = {
        id: 'usr_local_' + Date.now(),
        username: 'Pemain Lokal',
        avatar: '🧠',
        favoriteToken: '🚗',
        isLocalDefault: true,
        registeredAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        stats: {
          totalPoints: 0,
          ttsSolved: 0,
          monopolyGames: 0,
          monopolyWins: 0,
          monopolyTotalNetWorth: 0,
          monopolyHighestCash: 0,
          monopolySetsOwned: 0,
          streak: 1,
          tierTitle: 'Pemula Kata',
          tierBadge: 'Bronze'
        }
      };
      try {
        localStorage.setItem(this.STORAGE_KEY_LOCAL_USER, JSON.stringify(localSaved));
      } catch (e) {}
    }

    const key = localSaved.username.toLowerCase();
    if (!this.users[key]) {
      this.users[key] = localSaved;
      this.saveUsersDatabase();
    }
    this.currentUser = this.users[key] || localSaved;
  }

  // Pendaftaran Akun Baru
  register(username, password, avatar = '🧠', favoriteToken = '🚗') {
    if (!username || !username.trim()) {
      return { success: false, message: 'Username tidak boleh kosong!' };
    }
    const cleanUser = username.trim();
    if (cleanUser.length < 3) {
      return { success: false, message: 'Username minimal 3 karakter!' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'Password minimal 4 karakter!' };
    }

    const key = cleanUser.toLowerCase();
    if (this.users[key] && !this.users[key].isLocalDefault) {
      return { success: false, message: 'Username sudah terdaftar! Silakan gunakan nama lain atau login.' };
    }

    // Pindahkan skor lama dari Pemain Lokal jika ada
    const currentStats = this.currentUser?.stats || {
      totalPoints: 0,
      ttsSolved: 0,
      monopolyGames: 0,
      monopolyWins: 0,
      monopolyTotalNetWorth: 0,
      monopolyHighestCash: 0,
      monopolySetsOwned: 0,
      streak: 1,
      tierTitle: 'Pemula Kata',
      tierBadge: 'Bronze'
    };

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      username: cleanUser,
      password: password,
      avatar: avatar || '🧠',
      favoriteToken: favoriteToken || '🚗',
      isLocalDefault: false,
      registeredAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      stats: { ...currentStats }
    };

    this.users[key] = newUser;
    this.saveUsersDatabase();
    this.saveActiveSession(newUser);
    this.syncWithBackend(newUser);

    return { success: true, user: newUser, message: `🎉 Selamat datang, ${cleanUser}! Akun Anda berhasil disimpan permanen.` };
  }

  // Masuk Akun
  login(username, password) {
    if (!username || !username.trim()) {
      return { success: false, message: 'Username tidak boleh kosong!' };
    }
    const key = username.trim().toLowerCase();
    const user = this.users[key];

    if (!user) {
      return { success: false, message: 'Akun tidak ditemukan! Silakan daftar terlebih dahulu.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Kata sandi / Password salah!' };
    }

    user.lastLoginAt = new Date().toISOString();
    this.users[key] = user;
    this.saveUsersDatabase();
    this.saveActiveSession(user);

    return { success: true, user: user, message: `👋 Selamat datang kembali, ${user.username}!` };
  }

  // Keluar Akun (Logout)
  logout() {
    this.saveActiveSession(null);
    this.ensureLocalUser();
    return { success: true, message: 'Anda telah keluar dari akun.' };
  }

  // Periksa status login
  isLoggedIn() {
    return this.currentUser !== null && !this.currentUser.isLocalDefault;
  }

  // Dapatkan profil user aktif
  getUser() {
    if (this.currentUser) return this.currentUser;
    this.ensureLocalUser();
    return this.currentUser;
  }

  // Perbarui statistik pemain aktif secara instan dan permanen
  recordGameStats(category, data) {
    const user = this.getUser();
    if (!user) return;

    const key = user.username.toLowerCase();

    if (!user.stats) {
      user.stats = {
        totalPoints: 0,
        ttsSolved: 0,
        monopolyGames: 0,
        monopolyWins: 0,
        monopolyTotalNetWorth: 0,
        monopolyHighestCash: 0,
        monopolySetsOwned: 0,
        streak: 1,
        tierTitle: 'Pemula Kata',
        tierBadge: 'Bronze'
      };
    }

    if (category === 'tts') {
      user.stats.totalPoints += (data.score || 0);
      user.stats.ttsSolved += 1;
    } else if (category === 'monopoly') {
      user.stats.monopolyGames += 1;
      if (data.isWinner) user.stats.monopolyWins += 1;
      user.stats.monopolyTotalNetWorth += (data.netWorth || 0);
      user.stats.monopolySetsOwned += (data.setsOwned || 0);
      user.stats.totalPoints += (data.pointsEarned || 500);
      if ((data.finalCash || 0) > (user.stats.monopolyHighestCash || 0)) {
        user.stats.monopolyHighestCash = data.finalCash;
      }
    }

    this.users[key] = user;
    this.saveUsersDatabase();
    this.saveActiveSession(user);

    if (window.rankingEngine) {
      window.rankingEngine.syncUserRanking(user);
    }
  }

  // Deteksi URL Backend Python (Opsional: HANYA jika server python dijalankan pada port 8000)
  getBackendUrl() {
    try {
      if (typeof window === 'undefined' || !window.location) return null;
      const hostname = window.location.hostname;
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
      
      // Jika diakses langsung via server python di port 8000
      if (isLocal && window.location.port === '8000') {
        return '';
      }
      
      // Pada Vercel (https://lilevy-games.vercel.app) atau VS Code Live Server:
      // Game berjalan 100% Client-Side PWA dengan LocalStorage permanen tanpa perlu server python
      return null;
    } catch (e) {
      return null;
    }
  }

  // Sinkronisasi 1 user ke Backend Python API (opsional - hanya jika server python aktif)
  async syncWithBackend(user) {
    if (!user || typeof window === 'undefined' || !window.location) return;
    const backendUrl = this.getBackendUrl();
    if (backendUrl === null) return; // Lewati jika tidak ada backend python (di Vercel / Live Server)

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      await fetch(`${backendUrl}/api/auth/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
        signal: controller.signal
      }).catch(() => {});
      clearTimeout(timeoutId);
    } catch (e) {
      // Backend offline tidak masalah, penyimpanan lokal browser sudah permanen
    }
  }

  // Sinkronisasi seluruh database pengguna ke file disk di backend Python (opsional)
  async syncAllWithBackend() {
    if (!this.users || typeof window === 'undefined' || !window.location) return;
    const backendUrl = this.getBackendUrl();
    if (backendUrl === null) return; // Lewati jika tidak ada backend python

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      await fetch(`${backendUrl}/api/auth/save-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.users),
        signal: controller.signal
      }).catch(() => {});
      clearTimeout(timeoutId);
    } catch (e) {
      // Silently continue
    }
  }

  // Ekspor / Download file database pengguna (.json) secara instan tanpa ribet
  exportDataToFile() {
    try {
      const dataStr = JSON.stringify(this.users, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lilevy_users_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true, message: '📁 File data akun pemain berhasil diunduh!' };
    } catch (e) {
      return { success: false, message: 'Gagal mengunduh file: ' + e.message };
    }
  }

  // Impor file database pengguna (.json)
  importDataFromFile(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      if (typeof parsed === 'object' && parsed !== null) {
        this.users = { ...this.users, ...parsed };
        this.saveUsersDatabase();
        return { success: true, message: '✅ Berhasil memuat dan menggabungkan data dari file!' };
      }
      return { success: false, message: 'Format file JSON tidak valid.' };
    } catch (e) {
      return { success: false, message: 'File rusak atau bukan JSON valid: ' + e.message };
    }
  }
}

window.authEngine = new AuthEngine();
