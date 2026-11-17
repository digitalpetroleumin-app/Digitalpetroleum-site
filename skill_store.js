/* =========================================================================
   SKILL_STORE.JS — PumpSaathi AI Skill Store & Freemium Monetization Engine
   • Core App = 100% Free Forever (Nozzle, Shift Tally, Udhaar Khata, Salesman)
   • Advanced Skills = Locked with 3-Day Free Trial + Instant UPI Activation
   • Clean Interactive Voiceover (SpeechSynthesis) for every AI Avatar & Skill
   ========================================================================= */
(function () {
  'use strict';
  const APP = window.APP = window.APP || {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const SKILLS = [
    {
      id: "upi_hisab_kundali",
      name: "Paytm-Style Daily UPI Hisab & Customer Kundali",
      hindiName: "UPI पेमेंट हिसाब & ग्राहक कुंडली PRO",
      avatar: "Priya Verma (UPI & CRM Lead)",
      price: 249,
      icon: "💳",
      badge: "HOT SKILL",
      voiceText: "Namaste! Main Priya Verma hoon. Is skill se aapke pump ke har QR payment ka live record banega. Kisi bhi grahak ka naam, jaise Amar Sharma, search karte hi uski puri payment history aur kundali khul jayegi.",
      desc: "Live Paytm-for-Business style UPI dashboard, instant customer search ('Amar Sharma 5000'), complete customer payment kundali, and cash-back offer QR gateway."
    },
    {
      id: "cibil_fleet",
      name: "Transporter CIBIL & Fleet Fraud Shield",
      hindiName: "ट्रांसपोर्टर CIBIL & गाड़ी कंट्रोल",
      avatar: "Adv. Kabir Singh (Risk & Credit)",
      price: 249,
      icon: "🚛",
      badge: "POPULAR",
      voiceText: "Main Advocate Kabir Singh hoon. Naye transporter ko udhaar dene se pehle uska CIBIL score aur defaulter history check karein. Limit cross hote hi auto-lock lag jayega.",
      desc: "Check truck defaulter history across pumps, auto-lock credit limits, track empty vs loaded mileage, and send Section 138 legal reminders."
    },
    {
      id: "tanker_density",
      name: "Tanker Dip, ASTM 53B Density & Theft Detector",
      hindiName: "टैंकर डिप & डेंसिटी चोरी पकड़ो इंजन",
      avatar: "Chloe Taylor (Stock & Leakage Analyst)",
      price: 299,
      icon: "🛢️",
      badge: "HIGH ROI",
      voiceText: "Hello! Main Chloe hoon. Tanker aane par temperature aur hydrometer se 15 degree Celsius ki exact density check karein aur underground tank leakage ya chori turant pakdein.",
      desc: "Exact 15°C ASTM 53B density calculation, dip-to-meter shortage alerts, and underground tank evaporation monitoring."
    },
    {
      id: "jarvis_ai",
      name: "Jarvis Voice AI Assistant & Profit Analytics",
      hindiName: "Jarvis बोलने वाला AI & मुनाफा रिपोर्ट",
      avatar: "Ethan Brooks (360° AI Operations Head)",
      price: 349,
      icon: "🤖",
      badge: "AI COPILOT",
      voiceText: "Main Jarvis hoon. Aap mujhse bolkar pooch sakte hain ki aaj kitna diesel bika, kiska udhaar baaki hai, ya is mahine ka net profit kitna hua.",
      desc: "Hands-free Hindi/Hinglish voice queries, net dealer margin calculator, monthly P&L charts, and automated WhatsApp customer winback."
    },
    {
      id: "ca_tally",
      name: "1-Click Tally Prime XML & Party Portal",
      hindiName: "Tally XML एक्सपोर्ट & पार्टी पोर्टल",
      avatar: "CA Vikram Mehta (GST & Audit)",
      price: 199,
      icon: "📊",
      badge: "CA READY",
      voiceText: "Namaste! Main CA Vikram Mehta hoon. Ek click mein apne pump ka daily sales aur GST lube data Tally Prime XML mein export karein aur parties ko unka PDF statement bhejein.",
      desc: "Direct Tally Prime XML vouchers, GST split reports, and 6-digit login portal for credit customers to download their own PDF statements."
    },
    {
      id: "nearest_station",
      name: "Nearest Fuel Station & Live Highway Locator",
      hindiName: "नज़दीकी पेट्रोल पंप & लाइव रेट लोकेटर",
      avatar: "Tara Kapoor (Local SEO & Maps)",
      price: 149,
      icon: "📍",
      badge: "NEW",
      voiceText: "Main Tara Kapoor hoon. Highway par chalne wale drivers aur fleet owners ko aapke pump ki live location, distance aur petrol diesel rate dikha kar naye grahak laati hoon.",
      desc: "GPS-based nearest pump finder for fleet drivers, live fuel price display, and Google Maps 5-star review booster."
    }
  ];

  const PID = () => (window.PUMP_SYSTEM && window.PUMP_SYSTEM.activePumpId) || 'mazda';
  const LS_KEY = () => 'ps_unlocked_skills_' + PID();

  function getUnlockedMap() {
    try { return JSON.parse(localStorage.getItem(LS_KEY()) || '{}'); } catch (e) { return {}; }
  }
  function saveUnlockedMap(map) {
    try { localStorage.setItem(LS_KEY(), JSON.stringify(map)); } catch (e) {}
  }

  // Sync unlocked skills with Firestore pumps/{pid}/skills
  async function syncSkillsFromCloud() {
    const db = APP.db || (window.firebase && firebase.firestore());
    if (!db || PID() === 'mazda') return;
    try {
      const snap = await db.collection('skills').get();
      const map = getUnlockedMap();
      snap.forEach(doc => { map[doc.id] = doc.data(); });
      saveUnlockedMap(map);
    } catch (e) {}
  }

  function isSkillActive(skillId) {
    return true; // All features unlocked for every user & demo
    const map = getUnlockedMap();
    if (map['vip_all'] && map['vip_all'].expiresAt > Date.now()) return true;
    const item = map[skillId];
    return !!(item && item.expiresAt > Date.now());
  }

  function speakVoiceover(text) {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'hi-IN';
        u.rate = 0.98;
        window.speechSynthesis.speak(u);
      }
    } catch (e) {}
  }

  async function activateSkillRecord(skillId, days, mode) {
    const expiresAt = Date.now() + days * 86400000;
    const rec = { skillId, mode, activatedAt: Date.now(), expiresAt };
    const map = getUnlockedMap();
    map[skillId] = rec;
    saveUnlockedMap(map);

    const db = APP.db || (window.firebase && firebase.firestore());
    if (db) {
      try { await db.collection('skills').doc(skillId).set(rec, { merge: true }); } catch (e) {}
    }
  }

  window.PS_SKILLS = { SKILLS, isSkillActive, speakVoiceover, syncSkillsFromCloud };

  // Prompt Modal when clicking a locked skill
  window.openSkillUnlockModal = function (skillId) {
    const sk = SKILLS.find(x => x.id === skillId) || SKILLS[0];
    const superUpi = (window.CFG && window.CFG.superAdminUpi) || "neerajdevnik-2@okhdfcbank";
    const upiLink = `upi://pay?pa=${encodeURIComponent(superUpi)}&pn=${encodeURIComponent('PumpSaathi AI Store')}&am=${sk.price}&cu=INR&tn=${encodeURIComponent('Skill ' + sk.id)}`;

    const m = (APP.modal || function (h) {
      const d = document.createElement('div');
      d.innerHTML = `<div style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;"><div style="background:#0a1830;border:2px solid #f4b41a;border-radius:20px;padding:20px;color:#fff;max-width:400px;width:100%;">${h}</div></div>`;
      document.body.appendChild(d);
      return { close: () => d.remove() };
    })(`
      <div style="text-align:center;">
        <div style="font-size:38px;">${sk.icon}</div>
        <span style="background:#f4b41a;color:#000;font-size:10px;font-weight:800;padding:3px 10px;border-radius:999px;">${sk.badge}</span>
        <h3 style="margin:8px 0 4px;color:#fff;font-size:18px;">${esc(sk.hindiName)}</h3>
        <div style="font-size:12px;color:#38bdf8;font-weight:700;margin-bottom:10px;">🤖 ${esc(sk.avatar)}</div>
        <button id="sk-voice-btn" style="background:rgba(56,189,248,0.15);border:1px solid #38bdf8;color:#7dd3fc;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;margin-bottom:12px;">🔊 आवाज़ में सुनें (Voiceover)</button>
        <p style="font-size:13px;color:#cbd5e1;background:rgba(255,255,255,0.05);padding:12px;border-radius:12px;text-align:left;line-height:1.5;margin-bottom:14px;">${esc(sk.desc)}</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <button id="sk-trial-btn" style="background:#1e293b;border:1px solid #38bdf8;color:#fff;padding:11px 8px;border-radius:10px;font-weight:700;font-size:12px;cursor:pointer;">🎁 3-Day Free Trial</button>
          <a href="${upiLink}" id="sk-buy-btn" style="background:#22c55e;color:#052e16;padding:11px 8px;border-radius:10px;font-weight:800;font-size:12px;text-decoration:none;display:flex;align-items:center;justify-content:center;">⚡ Unlock ₹${sk.price}/mo</a>
        </div>
        <button id="sk-vip-btn" style="width:100%;background:linear-gradient(135deg,#f4b41a,#d99700);color:#000;border:none;padding:11px;border-radius:10px;font-weight:800;font-size:13px;cursor:pointer;margin-bottom:8px;">👑 Unlock ALL Skills VIP Bundle (₹799/mo)</button>
        <button id="sk-close" style="width:100%;background:transparent;color:#94a3b8;border:none;padding:6px;font-size:12px;cursor:pointer;">बंद करें</button>
      </div>
    `);

    setTimeout(() => {
      const vb = document.getElementById('sk-voice-btn');
      if (vb) vb.onclick = () => speakVoiceover(sk.voiceText);
      const tb = document.getElementById('sk-trial-btn');
      if (tb) tb.onclick = async () => {
        await activateSkillRecord(sk.id, 3, 'trial');
        if (APP.toast) APP.toast('🎉 3-Day Free Trial चालू हो गया!');
        m.close();
        if (APP.views && APP.views.skill_store) APP.views.skill_store();
      };
      const bb = document.getElementById('sk-buy-btn');
      if (bb) bb.onclick = async () => {
        await activateSkillRecord(sk.id, 30, 'paid');
        if (APP.toast) APP.toast('✅ पेमेंट वेरिफाई! Skill 30 दिनों के लिए अनलॉक हो गई।');
        m.close();
      };
      const vipb = document.getElementById('sk-vip-btn');
      if (vipb) vipb.onclick = async () => {
        window.open(`upi://pay?pa=${encodeURIComponent(superUpi)}&pn=PumpSaathi%20VIP&am=799&cu=INR&tn=VIP_ALL_SKILLS`, '_blank');
        await activateSkillRecord('vip_all', 30, 'vip_paid');
        if (APP.toast) APP.toast('👑 VIP Bundle अनलॉक! सभी 20 AI Skills चालू हो गईं।');
        m.close();
      };
      const cb = document.getElementById('sk-close');
      if (cb) cb.onclick = () => m.close();
    }, 80);
  };

  // Dedicated Skill Store View inside App
  APP.views = APP.views || {};
  APP.views.skill_store = async function () {
    const main = document.querySelector('#main');
    if (!main) return;
    await syncSkillsFromCloud();
    const map = getUnlockedMap();

    let html = `
      <div class="card" style="background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff;">
        <h3 style="margin:0;color:#f4b41a;">🤖 PumpSaathi AI Skill Store</h3>
        <div style="font-size:12px;opacity:.9;margin-top:4px;">बेस ऐप 100% फ्री है। अपनी ज़रूरत के हिसाब से AI Avatars और Pro Skills अनलॉक करें।</div>
        <button onclick="openSkillUnlockModal('upi_hisab_kundali')" class="btn sm" style="margin-top:10px;background:#f4b41a;color:#000;font-weight:800;">👑 All-in-One VIP Bundle (₹799/mo)</button>
      </div>
    `;

    SKILLS.forEach(sk => {
      const active = isSkillActive(sk.id);
      const exp = map[sk.id] ? new Date(map[sk.id].expiresAt).toLocaleDateString('en-IN') : '';
      html += `
        <div class="card" style="border-left:4px solid ${active ? '#16a34a' : '#f4b41a'};">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
            <div style="flex:1;">
              <div style="font-size:11px;font-weight:700;color:#2563eb;">${esc(sk.avatar)}</div>
              <b style="font-size:15px;">${sk.icon} ${esc(sk.hindiName)}</b>
              <p class="mut" style="font-size:12px;margin:4px 0 8px;">${esc(sk.desc)}</p>
              ${active ? `<span class="chip g">✔ अनलॉक (Valid till ${exp || 'Lifetime'})</span>` : `<span class="chip o">🔒 ₹${sk.price}/माह · 3-Day Free Trial</span>`}
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <button class="btn sm w" onclick="window.PS_SKILLS.speakVoiceover('${esc(sk.voiceText).replace(/'/g, "\'")}')">🔊 सुनें</button>
              <button class="btn sm ${active ? 'g' : 'o'}" onclick="openSkillUnlockModal('${sk.id}')">${active ? 'खोलें' : 'अनलॉक'}</button>
            </div>
          </div>
        </div>
      `;
    });

    html += `<div class="btns"><button class="btn w" onclick="APP.go('more')">← वापस</button></div>`;
    main.innerHTML = html;
  };
})();
