(function(){
  const c=document.createElement('canvas');
  c.id='bg-net'; c.setAttribute('aria-hidden','true');
  document.body.prepend(c);
  const ctx=c.getContext('2d');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D=140, M=170; // مسافة الربط بين النقاط / مسافة تأثير الماوس
  let W,H,nodes=[],packets=[],raf,mouse={x:-999,y:-999};

  function resize(){
    const dpr=Math.min(devicePixelRatio||1,2);
    W=innerWidth; H=innerHeight;
    c.width=W*dpr; c.height=H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const n=Math.round(Math.min(90,W*H/16000));
    nodes=Array.from({length:n},()=>({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35,
      r:1.2+Math.random()*1.6
    }));
    packets=[];
  }

  function frame(){
    const dark=document.documentElement.getAttribute('data-theme')==='dark';
    const rgb=dark?'77,177,255':'26,155,230';
    const k=dark?1:.8;
    ctx.clearRect(0,0,W,H);

    for(const p of nodes){
      if(!reduce){
        const dx=p.x-mouse.x, dy=p.y-mouse.y, d=Math.hypot(dx,dy);
        if(d<110&&d>0){p.x+=dx/d*.6; p.y+=dy/d*.6}   // ابتعاد خفيف عن الماوس
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<-10)p.x=W+10; if(p.x>W+10)p.x=-10;
        if(p.y<-10)p.y=H+10; if(p.y>H+10)p.y=-10;
      }
    }

    // الخطوط بين النقاط
    ctx.lineWidth=1;
    for(let i=0;i<nodes.length;i++){
      const a=nodes[i];
      for(let j=i+1;j<nodes.length;j++){
        const b=nodes[j], d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<D){
          ctx.strokeStyle=`rgba(${rgb},${(1-d/D)*.28*k})`;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
      // خط من الماوس للنقاط القريبة
      const dm=Math.hypot(a.x-mouse.x,a.y-mouse.y);
      if(dm<M){
        ctx.strokeStyle=`rgba(${rgb},${(1-dm/M)*.5})`;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(mouse.x,mouse.y); ctx.stroke();
      }
    }

    // النقاط
    ctx.fillStyle=`rgba(${rgb},${.55*k})`;
    for(const p of nodes){ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.283); ctx.fill()}

    // حزم البيانات
    if(!reduce){
      if(packets.length<8 && Math.random()<.04){
        const a=nodes[Math.random()*nodes.length|0];
        const near=nodes.filter(b=>b!==a&&Math.hypot(a.x-b.x,a.y-b.y)<D);
        if(near.length) packets.push({a,b:near[Math.random()*near.length|0],t:0});
      }
      packets=packets.filter(p=>{
        p.t+=.02;
        if(p.t>=1||Math.hypot(p.a.x-p.b.x,p.a.y-p.b.y)>D) return false;
        const x=p.a.x+(p.b.x-p.a.x)*p.t, y=p.a.y+(p.b.y-p.a.y)*p.t;
        ctx.shadowColor=`rgb(${rgb})`; ctx.shadowBlur=10;
        ctx.fillStyle=`rgb(${rgb})`;
        ctx.beginPath(); ctx.arc(x,y,2.6,0,6.283); ctx.fill();
        ctx.shadowBlur=0;
        return true;
      });
    }
    if(!reduce) raf=requestAnimationFrame(frame);
  }

  addEventListener('resize',()=>{resize(); if(reduce)frame()});
  addEventListener('mousemove',e=>{mouse.x=e.clientX; mouse.y=e.clientY});
  addEventListener('mouseleave',()=>{mouse.x=mouse.y=-999});
  document.addEventListener('visibilitychange',()=>{
    cancelAnimationFrame(raf);
    if(!document.hidden&&!reduce) frame();
  });
  resize(); frame();
})();