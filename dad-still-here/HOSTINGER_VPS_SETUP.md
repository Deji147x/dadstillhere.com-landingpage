# 🚀 Hostinger VPS Setup Guide - Dad, Still Here

**VPS Details:**
- Hostname: srv1249195
- OS: Ubuntu 24.04 LTS (Noble)
- Root access: ✅ Ready
- Repo: https://github.com/Deji147x/dadstillhere.com

---

## Phase 1: System Setup & Security (15 minutes)

### Step 1.1: Update System
```bash
# SSH into your VPS (Hostinger provides this in your panel)
# Once logged in as root:

apt update
apt upgrade -y

# Restart if needed (you showed "No reboot required" so skip for now)
```

### Step 1.2: Create Non-Root User
```bash
# Create a dedicated user for the app (don't run Node as root)
useradd -m -s /bin/bash dadstillhere
usermod -aG sudo dadstillhere

# Set password
passwd dadstillhere
# (Create a strong password, save it securely)

# Switch to new user
su - dadstillhere
```

### Step 1.3: Configure Firewall
```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verify
sudo ufw status
# Should show: Status: active
```

---

## Phase 2: Install Dependencies (30 minutes)

### Step 2.1: Install Node.js (v18+)
```bash
# Using NodeSource repository for latest LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be v20.x
npm --version   # Should be v10.x
```

### Step 2.2: Install PostgreSQL
```bash
# Install PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Start on boot

# Verify
sudo -u postgres psql --version
```

### Step 2.3: Install Nginx (Reverse Proxy)
```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
```

### Step 2.4: Install Git & PM2
```bash
# Install Git
sudo apt install -y git

# Install PM2 (process manager for Node.js)
sudo npm install -g pm2

# Setup PM2 to start on boot
sudo pm2 startup
sudo pm2 save

# Verify
git --version
pm2 --version
```

---

## Phase 3: Database Setup (15 minutes)

### Step 3.1: Create PostgreSQL Database & User
```bash
# Connect to PostgreSQL as postgres user
sudo -u postgres psql

# Inside PostgreSQL:
CREATE DATABASE dadstillhere_db;
CREATE USER dadstillhere_user WITH PASSWORD 'your_secure_password_here';
ALTER ROLE dadstillhere_user SET client_encoding TO 'utf8';
ALTER ROLE dadstillhere_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE dadstillhere_user SET default_transaction_deferrable TO on;
ALTER ROLE dadstillhere_user SET default_transaction_level TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE dadstillhere_db TO dadstillhere_user;

# Exit PostgreSQL
\q
```

### Step 3.2: Verify Database Connection
```bash
# Test connection as dadstillhere_user
psql -U dadstillhere_user -d dadstillhere_db -h localhost

# Inside: \q to exit
```

### Step 3.3: Create .env File
```bash
# Create app directory
mkdir -p /home/dadstillhere/app
cd /home/dadstillhere/app

# Create .env.local with database credentials
cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://dadstillhere_user:your_secure_password_here@localhost:5432/dadstillhere_db"

# NextAuth
NEXTAUTH_URL="https://dadstillhere.com"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Email Service
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@dadstillhere.com"

# AWS S3 (optional)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="dadstillhere-media"

# Analytics
NEXT_PUBLIC_ANALYTICS_ID="your-analytics-id"
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Facebook & Meta
NEXT_PUBLIC_FACEBOOK_PIXEL_ID="1534484327973771"
FACEBOOK_CONVERSIONS_API_TOKEN="your-token"

# HubSpot
HUBSPOT_API_KEY="your-hubspot-key"

# Environment
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://dadstillhere.com/api"

# Encryption
ENCRYPTION_KEY="$(openssl rand -base64 32)"
EOF

# Secure the file (only dadstillhere user can read)
chmod 600 .env.local

echo ".env.local created - update with your actual credentials"
```

---

## Phase 4: Git Deployment Setup (15 minutes)

### Step 4.1: Clone Repository
```bash
cd /home/dadstillhere/app
rm -rf .  # Clear directory if needed
git clone https://github.com/Deji147x/dadstillhere.com .

# Verify files
ls -la
# Should see: package.json, next.config.js, prisma/, etc.
```

### Step 4.2: Install Dependencies
```bash
npm install

# This will take 2-3 minutes
# Should end with: added X packages, audited Y packages
```

