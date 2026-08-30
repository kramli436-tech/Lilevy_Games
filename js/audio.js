const GameAudio = (function() {
  let ctx = null;
  let enabled = true;
  let volume = 0.3;
  
  function init() {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { enabled = false; }
  }
  
  function play(type) {
    if(!enabled || !ctx) return;
    if(ctx.state === 'suspended') ctx.resume();
    switch(type) {
      case 'dice': playTone(400, 0.1, 'square'); setTimeout(()=>playTone(600,0.1,'square'),50); break;
      case 'buy': playTone(523, 0.15, 'sine'); setTimeout(()=>playTone(659,0.15,'sine'),100); setTimeout(()=>playTone(784,0.15,'sine'),200); break;
      case 'rent': playTone(300, 0.2, 'sawtooth'); break;
      case 'card': playTone(800, 0.05, 'sine'); setTimeout(()=>playTone(1000,0.05,'sine'),50); break;
      case 'build': playTone(200, 0.1, 'triangle'); setTimeout(()=>playTone(400,0.1,'triangle'),100); break;
      case 'skill': playTone(600, 0.1, 'sine'); setTimeout(()=>playTone(900,0.1,'sine'),80); setTimeout(()=>playTone(1200,0.1,'sine'),160); break;
      case 'bankrupt': playTone(400, 0.3, 'sawtooth'); setTimeout(()=>playTone(300,0.3,'sawtooth'),200); setTimeout(()=>playTone(200,0.4,'sawtooth'),400); break;
      case 'win': for(let i=0;i<5;i++) setTimeout(()=>playTone(400+i*100,0.15,'sine'),i*150); break;
      case 'click': playTone(1000, 0.03, 'sine'); break;
      case 'error': playTone(200, 0.15, 'square'); break;
      case 'event': playTone(500, 0.1, 'triangle'); setTimeout(()=>playTone(700,0.1,'triangle'),150); break;
      case 'chat': playTone(950, 0.06, 'sine'); setTimeout(()=>playTone(1300, 0.08, 'sine'), 50); break;
    }
  }
  
  function playTone(freq, duration, type) {
    if(!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }
  
  function setVolume(v) { volume = Math.max(0, Math.min(1, v)); }
  function setEnabled(e) { enabled = e; }
  function isEnabled() { return enabled; }
  
  // Init on first user interaction
  document.addEventListener('click', function initAudio() {
    init();
    document.removeEventListener('click', initAudio);
  }, { once: true });
  
  return { init, play, setVolume, setEnabled, isEnabled };
})();
