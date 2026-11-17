#!/usr/bin/env bash
set -e
npm install -g @bubblewrap/cli
if [ ! -f android.keystore ]; then
  keytool -genkeypair -v -keystore android.keystore -alias pumpsaathi \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass Pumpsaathi@2026 -keypass Pumpsaathi@2026 \
    -dname "CN=Rohit Dev, OU=Digital Petroleum, O=Digital Petroleum, L=Almora, ST=Uttarakhand, C=IN"
fi
mkdir -p twa-build && cd twa-build
cp ../twa-manifest.json ./twa-manifest.json
sed -i "s|__PACKAGE_ID__|shop.digitalpetroleum.pumpsaathi|g" twa-manifest.json
sed -i "s|__APP_NAME__|PumpSaathi|g" twa-manifest.json
sed -i "s|__MANIFEST_URL__|https://digitalpetroleumin-app.github.io/Pumpsaathi/manifest.json|g" twa-manifest.json
yes "" | bubblewrap update --skipPwaValidation || true
export BUBBLEWRAP_KEYSTORE_PASSWORD=Pumpsaathi@2026
export BUBBLEWRAP_KEY_PASSWORD=Pumpsaathi@2026
bubblewrap build --skipPwaValidation
echo "APK Ready: twa-build/app-release-signed.apk"
