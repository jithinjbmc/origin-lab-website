/**
 * ORiGIN Lab - Full Accessibility Widget
 * Profiles: 8 colour-blindness + high-contrast + font scale + dyslexia + reduced motion
 */
(() => {
      'use strict';
      const ROOT = document.documentElement;
      const STORE = 'originLabA11y';
      const TOGGLE = document.getElementById('originAccessToggle');
      const PANEL  = document.getElementById('originAccessPanel');
      const CLOSE  = document.getElementById('originAccessClose');
      if (!TOGGLE || !PANEL) return;
      const DEFAULTS = { fontScale:1, contrast:false, profile:'default', dyslexia:false, motion:false, cursor:false, highlight:false };
      let S = {...DEFAULTS};
      try { const s=JSON.parse(localStorage.getItem(STORE)); if(s) S={...DEFAULTS,...s}; } catch(_){}

   const PROFILES = {
       default:        null,
           protanopia:     'url(#origin-protanopia)',
           deuteranopia:   'url(#origin-deuteranopia)',
           tritanopia:     'url(#origin-tritanopia)',
           protanomaly:    'url(#origin-protanomaly)',
           deuteranomaly:  'url(#origin-deuteranomaly)',
           tritanomaly:    'url(#origin-tritanomaly)',
           achromatopsia:  'url(#origin-achromatopsia)',
           achromatomaly:  'url(#origin-achromatomaly)'
   };

   function apply() {
           ROOT.style.setProperty('--access-font-scale', S.fontScale);
           ROOT.classList.toggle('origin-high-contrast', S.contrast);
           ROOT.classList.toggle('origin-dyslexia', S.dyslexia);
           ROOT.classList.toggle('origin-reduce-motion', S.motion);
           ROOT.classList.toggle('origin-big-cursor', S.cursor);
           ROOT.classList.toggle('origin-highlight-links', S.highlight);
           Object.keys(PROFILES).forEach(p => { if(p!=='default') ROOT.classList.remove('origin-profile-'+p); });
           if (S.profile !== 'default') ROOT.classList.add('origin-profile-'+S.profile);
           const cb = document.getElementById('originContrastToggle');
           if (cb) { cb.classList.toggle('is-active', S.contrast); cb.setAttribute('aria-pressed', S.contrast); }
           const dy = document.getElementById('originDyslexiaToggle');
           if (dy) { dy.classList.toggle('is-active', S.dyslexia); dy.setAttribute('aria-pressed', S.dyslexia); }
           const mo = document.getElementById('originMotionToggle');
           if (mo) { mo.classList.toggle('is-active', S.motion); mo.setAttribute('aria-pressed', S.motion); }
           const cu = document.getElementById('originCursorToggle');
           if (cu) { cu.classList.toggle('is-active', S.cursor); cu.setAttribute('aria-pressed', S.cursor); }
           const hl = document.getElementById('originHighlightToggle');
           if (hl) { hl.classList.toggle('is-active', S.highlight); hl.setAttribute('aria-pressed', S.highlight); }
           const ps = document.getElementById('originColourProfile');
           if (ps) ps.value = S.profile;
           const scl = document.getElementById('originFontScaleVal');
           if (scl) scl.textContent = Math.round(S.fontScale*100)+'%';
           try { localStorage.setItem(STORE, JSON.stringify(S)); } catch(_){}
   }

   function openPanel()  { PANEL.hidden=false; TOGGLE.setAttribute('aria-expanded','true');  CLOSE.focus(); }
      function closePanel() { PANEL.hidden=true;  TOGGLE.setAttribute('aria-expanded','false'); TOGGLE.focus(); }
      TOGGLE.addEventListener('click', () => PANEL.hidden ? openPanel() : closePanel());
      CLOSE.addEventListener('click', closePanel);
      document.addEventListener('keydown', e => { if(e.key==='Escape' && !PANEL.hidden) closePanel(); });
      document.addEventListener('click', e => { if(!PANEL.hidden && !PANEL.contains(e.target) && e.target!==TOGGLE) closePanel(); });
      document.getElementById('originFontIncrease')?.addEventListener('click', () => { S.fontScale=Math.min(+(S.fontScale+0.1).toFixed(1),1.6); apply(); });
      document.getElementById('originFontDecrease')?.addEventListener('click', () => { S.fontScale=Math.max(+(S.fontScale-0.1).toFixed(1),0.8); apply(); });
      document.getElementById('originFontReset')?.addEventListener('click',    () => { S.fontScale=1; apply(); });
      document.getElementById('originContrastToggle')?.addEventListener('click',  () => { S.contrast=!S.contrast; apply(); });
      document.getElementById('originDyslexiaToggle')?.addEventListener('click',  () => { S.dyslexia=!S.dyslexia; apply(); });
      document.getElementById('originMotionToggle')?.addEventListener('click',    () => { S.motion=!S.motion; apply(); });
      document.getElementById('originCursorToggle')?.addEventListener('click',    () => { S.cursor=!S.cursor; apply(); });
      document.getElementById('originHighlightToggle')?.addEventListener('click', () => { S.highlight=!S.highlight; apply(); });
      document.getElementById('originColourProfile')?.addEventListener('change',  e  => { S.profile=e.target.value; apply(); });
      document.getElementById('originAccessReset')?.addEventListener('click',     () => { S={...DEFAULTS}; apply(); });
      apply();
})();
