const Dice = (function() {
  'use strict';
  let lastRoll = null;
  let isRolling = false;

  // Face rotation maps for 3D CSS transform
  const FACE_ROTATIONS = {
    1: 'rotateX(0deg) rotateY(0deg)',
    2: 'rotateX(-90deg) rotateY(0deg)',
    3: 'rotateX(0deg) rotateY(-90deg)',
    4: 'rotateX(0deg) rotateY(90deg)',
    5: 'rotateX(90deg) rotateY(0deg)',
    6: 'rotateX(0deg) rotateY(180deg)'
  };

  function roll() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    lastRoll = {
      dice1, dice2,
      values: [dice1, dice2],
      total: dice1 + dice2,
      isDouble: dice1 === dice2
    };
    return lastRoll;
  }

  function animateRoll(callback) {
    if (isRolling) return lastRoll;
    isRolling = true;
    
    const modalDice = document.getElementById('modal-dice');
    const cube1 = document.getElementById('dice-cube-1');
    const cube2 = document.getElementById('dice-cube-2');
    const calcText = document.getElementById('dice-calc-text');
    const doubleTag = document.getElementById('dice-double-tag');
    const titleEl = document.getElementById('dice-roller-title');
    
    const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
    
    if (titleEl) {
      titleEl.textContent = lang === 'id' ? '🎲 LEMPAR DADU' : '🎲 ROLLING DICE';
    }
    if (calcText) {
      calcText.textContent = lang === 'id' ? '🎲 Mengocok dadu...' : '🎲 Rolling...';
      calcText.style.color = '#94a3b8';
    }
    if (doubleTag) doubleTag.style.display = 'none';

    if (modalDice) modalDice.classList.add('active');
    
    // Trigger 3D tumble physics animation
    if (cube1) cube1.classList.add('rolling');
    if (cube2) cube2.classList.add('rolling');
    
    // Play dice roll audio
    if (typeof GameAudio !== 'undefined' && GameAudio.play) {
      GameAudio.play('dice');
    }

    const result = roll();

    // Settle dice after tumble (600ms)
    setTimeout(() => {
      if (cube1) {
        cube1.classList.remove('rolling');
        cube1.style.transform = FACE_ROTATIONS[result.dice1] || 'rotateX(0deg) rotateY(0deg)';
      }
      if (cube2) {
        cube2.classList.remove('rolling');
        cube2.style.transform = FACE_ROTATIONS[result.dice2] || 'rotateX(0deg) rotateY(0deg)';
      }
      
      if (calcText) {
        calcText.textContent = `🎲 [ ${result.dice1} ] + [ ${result.dice2} ] = ${result.total}`;
        calcText.style.color = '#22c55e';
      }
      
      if (result.isDouble && doubleTag) {
        doubleTag.textContent = lang === 'id' ? '🔥 DOUBLE! GILIRAN EKSTRA' : '🔥 DOUBLE! EXTRA TURN';
        doubleTag.style.display = 'inline-block';
      }
    }, 600);

    // Close modal and pass result to gameplay (1150ms)
    setTimeout(() => {
      isRolling = false;
      if (modalDice) modalDice.classList.remove('active');
      if (callback) callback(result);
    }, 1150);

    return result;
  }

  function getLastRoll() { return lastRoll; }
  function isCurrentlyRolling() { return isRolling; }

  return { roll, animateRoll, getLastRoll, isCurrentlyRolling };
})();
