# Hostinger VPS Deployment Guide
## Deploy VoltixIO Flask App to Your VPS (31.97.132.83)

---

## 🎯 Your Setup
- **VPS Provider:** Hostinger
- **Domain:** voltixio.com / analytics.voltixio.com
- **Server IP:** 31.97.132.83
- **Application:** Flask (Python)
- **Dashboard:** https://voltixio.com/marketing/analytics

---

## 🚀 Step 1: Access Your Hostinger VPS Control Panel

```
1. Go to: https://hpanel.hostinger.com
2. Login with your Hostinger credentials
3. Click "VPS" in left sidebar
4. Select your VPS (31.97.132.83)
5. You'll see the control panel
```

---

## 📁 Step 2: Upload Your Application Files

### **Method A: Using Hostinger File Manager (Easiest)**

```
1. In Hostinger VPS panel, click "File Manager"
2. Navigate to: /home/[username]/public_html
   (or create /voltixio directory if you prefer)

3. Upload these files:
   ├── web_app.py (your Flask app)
   ├── voltixio_marketing_engine.py
   ├── social_media_integrations.py
   ├── templates/
   │   └── analytics.html
   └── .env (configuration file)
```

**Or upload the entire marketing folder as ZIP:**

```
1. Create ZIP: marketing.zip
2. Upload to /home/[username]/public_html/
3. Extract ZIP in File Manager
```

### **Method B: Using SSH (If preferred)**

```bash
# Find your SSH credentials in Hostinger panel:
# Settings → SSH Keys or show password

# Connect via SSH
ssh -p 22 username@31.97.132.83

# Navigate to public_html
cd /home/username/public_html/

# Or create voltixio directory
mkdir -p /home/username/public_html/voltixio
cd /home/username/public_html/voltixio

# Upload files (from your computer):
# Use SCP or upload via File Manager
```

---

## 🐍 Step 3: Install Python & Dependencies

### **In Hostinger Control Panel:**

```
1. Go to: VPS → Applications
2. Look for "Node.js" or "Python"
3. Click to install Python 3.10+ (if not already installed)
4. Wait for installation
```

### **Via SSH Terminal:**

```bash
# SSH into your VPS
ssh username@31.97.132.83

# Check Python is installed
python3 --version
# Should show: Python 3.10+

# Install pip if needed
sudo apt update
sudo apt install -y python3-pip python3-venv

# Navigate to your app directory
cd /home/username/public_html/voltixio

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install flask flask-cors gunicorn python-dotenv requests
```

---

## 🔧 Step 4: Create Configuration File

### **In File Manager, create .env file:**

```
Right-click in File Manager
→ Create New
→ File
→ Name it: .env

Paste this content:
```

```ini
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-change-this
FLASK_HOST=0.0.0.0
FLASK_PORT=5000

# NVIDIA API
NVIDIA_API_KEY=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
NVIDIA_API_URL=https://integrate.api.nvidia.com/v1/chat/completions

# Social Media (optional for now)
TWITTER_API_KEY=your-key-here
LINKEDIN_ACCESS_TOKEN=your-token-here
INSTAGRAM_ACCESS_TOKEN=your-token-here
TIKTOK_ACCESS_TOKEN=your-token-here
SLACK_WEBHOOK_URL=your-url-here
```

---

## 🌐 Step 5: Run Flask Application

### **Option A: Using Hostinger Process Manager (Recommended)**

```
1. In Hostinger VPS panel, go to:
   Settings → Processes or Applications

2. Click "Add Process" or "New Application"

3. Fill in:
   Name: VoltixIO Marketing
   Type: Custom/Python
   Path: /home/username/public_html/voltixio
   Command: 
   /home/username/public_html/voltixio/venv/bin/gunicorn \
   --bind 0.0.0.0:5000 \
   --workers 2 \
   --timeout 60 \
   web_app:app

4. Click "Start Process"
5. Status should show "Running" ✅
```

### **Option B: Manual with SSH (If no Process Manager)**

```bash
# SSH into VPS
ssh username@31.97.132.83

# Navigate to app
cd /home/username/public_html/voltixio

# Activate virtual environment
source venv/bin/activate

# Run with Gunicorn in background
nohup gunicorn --bind 0.0.0.0:5000 --workers 2 web_app:app > app.log 2>&1 &

# Check if running
curl http://localhost:5000

# Should return JSON with "VoltixIO Marketing API Running"
```

---

## 🔌 Step 6: Configure Nginx (Reverse Proxy)

### **In Hostinger Control Panel:**

```
1. Go to: Websites → Domains
2. Select analytics.voltixio.com
3. Click "Settings"
4. Find "Custom Nginx Configuration" or "Advanced Settings"
5. Add this configuration:
```

