/* Nexus Terminal HOTFIX (additive, safe)
   - Fixes focus (no double-tap), clears input after Enter
   - Adds working Codex glyph clicks + overlay + whispers
   - Ensures caption text is visible; slows frantic overlays (via our own)
   - Bridges glyph casts to 3D iframe if present
*/
(function(){
  const GLYPH_PATH = '/terminal/assets/sigils';
  const AUDIO_PATH = '/terminal/assets/audio/glyphs';
  const CLICK_BLOCKERS = new Set(['A','BUTTON','IFRAME','INPUT','TEXTAREA','SELECT','LABEL','SUMMARY']);

  function onReady(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function injectStyle(css){
    const s = document.createElement('style');
    s.setAttribute('data-hotfix','true');
    s.textContent = css;
    document.head.appendChild(s);
  }

  function ensureOverlay(){
    let o = document.getElementById('glyph-hotfix-overlay');
    if(o) return o;
    o = document.createElement('div');
    o.id = 'glyph-hotfix-overlay';
    o.setAttribute('aria-hidden','true');
    o.innerHTML = `
      <div class="gho-inner">
        <img class="gho-sigil" alt="sigil"/>
        <div class="gho-caption" role="status" aria-live="polite"></div>
      </div>
    `;
    document.body.appendChild(o);

    // Close overlay on click/ESC
    o.addEventListener('click', ()=> hideOverlay());
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') hideOverlay(); });

    // Styles (kept here so we don’t edit your css files)
    injectStyle(`
      #glyph-hotfix-overlay{
        position:fixed; inset:0; display:none;
        align-items:center; justify-content:center;
        background:rgba(0,0,0,.55); z-index:10000;
        -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px);
      }
      #glyph-hotfix-overlay .gho-inner{ position:relative; }
      #glyph-hotfix-overlay .gho-sigil{
        width:min(70vmin,560px); height:min(70vmin,560px); display:block;
        filter: drop-shadow(0 0 22px rgba(255,59,110,.25));
      }
      #glyph-hotfix-overlay .gho-caption{
        position:absolute; left:0; right:0; bottom:-3.5vh; text-align:center;
        color:#c4f1f9; font-family:"Courier New",monospace;
        font-size:clamp(13px,2.2vw,18px); opacity:.95; text-shadow:0 0 6px rgba(12,255,186,.25);
      }
      @media (prefers-reduced-motion: reduce) {
        #glyph-hotfix-overlay{ background:rgba(0,0,0,.35); }
      }
    `);
    return o;
  }

  let overlayTimer = null;
  function showGlyph(name){
    const o = ensureOverlay();
    const img = o.querySelector('.gho-sigil');
    const cap = o.querySelector('.gho-caption');
    img.src = `${GLYPH_PATH}/${encodeURIComponent(name)}.svg`;
    cap.textContent = name.toUpperCase();
    o.style.display = 'flex';
    // sound (best effort; silent on 404/autoplay block)
    try { new Audio(`${AUDIO_PATH}/${name}_whisper.wav`).play().catch(()=>{}); } catch(e){}
    // bridge to 3D pane if present
    try{
      const frame = document.getElementById('fx3d');
      if(frame){
        if(frame.style.display === 'none') frame.style.display = 'block';
        frame.contentWindow?.postMessage({ type:'cast', glyph:name }, '*');
      }
    }catch(e){}

    clearTimeout(overlayTimer);
    overlayTimer = setTimeout(()=> hideOverlay(), 2800);
  }

  function hideOverlay(){
    const o = document.getElementById('glyph-hotfix-overlay');
    if(o) o.style.display = 'none';
  }

  function initCodexLinks(){
    document.addEventListener('click', (e)=>{
      const a = e.target.closest ? e.target.closest('.glyph-link') : null;
      if(!a) return;
      e.preventDefault();
      const name = a.getAttribute('data-glyph') || a.textContent.trim().toLowerCase();
      if(!name) return;
      showGlyph(name);
    }, { passive:false });
  }

  function initTerminalInput(){
    const input = document.getElementById('cmdline');
    if(!input) return;

    // Keep focus (fix double tap)
    ['pointerdown','mousedown','touchstart','click'].forEach(evt=>{
      document.addEventListener(evt, (e)=>{
        const tag = (e.target && e.target.tagName) || '';
        if(CLICK_BLOCKERS.has(tag)) return;
        // iOS caret trick: toggle type to force caret
        const t = input.type;
        input.type = 'text';
        input.focus({ preventScroll:true });
        input.type = t;
      }, { passive:true });
    });

    // After Enter, clear + refocus (without fighting your existing handler)
    input.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){
        // run after your handler
        setTimeout(()=>{
          try { input.value = ''; } catch(_) {}
          try {
            const t = input.type;
            input.type = 'text';
            input.focus({ preventScroll:true });
            input.type = t;
          } catch(_) {}
        }, 0);
      }
    });
  }

  onReady(()=>{
    initTerminalInput();
    initCodexLinks();
  });
})();