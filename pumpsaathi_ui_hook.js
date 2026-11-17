/* =========================================================================
   PUMPSAATHI_UI_HOOK.JS — Main PumpSaathi + SuperAdmin Blank Gate + Demo Launcher
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
      <h3 style="margin:0 0 6px;color:#f4b41a;">👑 PumpSaathi AI Skill Store, UPI CRM & Logic Map</h3>
      <div style="font-size:12px;opacity:.9;margin-bottom:10px;">हर पेमेंट की कुंडली, Paytm-Style UPI हिसाब, नज़दीकी पंप लोकेटर और हर बटन का Core Logic</div>
      <div class="btns">
        <button class="btn g" onclick="APP.go('skill_store')">🤖 AI Skill Store</button>
        <button class="btn o" onclick="APP.go('upi_hisab')">💳 UPI हिसाब & कुंडली</button>
        <button class="btn w" onclick="APP.go('nearest_pump')">📍 नज़दीकी पंप</button>
        <button class="btn w" onclick="window.openDemoLogicExplorer && window.openDemoLogicExplorer()">🧠 Feature & Logic Map</button>
      </div>
    `;
    extra.insertBefore(hub, extra.firstChild);
  }

  function enhanceLoginScreen() {
    const login = document.querySelector('.login');
    if (!login) return;
    if (document.getElementById('ps-open-access-box')) return;

    const box = document.createElement('div');
    box.id = 'ps-open-access-box';
    box.style.cssText = 'margin-top:16px;padding:14px;background:linear-gradient(135deg,#071329,#0b3d91);border:1.5px solid #f4b41a;border-radius:16px;color:#fff;text-align:center;';
    box.innerHTML = `
      <div style="font-size:11px;font-weight:800;color:#f4b41a;letter-spacing:0.6px;margin-bottom:6px;">🧪 INTERACTIVE FEATURE & LOGIC DEMO</div>
      <div style="font-size:12px;color:#cbd5e1;margin-bottom:10px;">बिना किसी पंप डेटा को छेड़े ऐप के हर बटन और Core Logic को लाइव समझें:</div>
      <div style="display:grid;grid-template-columns:1fr;gap:8px;">
        <button id="btn-instant-mazda-demo" type="button" style="width:100%;padding:12px;border-radius:10px;border:none;background:#22c55e;color:#052e16;font-weight:800;font-size:13.5px;cursor:pointer;">
          🚀 Open Interactive Feature & Logic Demo (All Features + Logic Guide)
        </button>
      </div>
    `;
    login.appendChild(box);

    document.getElementById('btn-instant-mazda-demo').onclick = async () => {
      try {
        localStorage.setItem('ps_active_pump', 'mazda');
        if (window.firebase && firebase.auth && !firebase.auth().currentUser) {
          await firebase.auth().signInAnonymously();
        }
        localStorage.setItem('mazda_sess', JSON.stringify({ pid: 'mazda', role: 'owner', email: 'demo@pumpsaathi.in' }));
        const u = new URL(location.href);
        u.searchParams.set('p', 'mazda');
        location.href = u.toString();
      } catch (e) {
        alert('Demo error: ' + e.message);
      }
    };
  }

  setInterval(() => {
    injectMoreButtons();
    enhanceLoginScreen();
  }, 400);
})();
