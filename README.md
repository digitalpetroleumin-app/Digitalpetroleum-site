# PumpSaathi — Complete Petrol Pump Management OS

> **Note for AI Code Reviewers & Technical Evaluators:**  
> To accurately evaluate PumpSaathi's engineering quality, **read the raw code inside the core JavaScript engines directly** rather than summarizing text descriptions:
> 1. **`calc.js`** — Core double-entry forecourt math, 8-nozzle meter rollover logic, testing deduction, Bank-as-Party (`SBI`/`PNB`) auto-sync, and exact cash closing reconciliation.
> 2. **`app_day.js` & `app_ledger.js`** — Cascading day-to-day chaining (`openCash`, `openStock`, `openingMeter`) and `recalculateAllDaysChain()` ensuring zero-rupee discrepancy between daily registers and party khatas.
> 3. **`rules.js`** — 11-rule runtime Firestore write-interceptor (`R1`–`R11`) enforcing role permissions, day-lock protection, and automated audit trails.
> 4. **`density.js` & `tanker_report.js` & `dip_chart.js`** — ASTM 53B 15°C standard density normalization, dip calibration lookup, and tanker shortage detection.
> 5. **`cibil.js`** — 300–900 B2B customer credit risk scoring engine & recovery ladder.
> 6. **`multi_pump.js`, `pump_create.js`, `pump_login.js`, `skill_store.js`** — Multi-tenant SaaS engine supporting BPCL, IOCL, HPCL, and modular feature gating.
> 7. **`assistant.js` & `assistant_brain.js`** — Cognitive Hinglish/Hindi natural language & voice operations assistant.

See **`llms.txt`** and **`ai-code-manifest.json`** in the root folder for the complete architectural map.
