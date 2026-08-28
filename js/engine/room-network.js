/**
 * LILEVY GAMES - REALTIME MULTIPLAYER ROOM NETWORK ENGINE
 * Mengelola sinkronisasi permainan antar-perangkat (WebRTC PeerJS & BroadcastChannel)
 * Mendukung permainan online multi-device di Vercel (https://lilevy-games.vercel.app),
 * domain kustom, smartphone (Android/iOS), tablet, serta multi-tab lokal.
 */

class RoomNetworkEngine {
  constructor() {
    this.peer = null;
    this.connections = {}; // { [peerId]: conn } (Untuk Host: menyimpan koneksi semua guest)
    this.hostConnection = null; // (Untuk Guest: koneksi ke Host)
    this.isHost = false;
    this.roomId = null;
    this.localPlayer = null;
    this.broadcastChannel = null;
    this.status = 'DISCONNECTED'; // 'CONNECTING' | 'CONNECTED' | 'HOSTING' | 'JOINED'

    // Callbacks
    this.onPlayerJoined = null;
    this.onPlayerLeft = null;
    this.onStateReceived = null;
    this.onActionReceived = null;
    this.onChatMessage = null;
    this.onConnectionStatus = null;
  }

  // Format Room ID menjadi Peer ID unik yang aman (hanya huruf kecil, angka, dash)
  formatPeerId(roomId) {
    const clean = (roomId || 'ROOM-1').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `lilevy-room-${clean}`;
  }

