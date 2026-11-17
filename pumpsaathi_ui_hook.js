/* =========================================================================
   PUMPSAATHI_UI_HOOK.JS — Connects Skill Store, UPI Hisab & Nearest Pump
   into the More Menu, Login Screen, and Super Admin Panel
   ========================================================================= */
(function () {
  'use strict';

  function injectMoreButtons() {
    const extra = document.getElementById('extra-more-card');
    if (!extra || document.getElementById('ps-skill-hub-card')) return;

    const hub = document.createElement('div');
    hub.id = 'ps-skill-hub-card';
    hub.className = 'card';
    hub.style.cssText = 'border:2px solid #f4b41a;background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff;margin-bottom:12px;';
    hub.innerHTML = `
      <h3 style="margin:0 0 6px;color:#f4b41a;">👑 PumpSaathi AI Skill Store & UPI CRM</h3>
      <div style="font-size:12px;opacity:.9;margin-bottom:10px;">हर पेमेंट की कुंडली, Paytm-Style UPI हिसाब, नज़दीकी पंप लोकेटर और AI Avatars</div>
      <div class="btns">
        <button class="btn g" onclick="APP.go('skill_store')">🤖 AI Skill Store खोलें</button>
        <button class="btn o" onclick="APP.go('upi_hisab')">💳 UPI हिसाब & कुंडली</button>
        <button class="btn w" onclick="APP.go('nearest_pump')">📍 नज़दीकी पंप लोकेटर</button>
      </div>
    `;
    extra.insertBefore(hub, extra.firstChild);
  }

  // Also add PumpSaathi quick branding & Demo Pump switcher on login screen
  function enhanceLoginScreen() {
    const login = document.querySelector('.login');
    if (!login || document.getElementById('ps-login-badge')) return;
    const badge = document.createElement('div');
    badge.id = 'ps-login-badge';
    badge.style.cssText = 'text-align:center;margin-bottom:10px;';
    badge.innerHTML = `<span style="background:#0b3d91;color:#fff;font-size:11px;font-weight:800;padding:4px 12px;border-radius:999px;letter-spacing:.5px;">⚡ POWERED BY PUMPSAATHI OS</span>`;
    login.insertBefore(badge, login.firstChild);
  }

  setInterval(() => {
    injectMoreButtons();
    enhanceLoginScreen();
  }, 600);
})();
