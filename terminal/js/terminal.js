(function(){
  const $ = id => document.getElementById(id);
  const term = () => $('terminal');
  const cmd  = () => $('cmdline');

  let unlocked = false, level = 0, buffer = "";

  // Passphrases → levels
  const PASS = { awaken:1, resolve:2, collapse:3, phasewalk:4, foldkey:5 };

  // Help text per level (edit as needed)
  const HELP = {
    1: ["help - status - glyphs - codex - clear - exit", "glyph commands: rack, redthread, edgewind, glassveil, skyhook"],
    2: ["help - status - glyphs - codex - clear - exit", "glyph commands: latticekey, shardbind, echohook"],
    3: ["help - status - glyphs - codex - clear - exit", "glyph commands: talonswerve, threadwake"],
    4: ["help - status - glyphs - codex - clear - exit", "glyph commands: phasewalk, foldkey"],
    5: ["help - status - glyphs - codex - clear - exit", "glyph commands: collapse (plus all prior)"]
  };

  // All supported glyphs (includes new vantaeye)
  const ALL = [
    'rack','redthread','edgewind','glassveil','skyhook',
    'latticekey','shardbind','echohook',
    'talonswerve','threadwake',
    'foldkey','phasewalk','collapse',
    'vantaeye'
  ];

  // Basic terminal I/O helpers
  function print(s){ term().innerHTML += s; }
  function println(s=""){ term().innerHTML += (s + "\n"); }
  function pulse(){ document.body.classList.add('pulse'); setTimeout(()=>document.body.classList.remove('pulse'), 140); }

  function focusCmd(){
    const c = cmd();
    // iOS caret-focus trick
    const t = c.type;
    c.type = 'text';
    c.focus({ preventScroll: true });
    c.type = t;
  }

  function prompt(){
    println("");
    print("> ");
    buffer = "";
    focusCmd();
  }

  // Keep input focused when user taps page
  ['pointerdown','mousedown','touchstart','click'].forEach(evt=>{
    document.addEventListener(evt, (e)=>{
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      // don't steal focus from links/buttons/iframe
      if(tag==='a' || tag==='button' || tag==='iframe') return;
      focusCmd();
    }, { passive:true });
  });

  // Mirror typing into terminal (retro feel)
  cmd().addEventListener('input', ()=>{
    const v = cmd().value;
    if(v.length > buffer.length){
      print(v.slice(buffer.length));
    } else if (v.length < buffer.length){
      // remove characters
      const h = term().innerHTML;
      term().innerHTML = h.slice(0, -(buffer.length - v.length));
    }
    buffer = v;
    pulse();
  });

  // Submit on Enter
  cmd().addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      e.preventDefault();
      println('');
      const text = buffer.trim().toLowerCase();
      buffer = '';
      route(text);
      pulse();
    }
  });

  // Try unlock
  function tryUnlock(value){
    const p = (value || '').trim().toLowerCase();
    if(PASS[p]){
      unlock(PASS[p]);
      return true;
    }
    return false;
  }

  // Command router
  function route(text){
    if(!text){ return prompt(); }

    // Unlock if still locked
    if(!unlocked && PASS[text]){ return unlock(PASS[text]); }
    if(!unlocked){
      println('Access locked. Enter passphrase.');
      return prompt();
    }

    // Glyph commands
    if(ALL.includes(text)){
      // Existing 2D overlay engine (if present)
      if(window.GlyphEngine) GlyphEngine.cast(text);

      // Show 3D panel + send glyph name to iframe
      try{
        const frame = document.getElementById('fx3d');
        if(frame && frame.style.display === 'none') frame.style.display = 'block';
        frame.contentWindow?.postMessage({ type:'cast', glyph: text }, '*');
      }catch(e){ /* ignore */ }

      println(text.toUpperCase() + ' cast.');
      return prompt();
    }

    // Utility commands
    switch(text){
      case 'help':
        HELP[level].forEach(ln => println(ln));
        break;

      case 'status':
        println('SYSTEM ONLINE');
        break;

      case 'glyphs':
        println('Available: ' + ALL.join(', '));
        break;

      case 'codex':
        window.location.href = '/codex/';
        return;

      case 'clear':
        term().innerHTML = '';
        break;

      case 'exit':
        window.location.href = '/';
        return;

      default:
        println('Unknown command. Type "help".');
    }
    prompt();
  }

  // Unlock routine
  function unlock(lvl){
    if(unlocked) return;
    unlocked = true; level = lvl;
    $('lock-screen').style.display = 'none';
    term().style.display = 'block';
    // Soft audio cue if present
    try{ new Audio('/terminal/assets/audio/unlock.wav').play().catch(()=>{}); }catch(e){}
    println('\n[Access Granted: Level ' + level + ']');
    println('Type "help" to begin.');
    prompt(); focusCmd();
  }

  // Bootstrap
  window.addEventListener('DOMContentLoaded', ()=>{
    const pass = $('passphrase'), btn = $('unlockBtn');

    function onEnter(e){
      if(e.key === 'Enter'){
        e.preventDefault();
        if(!tryUnlock(pass.value)){ pass.value = ''; }
      }
    }
    if(pass){
      pass.addEventListener('keydown', onEnter);
      pass.addEventListener('change', ()=>tryUnlock(pass.value));
      pass.addEventListener('blur',   ()=>tryUnlock(pass.value));
      // small delay helps iOS focus reliably
      setTimeout(()=>pass.focus(), 80);
    }
    if(btn){
      btn.addEventListener('click', ()=>tryUnlock(pass.value));
    }
  });
})();