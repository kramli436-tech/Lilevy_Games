const Animations = (function() {
  const MAX_PARTICLES = 200;
  const particles = [];
  let activeCount = 0;
  
  for(let i = 0; i < MAX_PARTICLES; i++) {
    particles.push({ active:false, x:0, y:0, vx:0, vy:0, life:0, maxLife:0, size:0, color:'#fff', alpha:1, type:'circle' });
  }
  
  function getParticle() {
    for(let i = 0; i < MAX_PARTICLES; i++) {
      if(!particles[i].active) { particles[i].active = true; activeCount++; return particles[i]; }
    }
    return null;
  }
  
  function spawnParticles(x, y, count, color, opts) {
    opts = opts || {};
    for(let i = 0; i < count; i++) {
      const p = getParticle();
      if(!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = (opts.speed || 2) * (0.5 + Math.random());
      p.x = x; p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = opts.life || 30 + Math.random() * 30;
      p.maxLife = p.life;
      p.size = opts.size || 2 + Math.random() * 3;
      p.color = color;
      p.alpha = 1;
      p.type = opts.type || 'circle';
    }
  }
  
  function updateParticles() {
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
  
  const weatherParticles = [];
  for(let i=0; i<100; i++) weatherParticles.push({active:false,x:0,y:0,vx:0,vy:0,size:0,alpha:0});
  
  function renderWeather(ctx, weather, boardSize) {
    if(!weather) return;
    switch(weather.current) {
      case 'rain':
        ctx.strokeStyle = 'rgba(100,150,255,0.3)';
        ctx.lineWidth = 1;
        for(let i = 0; i < 50; i++) {
          const x = (Math.random()*boardSize + Date.now()*0.01*i)%boardSize;
          const y = (Date.now()*0.5+i*50)%boardSize;
          ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-2,y+10); ctx.stroke();
        }
        break;
      case 'storm':
        if(Math.random() < 0.005) {
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fillRect(0,0,boardSize,boardSize);
        }
        ctx.strokeStyle = 'rgba(100,150,255,0.4)';
        for(let i=0;i<80;i++) {
          const x=(Math.random()*boardSize+Date.now()*0.02*i)%boardSize;
          const y=(Date.now()*0.7+i*40)%boardSize;
          ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y+15);ctx.stroke();
        }
        break;
      case 'fog':
        ctx.fillStyle = 'rgba(150,150,170,0.15)';
        ctx.fillRect(0,0,boardSize,boardSize);
        break;
      case 'blizzard':
        ctx.fillStyle = 'rgba(200,220,255,0.6)';
        for(let i=0;i<40;i++) {
          const x=(Date.now()*0.03*i+Math.sin(i)*100)%boardSize;
          const y=(Date.now()*0.05+i*30)%boardSize;
          ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();
        }
        break;
      case 'heatwave':
        ctx.fillStyle = 'rgba(255,100,0,0.03)';
        ctx.fillRect(0,0,boardSize,boardSize);
        break;
      case 'clear':
        ctx.strokeStyle = 'rgba(255,255,0,0.05)';
        ctx.lineWidth = 3;
        for(let i=0;i<5;i++) {
          ctx.beginPath();ctx.arc(boardSize/2,boardSize/2,boardSize*0.3+i*10,0,Math.PI);ctx.stroke();
        }
        break;
    }
  }
  
  let shakeIntensity = 0;
  function screenShake(intensity) { shakeIntensity = intensity || 5; }
  function getShakeOffset() {
    if(shakeIntensity <= 0) return {x:0,y:0};
    const offset = { x:(Math.random()-0.5)*shakeIntensity, y:(Math.random()-0.5)*shakeIntensity };
    shakeIntensity *= 0.9;
    if(shakeIntensity < 0.5) shakeIntensity = 0;
    return offset;
  }
  
  function moneyFloat(x, y, amount, color) {
    const el = document.createElement('div');
    el.className = 'money-float';
    el.textContent = (amount >= 0 ? '+' : '') + '$' + amount;
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;color:${color||'#00ff88'};font-weight:bold;font-size:1.2rem;pointer-events:none;z-index:200;animation:floatUp 1.5s forwards;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
  
  function explosion(x, y, color) { spawnParticles(x, y, 30, color, { speed:4, life:40 }); }
  function confetti(x, y) {
    const colors = ['#ff0','#f0f','#0ff','#f00','#0f0','#00f'];
    colors.forEach(c => spawnParticles(x, y, 10, c, { speed:5, life:60, type:'square' }));
  }
  
  return { spawnParticles, updateParticles, renderParticles, renderWeather, screenShake, getShakeOffset, moneyFloat, explosion, confetti, activeCount:()=>activeCount };
})();
