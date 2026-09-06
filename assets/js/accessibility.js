/**
 * ORiGIN Lab - Accessibility Widget
 * File: assets/js/accessibility.js
 */
(() => {
    'use strict';
    const ROOT = document.documentElement;
    const STORE = 'originLabA11y';
    const TOGGLE = document.getElementById('originAccessToggle');
    const PANEL = document.getElementById('originAccessPanel');
    const CLOSE = document.getElementById('originAccessClose');
    if (!TOGGLE || !PANEL) return;
    const DEFAULTS = { fontScale: 1, contrast: false, profile: 'default' };
    let settings = { ...DEFAULTS };
    try { const s = JSON.parse(localStorage.getItem(STORE)); if (s) settings = { ...DEFAULTS, ...s }; } catch (_) {}
    function apply() {
          ROOT.style.setProperty('--access-font-scale', settings.fontScale);
          ROOT.classList.toggle('origin-high-contrast', settings.contrast);
          ['deuteranopia','tritanopia','grayscale'].forEach(p => ROOT.classList.remove('origin-profile-' + p));
          if (settings.profile !== 'default') ROOT.classList.add('origin-profile-' + settings.profile);
          const cb = document.getElementById('originContrastToggle');
          if (cb) cb.classList.toggle('is-active', settings.contrast);
          const ps = document.getElementById('originColourProfile');
          if (ps) ps.value = settings.profile;
          try { localStorage.setItem(STORE, JSON.stringify(settings)); } catch (_) {}
    }
    function openPanel() { PANEL.hidden = false; TOGGLE.setAttribute('aria-expanded', 'true'); CLOSE.focus(); }
    function closePanel() { PANEL.hidden = true; TOGGLE.setAttribute('aria-expanded', 'false'); TOGGLE.focus(); }
    TOGGLE.addEventListener('click', () => PANEL.hidden ? openPanel() : closePanel());
    CLOSE.addEventListener('click', closePanel);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !PANEL.hidden) closePanel(); });
    document.addEventListener('click', e => { if (!PANEL.hidden && !PANEL.contains(e.target) && e.target !== TOGGLE) closePanel(); });
    document.getElementById('originFontIncrease')?.addEventListener('click', () => { settings.fontScale = Math.min(+(settings.fontScale + 0.1).toFixed(1), 1.5); apply(); });
    document.getElementById('originFontDecrease')?.addEventListener('click', () => { settings.fontScale = Math.max(+(settings.fontScale - 0.1).toFixed(1), 0.8); apply(); });
    document.getElementById('originContrastToggle')?.addEventListener('click', () => { settings.contrast = !settings.contrast; apply(); });
    document.getElementById('originColourProfile')?.addEventListener('change', e => { settings.profile = e.target.value; apply(); });
    document.getElementById('originAccessReset')?.addEventListener('click', () => { settings = { ...DEFAULTS }; apply(); });
    apply();
})();
