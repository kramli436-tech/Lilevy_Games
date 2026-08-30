const Network = (function() {
  let supabase = null;
  let channel = null;
  let playerId = null;
  let isHost = false;
  let roomCode = '';
  let isOffline = false;
  let offlinePlayers = [];
  let bots = [];
  let myPlayerInfo = { name: '', character: '' };
  let hasJoinedRoom = false;
  
  function init() {
    playerId = 'player_' + Math.random().toString(36).substr(2, 9);
    hasJoinedRoom = false;
    // Try to initialize Supabase
    try {
      if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(
          'https://tdieqcitcjuefpsraoox.supabase.co',
          'sb_publishable_uMn5YKp3I5iIzP16W5BD3w_d2f8ByBT'
        );
        isOffline = false;
      } else {
        console.log('Supabase not loaded — running in offline mode');
        isOffline = true;
      }
    } catch(e) {
      console.log('Supabase init failed — running in offline mode', e);
      isOffline = true;
    }
  }
  
  function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for(let i = 0; i < 6; i++) code += chars[Math.floor(Math.random()*chars.length)];
    return code;
  }
  
  function createRoom(playerName, character) {
    roomCode = generateRoomCode();
    isHost = true;
    bots = [];
    hasJoinedRoom = false;
    myPlayerInfo = { name: playerName, character };

    if(isOffline || !supabase) {
      isOffline = true;
      offlinePlayers = [{
        id: playerId, name: playerName, character: character,
        isHost: true, ready: true, isBot: false
      }];
      hasJoinedRoom = true;
      Events.emit('roomJoined', { code: roomCode, isHost: true, playerId });
      emitCombinedPresence();
      return;
    }
    
    return joinChannel(roomCode, playerName, character);
  }
  
  function joinRoom(code, playerName, character) {
    roomCode = code.toUpperCase();
    isHost = false;
    bots = [];
    hasJoinedRoom = false;
    myPlayerInfo = { name: playerName, character };
    
    if(isOffline || !supabase) {
      isOffline = true;
      offlinePlayers = [{
        id: playerId, name: playerName, character: character,
        isHost: false, ready: true, isBot: false
      }];
      hasJoinedRoom = true;
      Events.emit('roomJoined', { code: roomCode, isHost: false, playerId });
      emitCombinedPresence();
      return;
    }
    
    return joinChannel(roomCode, playerName, character);
  }
  
  function joinChannel(code, playerName, character) {
    if(!supabase) { 
      isOffline = true; 
      return createRoom(playerName, character); 
    }
    
    channel = supabase.channel('room_' + code, {
      config: { broadcast: { self: true }, presence: { key: playerId } }
    });
    
    channel.on('broadcast', { event: 'game_action' }, (payload) => {
      handleAction(payload.payload);
    });
    
    channel.on('broadcast', { event: 'bot_sync' }, (payload) => {
      if(payload.payload && payload.payload.bots) {
        bots = payload.payload.bots;
        emitCombinedPresence();
      }
    });

    channel.on('broadcast', { event: 'chat_message' }, (payload) => {
      handleChatMessage(payload.payload);
    });

    channel.on('broadcast', { event: 'game_state' }, (payload) => {
      if(!isHost) {
        Events.emit('stateSync', payload.payload);
      }
    });
    
    channel.on('presence', { event: 'sync' }, () => {
      emitCombinedPresence();
    });
    
    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      Events.emit('playerJoined', { id: key, ...newPresences[0] });
    });
    
    channel.on('presence', { event: 'leave' }, ({ key }) => {
      Events.emit('playerLeft', { id: key });
    });
    
    return channel.subscribe(async (status) => {
      if(status === 'SUBSCRIBED') {
        try {
          await channel.track({ id: playerId, name: playerName, character, isHost, ready: true });
        } catch(e) {
          console.warn('Realtime channel track warning:', e);
        }
        if(!hasJoinedRoom) {
          hasJoinedRoom = true;
          Events.emit('roomJoined', { code: roomCode, isHost, playerId });
        }
        emitCombinedPresence();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.warn('Realtime channel fallback to offline mode');
        isOffline = true;
        if(offlinePlayers.length === 0) {
          offlinePlayers = [{
            id: playerId, name: playerName, character: character,
            isHost, ready: true, isBot: false
          }];
        }
        if(!hasJoinedRoom) {
          hasJoinedRoom = true;
          Events.emit('roomJoined', { code: roomCode, isHost, playerId });
        }
        emitCombinedPresence();
      }
    });
  }
  
  function emitCombinedPresence() {
    const presenceState = {};
    if(isOffline || !channel) {
      offlinePlayers.forEach(p => { presenceState[p.id] = [p]; });
    } else {
      const channelPresence = channel.presenceState ? channel.presenceState() : {};
      Object.assign(presenceState, channelPresence);
      // If channel presence is empty yet we are in room, put ourselves
      if(Object.keys(presenceState).length === 0) {
        presenceState[playerId] = [{ id: playerId, name: myPlayerInfo.name, character: myPlayerInfo.character, isHost, ready: true, isBot: false }];
      }
    }
    // Add bots
    bots.forEach(b => {
      presenceState[b.id] = [b];
    });
    Events.emit('presenceSync', presenceState);
  }

  function addBot(name, character) {
    const botId = 'bot_' + Math.random().toString(36).substr(2, 9);
    const botObj = {
      id: botId,
      name: name,
      character: character,
      isHost: false,
      ready: true,
      isBot: true
    };
    bots.push(botObj);

    if(isOffline || !channel) {
      offlinePlayers.push(botObj);
      emitCombinedPresence();
    } else {
      channel.send({
        type: 'broadcast',
        event: 'bot_sync',
        payload: { bots }
      });
      emitCombinedPresence();
    }
    return botObj;
  }
  
  function sendAction(action) {
    if(isOffline || !channel) {
      if(action.type === 'addBot') {
        addBot(action.name, action.character);
        return;
      }
      Events.emit('networkAction', action);
      return;
    }
    channel.send({ type:'broadcast', event:'game_action', payload: { ...action, senderId: playerId, timestamp: Date.now() } });
  }
  
  function broadcastState(gameState) {
    if(isOffline) return;
    if(channel && isHost) {
      channel.send({ type:'broadcast', event:'game_state', payload: gameState });
    }
  }
  
  function updatePresence(data) {
    if(data.name) myPlayerInfo.name = data.name;
    if(data.character) myPlayerInfo.character = data.character;

    if(isOffline || !channel) {
      const p = offlinePlayers.find(op => op.id === playerId);
      if(p) Object.assign(p, data);
      emitCombinedPresence();
      return;
    }
    channel.track({ id: playerId, ...myPlayerInfo, isHost, ready: true, ...data });
  }
  
  function sendChatMessage(text, customSender = null) {
    if(!text || !text.trim()) return null;
    const cleanText = text.trim();
    const msg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      senderId: customSender ? customSender.id : playerId,
      senderName: customSender ? customSender.name : (myPlayerInfo.name || 'Player'),
      character: customSender ? customSender.character : (myPlayerInfo.character || 'banker'),
      isBot: customSender ? !!customSender.isBot : false,
      text: cleanText,
      timestamp: Date.now()
    };

    if (isOffline || !channel) {
      handleChatMessage(msg);
      return msg;
    }

    try {
      channel.send({
        type: 'broadcast',
        event: 'chat_message',
        payload: msg
      });
      // In case self-broadcast is not enabled on some channels, ensure local delivery
      handleChatMessage(msg);
    } catch(e) {
      console.warn('Chat send error, falling back to local:', e);
      handleChatMessage(msg);
    }
    return msg;
  }

  const seenMessageIds = new Set();
  function handleChatMessage(msg) {
    if (!msg || !msg.id) return;
    if (seenMessageIds.has(msg.id)) return; // Prevent duplicate display from broadcast reflection
    seenMessageIds.add(msg.id);
    if (seenMessageIds.size > 200) {
      const first = seenMessageIds.values().next().value;
      seenMessageIds.delete(first);
    }
    Events.emit('chatMessageReceived', msg);
  }

  function handleAction(action) {
    Events.emit('networkAction', action);
  }
  
  function disconnect() {
    if(channel) { channel.unsubscribe(); channel = null; }
    offlinePlayers = [];
    bots = [];
    roomCode = '';
    hasJoinedRoom = false;
  }
  
  function getPlayerId() { return playerId; }
  function getIsHost() { return isHost; }
  function getRoomCode() { return roomCode; }
  function getChannel() { return channel; }
  function getIsOffline() { return isOffline; }
  function getOfflinePlayers() { return offlinePlayers; }
  function getBots() { return bots; }
  function getMyPlayerInfo() { return myPlayerInfo; }
  
  return { 
    init, createRoom, joinRoom, sendAction, broadcastState, updatePresence, 
    sendChatMessage, handleChatMessage, disconnect, getPlayerId, getIsHost, 
    getRoomCode, generateRoomCode, getChannel, getIsOffline, addBot, 
    addOfflineBot: addBot, getOfflinePlayers, getBots, getMyPlayerInfo 
  };
})();
