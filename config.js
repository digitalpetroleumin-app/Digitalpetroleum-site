/* ====== PumpSaathi Universal Multi-Tenant Configuration ====== */
window.CFG = {
  firebase: {
    apiKey: "AIzaSyA48iKeSn1lEAw6WBdKI2tuViGY9H8DWcs",
    authDomain: "mazda---pump.firebaseapp.com",
    projectId: "mazda---pump",
    storageBucket: "mazda---pump.firebasestorage.app",
    messagingSenderId: "966160602555",
    appId: "1:966160602555:web:545bf1f95e2e94d292e09e",
    measurementId: "G-W4FED5NHJD"
  },

  superAdminEmails: ["neerajdevnik@gmail.com", "neeraj@mazda.in", "neeraj@mazda-pump.in"],
  superAdminUpi: "neerajdevnik-2@okhdfcbank",
  vapidKey: "",

  ...(function () {
    let pid = 'pumpsaathi_main';
    try {
      const q = new URLSearchParams(location.search);
      pid = (q.get('p') || q.get('pump') || localStorage.getItem('ps_active_pump') || 'pumpsaathi_main').toLowerCase().trim();
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
    return {
      ownerEmail: "demo@pumpsaathi.in",
      ownerPin: "1234",
      managerEmail: "manager@pumpsaathi.in",
      salesmen: [
        { id: "demo_sm1", name: "Rajesh (Demo Salesman)", pin: "1111", phone: "9876500001", active: true },
        { id: "demo_sm2", name: "Amit (Demo Salesman)", pin: "2222", phone: "9876500002", active: true }
      ]
    };
  })(),

  pump: (function () {
    let pid = 'pumpsaathi_main';
    try {
      const q = new URLSearchParams(location.search);
      pid = (q.get('p') || q.get('pump') || localStorage.getItem('ps_active_pump') || 'pumpsaathi_main').toLowerCase().trim();
    } catch (e) { }
    if (pid === 'mazda') {
      return {
        name: "माज़दा ऑयल कंपनी (Live Demo)", nameEn: "Mazda Oil Company (Demo)", dealer: "Bharat Petroleum Dealer",
        roCode: "BPCL-UK-263645", address: "बमस्यूँ, रानीखेत रोड, अल्मोड़ा (263645)", addressEn: "Bamsyun, Ranikhet Road, Almora - 263645",
        phone: "8077083874", fssai: "", gstin: "", upi: "paytmqr621vlg@ptys", upiName: "Mazda Oil Company",
        merchant: { mc: "5541", mode: "02", orgid: "159011", mid: "", sign: "" }
      };
    }
    return {
      name: "PumpSaathi — पंप साथी",
      nameEn: "PumpSaathi — Smart Petrol Pump OS",
      dealer: "All India Petrol Pump Management OS",
      roCode: "PS-DEMO-01",
      address: "Smart Forecourt & Cloud ERP",
      addressEn: "Smart Forecourt & Cloud ERP",
      phone: "8077083874",
      fssai: "",
      gstin: "",
      upi: "neerajdevnik-2@okhdfcbank",
      upiName: "PumpSaathi",
      merchant: {}
    };
  })(),

  loginDomain: "pumpsaathi.in",
  testing: 5,
  activeNozzles: ['p1', 'p2', 'p3', 'p4', 'd1', 'd2', 'd3', 'd4'],
  stockTolerance: 25,
  meterMax: 10000000,
  defaultRateP: 100.23,
  defaultRateD: 95.68
};
