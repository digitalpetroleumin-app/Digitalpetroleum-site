#!/usr/bin/env bash
# PumpSaathi — local APK build (Linux/Mac/Termux). Password kabhi file mein nahi likhna.
# Use:  KS_PASS='apna-strong-password' ./build-apk-local.sh
set -euo pipefail
: "${KS_PASS:?KS_PASS set karo, jaise: KS_PASS='strong-pass' ./build-apk-local.sh}"
ALIAS="${KS_ALIAS:-pumpsaathi}"
MANIFEST_URL="https://digitalpetroleumin-app.github.io/Pumpsaathi/manifest.json"

command -v keytool >/dev/null || { echo "JDK 17 install karo (keytool nahi mila)"; exit 1; }
npm install -g @bubblewrap/cli

mkdir -p twa-build
if [ ! -f twa-build/android.keystore ]; then
  keytool -genkeypair -keystore twa-build/android.keystore -alias "$ALIAS" \
    -keyalg RSA -keysize 2048 -validity 10000 -storepass "$KS_PASS" -keypass "$KS_PASS" \
    -dname "CN=PumpSaathi, O=Digital Petroleum, C=IN"
  echo "=== GitHub Secret ANDROID_KEYSTORE_BASE64 (isse safe rakho, public mat karo) ==="
  base64 -w0 twa-build/android.keystore 2>/dev/null || base64 twa-build/android.keystore
  echo
fi
echo "=== SHA-256 fingerprint (assetlinks.json mein daalna) ==="
keytool -list -v -keystore twa-build/android.keystore -alias "$ALIAS" -storepass "$KS_PASS" | grep 'SHA256:'

cp twa-manifest.json twa-build/twa-manifest.json
cd twa-build
export BUBBLEWRAP_KEYSTORE_PASSWORD="$KS_PASS" BUBBLEWRAP_KEY_PASSWORD="$KS_PASS"
bubblewrap update --skipVersionUpgrade --manifest=./twa-manifest.json
bubblewrap build --skipPwaValidation --manifest=./twa-manifest.json
echo "APK Ready: twa-build/app-release-signed.apk"
