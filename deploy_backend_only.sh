#!/bin/bash

# 🚀 NyayNow BACKEND-ONLY Deploy Script (for Hybrid Setup)
# Use this if your Frontend is on Cloudflare.

echo "🔵 [1/5] Updating System..."
apt update && apt upgrade -y
apt install -y curl git nginx certbot python3-certbot-nginx

echo "🔵 [2/5] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

echo "🔵 [3/5] Setting up API Directory..."
mkdir -p /var/www/nyaynow-api
cd /var/www/nyaynow-api

# NOTE: Replace with your actual repo
REPO_URL="https://github.com/dhruvkumar2107/nyaynow.git" 

if [ -d ".git" ]; then
    echo "🟡 Repo exists. Pulling latest..."
    git pull
else
    echo "🔵 Cloning Repo..."
    git clone $REPO_URL .
fi

echo "🔵 [4/5] Installing Backend Dependencies..."
cd server
npm install
# Create .env if missing
if [ ! -f .env ]; then
    echo "PORT=5000" > .env
    echo "MONGO_URI=YOUR_MONGO_URI_HERE" >> .env
    echo "CLIENT_URL=https://nyaynow.com" >> .env
fi
cd ..

echo "🔵 [5/5] Configuring Nginx for API Subdomain..."
# Config for api.nyaynow.com
cat > /etc/nginx/sites-available/nyaynow-api <<EOF
server {
    listen 80;
    server_name api.nyaynow.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/nyaynow-api /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "🔵 [6/6] Starting API..."
cd server
pm2 start index.js --name "nyaynow-api"
pm2 save
pm2 startup

echo "✅ BACKEND DEPLOYMENT COMPLETE!"
echo "👉 1. Go to DNS Provider -> Point 'api.nyaynow.com' to this Server IP."
echo "👉 2. Run 'certbot --nginx' to enable HTTPS for the API."
echo "👉 3. Update your Cloudflare Frontend 'VITE_API_URL' to 'https://api.nyaynow.com'."
