const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));

// Random hue per page load, seeded by path for consistency per page but different each load (reload changes it)
(function setRandomHue() {
  const path = location.pathname;
  const seed = Array.from(path).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const randomHue = (seed + Math.floor(Math.random() * 360)) % 360;
  document.documentElement.style.setProperty('--hue', randomHue);
})();

document.body.classList.add('page-enter');
const curtain = $('.transition.cover');
window.addEventListener('load', ()=>{
  requestAnimationFrame(()=> curtain?.classList.add('reveal'));
  setTimeout(()=> document.body.classList.remove('page-enter'), 200);
});
if (curtain){
  $$('a[href]').forEach(a=>{
    const href=a.getAttribute('href');
    if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;
    a.addEventListener('click', ev=>{
      ev.preventDefault();
      curtain.classList.remove('reveal');
      setTimeout(()=> location.href=href, 900);
    });
  });
}

$$('#year').forEach(el=> el.textContent = new Date().getFullYear());

const burger=$('.burger'), nav=$('.nav');
if (burger && nav) burger.addEventListener('click', ()=>{ const open=nav.classList.toggle('open'); burger.setAttribute('aria-expanded', String(open)); });

const navGlow=$('.nav__glow'), navRail=$('.nav__rail');
function railTo(el){
  if(!nav||!navRail||!el) return;
  const r=el.getBoundingClientRect(), p=nav.getBoundingClientRect();
  navRail.style.transform=`translateX(${r.left-p.left}px)`; navRail.style.width=`${r.width}px`;
}
if (nav){
  const active=$('.nav__link.is-active') || $('.nav__link'); railTo(active);
  nav.addEventListener('mousemove', e=>{
    const r=nav.getBoundingClientRect();
    navGlow && navGlow.style.setProperty('--x', ((e.clientX-r.left)/r.width*100)+'%');
  });
  $$('.nav__link', nav).forEach(a=>{
    a.addEventListener('mouseenter', ()=> railTo(a));
    a.addEventListener('mouseleave', ()=> railTo(active));
  });
  addEventListener('resize', ()=> railTo($('.nav__link.is-active')||$('.nav__link')));
  new ResizeObserver(()=> railTo($('.nav__link.is-active')||$('.nav__link'))).observe(nav);
}

const bar=$('.scroll-bar > span');
if (bar){
  const onScroll=()=>{ const h=document.documentElement, max=h.scrollHeight-h.clientHeight; bar.style.width=(max>0?(h.scrollTop/max*100):0)+'%'; };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
}

const io=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      if (e.target.matches('.flyin, .gallery'))
        $$('.fly', e.target).forEach((f,i)=> setTimeout(()=> f.classList.add('in'), i*90));
    }
  });
},{threshold:.14});
$$('.reveal').forEach(el=> io.observe(el));

addEventListener('scroll', ()=> $$('.parallax').forEach(el=> el.style.transform=`translateY(${scrollY*0.12}px)`), {passive:true});

const cyc=$('.word-cycle');
if (cyc){ const words=JSON.parse(cyc.dataset.words||'[]'); let i=0; const tick=()=>{cyc.textContent=words[i%words.length]; i++;}; tick(); setInterval(tick,1200); }

(function(){
  const h1=$('.big-title'); if(!h1) return;
  const txt=h1.childNodes[0].nodeValue.trim();
  const wrap=document.createElement('span'); wrap.className='letters';
  [...txt].forEach((ch,idx)=>{ const s=document.createElement('span'); s.textContent=ch; s.style.animationDelay=idx*30+'ms'; wrap.appendChild(s); });
  h1.childNodes[0].nodeValue=''; h1.insertBefore(wrap, h1.firstChild);
})();

$$('.button').forEach(btn=>{
  btn.addEventListener('mousemove', e=>{ const r=btn.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top; btn.style.setProperty('--mx', mx+'px'); btn.style.setProperty('--my', my+'px'); });
  btn.addEventListener('click', ()=>{ btn.classList.remove('pulse'); void btn.offsetWidth; btn.classList.add('pulse'); });
});

