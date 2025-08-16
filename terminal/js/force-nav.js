(function(){
  function nav(id, urlFn){
    const el=document.getElementById(id); if(!el) return;
    function go(){ const u=(typeof urlFn==='function')?urlFn():urlFn; window.location.href=u; }
    ['click','pointerdown','touchstart'].forEach(evt=>el.addEventListener(evt,(e)=>{e.preventDefault();e.stopPropagation();go();},{passive:false}));
  }
  nav('toCodex', '/terminal/codex/');
  nav('toAbout', '/terminal/about/');
  nav('toTerminal', '/terminal/');
  nav('codexBtn', ()=>{ const lvl=document.body.getAttribute('data-level')||'1'; return '/terminal/codex/?level='+lvl; });
  nav('aboutBtn', '/terminal/about/');
  nav('exitBtn', '/');
})();