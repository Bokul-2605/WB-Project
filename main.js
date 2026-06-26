const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice=window.matchMedia('(hover: none), (pointer: coarse)').matches;
const enableHeavyFx=!prefersReducedMotion&&!isTouchDevice&&window.innerWidth>768;
const enableCursor=!prefersReducedMotion&&!isTouchDevice&&window.innerWidth>760;

/* CUSTOM CURSOR */
const cursorDot=document.createElement('div');
const cursorRing=document.createElement('div');
cursorDot.className='cursor-dot hidden';
cursorRing.className='cursor-ring hidden';
document.body.append(cursorRing,cursorDot);
if(enableCursor){
  document.body.classList.add('custom-cursor-enabled');
  let mouseX=window.innerWidth/2;
  let mouseY=window.innerHeight/2;
  let ringX=mouseX;
  let ringY=mouseY;

  const interactiveTargets=document.querySelectorAll('a,button,.btn-primary,.btn-ghost,.nav-links a,.mobile-nav-toggle');
  interactiveTargets.forEach(el=>{
    el.addEventListener('mouseenter',()=>cursorRing.classList.add('cursor-hover'));
    el.addEventListener('mouseleave',()=>cursorRing.classList.remove('cursor-hover'));
  });

  window.addEventListener('mousemove',e=>{
    mouseX=e.clientX;
    mouseY=e.clientY;
    cursorDot.style.left=`${mouseX}px`;
    cursorDot.style.top=`${mouseY}px`;
    cursorRing.style.left=`${mouseX}px`;
    cursorRing.style.top=`${mouseY}px`;
    cursorDot.classList.remove('hidden');
    cursorRing.classList.remove('hidden');
  },{passive:true});

  window.addEventListener('mouseleave',()=>{
    cursorDot.classList.add('hidden');
    cursorRing.classList.add('hidden');
  });
  window.addEventListener('mouseenter',()=>{
    cursorDot.classList.remove('hidden');
    cursorRing.classList.remove('hidden');
  });

  function animateCursor(){
    ringX += (mouseX-ringX)*0.18;
    ringY += (mouseY-ringY)*0.18;
    cursorRing.style.transform=`translate(${ringX-mouseX}px, ${ringY-mouseY}px) translate(-50%,-50%)`;
    requestAnimationFrame(animateCursor);
  }
  requestAnimationFrame(animateCursor);
} else {
  cursorDot.remove();
  cursorRing.remove();
}

/* MOBILE NAV */
const mobileToggle=document.querySelector('.mobile-nav-toggle');
if(mobileToggle){
  mobileToggle.addEventListener('click',()=>{
    const expanded=mobileToggle.getAttribute('aria-expanded')==='true';
    mobileToggle.setAttribute('aria-expanded', expanded? 'false' : 'true');
    document.body.classList.toggle('nav-open');
  });
}

/* SCROLL STATE (single RAF loop) */
const pb=document.getElementById('progressBar');
const nav=document.getElementById('mainNav');
const secs=document.querySelectorAll('section[id]');
const nls=document.querySelectorAll('.nav-links a');
const hg=document.getElementById('heroGif');
const hc=document.querySelector('.hero-content');

function updateScrollState(){
  const y=window.scrollY;
  const maxScroll=document.body.scrollHeight-window.innerHeight;
  pb.style.width=(maxScroll>0?(y/maxScroll)*100:0)+'%';
  nav.classList.toggle('scrolled',y>60);

  let cur='';
  secs.forEach(s=>{if(y>=s.offsetTop-130)cur=s.id;});
  nls.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+cur));

  if(enableHeavyFx&&y<window.innerHeight){
    hg.style.transform=`translateY(${y*.28}px)`;
    if(hc)hc.style.opacity=Math.max(0,1-(y/window.innerHeight)*1.35).toString();
  }else if(hc){
    hc.style.opacity='1';
  }
}

let scrollTicking=false;
window.addEventListener('scroll',()=>{
  if(scrollTicking)return;
  scrollTicking=true;
  requestAnimationFrame(()=>{
    updateScrollState();
    scrollTicking=false;
  });
},{passive:true});
window.addEventListener('resize',updateScrollState,{passive:true});
updateScrollState();

/* REVEAL */
const revealEls=document.querySelectorAll('.rv,.rv-l,.rv-r,.rv-s');
if(prefersReducedMotion){
  revealEls.forEach(el=>el.classList.add('on'));
}else{
  const rObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('on');});
  },{threshold:.1,rootMargin:'0px 0px -45px 0px'});
  revealEls.forEach(el=>rObs.observe(el));
}

/* CANVAS EMBER EFFECT */
if(enableHeavyFx){
  (function(){
    const c=document.getElementById('heroCanvas');
    const ctx=c.getContext('2d');
    let W,H,pts=[];
    function resize(){W=c.width=window.innerWidth;H=c.height=window.innerHeight;}
    resize();
    window.addEventListener('resize',resize);

    function P(){
      this.reset=function(){
        this.x=Math.random()*W;
        this.y=H+Math.random()*60;
        this.r=Math.random()*2+.35;
        this.vx=(Math.random()-.5)*.45;
        this.vy=-(Math.random()*.65+.22);
        this.l=0;
        this.ml=110+Math.random()*150;
        const t=Math.floor(Math.random()*3);
        this.c=t===0?'212,175,55':t===1?'200,134,10':'212,66,26';
      };
      this.reset();
    }
    for(let i=0;i<30;i++){
      const p=new P();
      p.l=Math.random()*p.ml;
      pts.push(p);
    }

    function draw(){
      ctx.clearRect(0,0,W,H);
      pts.forEach(p=>{
        p.x+=p.vx;p.y+=p.vy;p.l++;
        if(p.l>p.ml)p.reset();
        const a=p.l<16?p.l/16:p.l>p.ml-16?(p.ml-p.l)/16:1;
        ctx.save();
        ctx.globalAlpha=a*.45;
        ctx.fillStyle=`rgb(${p.c})`;
        ctx.shadowColor=`rgba(${p.c},.85)`;
        ctx.shadowBlur=p.r*5;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(draw);
    }
    draw();
  })();
}

/* STAT COUNTER */
function countUp(el,tgt,dur){
  let s=null;
  function step(ts){
    if(!s)s=ts;
    const p=Math.min((ts-s)/dur,1);
    el.textContent=Math.floor(p*tgt).toLocaleString();
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
if(prefersReducedMotion){
  document.querySelectorAll('.scard-val').forEach(el=>{
    const n=parseInt(el.textContent.replace(/\D/g,''),10);
    if(n)el.textContent=n.toLocaleString();
  });
}else{
  const cObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el=e.target;
        const n=parseInt(el.textContent.replace(/\D/g,''),10);
        if(n)countUp(el,n,1200);
        cObs.unobserve(el);
      }
    });
  },{threshold:.6});
  document.querySelectorAll('.scard-val').forEach(el=>cObs.observe(el));
}

/* PAGE FADE IN */
if(prefersReducedMotion){
  document.body.style.opacity='1';
}else{
  document.body.style.opacity='0';
  window.addEventListener('load',()=>{
    document.body.style.transition='opacity .45s ease';
    document.body.style.opacity='1';
  });
}