addEventListener('mousemove', e=>{
  document.body.style.setProperty('--spot-x', e.clientX+'px');
  document.body.style.setProperty('--spot-y', e.clientY+'px');
},{passive:true});

(function(){
  function update(){
    const h=document.documentElement;
    const max=Math.max(1, h.scrollHeight - h.clientHeight);
    const p = h.scrollTop / max;
    const hue = parseFloat(getComputedStyle(h).getPropertyValue('--hue')) + (p * 20 - 10);
    document.documentElement.style.setProperty('--hue', hue.toFixed(1));
    document.documentElement.style.setProperty('--bgShift', (p*100).toFixed(1)+'%');
  }
  update();
  addEventListener('scroll', update, {passive:true});
  addEventListener('resize', update);
})();

(function(){
  const c=$('#wavefield'); if(!c) return;
  const ctx=c.getContext('2d');
  function resize(){ const DPR=Math.min(devicePixelRatio||1,2); c.width=innerWidth*DPR; c.height=innerHeight*DPR; ctx.setTransform(DPR,0,0,DPR,0,0); }
  addEventListener('resize', resize); resize();
  function n2(x,y){let q=x+Math.sin(y)*2; return (Math.sin(q)+Math.sin(q*1.2)+Math.sin(q*1.4))/3; }
  let t=0;
  function draw(){
    t += 0.002;
    const W=innerWidth, H=innerHeight;
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#06101a'); g.addColorStop(1,'#0a1624');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

    const rows=80, cols=180; const boost=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--wave-boost'))||1;
    ctx.lineWidth=1;
    for(let r=0;r<rows;r++){
      const y=(r/rows)*H, amp=(1-r/rows)*32*boost;
      ctx.beginPath();
      for(let i=0;i<=cols;i++){
        const x=(i/cols)*W, n=n2(x*0.002+t*0.6, r*0.18+t*0.5);
        const dy=(n-.5)*amp + Math.sin((x/W)*Math.PI*4 + t*2 + r*0.1)*amp*0.08;
        (i?ctx.lineTo(x,y+dy):ctx.moveTo(x,y+dy));
      }
      ctx.strokeStyle=`hsla(${getComputedStyle(document.documentElement).getPropertyValue('--hue')} 100% 60% / ${0.05+(1-r/rows)*0.16})`;
      ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

(function(){
  const c=$('#ribbon'); if(!c) return;
  const ctx=c.getContext('2d');
  function resize(){ const DPR=Math.min(devicePixelRatio||1,2); c.width=innerWidth*DPR; c.height=innerHeight*DPR; ctx.setTransform(DPR,0,0,DPR,0,0); }
  addEventListener('resize', resize); resize();

  const R = [
    {y:.25, amp1:14, amp2:32, line:1.2, speed:0.9, initialOffset: Math.random() * 1000},
    {y:.30, amp1:12, amp2:30, line:1.0, speed:.85, initialOffset: Math.random() * 1000},
    {y:.35, amp1:11, amp2:28, line:1.0, speed:1.05, initialOffset: Math.random() * 1000},
    {y:.40, amp1:10, amp2:26, line:1.1, speed:1.00, initialOffset: Math.random() * 1000},
    {y:.45, amp1:9, amp2:24, line:0.8, speed:1.20, initialOffset: Math.random() * 1000},
    {y:.50, amp1: 8, amp2:22, line:0.9, speed:1.15, initialOffset: Math.random() * 1000},
    {y:.55, amp1:13, amp2:28, line:1.1, speed:0.90, initialOffset: Math.random() * 1000},
    {y:.60, amp1:12, amp2:26, line:1.0, speed:0.95, initialOffset: Math.random() * 1000},
    {y:.70, amp1: 9, amp2:18, line:0.9, speed:1.10, initialOffset: Math.random() * 1000},
    {y:.80, amp1:11, amp2:24, line:1.0, speed:1.00, initialOffset: Math.random() * 1000}
  ];

  let t=0, offset=0;
  function draw(){
    const W=innerWidth, H=innerHeight;
    ctx.clearRect(0,0,W,H);
    t += 1;
    offset += 4.0;

    const baseHue=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hue'))||198;

    R.forEach((rb,i)=>{
      const baseY = H*rb.y;
      const segW = W*0.10;
      const xC   = ( (offset*rb.speed + rb.initialOffset) % (W+segW*2) ) - segW;

      const pts=[];
      for(let x=-segW; x<=segW; x+=3){
        const X = xC + x;
        const Y = baseY
                + Math.sin((X/W)*Math.PI*4 + t*0.03 + i)*rb.amp1
                + Math.sin((X/W)*Math.PI*1.2 + t*0.02 + i)*rb.amp2;
        pts.push([X,Y]);
      }

      ctx.beginPath(); pts.forEach(([X,Y],k)=> k?ctx.lineTo(X,Y):ctx.moveTo(X,Y));
      ctx.lineWidth = rb.line*3.2;
      ctx.strokeStyle = `hsla(${baseHue} 100% 60% / .18)`;
      ctx.stroke();

      const g = ctx.createLinearGradient(xC-segW,0,xC+segW,0);
      g.addColorStop(0, `hsla(${baseHue-60} 100% 62% / 0)`);
      g.addColorStop(0.2, `hsla(${baseHue-40} 100% 62% / 1)`);
      g.addColorStop(0.4, `hsla(${baseHue-20} 100% 62% / 1)`);
      g.addColorStop(0.6, `hsla(${baseHue} 100% 62% / 1)`);
      g.addColorStop(0.8, `hsla(${baseHue+20} 100% 62% / 1)`);
      g.addColorStop(1, `hsla(${baseHue+40} 100% 62% / 0)`);
      ctx.beginPath(); pts.forEach(([X,Y],k)=> k?ctx.lineTo(X,Y):ctx.moveTo(X,Y));
      ctx.lineWidth = rb.line;
      ctx.strokeStyle = g;
      ctx.lineCap='round';
      ctx.stroke();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

(function(){
  const c=$('#sparks'); if(!c) return;
  const ctx=c.getContext('2d');
  function resize(){ const DPR=Math.min(devicePixelRatio||1,2); c.width=innerWidth*DPR; c.height=innerHeight*DPR; ctx.setTransform(DPR,0,0,DPR,0,0); }
  addEventListener('resize', resize); resize();

  let parts=[];
  function spawn(px,py){ for(let i=0;i<10;i++){ const a=Math.random()*Math.PI*2, s=0.9+Math.random()*1.3; parts.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1}); } }
  function onMove(e){ const r=c.getBoundingClientRect(); const x=e.clientX-r.left, y=e.clientY-r.top; spawn(x,y); document.body.style.setProperty('--spot-x', e.clientX+'px'); document.body.style.setProperty('--spot-y', e.clientY+'px'); }
  c.addEventListener('mousemove', onMove, {passive:true});
  c.addEventListener('touchmove', (e)=>{ const t=e.touches[0]; if(!t) return; onMove(t); }, {passive:true});

  function step(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for(let i=parts.length-1;i>=0;i--){
      const p=parts[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.02; p.life-=0.015;
      if(p.life<=0){ parts.splice(i,1); continue; }
      ctx.globalAlpha=p.life*.85;
      const hue=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hue'))||198;
      ctx.fillStyle=`hsl(${hue} 100% 60%)`;
      ctx.fillRect(p.x, p.y, 2, 2);
    }
    requestAnimationFrame(step);
  }
  step();
})();

addEventListener('scroll', ()=>{
  const h=document.documentElement, p=h.scrollTop/Math.max(1,h.scrollHeight-h.clientHeight);
  document.documentElement.style.setProperty('--wave-boost', (1+p*0.6).toFixed(2));
},{passive:true});

function mailTo(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.name.value;
  const email = form.email.value;
  const message = form.message.value;
  const subject = encodeURIComponent('Contact from Pixel Raptors Website');
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
  window.location.href = `mailto:pixelraptorsrobotics@gmail.com?subject=${subject}&body=${body}`;
  return false;
}