#!/bin/bash

# 🚀 NyayNow Auto-Deploy Script for Hetzner (Ubuntu 22/24)
# Run this as root.

echo "🔵 [1/6] Updating System..."
apt update && apt upgrade -y
apt install -y curl git nginx certbot python3-certbot-nginx

echo "🔵 [2/6] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

echo "🔵 [3/6] Setting up Directory..."
mkdir -p /var/www/nyaynow
cd /var/www/nyaynow

# NOTE: Replace with your actual repo
REPO_URL="https://github.com/dhruvkumar2107/nyaynow.git" 

if [ -d ".git" ]; then
    echo "🟡 Repo exists. Pulling latest..."
    git pull
else
    echo "🔵 Cloning Repo..."
    git clone $REPO_URL .
fi

echo "🔵 [4/6] Installing Dependencies & Building..."
# Backend
cd server
npm install
cd ..

# Frontend
cd client
npm install
npm run build
cd ..

echo "🔵 [5/6] Configuring Nginx..."
# Create Nginx Config
cat > /etc/nginx/sites-available/nyaynow <<EOF
server {
    listen 80;
    server_name nyaynow.com www.nyaynow.com;

    root /var/www/nyaynow/client/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/nyaynow /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "🔵 [6/6] Starting Backend with PM2..."
cd server
# Create dummy env if missing
if [ ! -f .env ]; then
    echo "PORT=5000" > .env
    echo "MONGO_URI=YOUR_MONGO_URI_HERE" >> .env
fi
pm2 start index.js --name "nyaynow-api"
pm2 save
pm2 startup

echo "✅ DEPLOYMENT COMPLETE!"
echo "👉 1. Edit /var/www/nyaynow/server/.env with real keys."
echo "👉 2. Run 'certbot --nginx' to enable HTTPS."
