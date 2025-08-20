(function(){
  const $=id=>document.getElementById(id), term=()=>$('terminal'), cmd=()=>$('cmdline');
  let unlocked=false, level=0;
  const PASS={awaken:1, resolve:2, collapse:3, phasewalk:4, foldkey:5};
  const HELP={
    1:["help - status - glyphs - codex - clear - exit","glyph commands: rack, redthread, edgewind, glassveil, skyhook"],
    2:["help - status - glyphs - codex - clear - exit","glyph commands: latticekey, shardbind, echohook"],
    3:["help - status - glyphs - codex - clear - exit","glyph commands: talonswerve, threadwake"],
    4:["help - status - glyphs - codex - clear - exit","glyph commands: phasewalk, foldkey"],
    5:["help - status - glyphs - codex - clear - exit","glyph commands: collapse (plus all prior)"]
  };
  const ALL=['rack','redthread','edgewind','glassveil','skyhook','latticekey','shardbind','echohook','talonswerve','threadwake','foldkey','phasewalk','collapse'];
  let buffer="";

  function print(s){term().innerHTML+=s}
  function println(s=""){term().innerHTML+=s+"\\n"}
  function prompt(){println(""); print("> "); buffer=""; const c=cmd(); const t=c.type; c.type='text'; c.focus({preventScroll:true}); c.type=t; }
  function focusCmd(){ const c=cmd(); const t=c.type; c.type='text'; c.focus({preventScroll:true}); c.type=t; }

  ['pointerdown','mousedown','touchstart','click'].forEach(evt=>{
    document.addEventListener(evt,(e)=>{
      const tag=(e.target&&e.target.tagName||'').toLowerCase();
      if(tag==='a'||tag==='button'||tag==='iframe') return;
      focusCmd();
    },{passive:true});
  });

  function pulse(){ document.body.classList.add('pulse'); setTimeout(()=>document.body.classList.remove('pulse'), 160); }

  cmd().addEventListener('input',()=>{
    const c=cmd(); const v=c.value;
    if(v.length>buffer.length){ print(v.slice(buffer.length)); pulse(); }
    else if(v.length<buffer.length){ const h=term().innerHTML; term().innerHTML=h.slice(0, -(buffer.length-v.length)); pulse(); }
    buffer=v;
  });

  cmd().addEventListener('keydown',(e)=>{
    if(e.key==='Enter'){
      e.preventDefault(); println('');
      const text=buffer.trim().toLowerCase(); buffer='';
      route(text); pulse();
    }
  });

  function tryUnlock(value){ const p=(value||'').trim().toLowerCase(); if(PASS[p]){ unlock(PASS[p]); return true; } return false; }

  function route(text){
    if(!text){return prompt()}
    if(!unlocked && PASS[text]){return unlock(PASS[text])}
    if(!unlocked){ println('Access locked. Enter passphrase.'); return prompt(); }

    // glyphs
    if(ALL.includes(text)){
      if(window.GlyphEngine) GlyphEngine.cast(text);
      // 3D: show panel + send glyph name
      try{
        const frame=document.getElementById('fx3d');
        if(frame && frame.style.display==='none') frame.style.display='block';
        frame.contentWindow?.postMessage({ type:'cast', glyph:text }, '*');
      }catch(e){}
      println(text.toUpperCase()+' cast.');
      return prompt();
    }

    // utility commands
    switch(text){
      case 'help': HELP[level].forEach(ln=>println(ln)); break;
      case 'status': println('SYSTEM ONLINE'); break;
      case 'glyphs': println('Available: '+ALL.join(', ')); break;
      case 'codex': window.location.href='/codex/'; return;
      case 'clear': term().innerHTML=''; break;
      case 'exit': window.location.href='/'; return;
      default: println('Unknown command. Type "help".');
    }
    prompt();
  }

  function unlock(lvl){
    if(unlocked) return; unlocked=true; level=lvl;
    $('lock-screen').style.display='none'; term().style.display='block';
    try{ new Audio('/terminal/assets/audio/unlock.wav').play().catch(()=>{}); }catch(e){}
    println('\\n[Access Granted: Level '+level+']'); println('Type "help" to begin.'); prompt(); focusCmd();
  }

  window.addEventListener('DOMContentLoaded',()=>{
    const pass=$('passphrase'), btn=$('unlockBtn');
    function onEnter(e){ if(e.key==='Enter'){ e.preventDefault(); if(!tryUnlock(pass.value)){ pass.value=''; } } }
    if(pass){ pass.addEventListener('keydown', onEnter); pass.addEventListener('change', ()=>tryUnlock(pass.value)); pass.addEventListener('blur', ()=>tryUnlock(pass.value)); }
    if(btn){ btn.addEventListener('click', ()=>tryUnlock(pass.value)); }
    setTimeout(()=>pass&&pass.focus(), 80);
  });
})();