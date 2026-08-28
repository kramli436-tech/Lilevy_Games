/**
 * LILEVY GAMES - MONOPOLI PRO: LIVE ROOM CHAT & EMOTE SYSTEM
 * Sistem obrolan interaktif langsung dalam Room Monopoli antar sesama pemain dan bot AI.
 */

class MonopolyChat {
  constructor() {
    this.messages = [];
    this.emotes = ['😂', '💸', '😭', '👑', '🔥', '💀', '🤝', '🔨', '🚀', '😎'];
    this.unreadCount = 0;
    this.isOpen = false;
  }

  init() {
    this.messages = [
      { sender: 'Sistem', text: '💬 Room chat aktif! Ketik pesan atau kirim emote untuk berinteraksi.', isSystem: true, time: this.getCurrentTime() }
    ];
    this.renderMessages();
  }

  getCurrentTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  sendMessage(senderName, text, isAI = false, token = '👤') {
    if (!text || text.trim() === '') return;

    const msg = {
      sender: senderName,
      text: text.trim(),
      isAI,
      token,
      time: this.getCurrentTime()
    };

    this.messages.push(msg);
    if (this.messages.length > 50) this.messages.shift();

    if (!this.isOpen) {
      this.unreadCount++;
      this.updateUnreadBadge();
    }

    if (window.soundEngine) window.soundEngine.playType();
    this.renderMessages();
  }

  sendEmote(senderName, emote, isAI = false, token = '👤') {
    this.sendMessage(senderName, emote, isAI, token);
  }

  // Respon AI Bot secara otomatis pada momen-momen tertentu
  triggerAIChatReaction(event, actor, victim = null, extra = null) {
    if (!window.monopolyEngine) return;
    const aiBots = window.monopolyEngine.players.filter(p => p.isAI && !p.isBankrupt);
    if (aiBots.length === 0) return;

    const bot = aiBots[Math.floor(Math.random() * aiBots.length)];

    let responses = [];

    if (event === 'RENT_PAID' && victim) {
      if (actor.id === bot.id) {
        responses = [
          `Terima kasih uang sewanya ya ${victim.name}! 💸 Bisnis lancar jaya!`,
          `Haha mantap! Kas bertambah lagi dari ${victim.name} 😎`,
          `Mampir lagi ya kapan-kapan di properti saya! 🏨`
        ];
      } else if (victim.id === bot.id) {
        responses = [
          `Aduh mahal banget sewanya ${actor.name} 😭 Bangkrut saya lama-lama!`,
          `Sial, mendarat di hotel ${actor.name}! 💸💸`,
          `Tunggu pembalasan saya nanti ${actor.name}! 😤`
        ];
      }
    } else if (event === 'BANKRUPT' && victim) {
      responses = [
        `Turut berduka cita untuk ${victim.name} 💀 Selamat pensiun!`,
        `Gugur satu, saingan berkurang! 👑`,
        `Nice game ${victim.name}! GG! 🤝`
      ];
    } else if (event === 'AUCTION_WON' && actor) {
      if (actor.id === bot.id) {
        responses = [
          `Properti ini resmi jadi milik saya! 🔨 Siap-siap bayar sewa ya!`,
          `Strategi lelang yang sempurna! 😎`
        ];
      } else {
        responses = [
          `Selamat ${actor.name}, jangan lupa pasang hotel! 🏨`,
          `Mahal banget belinya ${actor.name}, awas rugi! 😂`
        ];
      }
    } else if (event === 'DISASTER') {
      responses = [
        `Waduh bencana alam lagi! Semoga properti saya aman 😱`,
        `Krisis global! Jaga uang kas baik-baik semuanya! 🔥`
      ];
    }

    if (responses.length > 0) {
      const delay = 1200 + Math.random() * 1500;
      setTimeout(() => {
        const text = responses[Math.floor(Math.random() * responses.length)];
        this.sendMessage(bot.name, text, true, bot.token);
      }, delay);
    }
  }

  updateUnreadBadge() {
    const badge = document.getElementById('chat-unread-badge');
    if (badge) {
      if (this.unreadCount > 0) {
        badge.textContent = this.unreadCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  renderMessages() {
    const container = document.getElementById('mono-chat-messages');
    if (!container) return;

    container.innerHTML = '';
    this.messages.forEach(msg => {
      const div = document.createElement('div');
      if (msg.isSystem) {
        div.className = 'text-center my-1.5 text-[10px] text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800/60 py-1 px-2 rounded-lg';
        div.textContent = msg.text;
      } else {
        div.className = `flex flex-col mb-2 ${msg.sender === window.monopolyEngine?.getCurrentPlayer()?.name ? 'items-end' : 'items-start'}`;
        div.innerHTML = `
          <div class="flex items-center gap-1 mb-0.5 text-[10px] text-slate-500 font-bold">
            <span>${msg.token || '👤'}</span>
            <span>${msg.sender}</span>
            <span class="text-[9px] font-normal text-slate-400 font-mono">${msg.time}</span>
          </div>
          <div class="px-2.5 py-1.5 rounded-xl text-xs max-w-[85%] break-words ${
            msg.isAI 
              ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800'
              : 'bg-indigo-600 text-white rounded-tr-none'
          }">
            ${msg.text}
          </div>
        `;
      }
      container.appendChild(div);
    });

    container.scrollTop = container.scrollHeight;
  }
}

window.monopolyChat = new MonopolyChat();

