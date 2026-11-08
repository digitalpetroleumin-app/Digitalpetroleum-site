# सुरक्षा नीति (Security Policy)

## सुरक्षा समस्या की रिपोर्ट कैसे करें
अगर आपको कोई सुरक्षा कमज़ोरी (vulnerability) मिले, तो उसे सार्वजनिक रूप से न लिखें।
सीधे ईमेल करें: **digitalpetroleumhq@gmail.com** (विषय: "Security Report")।
हम 72 घंटे के भीतर जवाब देने की कोशिश करेंगे।

## नियम
- Firebase config (apiKey, projectId आदि) ब्राउज़र में सार्वजनिक रहता है। असली सुरक्षा Firestore Security Rules से होती है। Rules को हमेशा `firestore.rules` के अनुसार रखें।
- Service account JSON, Admin SDK key, या कोई निजी PIN/पासवर्ड कभी repository में न डालें।
- पासवर्ड कम से कम 8 अक्षर का रखें और उसे अलग-अलग लोगों के साथ साझा न करें।
- Super admin खाते पर Google 2-Step Verification ज़रूर चालू रखें।
- अगर कोई key या पासवर्ड गलती से सार्वजनिक हो जाए, तो तुरंत उसे बदलें (rotate करें)।
