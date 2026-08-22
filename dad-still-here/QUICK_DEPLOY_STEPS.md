# ⚡ Quick Deploy Steps - Copy & Paste Commands

**Total Time:** ~2 hours | **Difficulty:** Follow step-by-step, don't skip

---

## 🟢 STEP 1: SSH into VPS (2 min)

```bash
# Hostinger will give you SSH command in their panel
# Copy and paste it:
ssh root@srv1249195.hostinger.com

# Or with IP:
ssh root@[YOUR_VPS_IP]
```

---

## 🟢 STEP 2: Update System (3 min)

```bash
apt update
apt upgrade -y
```

---

## 🟢 STEP 3: Create App User (2 min)

```bash
useradd -m -s /bin/bash dadstillhere
usermod -aG sudo dadstillhere
passwd dadstillhere
# Create a strong password, save it securely

su - dadstillhere
```

---

## 🟢 STEP 4: Firewall Setup (2 min)

```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

---

## 🟢 STEP 5: Install Node.js (5 min)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

---

## 🟢 STEP 6: Install PostgreSQL (5 min)

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql --version
```

---

## 🟢 STEP 7: Install Nginx + PM2 + Git (5 min)

```bash
sudo apt install -y nginx git
sudo systemctl start nginx
sudo systemctl enable nginx
sudo npm install -g pm2
pm2 startup
pm2 save
```

---

## 🟢 STEP 8: Create Database (5 min)

```bash
sudo -u postgres psql
```

Then inside PostgreSQL terminal, run:

```sql
CREATE DATABASE dadstillhere_db;
CREATE USER dadstillhere_user WITH PASSWORD 'SuperSecurePassword123!';
ALTER ROLE dadstillhere_user SET client_encoding TO 'utf8';
ALTER ROLE dadstillhere_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE dadstillhere_user SET default_transaction_deferrable TO on;
ALTER ROLE dadstillhere_user SET default_transaction_level TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE dadstillhere_db TO dadstillhere_user;
\q
```

**Replace 'SuperSecurePassword123!' with your own strong password and save it!**

---

## 🟢 STEP 9: Test Database Connection (2 min)

```bash
psql -U dadstillhere_user -d dadstillhere_db -h localhost
# Should connect successfully
\q
# Exit
```

---

## 🟢 STEP 10: Create App Directory & .env (5 min)

```bash
mkdir -p /home/dadstillhere/app
cd /home/dadstillhere/app
```

Create `.env.local`:

```bash
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://dadstillhere_user:SuperSecurePassword123!@localhost:5432/dadstillhere_db"
NEXTAUTH_URL="https://dadstillhere.com"
NEXTAUTH_SECRET="your_random_secret_key_here"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@dadstillhere.com"
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://dadstillhere.com/api"
NEXT_PUBLIC_FACEBOOK_PIXEL_ID="1534484327973771"
NEXT_PUBLIC_ANALYTICS_ID="your-analytics-id"
EOF

chmod 600 .env.local
```

**IMPORTANT:** Replace the password and email credentials!

---

## 🟢 STEP 11: Clone Repository (3 min)

```bash
cd /home/dadstillhere/app
git clone https://github.com/Deji147x/dadstillhere.com .
ls -la
# Should show: package.json, next.config.js, etc.
```

---

## 🟢 STEP 12: Install Dependencies (3-5 min)

```bash
npm install
# Wait for "added X packages"
```

---

## 🟢 STEP 13: Database Migration (3 min)

```bash
npx prisma migrate deploy
# Or if first time:
npx prisma db push
```

---

## 🟢 STEP 14: Build App (5 min)

```bash
npm run build
# Wait for "✓ Compiled successfully"
```

---

## 🟢 STEP 15: Configure Nginx (5 min)

```bash
sudo tee /etc/nginx/sites-available/dadstillhere.com > /dev/null <<'EOF'
upstream nextjs {
  server 127.0.0.1:3000;
}

server {
  listen 80;
  server_name dadstillhere.com www.dadstillhere.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name dadstillhere.com www.dadstillhere.com;
  ssl_certificate /etc/letsencrypt/live/dadstillhere.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/dadstillhere.com/privkey.pem;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  access_log /var/log/nginx/dadstillhere.com.access.log;
  error_log /var/log/nginx/dadstillhere.com.error.log;
  gzip on;
  gzip_vary on;
  gzip_min_length 1000;
  gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
  location / {
    proxy_pass http://nextjs;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
  }
}
EOF

sudo ln -sf /etc/nginx/sites-available/dadstillhere.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🟢 STEP 16: Install SSL Certificate (5 min)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --standalone -d dadstillhere.com -d www.dadstillhere.com
# Answer prompts (email, agree to terms)

sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 🟢 STEP 17: Reload Nginx with SSL (2 min)

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -I https://dadstillhere.com
# Should return 200 with SSL info
```

---

## 🟢 STEP 18: Start App with PM2 (2 min)

```bash
cd /home/dadstillhere/app
pm2 start "npm start" --name "dadstillhere" --max-memory-restart 500M
pm2 status
# Should show "online"

sudo pm2 startup systemd -u dadstillhere --hp /home/dadstillhere
sudo pm2 save
```

---

## 🟢 STEP 19: Point Domain to VPS (5 min)

1. Get your VPS IP:
```bash
hostname -I
# Copy this IP address
```

2. In Hostinger domain panel:
   - Go to DNS / Nameservers
   - Create A records:
     - Name: `@` → Points to: [YOUR_VPS_IP]
     - Name: `www` → Points to: [YOUR_VPS_IP]
   - Save and wait 5-30 minutes for DNS propagation

3. Verify DNS:
```bash
nslookup dadstillhere.com
# Should show your VPS IP
```

---

## 🟢 STEP 20: Test Everything (5 min)

```bash
# Test HTTPS
curl -I https://dadstillhere.com
# Should return: HTTP/2 200

# Check app running
pm2 status

# Check logs
pm2 logs dadstillhere --lines 20

# Check database
psql -U dadstillhere_user -d dadstillhere_db -h localhost -c "SELECT version();"
```

---

## ✅ Success Checklist

- [ ] SSH connected to VPS
- [ ] System updated
- [ ] Node.js installed (v20+)
- [ ] PostgreSQL running
- [ ] Database created
- [ ] Nginx running
- [ ] Repository cloned
- [ ] npm install completed
- [ ] Prisma migrations run
- [ ] npm run build completed
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] PM2 running app
- [ ] Domain pointing to VPS
- [ ] https://dadstillhere.com responds with 200

---

## 🆘 Quick Troubleshooting

**If app doesn't start:**
```bash
pm2 logs dadstillhere --lines 50
# Check error message
pm2 restart dadstillhere
```

**If database won't connect:**
```bash
psql -U dadstillhere_user -d dadstillhere_db -h localhost
# Check password is correct in .env.local
```

**If SSL doesn't work:**
```bash
sudo certbot certificates
# Renew if expired
sudo certbot renew
```

**If Nginx error:**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

---

## 📞 Need Help?

1. Check logs: `pm2 logs dadstillhere`
2. Test database: `psql -U dadstillhere_user -d dadstillhere_db -h localhost`
3. Verify DNS: `nslookup dadstillhere.com`
4. Check Nginx: `sudo systemctl status nginx`

**Estimated total time: 2 hours**

Once done, your website will be live at **https://dadstillhere.com** 🎉

