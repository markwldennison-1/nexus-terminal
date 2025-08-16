(function(){
  const audio = {
    rack: new Audio('/terminal/assets/audio/glyphs/rack_whisper.wav'),
    redthread: new Audio('/terminal/assets/audio/glyphs/redthread_whisper.wav'),
    edgewind: new Audio('/terminal/assets/audio/glyphs/edgewind_whisper.wav'),
    glassveil: new Audio('/terminal/assets/audio/glyphs/glassveil_whisper.wav'),
    skyhook: new Audio('/terminal/assets/audio/glyphs/skyhook_whisper.wav'),
    latticekey: new Audio('/terminal/assets/audio/glyphs/latticekey_whisper.wav'),
    shardbind: new Audio('/terminal/assets/audio/glyphs/shardbind_whisper.wav'),
    echohook: new Audio('/terminal/assets/audio/glyphs/echohook_whisper.wav'),
    talonswerve: new Audio('/terminal/assets/audio/glyphs/talonswerve_whisper.wav'),
    threadwake: new Audio('/terminal/assets/audio/glyphs/threadwake_whisper.wav'),
    foldkey: new Audio('/terminal/assets/audio/glyphs/foldkey_whisper.wav'),
    phasewalk: new Audio('/terminal/assets/audio/glyphs/phasewalk_whisper.wav'),
    collapse: new Audio('/terminal/assets/audio/glyphs/collapse_whisper.wav')
  };
  function ensureHost(){let h=document.getElementById('glyph-overlay'); if(!h){h=document.createElement('div');h.id='glyph-overlay';document.body.appendChild(h);} h.innerHTML=''; h.style.display='flex'; return h;}
  function fetchSigil(name){return fetch(`/terminal/assets/sigils/${name}.svg`).then(r=>r.text());}
  async function showGlyph(name, caption){try{const host=ensureHost(); const ripple=document.createElement('div'); ripple.className='glyph-ripple'; host.appendChild(ripple); const wrap=document.createElement('div'); wrap.className='glyph-sigil sigil-animate'; host.appendChild(wrap); wrap.innerHTML=await fetchSigil(name); if(name==='rack') wrap.classList.add('rack-snap'); if(caption){const cap=document.createElement('div'); cap.className='glyph-caption'; cap.textContent=caption; wrap.appendChild(cap);} if(audio[name]){try{audio[name].currentTime=0; audio[name].play().catch(()=>{});}catch(e){}} setTimeout(()=>{host.style.display='none'; host.innerHTML='';}, 1800);}catch(e){console.warn('GlyphEngine error',e);}}
  window.GlyphEngine = { cast:(name,opts={})=>{ const captions={ rack: 'RACK locks the target’s Fold coordinates. Determination holds.',
        redthread: 'REDTHREAD ties memory to route. Allies find the path.',
        edgewind: 'EDGEWIND bends slipstreams; pursuit arcs bloom wider.',
        glassveil: 'GLASSVEIL refracts notice; optics glance away.',
        skyhook: 'SKYHOOK tethers telemetry to nearby conductors.',
        latticekey: 'LATTICEKEY borrows the city’s lattice to tag motion.',
        shardbind: 'SHARDBIND holds the shot, then opens into guidance chaff.',
        echohook: 'ECHOHOOK returns a polite lie to active sonar.',
        talonswerve: 'TALONSWERVE teaches the PID to overcorrect—safe glide‑past.',
        threadwake: 'THREADWAKE leaves a readable path through interference.',
        foldkey: 'FOLDKEY authorizes a narrow, safe corridor.',
        phasewalk: 'PHASEWALK steps with the seam’s rhythm—brief ghosting.',
        collapse: 'COLLAPSE asks the seam to rest—unsafe folds close.' }; return showGlyph(name, opts.caption||captions[name]||''); } };
})();