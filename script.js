(function(){
const $=id=>document.getElementById(id);
const cv=$('c'),ctx=cv.getContext('2d');
const TAU=Math.PI*2;
let items=[],rot=0,spinning=false,size=560;

function rnd(){
  const a=new Uint32Array(2);crypto.getRandomValues(a);
  return (a[0]*2097152+(a[1]>>>11))/9007199254740992;
}
function parse(){
  items=$('list').value.split('\n').map(s=>s.trim()).filter(Boolean);
  $('count').textContent=items.length;
  draw();
}
function color(i){return 'hsl('+((i*137.508)%360)+',65%,'+(i%2?52:60)+'%)';}

function resize(){
  const w=cv.parentElement.clientWidth,d=window.devicePixelRatio||1;
  if(!w||(w===size&&cv.width===Math.round(w*d)))return;
  size=w;cv.width=Math.round(w*d);cv.height=Math.round(w*d);
  ctx.setTransform(d,0,0,d,0,0);draw();
}
function draw(){
  const n=items.length,R=size/2-6,c=size/2;
  ctx.clearRect(0,0,size,size);
  if(!n){
    ctx.beginPath();ctx.arc(c,c,R,0,TAU);ctx.fillStyle='#8884';ctx.fill();
    ctx.fillStyle='#888';ctx.font='16px system-ui';ctx.textAlign='center';
    ctx.fillText('Agrega entradas para empezar',c,c+70);return;
  }
  const a=TAU/n;
  ctx.save();ctx.translate(c,c);ctx.rotate(rot-Math.PI/2);
  for(let i=0;i<n;i++){
    ctx.beginPath();ctx.moveTo(0,0);
    ctx.arc(0,0,R,i*a-0.002,(i+1)*a+0.002);ctx.closePath();
    ctx.fillStyle=color(i);ctx.fill();
  }
  const arc=a*R*0.55;
  if(arc>=7){
    const fs=Math.min(18,arc);
    ctx.font='600 '+fs+'px system-ui,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillStyle='#111';
    const maxC=Math.max(4,Math.floor(R*0.62/(fs*0.55)));
    for(let i=0;i<n;i++){
      let t=items[i];if(t.length>maxC)t=t.slice(0,maxC-1)+'…';
      ctx.save();ctx.rotate((i+0.5)*a);ctx.fillText(t,R-10,0);ctx.restore();
    }
  }
  ctx.restore();
  ctx.beginPath();ctx.arc(c,c,R,0,TAU);ctx.lineWidth=5;ctx.strokeStyle='#2228';ctx.stroke();
}
function under(){ // índice bajo el puntero
  const n=items.length,a=TAU/n;
  const ang=((-rot)%TAU+TAU)%TAU;
  return Math.min(n-1,Math.floor(ang/a));
}
const ease=t=>1-Math.pow(1-t,4);

function spin(){
  if(spinning||!items.length)return;
  const n=items.length,a=TAU/n;
  const win=Math.floor(rnd()*n);
  const jitter=(rnd()-0.5)*a*0.8;
  const target=-((win+0.5)*a+jitter);
  const delta=(((target-rot)%TAU)+TAU)%TAU;
  const spins=5+Math.floor(rnd()*3);
  const start=rot,end=rot+spins*TAU+delta,dur=5500+rnd()*1500;
  const t0=performance.now();
  spinning=true;$('spin').disabled=true;$('winner').textContent='';
  (function f(now){
    const p=Math.min(1,(now-t0)/dur);
    rot=start+(end-start)*ease(p);
    draw();$('now').textContent=items[under()];
    if(p<1)requestAnimationFrame(f);else finish(win);
  })(t0);
}
function finish(win){
  spinning=false;$('spin').disabled=false;
  const name=items[win];
  $('now').textContent='Ganador';$('winner').textContent=name;
  const li=document.createElement('li');li.textContent=name;$('hist').prepend(li);
  $('dw').textContent=name;
  try{$('dlg').showModal();}catch(e){}
  $('dlg').dataset.win=win;
}
$('ok').onclick=()=>{
  $('dlg').close();
  if($('rm').checked){
    const w=+$('dlg').dataset.win;items.splice(w,1);
    $('list').value=items.join('\n');parse();
  }
};
$('spin').onclick=spin;
$('list').addEventListener('input',()=>{if(!spinning)parse();});
$('shuf').onclick=()=>{
  if(spinning)return;
  for(let i=items.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
  $('list').value=items.join('\n');parse();
};
$('clr').onclick=()=>{if(spinning)return;$('list').value='';$('hist').innerHTML='';$('now').textContent='—';$('winner').textContent='';parse();};
if(window.ResizeObserver)new ResizeObserver(resize).observe(cv.parentElement);else window.addEventListener('resize',resize);
$('list').value=['1','2','3','4','5','6','7','8'].join('\n');
resize();parse();
})();
