/* =========================================================================
   PUMPSAATHI_UI_HOOK.JS — Main PumpSaathi Login + 1-Click Open Access + Mazda Demo
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

  function enhanceLoginScreen() {
    const login = document.querySelector('.login');
    if (!login) return;

    // Ensure main login displays PumpSaathi branding cleanly (unless Mazda Demo is explicitly active)
    const activePid = (window.PUMP_SYSTEM && window.PUMP_SYSTEM.activePumpId) || 'pumpsaathi_main';
    const titleEl = login.querySelector('.pump-title-dyn');
    const logoEl = login.querySelector('.login-logo');
    if (activePid !== 'mazda') {
      if (titleEl && /माज़दा|mazda/i.test(titleEl.textContent)) {
        titleEl.textContent = 'PumpSaathi — पंप साथी';
      }
      if (logoEl) {
        logoEl.style.borderRadius = '22px';
        logoEl.style.width = '140px';
        logoEl.style.height = '140px';
        logoEl.style.objectFit = 'cover';
      }
    }

    if (document.getElementById('ps-open-access-box')) return;

    const box = document.createElement('div');
    box.id = 'ps-open-access-box';
    box.style.cssText = 'margin-top:16px;padding:14px;background:linear-gradient(135deg,#071329,#0b3d91);border:1.5px solid #f4b41a;border-radius:16px;color:#fff;text-align:center;';
    box.innerHTML = `
      <div style="font-size:11px;font-weight:800;color:#f4b41a;letter-spacing:0.6px;margin-bottom:6px;">⚡ INSTANT ACCESS · ALL FEATURES UNLOCKED</div>
      <div style="font-size:12px;color:#cbd5e1;margin-bottom:10px;">बिना किसी रुकावट के PumpSaathi के सभी फीचर्स (हिसाब, खाते, स्टॉक, AI, CIBIL, UPI) सीधे चलाएं:</div>
      <div style="display:grid;grid-template-columns:1fr;gap:8px;">
        <button id="btn-instant-pumpsaathi" type="button" style="width:100%;padding:12px;border-radius:10px;border:none;background:#22c55e;color:#052e16;font-weight:800;font-size:14px;cursor:pointer;">
          🚀 1-Click Login (PumpSaathi Full App)
        </button>
        <button id="btn-instant-mazda-demo" type="button" style="width:100%;padding:10px;border-radius:10px;border:1px solid #f4b41a;background:rgba(244,180,26,0.15);color:#fde68a;font-weight:700;font-size:12.5px;cursor:pointer;">
          ⛽ Live Pump Demo: Mazda Oil Company (3-Month Data)
        </button>
      </div>
    `;
    login.appendChild(box);

    if (!document.getElementById('ps-trust-proof-box')) {
      const pbox = document.createElement('div');
      pbox.id = 'ps-trust-proof-box';
      pbox.style.cssText = 'margin-top:14px;padding:12px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;font-size:11.5px;color:#334155;line-height:1.5;text-align:left;';
      pbox.innerHTML = `
        <div style="font-weight:800;color:#0b3d91;margin-bottom:4px;">🛡️ Trust & Standards</div>
        <div>✅ <b>Battle-Tested Live:</b> Running daily operations at Mazda Oil Company (BPCL Dealer, Almora, Uttarakhand)</div>
        <div>✅ <b>Zero Lock-In Guarantee:</b> 1-Click Full Data Export (JSON + Excel/CSV) in every plan</div>
        <div>✅ <b>CA Ready:</b> Monthly CA Report (Excel/PDF) for your accountant</div>
        <div>✅ <b>Density & Tanker Audit:</b> Built-in ASTM 53B-based 15°C density correction & tanker shortage check</div>
      `;
      login.appendChild(pbox);
    }


    document.getElementById('btn-instant-pumpsaathi').onclick = async () => {
      try {
        localStorage.setItem('ps_active_pump', 'pumpsaathi_main');
        localStorage.setItem('mazda_sess', JSON.stringify({ pid: 'pumpsaathi_main', role: 'owner', email: 'owner@pumpsaathi.in' }));
        try {
          if (window.firebase && firebase.auth && !firebase.auth().currentUser) {
            await firebase.auth().signInAnonymously();
          }
        } catch (authErr) { console.warn('[PumpSaathi] anonymous sign-in skipped:', authErr && authErr.message); }
        // पुराना ?p=mazda हटाकर साफ़ PumpSaathi URL पर reload
        const u = new URL(location.href);
        u.searchParams.delete('p'); u.searchParams.delete('pump');
        location.href = u.toString();
      } catch (e) {
        alert('Login error: ' + e.message);
      }
    };

    document.getElementById('btn-instant-mazda-demo').onclick = async () => {
      try {
        localStorage.setItem('ps_active_pump', 'mazda');
        if (window.firebase && firebase.auth && !firebase.auth().currentUser) {
          await firebase.auth().signInAnonymously();
        }
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
