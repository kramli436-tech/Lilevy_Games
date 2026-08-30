const Chat = (function() {
  'use strict';

  const CHAR_ICONS = {
    banker: '💼',
    engineer: '🔧',
    trader: '📈',
    politician: '🎩',
    gambler: '🎲',
    guardian: '🛡️'
  };

  const BOT_RESPONSES = {
    greetings: [
      'Halo semuanya! Salam kenal!',
      'Siap bermain dan bertarung secara adil!',
      'Semoga beruntung semuanya! 🎲',
      'Ayo kita mulai, sudah tidak sabar!',
      'Robot AI siap mendominasi kota neon!'
    ],
    replies: [
      'Mantap! Strategi yang menarik.',
      'Haha, kita lihat saja siapa yang bangkrut duluan! 😉',
      'Hati-hati lewat distrikku ya!',
      'Fokus kumpulkan monopoli dulu bro.',
      'Pasar saham hari ini lagi seru nih!',
      'Jangan lupa bayar sewa tepat waktu ya! 💸',
      'GG! Permainan semakin sengit.'
    ],
    botJoin: [
      'Halo! Saya siap meramaikan room ini 🤖',
      'AI Bot online. Bersiaplah untuk tantangan hardcore!',
      'Salam dari masa depan neon! 🏙️'
    ],
    gameStart: [
      'Game dimulai! Semoga yang paling cerdas yang menang 🚀',
      'Selamat berjuang semuanya! Jangan sampai masuk penjara ya 🔒',
      'Waktunya membangun kerajaan bisnis!'
    ],
    doubleRoll: [
      'Wah hoki banget dapet Double! 🔥',
      'Dua angka kembar! Lanjut jalan lagi 🎲',
      'Lagi gacor dadunya nih!'
    ],
    highRent: [
      'Aduh sewanya pedas banget! 💀💸',
      'Bangkrut mendadak kalau begini terus...',
      'Investasi properti yang sangat mahal!'
    ],
    monopoly: [
      'Waduh, sudah ada yang monopoli penuh! Bahaya 🚨',
      'Harus waspada kalau lewat blok warna itu...'
    ],
    jail: [
      'Selamat beristirahat di balik jeruji besi! 👮',
      'Semoga punya kartu Jaminan Bebas ya!'
    ],
    bankrupt: [
      'GG kawan! Pertarungan yang sangat sengit 🤝',
      'Semoga beruntung di game berikutnya!'
    ]
  };

  let unreadCount = 0;
  let isChatOpen = false;
  let chatHistory = [];

  function init() {
    setupUI();
    setupListeners();
  }

  function setupUI() {
    // Lobby Chat Send
    const btnLobbySend = document.getElementById('btn-lobby-chat-send');
    const lobbyInput = document.getElementById('lobby-chat-input');
    if (btnLobbySend && lobbyInput) {
      btnLobbySend.addEventListener('click', () => {
        sendFromInput(lobbyInput);
      });
      lobbyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendFromInput(lobbyInput);
        }
      });
    }

    // Lobby Quick Taunts
    document.querySelectorAll('.lobby-quick-taunt').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text') || btn.textContent.trim();
        if (text) {
          Network.sendChatMessage(text);
        }
      });
    });

    // In-Game Chat Send
    const btnGameSend = document.getElementById('btn-game-chat-send');
    const gameInput = document.getElementById('game-chat-input');
    if (btnGameSend && gameInput) {
      btnGameSend.addEventListener('click', () => {
        sendFromInput(gameInput);
      });
      gameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendFromInput(gameInput);
        }
      });
    }

    // In-Game Quick Taunts
    document.querySelectorAll('.game-quick-taunt').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text') || btn.textContent.trim();
        if (text) {
          Network.sendChatMessage(text);
        }
      });
    });

    // In-Game Toggle & Close
    const btnToggle = document.getElementById('btn-chat-toggle');
    const btnClose = document.getElementById('btn-game-chat-close');

    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        toggleGameChat();
      });
    }
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        toggleGameChat(false);
      });
    }
  }

  function setupListeners() {
    Events.on('chatMessageReceived', (msg) => {
      addMessage(msg);
      
      // If user sent a chat, AI bots have a chance to reply after a short natural delay
      if (!msg.isBot && msg.senderId === Network.getPlayerId()) {
        triggerBotReply(msg.text);
      }
    });

    Events.on('roomJoined', () => {
      clearChat();
    });

    Events.on('playerJoined', (data) => {
      if (data && data.isBot) {
        setTimeout(() => {
          botBanter('botJoin', data);
        }, 800);
      }
    });

    Events.on('gameStarted', () => {
      setTimeout(() => {
        botBanter('gameStart');
      }, 1200);
    });

    Events.on('diceRolled', (data) => {
      if (data && data.result && data.result.isDouble) {
        if (Math.random() < 0.6) {
          setTimeout(() => { botBanter('doubleRoll'); }, 1000);
        }
      }
    });

    Events.on('rentPaid', (data) => {
      if (data && data.amount >= 300) {
        if (Math.random() < 0.7) {
          setTimeout(() => { botBanter('highRent'); }, 1200);
        }
      }
    });

    Events.on('playerJailed', () => {
      if (Math.random() < 0.5) {
        setTimeout(() => { botBanter('jail'); }, 1000);
      }
    });

    Events.on('playerBankrupt', () => {
      setTimeout(() => { botBanter('bankrupt'); }, 1200);
    });
  }

  function sendFromInput(inputEl) {
    if (!inputEl) return;
    const text = inputEl.value.trim();
    if (text) {
      Network.sendChatMessage(text);
      inputEl.value = '';
      inputEl.focus();
    }
  }

  function addMessage(msg) {
    chatHistory.push(msg);

    // Format time
    const d = new Date(msg.timestamp || Date.now());
    const timeStr = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');

    // Build message HTML
    const isSelf = msg.senderId === Network.getPlayerId();
    const icon = CHAR_ICONS[msg.character] || '👤';
    const botTag = msg.isBot ? '<span class="chat-bot-tag">BOT</span>' : '';
    const itemClass = 'chat-msg-item ' + (isSelf ? 'msg-self' : 'msg-other') + (msg.isBot ? ' msg-bot' : '');

    const html = 
      '<div class="' + itemClass + '">' +
        '<div class="chat-msg-header">' +
          '<span class="chat-sender-icon">' + icon + '</span>' +
          '<span class="chat-sender-name">' + escapeHtml(msg.senderName) + '</span>' +
          botTag +
          '<span class="chat-msg-time">' + timeStr + '</span>' +
        '</div>' +
        '<div class="chat-msg-body">' + escapeHtml(msg.text) + '</div>' +
      '</div>';

    // Append to Lobby Chat
    const lobbyBox = document.getElementById('lobby-chat-messages');
    if (lobbyBox) {
      lobbyBox.insertAdjacentHTML('beforeend', html);
      lobbyBox.scrollTop = lobbyBox.scrollHeight;
    }

    // Append to Game Chat
    const gameBox = document.getElementById('game-chat-messages');
    if (gameBox) {
      gameBox.insertAdjacentHTML('beforeend', html);
      gameBox.scrollTop = gameBox.scrollHeight;
    }

    // Handle audio sound
    if (typeof GameAudio !== 'undefined') {
      GameAudio.play('chat');
    }

    // Handle Unread Count & Floating Toast if Game is active and Chat is closed
    if (!isChatOpen) {
      const activeScreen = document.querySelector('.screen.active');
      if (activeScreen && activeScreen.id === 'screen-game') {
        unreadCount++;
        updateUnreadBadge();
        showFloatingBubble(msg);
      }
    }
  }

  function showFloatingBubble(msg) {
    const container = document.getElementById('chat-floating-preview');
    if (!container) return;

    const icon = CHAR_ICONS[msg.character] || '👤';
    const bubble = document.createElement('div');
    bubble.className = 'chat-floating-bubble';
    bubble.innerHTML = '<strong>' + icon + ' ' + escapeHtml(msg.senderName) + ':</strong> ' + escapeHtml(msg.text);
    container.appendChild(bubble);

    // Fade out and remove after 4s
    setTimeout(() => {
      bubble.classList.add('fade-out');
      setTimeout(() => { bubble.remove(); }, 400);
    }, 4000);
  }

  function toggleGameChat(forceState = null) {
    const drawer = document.getElementById('game-chat-drawer');
    if (!drawer) return;

    if (forceState !== null) {
      isChatOpen = forceState;
    } else {
      isChatOpen = !isChatOpen;
    }

    drawer.classList.toggle('active', isChatOpen);

    if (isChatOpen) {
      unreadCount = 0;
      updateUnreadBadge();
      const gameBox = document.getElementById('game-chat-messages');
      if (gameBox) gameBox.scrollTop = gameBox.scrollHeight;
      const gameInput = document.getElementById('game-chat-input');
      if (gameInput) setTimeout(() => gameInput.focus(), 200);
    }
  }

  function updateUnreadBadge() {
    const badge = document.getElementById('chat-unread-badge');
    if (!badge) return;
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  function clearChat() {
    chatHistory = [];
    unreadCount = 0;
    updateUnreadBadge();
    const lobbyBox = document.getElementById('lobby-chat-messages');
    if (lobbyBox) lobbyBox.innerHTML = '';
    const gameBox = document.getElementById('game-chat-messages');
    if (gameBox) gameBox.innerHTML = '';
  }

  function triggerBotReply(userText) {
    const bots = Network.getBots ? Network.getBots() : [];
    if (!bots || bots.length === 0) return;

    if (Math.random() < 0.5) {
      const bot = bots[Math.floor(Math.random() * bots.length)];
      const list = BOT_RESPONSES.replies;
      const reply = list[Math.floor(Math.random() * list.length)];
      setTimeout(() => {
        Network.sendChatMessage(reply, bot);
      }, 1200 + Math.floor(Math.random() * 1200));
    }
  }

  function botBanter(type, specificBot = null) {
    const bots = Network.getBots ? Network.getBots() : [];
    if (!bots || bots.length === 0) return;

    const bot = specificBot || bots[Math.floor(Math.random() * bots.length)];
    const list = BOT_RESPONSES[type] || BOT_RESPONSES.replies;
    const line = list[Math.floor(Math.random() * list.length)];

    Network.sendChatMessage(line, bot);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  return {
    init,
    addMessage,
    toggleGameChat,
    clearChat,
    botBanter
  };
})();
