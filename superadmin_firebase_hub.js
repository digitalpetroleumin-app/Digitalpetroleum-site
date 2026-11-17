/* =========================================================================
   SUPERADMIN_FIREBASE_HUB.JS
   1. Exclusive SuperAdmin Logo & Login when no pump is created/selected (Blank Mode)
   2. Easy 1-Step New Pump + Dedicated Firebase Project Connector
   3. Automatic Firestore Rules Generator & Rule Editor for the Pump's Firebase
   4. Direct Firebase Auth Account Creator for Pump Owner & Manager
   ========================================================================= */
(function () {
  'use strict';

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // SuperAdmin Crown Emblem SVG Data URI
  const SUPERADMIN_LOGO = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#040b19"/>
          <stop offset="100%" stop-color="#0b3d91"/>
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fde68a"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#b45309"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="44" fill="url(#bg)"/>
      <circle cx="100" cy="100" r="82" fill="none" stroke="url(#gold)" stroke-width="5"/>
      <path d="M52 124 L64 76 L88 98 L100 66 L112 98 L136 76 L148 124 Z" fill="url(#gold)"/>
      <rect x="52" y="130" width="96" height="12" rx="6" fill="url(#gold)"/>
      <text x="100" y="164" font-family="Arial,sans-serif" font-weight="900" font-size="16" fill="#fde68a" text-anchor="middle" letter-spacing="1.5">SUPERADMIN</text>
    </svg>
  `);
  window.SUPERADMIN_LOGO = SUPERADMIN_LOGO;

  function getRegistry() {
    try { return JSON.parse(localStorage.getItem('ps_pumps_registry') || '{}'); } catch (e) { return {}; }
  }
  function saveRegistry(reg) {
    try { localStorage.setItem('ps_pumps_registry', JSON.stringify(reg)); } catch (e) {}
  }

  // Parse pasted Firebase Config (supports raw JS snippet `const firebaseConfig = { ... }` OR pure JSON)
  function parseFirebaseConfigInput(rawText) {
    const txt = String(rawText || '').trim();
    if (!txt) throw new Error('Firebase Config खाली है!');
    // Try pure JSON first
    try {
      const obj = JSON.parse(txt);
      if (obj.apiKey && obj.projectId) return obj;
    } catch (e) {}

    // Extract key-value pairs from JS object snippet
    const keys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId', 'databaseURL'];
    const out = {};
    keys.forEach(k => {
      const rx = new RegExp(k + `\s*:\s*["']([^"']+)["']`);
      const m = txt.match(rx);
      if (m) out[k] = m[1].trim();
    });
    if (!out.apiKey || !out.projectId) {
      throw new Error('Firebase Config में apiKey और projectId नहीं मिले। Firebase Console → Project Settings से पूरा firebaseConfig पेस्ट करें।');
    }
    return out;
  }

  // Generate tailored Firestore Rules for a dedicated Pump Firebase Project
  function buildFirestoreRulesForPump(pumpMeta) {
    const ownerEm = (pumpMeta.ownerEmail || 'owner@pump.in').toLowerCase();
    const mgrEm = (pumpMeta.managerEmail || 'manager@pump.in').toLowerCase();
    const superRe = 'neerajdevnik@gmail.com|neeraj@mazda.in|neeraj@mazda-pump.in';
    const allowWriteRoles = pumpMeta.managerFullEdit
      ? `isSuperAdmin() || isOwner() || isManager()`
      : `isSuperAdmin() || isOwner()`;

    return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    function userEmail() {
      return request.auth.token.email != null ? request.auth.token.email.lower() : '';
    }
    function isSuperAdmin() {
      return isSignedIn() && userEmail().matches('${superRe}');
    }
    function isOwner() {
      return isSignedIn() && userEmail() == '${ownerEm}';
    }
    function isManager() {
      return isSignedIn() && userEmail() == '${mgrEm}';
    }

    // Pump Metadata & Rules Config
    match /config/{docId} {
      allow read: if isSignedIn();
      allow write: if isSuperAdmin() || isOwner();
    }

    // Daily Hisab (Submitted/Locked days protected from Manager edits)
    match /days/{dateId} {
      allow read: if isSignedIn();
      allow create, update: if isSuperAdmin() || isOwner() || (isManager() && (!exists(/databases/$(database)/documents/days/$(dateId)) || resource.data.status != 'submitted'));
      allow delete: if isSuperAdmin();
    }

    // Party & Bank Ledgers
    match /parties/{partyId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn();
      allow delete: if ${allowWriteRoles};
    }
    match /ledger/{entryId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if ${allowWriteRoles};
    }

    // Tanker Invoices, Density Logs, Workers & Audit
    match /tanker_invoices/{id} { allow read, write: if isSignedIn(); }
    match /tanker_reports/{id} { allow read, write: if isSignedIn(); }
    match /density_log/{id} { allow read, write: if isSignedIn(); }
    match /workers/{id} { allow read, write: if isSuperAdmin() || isOwner() || isManager(); }
    match /attendance/{id} { allow read, write: if isSignedIn(); }
    match /audit/{id} {
      allow read: if isSuperAdmin() || isOwner();
      allow create: if isSignedIn();
      allow update, delete: if false; // Immutable audit trail
    }
  }
}`;
  }

  // Create Owner & Manager users inside the Pump's Dedicated Firebase Project using a secondary app instance
  async function provisionPumpFirebaseUsers(fbConfig, ownerEmail, ownerPass, managerEmail, managerPass) {
    const appName = 'provision_' + Date.now();
    const secApp = firebase.initializeApp(fbConfig, appName);
    const secAuth = secApp.auth();
    const secDb = secApp.firestore();
    const results = [];

    try {
      if (ownerEmail && ownerPass) {
        try {
          await secAuth.createUserWithEmailAndPassword(ownerEmail, ownerPass);
          results.push('👑 Owner Firebase Login बनाया गया: ' + ownerEmail);
        } catch (e) {
          if (e.code === 'auth/email-already-in-use') results.push('👑 Owner Email पहले से Firebase में मौजूद है: ' + ownerEmail);
          else results.push('⚠️ Owner Auth Error: ' + e.message);
        }
      }
      if (managerEmail && managerPass) {
        try {
          await secAuth.createUserWithEmailAndPassword(managerEmail, managerPass);
          results.push('💼 Manager Firebase Login बनाया गया: ' + managerEmail);
        } catch (e) {
          if (e.code === 'auth/email-already-in-use') results.push('💼 Manager Email पहले से Firebase में मौजूद है: ' + managerEmail);
          else results.push('⚠️ Manager Auth Error: ' + e.message);
        }
      }
      // Seed initial pump profile in the new Firebase project
      await secDb.collection('config').doc('pump_profile').set({
        ownerEmail: ownerEmail || '',
        managerEmail: managerEmail || '',
        initializedAt: new Date().toISOString()
      }, { merge: true });
    } finally {
      try { await secAuth.signOut(); } catch (e) {}
      try { await secApp.delete(); } catch (e) {}
    }
    return results;
  }

  // Open SuperAdmin Dedicated New Pump + Firebase Connector Wizard Modal
  window.openSuperAdminPumpWizard = function (editSlug) {
    const reg = getRegistry();
    const existing = editSlug ? reg[editSlug] : null;
    const defaultRules = existing ? (existing.customRules || buildFirestoreRulesForPump(existing)) : buildFirestoreRulesForPump({});

    const m = (window.APP && window.APP.modal) ? window.APP.modal(`
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <img src="${SUPERADMIN_LOGO}" style="width:44px;height:44px;border-radius:12px;">
        <div>
          <h3 style="margin:0;color:#0b3d91;">${existing ? '⚙️ पंप & Firebase सेटिंग बदलें' : '👑 नया पंप + नया Firebase जोड़ें'}</h3>
          <div class="mut" style="font-size:11.5px;">हर पंप का अपना अलग Firebase Database, Auth Login और Security Rules</div>
        </div>
      </div>

      <div style="background:#f0f7ff;border:1px solid #bae6fd;border-radius:10px;padding:10px;font-size:12px;margin-bottom:10px;color:#0369a1;">
        <b>आसान तरीका:</b> Firebase Console में नया प्रोजेक्ट बनाएं → Web App जोड़ें → नीचे <b>firebaseConfig</b> पेस्ट करें। Owner और Manager के Firebase Login यहीं से 1-क्लिक में बन जाएंगे!
      </div>

      <div class="row">
        <div><label>पंप का नाम (हिंदी/English) *</label><input id="sa-pname" value="${esc(existing ? existing.name : '')}" placeholder="जैसे: शर्मा फिलिंग स्टेशन"></div>
        <div><label>Pump ID (URL कोड) *</label><input id="sa-pslug" value="${esc(existing ? existing.slug : '')}" ${existing ? 'readonly style="background:#eee"' : ''} placeholder="जैसे: sharma-pump"></div>
      </div>

      <div class="row">
        <div><label>OMC ब्रांड</label>
          <select id="sa-pbrand">
            <option value="bpcl" ${existing && existing.brand === 'bpcl' ? 'selected' : ''}>BPCL (Bharat Petroleum)</option>
            <option value="iocl" ${existing && existing.brand === 'iocl' ? 'selected' : ''}>IOCL (IndianOil)</option>
            <option value="hpcl" ${existing && existing.brand === 'hpcl' ? 'selected' : ''}>HPCL (Hindustan Petroleum)</option>
            <option value="nayara" ${existing && existing.brand === 'nayara' ? 'selected' : ''}>Nayara Energy</option>
            <option value="jiobp" ${existing && existing.brand === 'jiobp' ? 'selected' : ''}>Jio-bp</option>
          </select>
        </div>
        <div><label>पता / शहर</label><input id="sa-paddr" value="${esc(existing ? existing.address : '')}" placeholder="शहर, राज्य"></div>
      </div>

      <label style="color:#0b3d91;font-weight:800;margin-top:10px;">🔥 Step 1: पंप का नया Firebase Config पेस्ट करें *</label>
      <textarea id="sa-fbcfg" rows="4" style="font-family:monospace;font-size:11.5px;" placeholder='const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-pump.firebaseapp.com",
  projectId: "your-pump",
  ...
};'>${esc(existing && existing.firebaseConfig ? JSON.stringify(existing.firebaseConfig, null, 2) : '')}</textarea>

      <label style="color:#0b3d91;font-weight:800;margin-top:10px;">🔐 Step 2: Owner & Manager का Firebase Login बनाएं</label>
      <div class="row">
        <div><label>👑 Owner Email (Firebase Auth)</label><input id="sa-ow-em" type="email" value="${esc(existing ? existing.ownerEmail : '')}" placeholder="owner@sharmapump.in"></div>
        <div><label>👑 Owner Password (6+ अक्षर)</label><input id="sa-ow-pw" type="password" placeholder="${existing ? 'बदलना हो तो लिखें' : 'कम से कम 6 अक्षर'}"></div>
      </div>
      <div class="row">
        <div><label>💼 Manager Email (Firebase Auth)</label><input id="sa-mg-em" type="email" value="${esc(existing ? existing.managerEmail : '')}" placeholder="manager@sharmapump.in"></div>
        <div><label>💼 Manager Password (6+ अक्षर)</label><input id="sa-mg-pw" type="password" placeholder="${existing ? 'बदलना हो तो लिखें' : 'कम से कम 6 अक्षर'}"></div>
      </div>

      <label style="color:#0b3d91;font-weight:800;margin-top:10px;">🛡️ Step 3: इस पंप के Firebase Security Rules (SuperAdmin कंट्रोल)</label>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
        <label style="display:flex;align-items:center;gap:6px;margin:0;font-size:12px;">
          <input type="checkbox" id="sa-mgr-edit" ${existing && existing.managerFullEdit ? 'checked' : ''} style="width:auto;"> Manager को पुराने दिन एडिट की अनुमति दें
        </label>
        <button type="button" id="sa-regen-rules" class="btn sm w">🔄 Rules अपडेट करें</button>
      </div>
      <textarea id="sa-rules-box" rows="6" style="font-family:monospace;font-size:11px;background:#0f172a;color:#38bdf8;">${esc(defaultRules)}</textarea>
      <div class="btns" style="margin-top:6px;">
        <button type="button" id="sa-copy-rules" class="btn sm o">📋 Firestore Rules कॉपी करें (Firebase Console में पेस्ट करने के लिए)</button>
      </div>

      <div id="sa-wiz-status" style="margin-top:10px;"></div>

      <div class="btns" style="margin-top:12px;">
        <button type="button" id="sa-save-pump" class="btn g">✅ पंप जोड़ें & Firebase से कनेक्ट करें</button>
        <button type="button" id="sa-close-wiz" class="btn w">बंद करें</button>
      </div>
    `) : null;

    if (!m) return;
    const q = id => m.querySelector('#' + id);

    q('sa-close-wiz').onclick = () => m.close();

    const refreshRules = () => {
      const meta = {
        ownerEmail: q('sa-ow-em').value.trim(),
        managerEmail: q('sa-mg-em').value.trim(),
        managerFullEdit: q('sa-mgr-edit').checked
      };
      q('sa-rules-box').value = buildFirestoreRulesForPump(meta);
    };
    q('sa-regen-rules').onclick = () => { refreshRules(); window.APP.toast && window.APP.toast('Rules अपडेट हो गए ✔'); };
    q('sa-copy-rules').onclick = async () => {
      try {
        await navigator.clipboard.writeText(q('sa-rules-box').value);
        window.APP.toast && window.APP.toast('📋 Firestore Rules कॉपी हो गए! Firebase Console → Firestore → Rules में पेस्ट कर दें।');
      } catch (e) {
        q('sa-rules-box').select();
        document.execCommand('copy');
        window.APP.toast && window.APP.toast('Rules कॉपी हो गए ✔');
      }
    };

    q('sa-save-pump').onclick = async () => {
      const name = q('sa-pname').value.trim();
      const slug = q('sa-pslug').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      const brand = q('sa-pbrand').value;
      const address = q('sa-paddr').value.trim();
      const ownerEmail = q('sa-ow-em').value.trim().toLowerCase();
      const ownerPass = q('sa-ow-pw').value;
      const managerEmail = q('sa-mg-em').value.trim().toLowerCase();
      const managerPass = q('sa-mg-pw').value;
      const managerFullEdit = q('sa-mgr-edit').checked;
      const customRules = q('sa-rules-box').value;

      if (!name) return alert('पंप का नाम लिखें');
      if (!slug || slug.length < 3) return alert('सही Pump ID लिखें (कम से कम 3 अक्षर, जैसे: sharma-pump)');

      let fbConfig;
      try {
        fbConfig = parseFirebaseConfigInput(q('sa-fbcfg').value);
      } catch (err) {
        return alert(err.message);
      }

      const btn = q('sa-save-pump');
      btn.disabled = true;
      btn.textContent = '⏳ Firebase से कनेक्ट हो रहा है...';
      const statusBox = q('sa-wiz-status');

      try {
        // Provision Owner & Manager in the new Firebase project's Auth
        const provLogs = await provisionPumpFirebaseUsers(fbConfig, ownerEmail, ownerPass, managerEmail, managerPass);

        const pumpRecord = {
          slug,
          name,
          nameEn: name,
          brand,
          address,
          addressEn: address,
          ownerEmail,
          managerEmail,
          managerFullEdit,
          firebaseConfig: fbConfig,
          customRules,
          updatedAt: new Date().toISOString()
        };

        // Save in local registry AND Master SuperAdmin Firestore (if signed in as SuperAdmin)
        const registry = getRegistry();
        registry[slug] = pumpRecord;
        saveRegistry(registry);

        try {
          if (window.APP && window.APP.db && window.APP.isTrueOwner && window.APP.isTrueOwner()) {
            await firebase.firestore().collection('pumps').doc(slug).set(pumpRecord, { merge: true });
          }
        } catch (e) {}

        statusBox.innerHTML = `
          <div class="ok" style="font-size:12.5px;line-height:1.6;">
            <b>✅ "${esc(name)}" सफलतापूर्वक जुड़ गया!</b><br>
            🔥 Connected Firebase Project: <b>${esc(fbConfig.projectId)}</b><br>
            ${provLogs.map(l => esc(l)).join('<br>')}<br>
            <div style="margin-top:8px;">
              <button type="button" id="sa-launch-now" class="btn sm g">🚀 इस पंप को अभी खोलें</button>
            </div>
          </div>
        `;
        btn.disabled = false;
        btn.textContent = '✅ सेव हो गया';

        const launchBtn = document.getElementById('sa-launch-now');
        if (launchBtn) {
          launchBtn.onclick = () => {
            localStorage.setItem('ps_active_pump', slug);
            const u = new URL(location.href);
            u.searchParams.set('p', slug);
            location.href = u.toString();
          };
        }
      } catch (e) {
        btn.disabled = false;
        btn.textContent = '✅ पंप जोड़ें & Firebase से कनेक्ट करें';
        statusBox.innerHTML = `<div class="err">❌ त्रुटि: ${esc(e.message)}</div>`;
      }
    };
  };

  // Enforce Exclusive SuperAdmin Login Screen when NO pump is active (Blank Mode)
  function enforceSuperAdminBlankGate() {
    const login = document.querySelector('.login');
    if (!login) return;

    const activeSlug = (window.CFG && window.CFG.activePumpSlug) || localStorage.getItem('ps_active_pump') || '';
    const reg = getRegistry();
    const hasConfiguredPump = !!(activeSlug && reg[activeSlug]);

    // Always inject SuperAdmin Console Bar on Login Screen if SuperAdmin is logged in or wants to manage pumps
    if (!hasConfiguredPump && !document.getElementById('sa-blank-mode-banner')) {
      // Replace login logo with SuperAdmin Crown Logo
      const logoImg = login.querySelector('.login-logo');
      if (logoImg) {
        logoImg.src = SUPERADMIN_LOGO;
        logoImg.style.borderRadius = '24px';
        logoImg.style.width = '116px';
        logoImg.style.height = '116px';
      }

      const titleEl = login.querySelector('.pump-title-dyn');
      if (titleEl) titleEl.textContent = 'PumpSaathi SuperAdmin';

      const subEl = login.querySelector('p.mut');
      if (subEl) subEl.innerHTML = 'अभी कोई पंप नहीं जुड़ा है (Blank State) · केवल <b>SuperAdmin</b> लॉगिन कर सकता है';

      // Hide Salesman & Viewer tabs in Blank Mode — only SuperAdmin can log in until a pump is added!
      const seg = login.querySelector('.seg');
      if (seg) seg.style.display = 'none';
      const tabManBtn = login.querySelector('#tab-man');
      if (tabManBtn) tabManBtn.textContent = '👑 SuperAdmin Login';

      const emLabel = login.querySelector('label');
      if (emLabel) emLabel.textContent = 'SuperAdmin Email';
      const emInput = login.querySelector('#em');
      if (emInput) emInput.placeholder = 'neerajdevnik@gmail.com';

      const banner = document.createElement('div');
      banner.id = 'sa-blank-mode-banner';
      banner.style.cssText = 'margin-top:12px;padding:10px;background:#fffbeb;border:1px solid #f59e0b;border-radius:10px;font-size:12px;color:#92400e;text-align:center;';
      banner.innerHTML = '🔒 <b>Blank Mode Active:</b> Manager और Owner लॉगिन तब तक बंद हैं जब तक SuperAdmin नया पंप और उसका Firebase नहीं जोड़ता।';
      const formMan = login.querySelector('#form-man');
      if (formMan) formMan.prepend(banner);
    } else if (hasConfiguredPump && !document.getElementById('sa-pump-connected-badge')) {
      const pMeta = reg[activeSlug];
      const badge = document.createElement('div');
      badge.id = 'sa-pump-connected-badge';
      badge.style.cssText = 'margin:8px 0;padding:8px 10px;background:#eff6ff;border:1px solid #93c5fd;border-radius:10px;font-size:11.5px;color:#1e40af;display:flex;justify-content:space-between;align-items:center;';
      badge.innerHTML = `
        <span>🔥 Firebase: <b>${esc(pMeta.firebaseConfig?.projectId || 'Connected')}</b></span>
        <button type="button" id="sa-switch-blank" style="background:#1e3a8a;color:#fff;border:none;padding:4px 8px;border-radius:6px;font-size:10.5px;cursor:pointer;">👑 SuperAdmin</button>
      `;
      const titleEl = login.querySelector('.pump-title-dyn');
      if (titleEl) titleEl.after(badge);
      const swBtn = document.getElementById('sa-switch-blank');
      if (swBtn) {
        swBtn.onclick = () => {
          localStorage.removeItem('ps_active_pump');
          const u = new URL(location.href);
          u.searchParams.delete('p');
          u.searchParams.delete('pump');
          location.href = u.toString();
        };
      }
    }
  }

  // Inject SuperAdmin Pump & Firebase Manager Card inside the App ("More" tab) when SuperAdmin is logged in
  function injectSuperAdminDashboardCard() {
    const main = document.querySelector('#main');
    if (!main) return;
    const isSuper = (window.APP && window.APP.isTrueOwner && window.APP.isTrueOwner()) ||
      ((window.APP && window.APP.S && window.APP.S.user && window.APP.S.user.email || '').toLowerCase().includes('neeraj'));
    if (!isSuper) return;

    const onMore = document.querySelector('nav button[data-tab="more"].on, nav button[data-tab="more"].active');
    if (!onMore) return;
    if (document.getElementById('sa-multi-firebase-card')) return;

    const reg = getRegistry();
    const slugs = Object.keys(reg);
    const activeSlug = (window.CFG && window.CFG.activePumpSlug) || localStorage.getItem('ps_active_pump') || '';

    const card = document.createElement('div');
    card.id = 'sa-multi-firebase-card';
    card.className = 'card';
    card.style.cssText = 'background:linear-gradient(135deg,#040b19,#0b3d91);border:2px solid #f4b41a;color:#fff;margin-bottom:14px;';
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <img src="${SUPERADMIN_LOGO}" style="width:48px;height:48px;border-radius:12px;">
        <div>
          <b style="color:#fde68a;font-size:16px;">👑 SuperAdmin Multi-Firebase Control</b>
          <div style="font-size:11.5px;color:#cbd5e1;">नया पंप बनाएं, अलग Firebase जोड़ें, Rules बदलें और Owner/Manager लॉगिन बनाएं</div>
        </div>
      </div>

      <button type="button" id="sa-btn-add-pump" class="btn g full" style="margin-bottom:10px;">
        ➕ नया पंप जोड़ें + नया Firebase कनेक्ट करें
      </button>

      <div style="font-size:12px;font-weight:700;color:#fde68a;margin-bottom:6px;">
        📋 जुड़े हुए पंप (${slugs.length}):
      </div>
      <div id="sa-pump-list" style="display:flex;flex-direction:column;gap:6px;">
        ${slugs.length ? slugs.map(s => {
          const p = reg[s];
          const isCur = s === activeSlug;
          return `
            <div style="background:rgba(255,255,255,0.08);border:1px solid ${isCur ? '#22c55e' : 'rgba(255,255,255,0.15)'};border-radius:10px;padding:10px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <div style="min-width:0;">
                <b style="color:#fff;font-size:13.5px;">${esc(p.name)}</b> ${isCur ? '<span class="chip g" style="font-size:10px;">Active</span>' : ''}
                <div style="font-size:11px;color:#93c5fd;">🔥 Project: ${esc(p.firebaseConfig?.projectId || 'Master')} · Owner: ${esc(p.ownerEmail || '—')}</div>
              </div>
              <div style="display:flex;gap:5px;flex:none;">
                <button type="button" class="btn sm g sa-open-p" data-slug="${esc(s)}">खोलें</button>
                <button type="button" class="btn sm o sa-edit-p" data-slug="${esc(s)}">⚙️ Rules/Edit</button>
              </div>
            </div>
          `;
        }).join('') : '<div style="font-size:12px;color:#94a3b8;padding:8px;background:rgba(0,0,0,0.2);border-radius:8px;">अभी कोई पंप नहीं जुड़ा है (Blank State)। ऊपर बटन दबाकर पहला पंप जोड़ें।</div>'}
      </div>

      ${activeSlug ? `
        <button type="button" id="sa-btn-reset-blank" class="btn sm w full" style="margin-top:10px;">
          🔄 Blank Mode पर वापस जाएं (कोई पंप सिलेक्ट न रखें)
        </button>
      ` : ''}
    `;

    main.insertBefore(card, main.firstChild);

    document.getElementById('sa-btn-add-pump').onclick = () => window.openSuperAdminPumpWizard(null);
    card.querySelectorAll('.sa-open-p').forEach(b => {
      b.onclick = () => {
        const s = b.dataset.slug;
        localStorage.setItem('ps_active_pump', s);
        const u = new URL(location.href);
        u.searchParams.set('p', s);
        location.href = u.toString();
      };
    });
    card.querySelectorAll('.sa-edit-p').forEach(b => {
      b.onclick = () => window.openSuperAdminPumpWizard(b.dataset.slug);
    });
    const rb = document.getElementById('sa-btn-reset-blank');
    if (rb) {
      rb.onclick = () => {
        localStorage.removeItem('ps_active_pump');
        const u = new URL(location.href);
        u.searchParams.delete('p');
        u.searchParams.delete('pump');
        location.href = u.toString();
      };
    }
  }

  setInterval(() => {
    enforceSuperAdminBlankGate();
    injectSuperAdminDashboardCard();
  }, 400);
})();