  // Bersihkan koneksi lama
  cleanup() {
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch (e) {}
      this.broadcastChannel = null;
    }
    if (this.hostConnection) {
      try { this.hostConnection.close(); } catch (e) {}
      this.hostConnection = null;
    }
    Object.values(this.connections).forEach(conn => {
      try { conn.close(); } catch (e) {}
    });
    this.connections = {};

    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }
    this.isHost = false;
    this.status = 'DISCONNECTED';
  }

  // Notifikasi status jaringan ke UI
  notifyStatus(status, message = '') {
    this.status = status;
    if (this.onConnectionStatus) {
      this.onConnectionStatus(status, message);
    }
  }

  // Inisialisasi BroadcastChannel untuk sinkronisasi antar-tab pada browser yang sama
  initBroadcastChannel(roomId) {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(`lilevy_room_${roomId.toUpperCase()}`);
        this.broadcastChannel.onmessage = (event) => {
          const msg = event.data;
          if (!msg || typeof msg !== 'object') return;
          this.handleIncomingMessage(msg, 'broadcast');
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }
  }

  // =========================================================================
  // 1. HOST: MEMBUAT ROOM & MENERIMA PEMAIN LAIN
  // =========================================================================
  hostRoom(roomId, hostPlayer, gameOptions = {}) {
    this.cleanup();
    this.isHost = true;
    this.roomId = roomId.toUpperCase();
    this.localPlayer = hostPlayer;
    const peerId = this.formatPeerId(this.roomId);

    this.initBroadcastChannel(this.roomId);

    if (typeof Peer !== 'undefined') {
      try {
        this.peer = new Peer(peerId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        this.peer.on('open', (id) => {
          console.log(`👑 [Host] Room terbuka dengan Peer ID: ${id}`);
          this.status = 'HOSTING';
          this.notifyStatus('HOSTING', `Room [${this.roomId}] siap menerima pemain online!`);
        });

        this.peer.on('connection', (conn) => {
          console.log(`🤝 [Host] Menerima koneksi baru dari Peer: ${conn.peer}`);
          this.connections[conn.peer] = conn;

          conn.on('open', () => {
            console.log(`✅ [Host] Saluran Data Terbuka dengan: ${conn.peer}`);
          });

          conn.on('data', (data) => {
            this.handleIncomingMessage(data, conn);
          });

          conn.on('close', () => {
            console.log(`👋 [Host] Pemain keluar/terputus: ${conn.peer}`);
            delete this.connections[conn.peer];
            if (this.onPlayerLeft) this.onPlayerLeft(conn.peer);
          });

          conn.on('error', (err) => {
            console.warn('[Host Connection Error]:', err);
          });
        });

        this.peer.on('error', (err) => {
          console.warn('[Host Peer Error]:', err);
          if (err.type === 'unavailable-id') {
            console.log('Room ID sudah digunakan di internet, menggunakan channel lokal');
          }
        });
      } catch (e) {
        console.warn('PeerJS init failed:', e);
      }
    } else {
      this.status = 'HOSTING';
      this.notifyStatus('HOSTING', `Room [${this.roomId}] aktif di jaringan lokal.`);
    }
  }

  // =========================================================================
  // 2. GUEST: BERGABUNG KE ROOM TEMAN (JOIN ROOM)
  // =========================================================================
  joinRoom(roomId, guestPlayer) {
    this.cleanup();
    this.isHost = false;
    this.roomId = roomId.toUpperCase();
    this.localPlayer = guestPlayer;
    const targetHostPeerId = this.formatPeerId(this.roomId);

    this.initBroadcastChannel(this.roomId);

    // Kirim join request via BroadcastChannel (untuk multi-tab pada device yang sama)
    this.sendViaBroadcast({
      type: 'JOIN_REQUEST',
      player: guestPlayer,
      roomId: this.roomId
    });

    if (typeof Peer !== 'undefined') {
      try {
        const randomGuestId = `lilevy-guest-${Math.random().toString(36).substring(2, 9)}`;
        this.peer = new Peer(randomGuestId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        this.peer.on('open', () => {
          console.log(`🚀 [Guest] Menghubungkan ke Host Room: ${targetHostPeerId}`);
          this.status = 'CONNECTING';
          this.notifyStatus('CONNECTING', `Menghubungkan ke Room [${this.roomId}]...`);

          const conn = this.peer.connect(targetHostPeerId, {
            reliable: true
          });

          conn.on('open', () => {
            console.log('✅ [Guest] Terhubung ke Host WebRTC!');
            this.hostConnection = conn;
            this.status = 'JOINED';
            this.notifyStatus('JOINED', `Terhubung ke Host! Mengirim data profil...`);

            // Kirim permintaan gabung ke Host
            conn.send({
              type: 'JOIN_REQUEST',
              player: guestPlayer,
              roomId: this.roomId
            });
          });

          conn.on('data', (data) => {
            this.handleIncomingMessage(data, conn);
          });

          conn.on('close', () => {
            console.warn('[Guest] Koneksi ke Host terputus.');
            this.notifyStatus('DISCONNECTED', 'Koneksi ke Host terputus.');
          });

          conn.on('error', (err) => {
            console.warn('[Guest Connection Error]:', err);
          });
        });

        this.peer.on('error', (err) => {
          console.warn('[Guest Peer Error]:', err);
          if (err.type === 'peer-unavailable') {
            this.notifyStatus('ERROR', `Room [${this.roomId}] belum aktif atau Host sedang offline.`);
          }
        });
      } catch (e) {
        console.warn('Guest PeerJS error:', e);
      }
    }
  }

  // =========================================================================
  // 3. PEMROSESAN PESAN PROTOKOL MULTIPLAYER
  // =========================================================================
  handleIncomingMessage(data, sender) {
    if (!data || !data.type) return;

    switch (data.type) {
      // HOST: Menerima Permintaan Bergabung dari Guest
      case 'JOIN_REQUEST':
        if (this.isHost && window.monopolyEngine) {
          console.log(`📥 [Host] Menerima JOIN_REQUEST dari: ${data.player?.name}`);
          const res = window.monopolyEngine.addRealPlayer(data.player);
          if (res.success) {
            // Balas ke Guest bahwa join diterima dan kirim seluruh status papan game saat ini
            const acceptPayload = {
              type: 'JOIN_ACCEPTED',
              player: res.player,
              gameState: window.monopolyEngine.serializeState()
            };

            if (sender && sender !== 'broadcast' && sender.send) {
              sender.send(acceptPayload);
            }
            this.sendViaBroadcast(acceptPayload);

            // Broadcast ke semua pemain lain bahwa ada pemain baru masuk
            this.broadcastToAll({
              type: 'PLAYER_JOINED',
              player: res.player,
              gameState: window.monopolyEngine.serializeState()
            });

            if (this.onPlayerJoined) this.onPlayerJoined(res.player);
          }
        }
        break;

      // GUEST: Menerima Konfirmasi Bergabung & Sinkronisasi Game Penuh
      case 'JOIN_ACCEPTED':
        if (!this.isHost && window.monopolyEngine) {
          console.log('🎉 [Guest] Permintaan bergabung DITERIMA oleh Host!');
          this.status = 'CONNECTED';
          this.notifyStatus('CONNECTED', `Berhasil bergabung ke Room [${this.roomId}]!`);
          if (data.gameState) {
            window.monopolyEngine.applyState(data.gameState);
          }
          if (this.onStateReceived) this.onStateReceived(data.gameState);
        }
        break;

      // GUEST & SEMUA: Menerima Notifikasi Pemain Baru
      case 'PLAYER_JOINED':
        if (data.gameState && window.monopolyEngine) {
          window.monopolyEngine.applyState(data.gameState);
        }
        if (this.onPlayerJoined) this.onPlayerJoined(data.player);
        break;

      // GUEST: Menerima Pembaruan State Game dari Host
      case 'STATE_SYNC':
        if (!this.isHost && data.gameState && window.monopolyEngine) {
          window.monopolyEngine.applyState(data.gameState);
          if (this.onStateReceived) this.onStateReceived(data.gameState);
        }
        break;

      // HOST: Menerima Aksi Game dari Pemain (Roll, Buy, End Turn, dll.)
      case 'GAME_ACTION':
        if (this.isHost && window.monopolyEngine) {
          this.executeHostGameAction(data.action, data.payload);
        }
        break;

      // SEMUA: Menerima Pesan Room Chat
      case 'CHAT_MESSAGE':
        if (this.onChatMessage) this.onChatMessage(data.chat);
        if (this.isHost) {
          // Teruskan chat ke semua guest lain
          this.broadcastToAll(data, sender);
        }
        break;
    }
  }

  // =========================================================================
  // 4. EKSEKUSI AKSI GAME PADA HOST & BROADCAST STATE
  // =========================================================================
  executeHostGameAction(action, payload = {}) {
    if (!this.isHost || !window.monopolyEngine) return;

    const engine = window.monopolyEngine;

    switch (action) {
      case 'ROLL':
        engine.rollDice();
        break;
      case 'BUY':
        engine.buyCurrentProperty();
        break;
      case 'BUILD':
        if (payload.tileId) engine.buildHouse(payload.tileId);
        break;
      case 'END_TURN':
        engine.endTurn();
        break;
      case 'USE_SKILL':
        if (window.monopolySkills && payload.skillId) {
          window.monopolySkills.useSkill(payload.skillId, payload.targetId);
        }
        break;
      case 'TRADE_OFFER':
        if (window.monopolyTrade && payload.tradeData) {
          window.monopolyTrade.proposeTrade(payload.tradeData);
        }
        break;
      case 'AUCTION_BID':
        if (window.monopolyAuction && payload.bidderId) {
          window.monopolyAuction.placeBid(payload.bidderId, payload.amount);
        }
        break;
    }

    // Broadcast status terbaru ke semua pemain
    this.broadcastGameState();
  }

  // =========================================================================
  // 5. HELPER PENGIRIMAN & BROADCAST
  // =========================================================================
  
  // Host mengirim state game terbaru ke semua guest
  broadcastGameState() {
    if (!this.isHost || !window.monopolyEngine) return;
    const state = window.monopolyEngine.serializeState();
    this.broadcastToAll({
      type: 'STATE_SYNC',
      gameState: state
    });
  }

  // Broadcast payload ke semua koneksi Peer dan BroadcastChannel
  broadcastToAll(payload, excludeSender = null) {
    // 1. Kirim via WebRTC Peer Connections
    Object.values(this.connections).forEach(conn => {
      if (conn !== excludeSender && conn.open) {
        try { conn.send(payload); } catch (e) {}
      }
    });

    // 2. Kirim via BroadcastChannel
    this.sendViaBroadcast(payload);
  }

  // Kirim via BroadcastChannel (Multi-Tab)
  sendViaBroadcast(payload) {
    if (this.broadcastChannel) {
      try { this.broadcastChannel.postMessage(payload); } catch (e) {}
    }
  }

  // Guest mengirim aksi game ke Host
  sendAction(action, payload = {}) {
    const data = {
      type: 'GAME_ACTION',
      action: action,
      payload: payload,
      senderId: this.localPlayer?.id
    };

    if (this.isHost) {
      this.executeHostGameAction(action, payload);
    } else {
      if (this.hostConnection && this.hostConnection.open) {
        this.hostConnection.send(data);
      }
      this.sendViaBroadcast(data);
    }
  }

  // Kirim pesan room chat ke seluruh pemain di room
  sendChat(chatData) {
    const payload = {
      type: 'CHAT_MESSAGE',
      chat: {
        id: Date.now() + Math.random(),
        senderId: this.localPlayer?.id || 'p_unknown',
        senderName: chatData.senderName || this.localPlayer?.name || 'Pemain',
        avatar: chatData.avatar || this.localPlayer?.avatar || '💬',
        text: chatData.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };

    if (this.isHost) {
      this.broadcastToAll(payload);
    } else {
      if (this.hostConnection && this.hostConnection.open) {
        this.hostConnection.send(payload);
      }
      this.sendViaBroadcast(payload);
    }

    if (this.onChatMessage) {
      this.onChatMessage(payload.chat);
    }
  }
}

// Inisialisasi Instance Global
window.roomNetwork = new RoomNetworkEngine();