### Step 4.3: Run Prisma Migrations
```bash
# Set DATABASE_URL for Prisma
export DATABASE_URL="postgresql://dadstillhere_user:your_password@localhost:5432/dadstillhere_db"

# Run migrations to create database schema
npx prisma migrate deploy

# If no migrations exist yet, create initial schema
npx prisma db push

# Verify tables created
npx prisma studio  # Optional: opens GUI database explorer
# Press Ctrl+C to exit
```

### Step 4.4: Build Next.js App
```bash
# Build the app
npm run build

# Should end with: ✓ Compiled successfully
```

---

## Phase 5: Nginx Configuration (10 minutes)

### Step 5.1: Create Nginx Config
```bash
# Create Nginx config for your domain
sudo tee /etc/nginx/sites-available/dadstillhere.com > /dev/null <<'EOF'
upstream nextjs {
  server 127.0.0.1:3000;
}

server {
  listen 80;
  server_name dadstillhere.com www.dadstillhere.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name dadstillhere.com www.dadstillhere.com;

  # SSL certificates (will setup in Step 5.3)
  ssl_certificate /etc/letsencrypt/live/dadstillhere.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/dadstillhere.com/privkey.pem;

  # Security headers
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "no-referrer-when-downgrade" always;

  # Logging
  access_log /var/log/nginx/dadstillhere.com.access.log;
  error_log /var/log/nginx/dadstillhere.com.error.log;

  # Gzip compression
  gzip on;
  gzip_vary on;
  gzip_min_length 1000;
  gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

  # Reverse proxy to Next.js
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
```

### Step 5.2: Enable Nginx Site
```bash
# Create symbolic link
sudo ln -sf /etc/nginx/sites-available/dadstillhere.com /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t
# Should say: successful

# Reload Nginx
sudo systemctl reload nginx
```

### Step 5.3: Install SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (will prompt for email)
sudo certbot certonly --standalone -d dadstillhere.com -d www.dadstillhere.com

# Auto-renew certificates
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

### Step 5.4: Verify SSL
```bash
# Update Nginx config with SSL paths (should already be in place)
sudo nginx -t
sudo systemctl reload nginx

# Check SSL from browser or command line
curl -I https://dadstillhere.com
# Should return 200 and show SSL certificate info
```

---

## Phase 6: Start Application (5 minutes)

### Step 6.1: Start Next.js with PM2
```bash
cd /home/dadstillhere/app

# Start the app
pm2 start "npm start" --name "dadstillhere" --max-memory-restart 500M

# Configure PM2 to restart on boot
sudo pm2 startup systemd -u dadstillhere --hp /home/dadstillhere
sudo pm2 save

# Verify app is running
pm2 status
# Should show "dadstillhere" with status "online"
```

### Step 6.2: Check Logs
```bash
# View PM2 logs
pm2 logs dadstillhere

# View Nginx error logs (if needed)
sudo tail -f /var/log/nginx/dadstillhere.com.error.log

# View system journal (if needed)
sudo journalctl -u nginx -n 50
```

### Step 6.3: Test Application
```bash
# Test from command line
curl -I https://dadstillhere.com
# Should return 200 OK

# Check if app is responding
curl https://dadstillhere.com/api/health 2>/dev/null | grep -q "." && echo "✅ App is running" || echo "❌ App not responding"
```

---

## Phase 7: Point Domain to VPS (5 minutes)

### Step 7.1: DNS Configuration
1. **Get your VPS IP address:**
   ```bash
   hostname -I
   # Example output: 123.45.67.89
   ```

2. **Update DNS records** (via Hostinger Domain Manager):
   - Go to your domain panel
   - DNS / Nameservers section
   - Create A records:
     - `@` → Your VPS IP (123.45.67.89)
     - `www` → Your VPS IP (123.45.67.89)

3. **Wait for DNS propagation** (5-30 minutes)

4. **Verify DNS:**
   ```bash
   nslookup dadstillhere.com
   # Should show your VPS IP
   ```

---

## Phase 8: Deployment & Updates (Automated)

### Step 8.1: Create Git Pull Script
```bash
# Create deploy script
sudo tee /home/dadstillhere/app/deploy.sh > /dev/null <<'EOF'
#!/bin/bash
cd /home/dadstillhere/app

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Build app
npm run build

# Restart PM2
pm2 restart dadstillhere

echo "✅ Deployment complete"
EOF

# Make executable
chmod +x /home/dadstillhere/app/deploy.sh
```

### Step 8.2: Manual Deployment
```bash
# To deploy new changes:
cd /home/dadstillhere/app
./deploy.sh

# Or manually:
git pull origin main
npm install
npx prisma migrate deploy
npm run build
pm2 restart dadstillhere
```

