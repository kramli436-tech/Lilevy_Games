/**
 * LILEVY GAMES - REALTIME ONLINE PRESENCE ENGINE
 * Menghitung dan menyinkronkan jumlah pemain aktif di website secara 100% valid dan realtime.
 * Mendukung:
 * 1. Multi-Tab & Multi-Window Synchronization via BroadcastChannel API
 * 2. Shared Storage Registry (localStorage with auto-expiry cleanup)
 * 3. Python Backend REST Heartbeat Sync (/api/presence/heartbeat)
 */

class PresenceEngine {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.channel = null;
    this.onlineCount = 1;
    this.heartbeatInterval = null;
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    this.backendUrl = isLocal && window.location.port !== '8000' ? 'http://localhost:8000' : '';

    this.init();
  }

  getOrCreateSessionId() {
    let sid = sessionStorage.getItem('lilevy_session_id');
    if (!sid) {
      sid = 'usr_sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      sessionStorage.setItem('lilevy_session_id', sid);
    }
    return sid;
  }

  init() {
    // 1. Setup BroadcastChannel untuk sinkronisasi antar-tab seketika
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('lilevy_presence_channel');
        this.channel.onmessage = (event) => {
          this.handleChannelMessage(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported', e);
      }
    }

    // 2. Kirim sinyal JOIN
    this.sendHeartbeat('JOIN');

    // 3. Interval Heartbeat berkala (setiap 3,5 detik)
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat('PING');
    }, 3500);

    // 4. Deteksi Tab Ditutup / Dilepas (beforeunload & pagehide)
    window.addEventListener('beforeunload', () => this.leave());
    window.addEventListener('pagehide', () => this.leave());

    // 5. Update UI pertama kali
    this.calculateLocalOnlineCount();
  }

  getPlayerInfo() {
    const user = window.authEngine?.getUser();
    return {
      id: this.sessionId,
      userId: user?.id || 'guest',
      name: user?.username || 'Pemain Tamu',
      avatar: user?.avatar || '🧠',
      timestamp: Date.now()
    };
  }

  sendHeartbeat(action = 'PING') {
    const playerInfo = this.getPlayerInfo();

    // 1. Update ke localStorage registry
    this.updateLocalRegistry(playerInfo);

    // 2. Broadcast ke tab lain
    if (this.channel) {
      this.channel.postMessage({
        type: action,
        player: playerInfo
      });
    }

    // 3. Kirim ke Python Backend jika server aktif
    this.syncBackend(playerInfo);

    // 4. Hitung ulang dan update UI
    this.calculateLocalOnlineCount();
  }

  updateLocalRegistry(playerInfo) {
    try {
      const raw = localStorage.getItem('lilevy_presence_registry') || '{}';
      let registry = JSON.parse(raw);
      const now = Date.now();

      // Bersihkan sesi yang sudah tidak aktif (> 10 detik tanpa heartbeat)
      Object.keys(registry).forEach(sid => {
        if (!registry[sid] || now - registry[sid].timestamp > 10000) {
          delete registry[sid];
        }
      });

      // Tambahkan sesi saat ini
      registry[playerInfo.id] = playerInfo;
      localStorage.setItem('lilevy_presence_registry', JSON.stringify(registry));
    } catch (e) {
      console.warn('Presence registry error', e);
    }
  }

  calculateLocalOnlineCount() {
    try {
      const raw = localStorage.getItem('lilevy_presence_registry') || '{}';
      const registry = JSON.parse(raw);
      const now = Date.now();
      let count = 0;

      Object.keys(registry).forEach(sid => {
        if (registry[sid] && now - registry[sid].timestamp <= 10000) {
          count++;
        }
      });

      this.onlineCount = Math.max(1, count);
      this.renderCount(this.onlineCount);
    } catch (e) {
      this.renderCount(1);
    }
  }

  handleChannelMessage(data) {
    if (!data) return;
    if (data.type === 'JOIN' || data.type === 'PING') {
      if (data.player && data.player.id !== this.sessionId) {
        this.updateLocalRegistry(data.player);
        this.calculateLocalOnlineCount();
      }
    } else if (data.type === 'LEAVE') {
      if (data.sessionId) {
        try {
          const raw = localStorage.getItem('lilevy_presence_registry') || '{}';
          let registry = JSON.parse(raw);
          delete registry[data.sessionId];
          localStorage.setItem('lilevy_presence_registry', JSON.stringify(registry));
          this.calculateLocalOnlineCount();
        } catch (e) {}
      }
    }
  }

  async syncBackend(playerInfo) {
    try {
      const resp = await fetch(`${this.backendUrl}/api/presence/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: playerInfo.id,
          name: playerInfo.name
        })
      });
      if (resp.ok) {
        const res = await resp.json();
        if (res.success && typeof res.onlineCount === 'number') {
          const finalCount = Math.max(res.onlineCount, this.onlineCount);
          this.renderCount(finalCount);
        }
      }
    } catch (e) {
      // Backend offline, fallback ke sync local tab
    }
  }

  leave() {
    if (this.channel) {
      this.channel.postMessage({
        type: 'LEAVE',
        sessionId: this.sessionId
      });
    }

    try {
      const raw = localStorage.getItem('lilevy_presence_registry') || '{}';
      let registry = JSON.parse(raw);
      delete registry[this.sessionId];
      localStorage.setItem('lilevy_presence_registry', JSON.stringify(registry));
    } catch (e) {}

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ sessionId: this.sessionId })], { type: 'application/json' });
        navigator.sendBeacon(`${this.backendUrl}/api/presence/leave`, blob);
      }
    } catch (e) {}
  }

  renderCount(count) {
    const badgeEl = document.getElementById('online-players-count');
    if (badgeEl) {
      badgeEl.textContent = count.toLocaleString('id-ID');
    }
  }
}

// Inisialisasi Singleton
window.presenceEngine = new PresenceEngine();
