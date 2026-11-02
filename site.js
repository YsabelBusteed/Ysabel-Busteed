// Work filter, image lightbox and copy-email button.
(function(){
  // Crayon scribbles: one shared filter, then an SVG stroke inside each element that gets one
  var NS='http://www.w3.org/2000/svg';
  var CIRCLE=['M34 18 C 80 4, 160 6, 186 26 C 204 42, 182 66, 130 72 C 80 78, 22 70, 12 50 C 4 32, 40 14, 96 10'];
  var UNDER=['M6 14 C 52 6, 120 10, 194 8','M24 19 C 80 14, 140 18, 176 15'];
  var defs=document.createElement('div');
  defs.innerHTML='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="crayon" x="-10%" y="-40%" width="120%" height="180%">'+
    '<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="4" result="n"/>'+
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G" result="d"/>'+
    '<feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="9" result="g"/>'+
    '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -3 0 0 0 2.3" result="ga"/>'+
    '<feComposite in="d" in2="ga" operator="in"/></filter></svg>';
  document.body.appendChild(defs.firstChild);
  function scribble(el,paths,kind){
    var svg=document.createElementNS(NS,'svg');
    svg.setAttribute('class','scrib '+kind);
    svg.setAttribute('viewBox',kind==='c'?'0 0 200 80':'0 0 200 24');
    svg.setAttribute('preserveAspectRatio','none');
    svg.setAttribute('aria-hidden','true');
    paths.forEach(function(d){
      var p=document.createElementNS(NS,'path');
      p.setAttribute('d',d);p.setAttribute('pathLength','1');
      svg.appendChild(p);
    });
    el.appendChild(svg);
  }
  document.querySelectorAll('.chip,.pill,.copy,.scrib-circle').forEach(function(el){scribble(el,CIRCLE,'c')});
  document.querySelectorAll('.scrib-under,nav a[aria-current="page"]').forEach(function(el){scribble(el,UNDER,'u')});

  // Filter chips on the home page
  var wall=document.querySelector('.wall');
  var chips=document.querySelectorAll('.chip');
  function applyFilter(cat){
    if(!wall) return;
    chips.forEach(function(c){c.setAttribute('aria-pressed',String(c.dataset.cat===cat))});
    wall.classList.toggle('filtered',cat!=='all');
    wall.querySelectorAll('.tile').forEach(function(t){
      t.hidden=cat!=='all'&&(' '+t.dataset.cats+' ').indexOf(' '+cat+' ')<0;
    });
  }
  chips.forEach(function(c){c.addEventListener('click',function(){
    applyFilter(c.dataset.cat);
    try{history.replaceState(null,'',c.dataset.cat==='all'?'#work':'#'+c.dataset.cat)}catch(e){}
  })});
  if(wall){
    var h=location.hash.slice(1);
    if(h&&document.querySelector('.chip[data-cat="'+h+'"]')) applyFilter(h);
  }

  // Looping videos stay paused on their first frame for people who turn motion off
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('video[autoplay]').forEach(function(v){v.removeAttribute('autoplay');v.pause()});
  }

  // Project pages always open at the top, even when the browser or host keeps the old scroll position
  var lb=document.getElementById('lb');
  if(lb&&!location.hash){
    try{history.scrollRestoration='manual'}catch(e){}
    var top=function(){window.scrollTo({top:0,left:0,behavior:'instant'})};
    top();
    window.addEventListener('load',top);
    window.addEventListener('pageshow',top);
  }

  // Lightbox on project pages
  var frames=Array.prototype.slice.call(document.querySelectorAll('.frame.has-img'));
  if(lb&&frames.length&&lb.showModal){
    var img=lb.querySelector('img'),cap=lb.querySelector('.lb-bar span'),i=0;
    function show(n){
      i=(n+frames.length)%frames.length;
      var src=frames[i].querySelector('img');
      img.src=src.src;img.alt=src.alt;
      cap.textContent=(i+1)+' / '+frames.length+(src.alt?'  '+src.alt:'');
    }
    frames.forEach(function(f,n){f.addEventListener('click',function(){show(n);lb.showModal()})});
    lb.querySelector('[data-lb=close]').addEventListener('click',function(){lb.close()});
    lb.querySelector('[data-lb=prev]').addEventListener('click',function(){show(i-1)});
    lb.querySelector('[data-lb=next]').addEventListener('click',function(){show(i+1)});
    lb.addEventListener('keydown',function(e){
      if(e.key==='ArrowLeft') show(i-1);
      if(e.key==='ArrowRight') show(i+1);
    });
    lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('lb-img')) lb.close()});
    if(frames.length<2) lb.querySelector('.lb-nav').hidden=true;
  }

  // Copy email
  var copy=document.getElementById('copy');
  if(copy){copy.addEventListener('click',function(){
    var m=document.getElementById('mail');
    function done(){copy.firstChild.nodeValue='Copied';setTimeout(function(){copy.firstChild.nodeValue='Copy email'},1600)}
    function sel(){var r=document.createRange();r.selectNodeContents(m);var s=getSelection();s.removeAllRanges();s.addRange(r);copy.firstChild.nodeValue='Selected, press copy'}
    try{navigator.clipboard.writeText(m.textContent.trim()).then(done,sel)}catch(e){sel()}
  })}
})();
