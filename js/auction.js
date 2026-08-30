const Auction = (function() {
  'use strict';
  
  let auctionInterval = null;
  let isResolving = false;
  
  function startAuction(tileIndex, gameState) {
    if (!gameState || !gameState.tiles) return;
    const tile = gameState.tiles[tileIndex];
    if (!tile) return;
    
    stopTimer();
    isResolving = false;
    
    const startingBid = Math.max(10, Math.floor(tile.price * 0.5));
    gameState.auction = {
      tileIndex,
      currentBid: startingBid,
      currentBidder: null,
      bids: [],
      timeLeft: 10,
      isBlindBid: false,
      blindBids: {},
      passedPlayers: [],
      isActive: true
    };
    
    if (typeof Events !== 'undefined') {
      Events.emit('auctionStarted', gameState.auction);
      Events.emit('stateUpdated', gameState);
    }

    if (typeof Network !== 'undefined') {
      Network.broadcastState(gameState);
    }

    if (typeof UI !== 'undefined') {
      UI.showAuctionModal();
      const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
      const tileName = (lang === 'id' ? tile.name_id : tile.name_en) || tile.name_en;
      UI.showToast(`⚖️ ${lang === 'id' ? 'Lelang Terbuka Dimulai untuk' : 'Public Auction Started for'} ${tileName} ($${startingBid})!`, 'info', 4000);
    }
    
    startTimer(gameState);
  }
  
  function startTimer(gameState) {
    stopTimer();
    auctionInterval = setInterval(() => {
      if (!gameState || !gameState.auction || !gameState.auction.isActive) {
        stopTimer();
        return;
      }
      
      gameState.auction.timeLeft--;
      if (typeof Events !== 'undefined') {
        Events.emit('auctionTick', gameState.auction);
      }
      
      // Trigger AI bot bidding check
      triggerAiBids(gameState);
      
      if (gameState.auction.timeLeft <= 0) {
        resolveAuction(gameState);
      }
    }, 1000);
  }
  
  function stopTimer() {
    if (auctionInterval) {
      clearInterval(auctionInterval);
      auctionInterval = null;
    }
  }
  
  function triggerAiBids(gameState) {
    const auction = gameState.auction;
    if (!auction || !auction.isActive || typeof AI === 'undefined') return;
    
    // Pick an AI bot that hasn't passed and isn't the highest bidder
    const aiBots = gameState.players.filter(p => 
      p.isAI && 
      !p.isBankrupt && 
      p.id !== auction.currentBidder && 
      !auction.passedPlayers.includes(p.id)
    );
    
    if (aiBots.length === 0) return;
    
    // Random AI bot considers bidding
    const bot = aiBots[Math.floor(Math.random() * aiBots.length)];
    const desiredBid = AI.decideBid ? AI.decideBid(bot, auction.tileIndex, auction.currentBid, gameState) : 0;
    const minBid = getMinBid(gameState);
    
    if (desiredBid >= minBid && bot.money >= desiredBid) {
      setTimeout(() => {
        if (gameState.auction && gameState.auction.isActive && gameState.auction.currentBidder !== bot.id) {
          placeBid(bot.id, Math.max(minBid, desiredBid), gameState);
          if (typeof UI !== 'undefined') {
            UI.showToast(`🤖 ${bot.name} menawar $${gameState.auction.currentBid}!`, 'info');
          }
        }
      }, 500);
    } else {
      // 30% chance for bot to pass if they won't bid
      if (Math.random() < 0.3) {
        passAuction(bot.id, gameState);
      }
    }
  }
  
  function placeBid(playerId, amount, gameState) {
    const auction = gameState.auction;
    if (!auction || !auction.isActive || auction.isBlindBid) return false;
    if (auction.passedPlayers.includes(playerId)) return false;
    
    const player = gameState.players.find(p => p.id === playerId);
    if (!player || player.money < amount) return false;
    if (amount <= auction.currentBid && auction.currentBidder !== null) return false;
    
    auction.currentBid = amount;
    auction.currentBidder = playerId;
    auction.bids.push({ playerId, playerName: player.name, amount });
    auction.timeLeft = 10; // Reset timer on each bid
    
    if (typeof Events !== 'undefined') {
      Events.emit('auctionBid', { playerId, amount, auction });
      Events.emit('stateUpdated', gameState);
    }
    if (typeof Network !== 'undefined') {
      Network.broadcastState(gameState);
    }
    if (typeof UI !== 'undefined') {
      UI.showAuctionModal();
    }
    return true;
  }
  
  function placeBlindBid(playerId, amount, gameState) {
    const auction = gameState.auction;
    if (!auction || !auction.isBlindBid) return false;
    
    const player = gameState.players.find(p => p.id === playerId);
    if (player.money < amount) return false;
    
    auction.blindBids[playerId] = amount;
    return true;
  }
  
  function passAuction(playerId, gameState) {
    const auction = gameState.auction;
    if (!auction || !auction.isActive) return;
    if (!auction.passedPlayers.includes(playerId)) {
      auction.passedPlayers.push(playerId);
    }
    
    const activePlayers = gameState.players.filter(p => !p.isBankrupt && !auction.passedPlayers.includes(p.id));
    if (typeof Events !== 'undefined') {
      Events.emit('auctionPass', { playerId, auction });
      Events.emit('stateUpdated', gameState);
    }
    if (typeof Network !== 'undefined') {
      Network.broadcastState(gameState);
    }
    if (typeof UI !== 'undefined') {
      UI.showAuctionModal();
    }
    
    if (activePlayers.length <= 1) {
      resolveAuction(gameState);
    }
  }
  
  function resolveAuction(gameState) {
    if (isResolving) return;
    isResolving = true;
    stopTimer();
    
    const auction = gameState.auction;
    if (!auction) return;
    
    let winner = null;
    let winningBid = 0;
    
    if (auction.isBlindBid) {
      for (let pid in auction.blindBids) {
        if (auction.blindBids[pid] > winningBid) {
          winningBid = auction.blindBids[pid];
          winner = pid;
        }
      }
    } else {
      winner = auction.currentBidder;
      winningBid = auction.currentBid;
    }
    
    const tile = gameState.tiles[auction.tileIndex];
    if (winner && tile) {
      const player = gameState.players.find(p => p.id === winner);
      if (player) {
        Player.payMoney(player, winningBid);
        tile.owner = winner;
        if (!player.properties) player.properties = [];
        player.properties.push(auction.tileIndex);
      }
    }
    
    if (gameState.auctionPool) {
      gameState.auctionPool = gameState.auctionPool.filter(ti => ti !== auction.tileIndex);
    }
    
    auction.isActive = false;
    
    if (typeof Events !== 'undefined') {
      Events.emit('auctionEnded', { winner, winningBid, tileIndex: auction.tileIndex });
      Events.emit('stateUpdated', gameState);
    }
    if (typeof Network !== 'undefined') {
      Network.broadcastState(gameState);
    }
    
    if (typeof UI !== 'undefined') {
      const winnerPlayer = gameState.players.find(p => p.id === winner);
      const lang = typeof Lang !== 'undefined' ? Lang.getLang() : 'id';
      const tileName = tile ? ((lang === 'id' ? tile.name_id : tile.name_en) || tile.name_en) : 'Properti';
      if (winnerPlayer) {
        UI.showToast(`🏆 ${winnerPlayer.name} memenangkan lelang ${tileName} ($${winningBid})!`, 'success', 5000);
      } else {
        UI.showToast(`Lelang ${tileName} berakhir tanpa pemenang.`, 'info', 4000);
      }
      UI.hideModal('auction');
    }
    
    gameState.auction = null;
  }
  
  function getMinBid(gameState) {
    if(!gameState || !gameState.auction) return 10;
    if (!gameState.auction.currentBidder) return gameState.auction.currentBid;
    return gameState.auction.currentBid + 10;
  }
  
  function isPlayerGuardian(playerId, gameState) {
    const player = gameState.players.find(p => p.id === playerId);
    return player && player.character === 'guardian';
  }
  
  return { 
    startAuction, placeBid, placeBlindBid, passAuction, resolveAuction, getMinBid, isPlayerGuardian, stopTimer 
  };
})();
