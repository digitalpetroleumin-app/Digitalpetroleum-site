# Digital Petroleum: पंप प्रबंधन ऐप

पेट्रोल पंप के रोज़ के हिसाब (बिक्री, कैश, उधार, रेट) को संभालने वाला वेब ऐप।
हर पंप का अपना डेटा है, और हर यूज़र (मालिक, मैनेजर, सेल्समैन) अपने Login ID और password से अपना पंप खोलता है।

## मुख्य सुविधाएं
- **Login ID + Password:** Firebase Email/Password के ज़रिये, Firebase Console की ज़रूरत नहीं।
- **Super Admin:** नया पंप बनाना, और उसके मालिक, मैनेजर, सेल्समैन के खाते बनाना।
- **रेट प्रबंधन:** मालिक या मैनेजर पेट्रोल/डीज़ल के रेट सेट करते हैं।
- **रोज़ की एंट्री:** लीटर, कैश, उधार और सेल्समैन के साथ।
- **आज का हिसाब:** कुल बिक्री, कैश, उधार और अंतर।
- **भूमिकाएं:** मालिक (हटाने और बदलने का अधिकार), मैनेजर, सेल्समैन।

## तकनीक
- Frontend: HTML, CSS, Vanilla JavaScript (कोई framework नहीं)
- Backend: Firebase Authentication, Cloud Firestore
- Hosting: Firebase Hosting

## फ़ाइलें
| फ़ाइल | काम |
|---|---|
| `public/index.html` | पूरा ऐप (UI और लॉजिक) |
| `public/manifest.json` | मोबाइल पर ऐप की तरह इंस्टॉल होने की सेटिंग |
| `public/icons/` | ऐप आइकन और लोगो (हर साइज़) |
| `brand/` | लोगो का मूल (source) फ़ाइल |
| `firestore.rules` | डेटा की सुरक्षा और पहुंच के नियम |
| `firebase.json` | Hosting (`public/` फ़ोल्डर) और Firestore की सेटिंग |
| `LICENSE` | स्वामित्व और उपयोग की शर्तें |
| `SECURITY.md` | सुरक्षा समस्या कैसे रिपोर्ट करें |

## नया सेटअप (एक बार)

### 1. Google खाता और Firebase Console
- Firebase Console (https://console.firebase.google.com) में **Digital Petroleum के business Gmail** से लॉगिन करें (जैसे `digitalpetroleumhq@gmail.com`)।
- इस Google खाते पर **2-Step Verification** चालू करें। Firebase Console का पासवर्ड यही Google खाता संभालता है, इसे ऐप के यूज़र पासवर्ड से अलग समझें।

### 2. नया Firebase प्रोजेक्ट
1. "Add project" दबाएं, नाम दें (जैसे `digital-petroleum`)।
2. Project settings → Your apps → Web (`</>`) से ऐप रजिस्टर करें।
3. दिखे config को `public/index.html` में `FB` वाले हिस्से में डालें।

### 3. Authentication
- Authentication → Sign-in method → **Email/Password** चालू करें।
- Authentication → Users → "Add user" से super admin खाते बनाएं:
  - `digitalpetroleum.in@gmail.com` (मुख्य)
  - `neeraj@mazda.in`
  - `neeraj@mazda-pump.in`
  (इनके पासवर्ड मज़बूत और सिर्फ आपके पास रहें।)

### 4. Firestore
- Firestore Database बनाएं (Production mode)।
- Rules → `firestore.rules` का पूरा content paste करके **Publish** करें।

### 5. Hosting
```bash
npm install -g firebase-tools
firebase login
firebase use --add        # नया प्रोजेक्ट चुनें
firebase deploy --only hosting,firestore:rules
```

## पहली बार उपयोग
1. Super admin से लॉगिन करें (email और पासवर्ड से)।
2. "नया पंप बनाएं" में Pump ID (जैसे `gurunanak`) और नाम डालें।
3. उसी पंप के लिए मालिक, मैनेजर और सेल्समैन बनाएं, हर एक का Login ID और password।
4. वे अपने Login ID और password से लॉगिन करके काम शुरू करें।

## सुरक्षा
- हर यूज़र सिर्फ अपने पंप का डेटा पढ़ और लिख सकता है (`firestore.rules` से तय)।
- सिर्फ super admin पंप और यूज़र बना सकता है।
- एंट्री बदलना और हटाना सिर्फ मालिक कर सकता है।
- सुरक्षा समस्या की रिपोर्ट के लिए `SECURITY.md` देखें।

## लाइसेंस
Copyright (c) 2026 Digital Petroleum. सर्वाधिकार सुरक्षित। विवरण के लिए `LICENSE` देखें।
