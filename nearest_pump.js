/* =========================================================================
   NEAREST_PUMP.JS — GPS Nearest Fuel Station & Live Highway Rate Locator
   ========================================================================= */
(function () {
  'use strict';
  const APP = window.APP = window.APP || {};
  APP.views = APP.views || {};

  APP.views.nearest_pump = async function () {
    const main = document.querySelector('#main');
    if (!main) return;

    if (window.PS_SKILLS && !window.PS_SKILLS.isSkillActive('nearest_station')) {
      window.openSkillUnlockModal('nearest_station');
      return;
    }

    const pump = (window.CFG && window.CFG.pump) || {};
    const rates = (APP.S && APP.S.rates) || { petrol: 100.23, diesel: 95.68 };

    main.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg,#064e3b,#047857);color:#fff;">
        <h3 style="margin:0;color:#fff;">📍 नज़दीकी पेट्रोल पंप & लाइव रेट लोकेटर</h3>
        <div style="font-size:12px;opacity:.9;margin-top:4px;">हाईवे और फ्लीट ड्राइवरों के लिए लाइव GPS नेविगेशन और रेट कार्ड</div>
      </div>
      <div class="card">
        <b>⛽ ${pump.name || 'PumpSaathi Station'}</b>
        <div class="mut" style="font-size:12px;margin:4px 0 10px;">${pump.address || 'Highway Retail Outlet'}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
          <div style="background:#f8fafc;padding:10px;border-radius:10px;text-align:center;border:1px solid #e2e8f0;">
            <small class="mut">पेट्रोल (MS)</small><div style="font-size:18px;font-weight:800;color:#0b3d91;">₹${rates.petrol}</div>
          </div>
          <div style="background:#f8fafc;padding:10px;border-radius:10px;text-align:center;border:1px solid #e2e8f0;">
            <small class="mut">डीज़ल (HSD)</small><div style="font-size:18px;font-weight:800;color:#16a34a;">₹${rates.diesel}</div>
          </div>
        </div>
        <div class="btns">
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((pump.name || 'Petrol Pump') + ' ' + (pump.address || ''))}" target="_blank" class="btn g">🗺️ Google Maps पर खोलें</a>
          <button class="btn w" onclick="APP.go('more')">← वापस</button>
        </div>
      </div>
    `;
  };
})();
