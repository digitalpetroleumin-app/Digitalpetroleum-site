/* ====== PumpSaathi Universal Multi-Tenant Configuration ====== */
window.CFG = {
  // Default Master Firebase Project (Super Admin & Master Registry)
  firebase: {
    apiKey: "AIzaSyA48iKeSn1lEAw6WBdKI2tuViGY9H8DWcs",
    authDomain: "mazda---pump.firebaseapp.com",
    projectId: "mazda---pump",
    storageBucket: "mazda---pump.firebasestorage.app",
    messagingSenderId: "966160602555",
    appId: "1:966160602555:web:545bf1f95e2e94d292e09e",
    measurementId: "G-W4FED5NHJD"
  },

  // Super Admin & Global Billing UPI
  superAdminEmails: ["neerajdevnik@gmail.com", "neeraj@mazda.in", "neeraj@mazda-pump.in"],
  superAdminUpi: "neerajdevnik-2@okhdfcbank",
  vapidKey: "YAHAN_APNI_VAPID_KEY_PASTE_KAREIN",

  // Active Pump Resolution (?p=ID or logged-in domain)
  ...(function () {
    let pid = 'mazda';
    try {
      const q = new URLSearchParams(location.search);
      pid = (q.get('p') || q.get('pump') || localStorage.getItem('ps_active_pump') || 'mazda').toLowerCase().trim();
    } catch (e) { }
    if (pid === 'mazda') {
      return {
        ownerEmail: "neeraj@mazda-pump.in",
        ownerPin: "9999",
        managerEmail: "manager@mazda-pump.in",
        salesmen: [
          { id: "manoj", name: "Manoj", pin: "1234", phone: "9876543211", active: true },
          { id: "rohit", name: "Rohit", pin: "1104", phone: "8077083874", active: true },
          { id: "chamu", name: "Chamu", pin: "2233", phone: "9876543213", active: true }
        ]
      };
    }
    return { ownerEmail: "", ownerPin: "", managerEmail: "", salesmen: [] };
  })(),

  pump: (function () {
    let pid = 'mazda';
    try {
      const q = new URLSearchParams(location.search);
      pid = (q.get('p') || q.get('pump') || localStorage.getItem('ps_active_pump') || 'mazda').toLowerCase().trim();
    } catch (e) { }
    if (pid === 'mazda') {
      return {
        name: "माज़दा ऑयल कंपनी", nameEn: "Mazda Oil Company", dealer: "Bharat Petroleum Dealer",
        roCode: "BPCL-UK-263645", address: "बमस्यूँ, रानीखेत रोड, अल्मोड़ा (263645)", addressEn: "Bamsyun, Ranikhet Road, Almora - 263645",
        phone: "8077083874", fssai: "12345678901234", gstin: "05AAAAA0000A1Z5", upi: "paytmqr621vlg@ptys", upiName: "Mazda Oil Company",
        merchant: { mc: "5541", mode: "02", orgid: "159011", mid: "", sign: "" }
      };
    }
    return { name: "PumpSaathi स्टेशन", nameEn: "PumpSaathi Station", dealer: "Retail Fuel Dealer", roCode: "", address: "", addressEn: "", phone: "", fssai: "", gstin: "", upi: "", upiName: "", merchant: {} };
  })(),

  loginDomain: (function () {
    try {
      const q = new URLSearchParams(location.search);
      const p = (q.get('p') || q.get('pump') || localStorage.getItem('ps_active_pump') || 'mazda').toLowerCase().trim();
      return p === 'mazda' ? 'mazda-pump.in' : (p + '.in');
    } catch (e) { return 'pumpsaathi.in'; }
  })(),
  testing: 5,
  activeNozzles: ['p1', 'p2', 'p3', 'p4', 'd1', 'd2', 'd3', 'd4'],
  stockTolerance: 25,
  meterMax: 10000000,
  defaultRateP: 100.23,
  defaultRateD: 95.68
};