```nginx
upstream voltixio_app {
    server 127.0.0.1:5000;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name analytics.voltixio.com voltixio.com www.voltixio.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name analytics.voltixio.com voltixio.com www.voltixio.com;

    # SSL certificates (auto-installed by Hostinger)
    ssl_certificate /etc/letsencrypt/live/analytics.voltixio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/analytics.voltixio.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;

    # Proxy to Flask app
    location / {
        proxy_pass http://voltixio_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

6. Click "Save" and wait for Nginx to reload

---

## 🔒 Step 7: Enable SSL/HTTPS

### **In Hostinger Control Panel:**

```
1. Go to: Websites → Domains → analytics.voltixio.com
2. Click "SSL/TLS Certificate"
3. If not already installed:
   - Click "Install" or "Activate AutoSSL"
   - Select "Free Let's Encrypt"
   - Click "Install"
   - Wait 5-10 minutes

4. Verify: HTTPS works
   - Open: https://analytics.voltixio.com
   - Should show padlock 🔒
```

---

## 🧪 Step 8: Test Everything

### **Test 1: Check if Flask app is running**

```bash
# Via SSH
ssh username@31.97.132.83

# Check process
ps aux | grep gunicorn
# Should show: gunicorn process running

# Test API
curl http://localhost:5000/api/health
# Should return JSON with "healthy" status
```

### **Test 2: Test via domain**

```bash
# From your computer
curl -I http://analytics.voltixio.com/api/health
curl -I https://analytics.voltixio.com/api/health
```

### **Test 3: Access dashboard in browser**

```
Open: https://analytics.voltixio.com/marketing/analytics
Should show: Analytics dashboard with metrics
```

### **Test 4: Test API endpoints**

```bash
# Test 1: Health check
curl https://analytics.voltixio.com/api/health

# Test 2: Get analytics
curl https://analytics.voltixio.com/api/analytics

# Test 3: Get campaigns
curl https://analytics.voltixio.com/api/campaigns

# All should return 200 OK with JSON
```

---

## 📊 Check Application Logs

### **In Hostinger Panel:**

```
1. Go to: Settings → Processes
2. Find "VoltixIO Marketing"
3. Click to see logs
4. Check for errors
```

### **Via SSH:**

```bash
# View logs
tail -f /home/username/public_html/voltixio/app.log

# Or check Gunicorn logs
tail -f /var/log/gunicorn.log

# Exit with: Ctrl+C
```

---

## 🚀 Verify Full Deployment

### **Checklist:**

```
Application Files:
☐ web_app.py uploaded
☐ voltixio_marketing_engine.py uploaded
☐ social_media_integrations.py uploaded
☐ templates/analytics.html uploaded
☐ .env file created with API keys

Python Setup:
☐ Python 3.10+ installed
☐ Virtual environment created
☐ Dependencies installed
☐ Flask app running (via Process Manager or SSH)

Web Server:
☐ Nginx configured for reverse proxy
☐ SSL certificate installed (Let's Encrypt)
☐ HTTPS redirects working

Testing:
☐ curl http://localhost:5000/api/health returns 200
☐ https://analytics.voltixio.com/api/health works
☐ https://analytics.voltixio.com/marketing/analytics loads
☐ Dashboard shows analytics data
```

---

## 🎯 Final URLs

Once deployed, these should all work:

```
https://voltixio.com                    ✅ Redirects to HTTPS
https://www.voltixio.com                ✅ Redirects to HTTPS
https://analytics.voltixio.com          ✅ Flask app
https://voltixio.com/marketing/analytics ✅ Dashboard

API Endpoints:
https://analytics.voltixio.com/api/health
https://analytics.voltixio.com/api/analytics
https://analytics.voltixio.com/api/campaigns
https://analytics.voltixio.com/api/metrics
```

---

## 🆘 Troubleshooting

### **Flask app won't start**

```bash
# Check Python version
python3 --version

# Check dependencies installed
pip list | grep flask

# Check app syntax
python3 -c "import web_app"

# View detailed error
python3 web_app.py
```

### **Port 5000 already in use**

```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill it
sudo kill -9 <PID>

# Or use different port in gunicorn command
gunicorn --bind 0.0.0.0:8000 web_app:app
```

### **HTTPS certificate not working**

```
1. Wait 10 minutes (certificate still installing)
2. Hard refresh browser: Ctrl+Shift+R
3. Clear browser cache
4. Check Hostinger SSL/TLS panel
5. If still not working, contact Hostinger support
```

### **Dashboard shows 404 error**

```
1. Check Flask app is running: ps aux | grep gunicorn
2. Test API: curl http://localhost:5000/api/health
3. Check Nginx config is correct
4. Restart Nginx: sudo systemctl restart nginx
```

---

## 🎉 Success!

Once everything is working:

1. ✅ **Dashboard live:** https://voltixio.com/marketing/analytics
2. ✅ **API working:** https://analytics.voltixio.com/api/analytics
3. ✅ **HTTPS secure:** 🔒 Padlock visible
4. ✅ **Marketing automation:** Ready to generate campaigns

---

## 📞 Hostinger Support

If you need help with VPS settings:
- **Hostinger Help:** https://hpanel.hostinger.com/support
- **Live Chat:** Available 24/7 in control panel
- **Documentation:** https://www.hostinger.com/help

---

**You're ready to deploy! Follow the steps above and your analytics dashboard will be live in ~15 minutes!** 🚀
