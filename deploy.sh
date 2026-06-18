#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "[+] Pull latest code..."
git pull origin main

echo "[+] Install dependencies..."
npm install

echo "[+] Build project..."
npm run build

echo "[+] Deploy to /var/www/d1nhvar3n-blog..."
mkdir -p /var/www/d1nhvar3n-blog
rm -rf /var/www/d1nhvar3n-blog/*

cp -r build/. /var/www/d1nhvar3n-blog/

echo "[+] Test nginx config..."
nginx -t

echo "[+] Reload nginx..."
systemctl reload nginx

echo "✅ Deploy blog hoàn tất!"