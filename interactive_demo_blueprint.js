/* =========================================================================
   INTERACTIVE_DEMO_BLUEPRINT.JS
   - Interactive Feature & Core Logic Inspector for Demo Mode (For Humans & AI)
   - Click any feature or button in the Demo Blueprint to see:
       1. Exact Button Behavior & User Workflow
       2. Exact Mathematical Formula & Core Engine Logic
       3. Source File Reference & Live Interactive Simulation
   ========================================================================= */
(function () {
  'use strict';

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const FEATURE_CATALOG = [
    {
      id: "daily_hisab",
      icon: "🧾",
      tab: "हिसाब (Daily Hisab)",
      title: "8-Nozzle Meter, Testing & Cash Reconciliation Engine",
      sourceFile: "calc.js + app_day.js",
      buttons: ["💾 सेव (Save)", "✅ जमा करें (Lock)", "🔓 अनलॉक (Owner)", "📥 शिफ्ट से भरें", "📷 AI रजिस्टर स्कैन", "🖼️ साफ़ हिसाब फोटो"],
      whatItDoes: "Calculates daily petrol (P1–P4) & diesel (D1–D4) nozzle sales, handles meter rollovers (9999999 → 0000005), subtracts testing fuel (5L), reconciles UPI/Swipe/Udhaar/Expenses, and locks the day against tampering.",
      coreFormula: [
        "Net_Nozzle_Litres = max(0, (Closing_Meter - Opening_Meter) - Testing_Litres)",
        "Gross_Fuel_Sale = (Total_Petrol_L × Rate_P) + (Total_Diesel_L × Rate_D)",
        "Total_Galla_In = Opening_Cash (Yesterday_Close) + Gross_Fuel_Sale + Party_Jama_Cash",
        "Net_Closing_Cash = Total_Galla_In - (Paytm + Swipe + Udhaar_Given + Total_Expenses + Bank_Deposit)"
      ],
      liveExample: "Example: Opening Cash ₹12,400 + Sale ₹2,45,800 + Jama ₹15,000 − (Paytm ₹62,000 + Udhaar ₹84,500 + Expense ₹1,200 + SBI Deposit ₹1,00,000) = Exact Drawer Cash ₹25,500."
    },
    {
      id: "party_ledger",
      icon: "📒",
      tab: "खाते (Party & Bank Ledger)",
      title: "Double-Entry Khata, Bank-as-Party & Cascading Chain Recalculator",
      sourceFile: "app_ledger.js + calc.js",
      buttons: ["+ उधार (Credit Sale)", "+ जमा (Pump / Bank)", "🏦 पंप कैश बैंक में जमा", "📦 खाता बंद (History)", "🧾 Professional Invoice (UPI QR)", "🔑 पोर्टल कोड"],
      whatItDoes: "Maintains running balances for credit fleet parties plus pinned SBI & PNB bank ledgers. Every entry is verified against a Daily Hisab date, and editing/deleting any past entry triggers recalculateAllDaysChain() across all subsequent days.",
      coreFormula: [
        "Party_Balance_Delta = +Amount (if Udhaar) | -Amount (if Jama)",
        "Direct_Bank_Jama = Credits Party Ledger (+Green) AND Mirrors to SBI/PNB Ledger without altering Pump Cash Drawer",
        "Cascading_Chain: Day[t].openCash = Day[t-1].closeCash; Day[t].openStock = Day[t-1].actStock"
      ],
      liveExample: "If a party pays ₹50,000 via NEFT directly to SBI, Party Balance drops by ₹50,000, SBI Bank Balance rises by ₹50,000, and Pump Physical Cash Drawer remains 100% untouched."
    },
    {
      id: "tanker_density",
      icon: "🛢️",
      tab: "स्टॉक & टैंकर रिपोर्ट",
      title: "ASTM 53B 15°C Density Normalization & Dip Calibration Engine",
      sourceFile: "density.js + tanker_report.js + dip_chart.js",
      buttons: ["+ नई टैंकर रिपोर्ट", "🧪 Density Calculator (15°C)", "📥 आज के हिसाब से भरें", "📤 WhatsApp भेजें"],
      whatItDoes: "Converts dip-stick readings (cm) into exact tank litres via piecewise linear interpolation, normalizes observed hydrometer density at ambient temperature (°C) to standard 15°C (ASTM 53B), and detects transit shortages.",
      coreFormula: [
        "Rho_15C = Observed_Hydrometer + (Gamma × 1000 × (Temp_C - 15.0))  [Gamma: MS=0.886, HSD=0.707 kg/m³ per °C]",
        "Expected_Tank_Stock = Opening_Stock + Tanker_Received - Meter_Sales",
        "Stock_Variation = Actual_Dip_Litres - Expected_Tank_Stock  (Alert if |Variation| > 25L)"
      ],
      liveExample: "Diesel observed at 812.0 kg/m³ at 30°C → Normalized 15°C Density = 812 + 0.707 × (30 - 15) = 822.6 kg/m³ (Verified against Depot Invoice)."
    },
    {
      id: "security_rules",
      icon: "📜",
      tab: "Runtime Security Rules (R1–R11)",
      title: "11-Point Database Write Interceptor & Role Governance",
      sourceFile: "rules.js + superadmin_firebase_hub.js",
      buttons: ["🔍 नियम जाँच (Audit)", "📜 नियम पुस्तिका", "🔓 अनलॉक (Owner Only)"],
      whatItDoes: "Wraps Firestore collection(), doc(), and batch() at runtime to enforce 11 strict accounting rules (R1–R11) before any write reaches the server, alongside per-pump Firebase Security Rules.",
      coreFormula: [
        "R1–R3: Viewers are read-only; Submitted/Locked days block all edits unless Owner explicitly unlocks",
        "R4: Opening meters, opening cash & opening stock auto-chain from yesterday (manual override blocked)",
        "R7: Enforces |Litre × Rate - Amount| ≤ ₹1.01 on all fuel credit entries",
        "R10–R11: Audit logs are append-only immutable; Negative closing cash blocks day submission"
      ],
      liveExample: "If a manager tries to edit a locked day or enter 10L × ₹100 = ₹1,200, rules.js intercepts the batch write and blocks it with an exact rule code."
    },
    {
      id: "cibil_recovery",
      icon: "⭐",
      tab: "पार्टी CIBIL & वसूली (Recovery)",
      title: "300–900 B2B Fleet Credit Scoring & 5-Stage Recovery Ladder",
      sourceFile: "cibil.js + extras.js",
      buttons: ["⭐ पार्टी CIBIL", "🚨 वसूली (Recovery)", "💬 WhatsApp तगादा"],
      whatItDoes: "Analyzes every party's historical payment turnaround time, overdue aging buckets (15/25/35/50/70+ days), and volume consistency to compute a 300–900 CIBIL score and auto-adjust credit limits.",
      coreFormula: [
        "Weighted_Score = 30% Repayment_Speed + 20% Overdue_History + 15% Full_Clearance + 15% Volume_Trend + 10% Tenure + 10% Bal_Ratio",
        "CIBIL_300_900 = clamp(300, 900, 300 + Weighted_Score × 6)",
        "Credit_Limit = Base_Limit × Multiplier (A+ [800+]: 3x | A [700+]: 2x | B [550+]: 1x | C [<550]: 0.5x & Auto-Hold)"
      ],
      liveExample: "A transporter paying within 7 days gets Score 835 (Grade A+, 3x Credit Limit), while 35+ days overdue triggers automatic 'Hold' on new credit."
    },
    {
      id: "upi_crm_ai",
      icon: "💳",
      tab: "UPI हिसाब, कुंडली & Jarvis AI",
      title: "Paytm-Style UPI Settlement Ledger & Hinglish Voice Assistant",
      sourceFile: "upi_hisab.js + assistant.js + assistant_brain.js",
      buttons: ["💳 UPI हिसाब & कुंडली", "+ Smart QR पेमेंट", "🤖 Jarvis Voice AI", "📊 आंकड़ों का विश्लेषण"],
      whatItDoes: "Tracks every customer QR payment with lifetime visit history ('ग्राहक कुंडली'), provides a Hindi/Hinglish voice copilot that parses spoken commands ('P1 4500', '9769 में 5000 उधार'), and forecasts tank depletion dates.",
      coreFormula: [
        "Days_Until_Tank_Empty = Current_Dip_Stock_Litres / Weighted_7Day_Daily_Burn_Rate",
        "Voice_Intent_Parser: Normalizes Hindi number words ('चार तारीख' → 4th) + Fuzzy Party/Vehicle matching"
      ],
      liveExample: "Tap any customer in UPI Hisab to open their lifetime spend, visit count, and send a 1-click WhatsApp cashback offer."
    }
  ];

  // Open Interactive Feature & Logic Blueprint Modal
  window.openDemoLogicExplorer = function (selectedId) {
    let activeId = selectedId || FEATURE_CATALOG[0].id;

    const m = (window.APP && window.APP.modal) ? window.APP.modal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div>
          <h3 style="margin:0;color:#0b3d91;">🧠 PumpSaathi Interactive Feature & Logic Map</h3>
          <div class="mut" style="font-size:11.5px;">किसी भी फीचर पर क्लिक करें — उसका काम, बटन और पीछे का पूरा Core Logic देखें</div>
        </div>
        <button type="button" id="dle-close" class="btn sm w">✖</button>
      </div>

      <div id="dle-pills" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;"></div>
      <div id="dle-body"></div>
    `) : null;

    if (!m) return;
    const pillsEl = m.querySelector('#dle-pills');
    const bodyEl = m.querySelector('#dle-body');
    m.querySelector('#dle-close').onclick = () => m.close();

    function renderExplorer() {
      pillsEl.innerHTML = FEATURE_CATALOG.map(f => `
        <button type="button" data-fid="${f.id}" class="btn sm ${f.id === activeId ? 'g' : 'w'}" style="font-size:12px;padding:6px 10px;">
          ${f.icon} ${esc(f.tab)}
        </button>
      `).join('');

      pillsEl.querySelectorAll('[data-fid]').forEach(b => {
        b.onclick = () => { activeId = b.dataset.fid; renderExplorer(); };
      });

      const item = FEATURE_CATALOG.find(x => x.id === activeId) || FEATURE_CATALOG[0];
      bodyEl.innerHTML = `
        <div style="background:#0f172a;color:#fff;border-radius:14px;padding:14px;border:1.5px solid #f4b41a;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="font-size:11px;font-weight:800;color:#fde68a;background:rgba(244,180,26,0.18);padding:3px 9px;border-radius:999px;">📁 Source: ${esc(item.sourceFile)}</span>
            <span style="font-size:11px;color:#38bdf8;font-weight:700;">Live Verified Engine</span>
          </div>
          <h4 style="margin:4px 0 8px;font-size:16px;color:#fff;">${item.icon} ${esc(item.title)}</h4>

          <div style="font-size:12.5px;color:#cbd5e1;line-height:1.55;margin-bottom:10px;">
            <b style="color:#38bdf8;">1. यह फीचर क्या करता है (What It Does):</b><br>
            ${esc(item.whatItDoes)}
          </div>

          <div style="margin-bottom:10px;">
            <b style="font-size:12px;color:#fde68a;display:block;margin-bottom:4px;">2. स्क्रीन के मुख्य बटन (Interactive Buttons):</b>
            <div style="display:flex;gap:5px;flex-wrap:wrap;">
              ${item.buttons.map(b => `<span style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);padding:3px 8px;border-radius:6px;font-size:11.5px;color:#fff;">${esc(b)}</span>`).join('')}
            </div>
          </div>

          <div style="background:#020617;border:1px solid #1e293b;border-radius:10px;padding:10px;margin-bottom:10px;">
            <b style="font-size:12px;color:#4ade80;display:block;margin-bottom:4px;">3. पीछे का असली गणित और Core Logic (Formulas):</b>
            ${item.coreFormula.map(line => `<div style="font-family:monospace;font-size:11.5px;color:#a7f3d0;margin:3px 0;">• ${esc(line)}</div>`).join('')}
          </div>

          <div style="background:rgba(56,189,248,0.12);border-left:3px solid #38bdf8;padding:8px 10px;border-radius:6px;font-size:12px;color:#e0f2fe;">
            <b>💡 Live Example:</b> ${esc(item.liveExample)}
          </div>
        </div>
      `;
    }

    renderExplorer();
  };

  // Inject "🧠 Feature & Core Logic Explorer" Banner at top of Demo Mode so every human & AI sees it immediately
  function injectDemoLogicBar() {
    const main = document.querySelector('#main');
    if (!main || document.getElementById('ps-demo-logic-bar')) return;
    if (!window.APP || !window.APP.S || !window.APP.S.role) return;

    const bar = document.createElement('div');
    bar.id = 'ps-demo-logic-bar';
    bar.style.cssText = 'background:linear-gradient(90deg,#0f172a,#1e3a8a);border:1.5px solid #f4b41a;border-radius:12px;padding:10px 12px;margin-bottom:12px;color:#fff;display:flex;justify-content:space-between;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(15,23,42,0.15);';
    bar.innerHTML = `
      <div style="min-width:0;">
        <div style="font-size:12px;font-weight:800;color:#fde68a;">🧠 Interactive Feature & Core Logic Guide</div>
        <div style="font-size:11px;color:#cbd5e1;">हर बटन का काम और पीछे का पूरा गणित/कोड लॉजिक देखें</div>
      </div>
      <button type="button" id="btn-open-logic-map" class="btn sm o" style="flex:none;white-space:nowrap;">🔍 Logic देखें</button>
    `;
    main.insertBefore(bar, main.firstChild);
    document.getElementById('btn-open-logic-map').onclick = () => window.openDemoLogicExplorer();
  }

  // Also add an "ℹ️ Logic" helper chip next to every major card header inside the app!
  function injectCardLogicTags() {
    const mapByHeader = [
      [/आज का रेट|मीटर रीडिंग|आज का हिसाब|कैश और भुगतान/i, 'daily_hisab'],
      [/पार्टी उधार|पिन किए गए बैंक|खाता विवरण/i, 'party_ledger'],
      [/पेट्रोल स्टॉक|डीज़ल स्टॉक|टैंकर रिपोर्ट/i, 'tanker_density'],
      [/नियम|ऑडिट/i, 'security_rules'],
      [/CIBIL|वसूली/i, 'cibil_recovery'],
      [/UPI|विश्लेषण/i, 'upi_crm_ai']
    ];

    document.querySelectorAll('#main .card h3').forEach(h3 => {
      if (h3.dataset.logicTagged) return;
      h3.dataset.logicTagged = '1';
      const txt = h3.textContent || '';
      const found = mapByHeader.find(([rx]) => rx.test(txt));
      if (!found) return;

      const tag = document.createElement('button');
      tag.type = 'button';
      tag.textContent = 'ℹ️ Logic';
      tag.title = 'इस फीचर का काम और Core Logic देखें';
      tag.style.cssText = 'margin-left:auto;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:999px;padding:2px 8px;font-size:10.5px;font-weight:700;cursor:pointer;';
      tag.onclick = (e) => {
        e.stopPropagation();
        window.openDemoLogicExplorer(found[1]);
      };
      h3.appendChild(tag);
    });
  }

  setInterval(() => {
    injectDemoLogicBar();
    injectCardLogicTags();
  }, 450);
})();
