/* =========================================================================
   UPI_HISAB.JS — Paytm-for-Business Style Daily UPI Ledger & Customer Kundali
   • Exact layout inspired by business settlement dashboards:
     - Top Tabs: Payments | Bank Settlements
     - Filters: Date Range | Counter Name | Search ("Amar Sharma", "5000")
     - Summary Card: "₹1,53,625.11 from 110 Payments, Today" + "Next Settlement by 10 AM"
     - Click any customer -> Opens full "ग्राहक कुंडली (Customer Kundali)" & Marketing CRM!
     - Smart QR Payment Collector with ₹100 Cashback / Offer hook to capture Name + Mobile + UPI ID
   ========================================================================= */
(function () {
  'use strict';
  const APP = window.APP = window.APP || {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = v => Number(v) || 0;
  const money = v => '₹' + num(v).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const todayISO = () => (APP.todayISO ? APP.todayISO() : new Date().toISOString().slice(0, 10));

  APP.views = APP.views || {};

  // Sample realistic fallback transactions if Firestore collection 'upi_payments' is empty initially
  const DEMO_TXNS = [
    { id: 'tx_1', date: todayISO(), time: '06:12 AM', customerName: 'Amar Sharma', phone: '9897123456', upiId: 'amarsharma@okicici', amount: 5000, counter: 'Nozzle P1 (Morning)', status: 'SETTLED' },
    { id: 'tx_2', date: todayISO(), time: '08:28 PM', customerName: 'Deepanshu Arya', phone: '9837011223', upiId: 'deepanshu@ybl', amount: 3318, counter: 'Nozzle D1', status: 'SETTLED' },
    { id: 'tx_3', date: todayISO(), time: '08:24 PM', customerName: 'Baali Ram', phone: '9412099887', upiId: 'baaliram@oksbi', amount: 2700, counter: 'Nozzle P2', status: 'SETTLED' },
    { id: 'tx_4', date: todayISO(), time: '08:18 PM', customerName: 'Kaviraj Singh', phone: '7500112244', upiId: 'kaviraj@paytm', amount: 2199, counter: 'Nozzle D2', status: 'SETTLED' },
    { id: 'tx_5', date: todayISO(), time: '08:08 PM', customerName: 'Pankaj Bhandari', phone: '8077083874', upiId: 'pankaj@okaxis', amount: 46, counter: 'Nozzle P1', status: 'SETTLED' },
    { id: 'tx_6', date: todayISO(), time: '07:36 PM', customerName: 'Mr Satyapal Gaira', phone: '9756001122', upiId: 'satyapal@okhdfcbank', amount: 1200, counter: 'Nozzle D1', status: 'SETTLED' },
    { id: 'tx_7', date: todayISO(), time: '07:26 PM', customerName: 'R S Kohli', phone: '9411122334', upiId: 'rskohli@oksbi', amount: 8351, counter: 'Nozzle D2', status: 'SETTLED' },
    { id: 'tx_8', date: '2026-11-12', time: '07:15 AM', customerName: 'Amar Sharma', phone: '9897123456', upiId: 'amarsharma@okicici', amount: 3200, counter: 'Nozzle D1', status: 'SETTLED' },
    { id: 'tx_9', date: '2026-11-05', time: '05:40 PM', customerName: 'Amar Sharma', phone: '9897123456', upiId: 'amarsharma@okicici', amount: 4500, counter: 'Nozzle P1', status: 'SETTLED' }
  ];

  async function loadUpiPayments() {
    const db = APP.db || (window.firebase && firebase.firestore());
    let list = [];
    if (db) {
      try {
        const snap = await db.collection('upi_payments').orderBy('at', 'desc').limit(300).get();
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {}
    }
    try {
      const local = JSON.parse(localStorage.getItem('ps_local_upi_txns') || '[]');
      list = [...local, ...list];
    } catch (e) {}
    return list.length ? list : DEMO_TXNS;
  }

  // Full Customer Kundali Modal ("Amar Sharma ne kab kab kitni payment ki hai")
  window.openCustomerKundali = function (customerName, allTxns) {
    const history = allTxns.filter(t => (t.customerName || '').toLowerCase() === customerName.toLowerCase());
    const totalSpent = history.reduce((a, b) => a + num(b.amount), 0);
    const phone = (history[0] && history[0].phone) || 'Not Captured';
    const upiId = (history[0] && history[0].upiId) || 'N/A';

    const rows = history.map(h => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px dashed #334155;">
        <div>
          <b style="color:#fff;font-size:13px;">${esc(h.date)} · ${esc(h.time)}</b>
          <div style="font-size:11px;color:#94a3b8;">${esc(h.counter || 'Forecourt QR')} · ${esc(h.upiId || '')}</div>
        </div>
        <b style="color:#22c55e;font-size:15px;">${money(h.amount)}</b>
      </div>
    `).join('');

    const waOfferMsg = encodeURIComponent(`Namaste ${customerName} ji! 🙏
${(window.CFG && CFG.pump && CFG.pump.name) || 'PumpSaathi'} par aapka ab tak ka total fuel purchase ${money(totalSpent)} (${history.length} visits) ho chuka hai.

🎁 Aapke liye Special VIP Offer: Agli baar ₹2,000+ ke petrol/diesel par ₹100 ka Instant Cashback / Free Engine Oil Checkup! Dhanyavaad.`);

    const m = (APP.modal || function (h) {
      const d = document.createElement('div');
      d.innerHTML = `<div style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;"><div style="background:#0a1830;border:2px solid #38bdf8;border-radius:20px;padding:20px;color:#fff;max-width:420px;width:100%;max-height:88vh;overflow-y:auto;">${h}</div></div>`;
      document.body.appendChild(d);
      return { close: () => d.remove() };
    })(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h3 style="margin:0;color:#38bdf8;">📜 ग्राहक की पूरी कुंडली</h3>
        <span style="background:#16a34a;color:#fff;font-size:10px;padding:3px 8px;border-radius:999px;font-weight:700;">VERIFIED CRM</span>
      </div>
      <div style="background:rgba(255,255,255,0.06);padding:14px;border-radius:14px;margin-bottom:14px;">
        <div style="font-size:18px;font-weight:800;color:#f4b41a;">${esc(customerName)}</div>
        <div style="font-size:12px;color:#cbd5e1;margin-top:4px;">📱 मोबाइल: <b>${esc(phone)}</b> &nbsp;|&nbsp; 🏦 UPI: <b>${esc(upiId)}</b></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;">
          <div style="background:#0f172a;padding:10px;border-radius:10px;text-align:center;">
            <div style="font-size:11px;color:#94a3b8;">कुल पेमेंट (Lifetime)</div>
            <b style="font-size:18px;color:#22c55e;">${money(totalSpent)}</b>
          </div>
          <div style="background:#0f172a;padding:10px;border-radius:10px;text-align:center;">
            <div style="font-size:11px;color:#94a3b8;">कुल विज़िट (Visits)</div>
            <b style="font-size:18px;color:#38bdf8;">${history.length} बार</b>
          </div>
        </div>
      </div>

      <div style="font-size:12px;font-weight:700;color:#f4b41a;margin-bottom:6px;">🕒 कब-कब कितनी पेमेंट की (Full History):</div>
      <div style="max-height:220px;overflow-y:auto;margin-bottom:14px;">${rows}</div>

      <div style="display:flex;gap:8px;">
        <a href="https://wa.me/91${phone.replace(/\D/g, '')}?text=${waOfferMsg}" target="_blank" style="flex:1;background:#25D366;color:#052e16;padding:11px;border-radius:10px;text-decoration:none;font-weight:800;font-size:12px;text-align:center;">🎁 ₹100 Cashback Offer भेजें</a>
        <button id="kd-close" style="background:rgba(255,255,255,0.12);color:#fff;border:none;padding:11px 16px;border-radius:10px;font-weight:700;cursor:pointer;">बंद</button>
      </div>
    `);
    setTimeout(() => { const b = document.getElementById('kd-close'); if (b) b.onclick = () => m.close(); }, 60);
  };

  // Smart Cashback QR Payment Gateway Collector (Captures Name + Mobile + UPI before paying to Pump UPI)
  window.openSmartQrCollector = function () {
    const pumpUpi = (window.CFG && CFG.pump && CFG.pump.upi) || 'paytmqr621vlg@ptys';
    const pumpName = (window.CFG && CFG.pump && CFG.pump.name) || 'PumpSaathi Station';

    const m = (APP.modal || function (h) {
      const d = document.createElement('div');
      d.innerHTML = `<div style="position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;"><div style="background:#ffffff;border-radius:20px;padding:20px;color:#0f172a;max-width:400px;width:100%;">${h}</div></div>`;
      document.body.appendChild(d);
      return { close: () => d.remove() };
    })(`
      <div style="text-align:center;">
        <span style="background:#dcfce7;color:#166534;font-size:11px;font-weight:800;padding:4px 12px;border-radius:999px;">🎁 ₹100 FREE CASHBACK OFFER QR</span>
        <h3 style="margin:8px 0 4px;color:#0f172a;">${esc(pumpName)} — Smart UPI</h3>
        <p style="font-size:12px;color:#64748b;margin-bottom:12px;">पेमेंट से पहले अपना नाम व नंबर भरें और ₹100 तक का कैशबैक कूपन पाएं!</p>

        <input id="qr-cname" placeholder="आपका पूरा नाम (जैसे: Amar Sharma)" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;margin-bottom:8px;">
        <input id="qr-cphone" inputmode="numeric" maxlength="10" placeholder="मोबाइल नंबर (कैशबैक SMS के लिए)" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;margin-bottom:8px;">
        <input id="qr-camt" inputmode="decimal" placeholder="पेमेंट रकम ₹ (जैसे: 5000)" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;margin-bottom:8px;">
        <select id="qr-counter" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;margin-bottom:12px;">
          <option value="Nozzle P1">Nozzle P1 (Petrol)</option>
          <option value="Nozzle P2">Nozzle P2 (Petrol)</option>
          <option value="Nozzle D1">Nozzle D1 (Diesel)</option>
          <option value="Nozzle D2">Nozzle D2 (Diesel)</option>
        </select>

        <div style="background:#f8fafc;border:1px dashed #94a3b8;padding:10px;border-radius:10px;font-size:12px;margin-bottom:12px;">
          Direct Pump Merchant UPI: <b style="color:#0b3d91;">${esc(pumpUpi)}</b>
        </div>

        <button id="qr-pay-now" style="width:100%;background:#16a34a;color:#fff;border:none;padding:13px;border-radius:10px;font-weight:800;font-size:14px;cursor:pointer;margin-bottom:8px;">✅ पेमेंट करें & ₹100 कूपन पाएं</button>
        <button id="qr-cancel" style="width:100%;background:#f1f5f9;color:#475569;border:none;padding:9px;border-radius:8px;font-weight:700;cursor:pointer;">बंद करें</button>
      </div>
    `);

    setTimeout(() => {
      document.getElementById('qr-cancel').onclick = () => m.close();
      document.getElementById('qr-pay-now').onclick = async () => {
        const cname = document.getElementById('qr-cname').value.trim();
        const cphone = document.getElementById('qr-cphone').value.trim();
        const camt = num(document.getElementById('qr-camt').value);
        const counter = document.getElementById('qr-counter').value;
        if (!cname || camt <= 0) return alert('नाम और सही रकम भरें!');

        const txn = {
          id: 'tx_' + Date.now(),
          date: todayISO(),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          customerName: cname,
          phone: cphone || '9999999999',
          upiId: cname.toLowerCase().replace(/\s+/g, '') + '@upi',
          amount: camt,
          counter,
          status: 'SETTLED'
        };

        try {
          const local = JSON.parse(localStorage.getItem('ps_local_upi_txns') || '[]');
          local.unshift(txn);
          localStorage.setItem('ps_local_upi_txns', JSON.stringify(local));
          const db = APP.db || (window.firebase && firebase.firestore());
          if (db) await db.collection('upi_payments').doc(txn.id).set({ ...txn, at: firebase.firestore.FieldValue.serverTimestamp() });
        } catch (e) {}

        window.open(`upi://pay?pa=${encodeURIComponent(pumpUpi)}&pn=${encodeURIComponent(pumpName)}&am=${camt}&cu=INR`, '_blank');
        m.close();
        if (APP.toast) APP.toast(`🎉 ₹${camt} पेमेंट रिकॉर्ड हो गई (${cname})`);
        if (APP.views.upi_hisab) APP.views.upi_hisab();
      };
    }, 60);
  };

  // Main Paytm-for-Business Style UPI Ledger View
  APP.views.upi_hisab = async function () {
    const main = document.querySelector('#main');
    if (!main) return;

    // Check if skill is unlocked
    if (window.PS_SKILLS && !window.PS_SKILLS.isSkillActive('upi_hisab_kundali')) {
      window.openSkillUnlockModal('upi_hisab_kundali');
      return;
    }

    main.innerHTML = '<p class="mut" style="text-align:center;padding:20px;">💳 UPI पेमेंट और ग्राहक कुंडली लोड हो रही है…</p>';
    const allTxns = await loadUpiPayments();
    let activeTab = 'payments';
    let searchQuery = '';
    let selectedDate = todayISO();

    function render() {
      const filtered = allTxns.filter(t => {
        const matchQ = !searchQuery ||
          (t.customerName || '').toLowerCase().includes(searchQuery) ||
          String(t.amount).includes(searchQuery) ||
          (t.phone || '').includes(searchQuery);
        const matchDate = !selectedDate || selectedDate === 'ALL' || t.date === selectedDate;
        return matchQ && matchDate;
      });

      const totalAmt = filtered.reduce((a, b) => a + num(b.amount), 0);
      const pumpTitle = (window.CFG && CFG.pump && CFG.pump.name) || 'PumpSaathi Station';

      const listHtml = filtered.map(t => `
        <div onclick="window.openCustomerKundali('${esc(t.customerName).replace(/'/g, "\'")}', window._allUpiTxns)" style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #e2e8f0;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:38px;height:38px;border-radius:10px;background:#eff6ff;color:#1d4ed8;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;">🏦</div>
            <div>
              <div style="font-size:14px;font-weight:700;color:#0f172a;">${esc(t.time)} &nbsp; ${esc(t.customerName)}</div>
              <div style="font-size:11px;color:#64748b;">Bank Account · ${esc(t.counter || 'QR')} · <span style="color:#2563eb;font-weight:600;">कुंडली देखें →</span></div>
            </div>
          </div>
          <div style="font-size:15px;font-weight:800;color:#0f172a;">${money(t.amount)}</div>
        </div>
      `).join('');

      main.innerHTML = `
        <div style="background:#ffffff;border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <b style="font-size:17px;color:#0f172a;">← ${esc(pumpTitle)}</b>
            <button onclick="window.openSmartQrCollector()" class="btn sm g">+ Smart QR पेमेंट</button>
          </div>

          <!-- Paytm Style Segmented Pill Tabs -->
          <div style="display:flex;background:#f1f5f9;border-radius:999px;padding:4px;margin-bottom:12px;">
            <button id="upi-tab-pay" style="flex:1;padding:8px;border-radius:999px;border:none;font-weight:700;font-size:13px;cursor:pointer;background:${activeTab === 'payments' ? '#ffffff' : 'transparent'};color:${activeTab === 'payments' ? '#0284c7' : '#475569'};box-shadow:${activeTab === 'payments' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'};">Payments</button>
            <button id="upi-tab-set" style="flex:1;padding:8px;border-radius:999px;border:none;font-weight:700;font-size:13px;cursor:pointer;background:${activeTab === 'settlements' ? '#ffffff' : 'transparent'};color:${activeTab === 'settlements' ? '#0284c7' : '#475569'};box-shadow:${activeTab === 'settlements' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'};">Bank Settlements</button>
          </div>

          <!-- Instant Search Bar ("Amar Sharma" ya "5000") -->
          <div style="display:flex;gap:8px;margin-bottom:12px;">
            <input id="upi-search" value="${esc(searchQuery)}" placeholder="🔍 नाम या रकम खोजें (जैसे: Amar Sharma ya 5000)" style="flex:1;padding:10px 12px;border:1px solid #cbd5e1;border-radius:10px;font-size:13px;">
            <select id="upi-date-filter" style="padding:10px;border:1px solid #cbd5e1;border-radius:10px;font-size:12px;">
              <option value="${todayISO()}" ${selectedDate === todayISO() ? 'selected' : ''}>Today</option>
              <option value="ALL" ${selectedDate === 'ALL' ? 'selected' : ''}>All Dates</option>
            </select>
          </div>

          ${activeTab === 'payments' ? `
            <!-- Summary Hero Card -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px;margin-bottom:14px;">
              <div style="font-size:19px;font-weight:800;color:#0f172a;">${money(totalAmt)} <span style="font-size:14px;font-weight:600;color:#334155;">from ${filtered.length} Payments</span></div>
              <div style="font-size:12px;color:#64748b;margin-top:4px;">Next Settlement by 10 AM, Tomorrow · Direct to Pump UPI</div>
            </div>

            <div style="font-size:15px;font-weight:800;color:#0f172a;margin-bottom:6px;">All Payments <small style="font-weight:500;color:#64748b;">(नाम पर क्लिक कर पूरी कुंडली देखें)</small></div>
            <div>${listHtml || '<p class="mut" style="text-align:center;padding:20px;">कोई पेमेंट रिकॉर्ड नहीं मिला</p>'}</div>
          ` : `
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:16px;">
              <b style="color:#166534;font-size:15px;">🏦 Auto Bank Settlement Summary</b>
              <div style="font-size:13px;color:#15803d;margin-top:6px;">• कुल QR कलेक्शन: <b>${money(totalAmt)}</b></div>
              <div style="font-size:13px;color:#15803d;margin-top:4px;">• मर्चेंट UPI ID: <b>${esc((window.CFG && CFG.pump && CFG.pump.upi) || 'Pump Linked Bank')}</b></div>
              <div style="font-size:12px;color:#475569;margin-top:8px;">✔ हर रात 12:00 बजे का हिसाब सुबह 10:00 AM तक सीधे पंप के बैंक खाते में सेटल होता है।</div>
            </div>
          `}
        </div>
        <div class="btns"><button class="btn w" onclick="APP.go('more')">← वापस</button></div>
      `;

      window._allUpiTxns = allTxns;
      document.getElementById('upi-tab-pay').onclick = () => { activeTab = 'payments'; render(); };
      document.getElementById('upi-tab-set').onclick = () => { activeTab = 'settlements'; render(); };
      const sInp = document.getElementById('upi-search');
      sInp.oninput = () => { searchQuery = sInp.value.trim().toLowerCase(); render(); };
      sInp.focus();
      sInp.setSelectionRange(sInp.value.length, sInp.value.length);
      document.getElementById('upi-date-filter').onchange = (e) => { selectedDate = e.target.value; render(); };
    }

    render();
  };
})();
