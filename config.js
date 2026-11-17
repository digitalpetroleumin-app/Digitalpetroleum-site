/* ====== PumpSaathi Multi-Tenant + Dedicated Per-Pump Firebase Architecture ====== */
(function () {
  'use strict';

  // Master Control Firebase (SuperAdmin Registry)
  const MASTER_FIREBASE = {
    apiKey: "AIzaSyA48iKeSn1lEAw6WBdKI2tuViGY9H8DWcs",
    authDomain: "mazda---pump.firebaseapp.com",
    projectId: "mazda---pump",
    storageBucket: "mazda---pump.firebasestorage.app",
    messagingSenderId: "966160602555",
    appId: "1:966160602555:web:545bf1f95e2e94d292e09e",
    measurementId: "G-W4FED5NHJD"
  };

  let pid = '';
  try {
    const q = new URLSearchParams(location.search);
    pid = (q.get('p') || q.get('pump') || localStorage.getItem('ps_active_pump') || '').toLowerCase().trim();
  } catch (e) {}

  // Check if this specific pump has its OWN dedicated Firebase project config saved!
  let activeFirebase = MASTER_FIREBASE;
  let dedicatedPumpMeta = null;
  if (pid) {
    try {
      const savedRegistry = JSON.parse(localStorage.getItem('ps_pumps_registry') || '{}');
      if (savedRegistry[pid]) {
        dedicatedPumpMeta = savedRegistry[pid];
        if (dedicatedPumpMeta.firebaseConfig && dedicatedPumpMeta.firebaseConfig.apiKey && dedicatedPumpMeta.firebaseConfig.projectId) {
          activeFirebase = dedicatedPumpMeta.firebaseConfig;
        }
      }
    } catch (e) {}
  }

  window.CFG = {
    masterFirebase: MASTER_FIREBASE,
    firebase: activeFirebase,
    dedicatedPumpMeta: dedicatedPumpMeta,
    activePumpSlug: pid,

    // Strictly SuperAdmin Only until a Pump is created and selected
    superAdminEmails: ["neerajdevnik@gmail.com", "neeraj@mazda.in", "neeraj@mazda-pump.in"],
    superAdminUpi: "neerajdevnik-2@okhdfcbank",
    vapidKey: "",

    ownerEmail: dedicatedPumpMeta ? (dedicatedPumpMeta.ownerEmail || "") : "",
    ownerPin: dedicatedPumpMeta ? (dedicatedPumpMeta.ownerPin || "") : "",
    managerEmail: dedicatedPumpMeta ? (dedicatedPumpMeta.managerEmail || "") : "",
    salesmen: dedicatedPumpMeta && Array.isArray(dedicatedPumpMeta.salesmen) ? dedicatedPumpMeta.salesmen : [],

    pump: dedicatedPumpMeta ? {
      name: dedicatedPumpMeta.name || "Petrol Pump",
      nameEn: dedicatedPumpMeta.nameEn || dedicatedPumpMeta.name || "Petrol Pump",
      dealer: dedicatedPumpMeta.dealer || "OMC Dealer",
      roCode: dedicatedPumpMeta.roCode || "",
      address: dedicatedPumpMeta.address || "",
      addressEn: dedicatedPumpMeta.addressEn || dedicatedPumpMeta.address || "",
      phone: dedicatedPumpMeta.phone || "",
      fssai: dedicatedPumpMeta.fssai || "",
      gstin: dedicatedPumpMeta.gstin || "",
      upi: dedicatedPumpMeta.upi || "",
      upiName: dedicatedPumpMeta.upiName || dedicatedPumpMeta.nameEn || "Petrol Pump",
      merchant: {}
    } : {
      name: "PumpSaathi — पंप साथी",
      nameEn: "PumpSaathi — Smart Petrol Pump OS",
      dealer: "SuperAdmin Multi-Firebase Cloud Platform",
      roCode: "",
      address: "No Pump Selected (Blank Mode — Add Pump via SuperAdmin)",
      addressEn: "Blank Mode — Add Pump via SuperAdmin",
      phone: "",
      fssai: "",
      gstin: "",
      upi: "",
      upiName: "PumpSaathi",
      merchant: {}
    },

    loginDomain: "pumpsaathi.in",
    testing: 5,
    activeNozzles: ['p1', 'p2', 'p3', 'p4', 'd1', 'd2', 'd3', 'd4'],
    stockTolerance: 25,
    meterMax: 10000000,
    defaultRateP: 100.23,
    defaultRateD: 95.68
  };
})();
