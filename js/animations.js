const Animations = (function() {
  'use strict';

  const MAX_PARTICLES = 120;
  const particles = [];
  let activeCount = 0;
  
  for(let i = 0; i < MAX_PARTICLES; i++) {
    particles.push({ active:false, x:0, y:0, vx:0, vy:0, life:0, maxLife:0, size:0, color:'#fff', alpha:1, type:'circle' });
  }
  
  function getParticle() {
    for(let i = 0; i < MAX_PARTICLES; i++) {
      if(!particles[i].active) { 
        particles[i].active = true; 
        activeCount++; 
        return particles[i]; 
      }
    }
    return null;
  }
  
  function spawnParticles(x, y, count, color, opts) {
    opts = opts || {};
    const q = (typeof Renderer !== 'undefined' && Renderer.getQuality) ? Renderer.getQuality() : 'medium';
    // Reduce particle count on low-end hardware
    const adjustedCount = q === 'low' ? Math.min(6, Math.ceil(count * 0.3)) : q === 'medium' ? Math.min(15, Math.ceil(count * 0.6)) : count;
    
    for(let i = 0; i < adjustedCount; i++) {
      const p = getParticle();
      if(!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = (opts.speed || 2) * (0.5 + Math.random());
      p.x = x; p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = opts.life || 20 + Math.random() * 20;
      p.maxLife = p.life;
      p.size = opts.size || 2 + Math.random() * 2.5;
      p.color = color;
      p.alpha = 1;
      p.type = opts.type || 'circle';
    }
  }
  
  function updateParticles() {
    if(activeCount <= 0) return;
    for(let i = 0; i < MAX_PARTICLES; i++) {
      const p = particles[i];
      if(!p.active) continue;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; 
      p.life--;
      p.alpha = p.life / p.maxLife;
      if(p.life <= 0) { p.active = false; activeCount--; }
    }
  }
  
  function renderParticles(ctx) {
    if(activeCount <= 0) return;
    for(let i = 0; i < MAX_PARTICLES; i++) {
      const p = particles[i];
      if(!p.active) continue;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      if(p.type === 'circle') {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
      } else {
        ctx.fillRect(p.x-p.size/2, p.y-p.size/2, p.size, p.size);
      }
    }
    ctx.globalAlpha = 1;
  }
  
  function renderWeather(ctx, weather, boardSize) {
    if(!weather || !weather.current) return;
    const q = (typeof Renderer !== 'undefined' && Renderer.getQuality) ? Renderer.getQuality() : 'medium';
    if(q === 'low') return; // Skip heavy weather line rasterization on low-end hardware

    const lineCount = q === 'medium' ? 18 : 35;

    switch(weather.current) {
      case 'rain':
        ctx.strokeStyle = 'rgba(100,150,255,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i = 0; i < lineCount; i++) {
          const x = (Date.now()*0.02*i)%boardSize;
          const y = (Date.now()*0.4+i*40)%boardSize;
          ctx.moveTo(x, y); ctx.lineTo(x-2, y+8);
        }
        ctx.stroke();
        break;
      case 'storm':
        ctx.strokeStyle = 'rgba(100,150,255,0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for(let i = 0; i < lineCount; i++) {
          const x = (Date.now()*0.03*i)%boardSize;
          const y = (Date.now()*0.6+i*35)%boardSize;
          ctx.moveTo(x, y); ctx.lineTo(x-3, y+12);
        }
        ctx.stroke();
        break;
      case 'fog':
        ctx.fillStyle = 'rgba(150,150,170,0.1)';
        ctx.fillRect(0, 0, boardSize, boardSize);
        break;
      case 'blizzard':
        ctx.fillStyle = 'rgba(200,220,255,0.5)';
        for(let i = 0; i < lineCount; i++) {
          const x = (Date.now()*0.03*i + Math.sin(i)*80)%boardSize;
          const y = (Date.now()*0.05 + i*25)%boardSize;
          ctx.fillRect(x, y, 2.5, 2.5);
        }
        break;
      case 'heatwave':
        ctx.fillStyle = 'rgba(255,100,0,0.025)';
        ctx.fillRect(0, 0, boardSize, boardSize);
        break;
    }
  }
  
  let shakeIntensity = 0;
  function screenShake(intensity) { 
    const q = (typeof Renderer !== 'undefined' && Renderer.getQuality) ? Renderer.getQuality() : 'medium';
    if(q === 'low') return; // Skip screen shake on low quality
    shakeIntensity = intensity || 4; 
  }

  function getShakeOffset() {
    if(shakeIntensity <= 0) return {x:0,y:0};
    const offset = { x:(Math.random()-0.5)*shakeIntensity, y:(Math.random()-0.5)*shakeIntensity };
    shakeIntensity *= 0.85;
    if(shakeIntensity < 0.4) shakeIntensity = 0;
    return offset;
  }
  
  function moneyFloat(x, y, amount, color) {
    const el = document.createElement('div');
    el.className = 'money-float';
    el.textContent = (amount >= 0 ? '+' : '') + '$' + amount;
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;color:${color||'#00ff88'};font-weight:bold;font-size:1.1rem;pointer-events:none;z-index:200;animation:floatUp 1.2s forwards;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
  
  function explosion(x, y, color) { spawnParticles(x, y, 15, color, { speed:3.5, life:30 }); }
  function confetti(x, y) {
    const colors = ['#ff0','#f0f','#0ff','#f00','#0f0','#00f'];
    colors.forEach(c => spawnParticles(x, y, 4, c, { speed:4, life:40, type:'square' }));
  }
  
  return { spawnParticles, updateParticles, renderParticles, renderWeather, screenShake, getShakeOffset, moneyFloat, explosion, confetti, activeCount:()=>activeCount };
})();