### Step 8.3: Webhook Deployment (Optional)
```bash
# For automatic deploys on git push:
# 1. Install webhook listener
sudo npm install -g node-webhook

# 2. Create webhook handler
# (Advanced setup - can add later)
```

---

## Phase 9: Monitoring & Maintenance

### Step 9.1: Set Up Monitoring
```bash
# Monitor PM2 processes
pm2 monit

# Monitor disk space
df -h
# Keep free space > 20%

# Monitor memory
free -h

# Monitor PostgreSQL connections
sudo -u postgres psql -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```

### Step 9.2: Backup Database
```bash
# Create backup
sudo -u postgres pg_dump dadstillhere_db > /home/dadstillhere/backups/backup_$(date +%Y%m%d).sql

# Automated daily backup (cron)
sudo tee /etc/cron.daily/dadstillhere-backup > /dev/null <<'EOF'
#!/bin/bash
mkdir -p /home/dadstillhere/backups
sudo -u postgres pg_dump dadstillhere_db | gzip > /home/dadstillhere/backups/backup_$(date +\%Y\%m\%d).sql.gz
find /home/dadstillhere/backups -name "*.gz" -mtime +30 -delete
EOF

sudo chmod +x /etc/cron.daily/dadstillhere-backup
```

### Step 9.3: Log Rotation
```bash
# Nginx logs are auto-rotated, but verify:
sudo cat /etc/logrotate.d/nginx

# PM2 logs
pm2 save
pm2 logs --lines 100
```

---

## 🚨 Troubleshooting

### Issue: App not responding after deploy
```bash
# Check PM2 status
pm2 status

# Restart app
pm2 restart dadstillhere

# Check logs
pm2 logs dadstillhere --lines 50
```

### Issue: Database connection error
```bash
# Test connection
psql -U dadstillhere_user -d dadstillhere_db -h localhost

# Check DATABASE_URL in .env.local
cat /home/dadstillhere/app/.env.local | grep DATABASE_URL

# Run migrations again
cd /home/dadstillhere/app
npx prisma migrate deploy
```

### Issue: SSL certificate error
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Manual renewal if needed
sudo certbot certonly --standalone -d dadstillhere.com -d www.dadstillhere.com --force-renewal
```

### Issue: High memory usage
```bash
# Check PM2 memory
pm2 status

# Increase max memory restart
pm2 delete dadstillhere
pm2 start "npm start" --name "dadstillhere" --max-memory-restart 1000M
pm2 save
```

---

## ✅ Deployment Checklist

- [ ] SSH into VPS
- [ ] Update system (`apt update && apt upgrade`)
- [ ] Create non-root user
- [ ] Enable firewall
- [ ] Install Node.js, PostgreSQL, Nginx, Git, PM2
- [ ] Create PostgreSQL database and user
- [ ] Create `.env.local` with all credentials
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Run Prisma migrations
- [ ] Build Next.js app
- [ ] Configure Nginx
- [ ] Install SSL certificate
- [ ] Start app with PM2
- [ ] Point domain to VPS
- [ ] Test https://dadstillhere.com
- [ ] Set up backups
- [ ] Monitor logs

---

## 📊 Quick Reference Commands

```bash
# App Management
pm2 status              # Check app status
pm2 restart dadstillhere  # Restart app
pm2 logs dadstillhere   # View logs
pm2 stop dadstillhere   # Stop app
pm2 delete dadstillhere # Remove from PM2

# Database
psql -U dadstillhere_user -d dadstillhere_db  # Connect to DB
npx prisma studio      # Open database GUI
npx prisma migrate deploy  # Run migrations

# Nginx
sudo systemctl restart nginx  # Restart Nginx
sudo nginx -t           # Test config
sudo tail -f /var/log/nginx/error.log  # View errors

# Git Deployment
cd /home/dadstillhere/app
git pull origin main
npm install
npm run build
pm2 restart dadstillhere

# System
df -h                   # Disk usage
free -h                 # Memory usage
systemctl status postgresql  # PostgreSQL status
```

---

## 🎉 Success Indicators

- ✅ `curl https://dadstillhere.com` returns 200 OK
- ✅ SSL certificate is valid (green lock in browser)
- ✅ `pm2 status` shows "dadstillhere" as "online"
- ✅ Database is connected (no connection errors in logs)
- ✅ Homepage loads with styling
- ✅ API endpoints respond

**Time to completion:** ~2 hours total  
**Difficulty:** Intermediate (no prior DevOps needed)  
**Support:** Check logs first, then troubleshooting section above

