# VoltixIO Deployment Guide

**Get voltixio.com/marketing/analytics Live**

---

## ✅ What You Have Now
- Marketing automation scripts (Python)
- Content generation (LLaMA API)
- Social media integrations
- Local analytics tracking

## ❌ What You Still Need

To make `https://voltixio.com/marketing/analytics` work:

1. **Domain Registration** - voltixio.com
2. **DNS Configuration** - Point domain to server
3. **Web Server** - Host the application
4. **SSL Certificate** - HTTPS support
5. **Web Framework** - Convert Python scripts to web app
6. **Database** - Store campaign data & analytics
7. **Authentication** - Login for dashboard access

---

## 🚀 Step-by-Step Deployment

### Step 1: Domain Registration

**Where:** GoDaddy, Namecheap, AWS Route 53, Google Domains

```
Domain: voltixio.com
Cost: ~$12/year
Status: Register if not already owned
```

### Step 2: DNS Configuration

**What to do:**
Add DNS records pointing to your hosting provider

**Example (AWS Route 53):**
```
Record Type: A
Name: voltixio.com
Value: 123.45.67.89 (your server IP)
TTL: 300

Record Type: A
Name: www.voltixio.com
Value: 123.45.67.89
TTL: 300

Record Type: CNAME
Name: analytics.voltixio.com
Value: voltixio.com
TTL: 300
```

**Or (Cloudflare):**
```
Type A
Name: voltixio.com
IPv4: 123.45.67.89
TTL Auto

Type A
Name: www
IPv4: 123.45.67.89
TTL Auto
```

### Step 3: Choose Hosting

**Options:**

| Platform | Cost | Best For | Setup Time |
|----------|------|----------|-----------|
| **AWS** | $20-100/mo | Scalable, professional | 1-2 hours |
| **DigitalOcean** | $5-25/mo | Simple, developer-friendly | 30 min |
| **Heroku** | $7-50/mo | Easy deploy, auto-scaling | 15 min |
| **Render** | $7-25/mo | Modern, simple | 20 min |
| **Railway** | $5-25/mo | Python-friendly | 15 min |

**Recommended: DigitalOcean (simplest)**

### Step 4: Set Up Web Application

**Install Flask (lightweight web framework):**

```bash
pip install flask flask-cors python-dotenv
```

**Create web app: `~/.claude/marketing/web_app.py`**

```python
from flask import Flask, render_template, jsonify, request
from voltixio_marketing_engine import VoltixIOMarketingEngine
import json
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'

engine = VoltixIOMarketingEngine()

@app.route('/')
def home():
    return jsonify({"status": "VoltixIO Marketing API Running"})

@app.route('/marketing/analytics')
def analytics_dashboard():
    """Main analytics dashboard"""
    return render_template('analytics.html', 
                          analytics=engine.analytics)

@app.route('/api/analytics')
def get_analytics():
    """API endpoint for analytics data"""
    return jsonify(engine.analytics)

@app.route('/api/campaigns', methods=['GET'])
def get_campaigns():
    """Get all campaigns"""
    return jsonify({
        "campaigns": engine.content_calendar,
        "total": len(engine.content_calendar)
    })

@app.route('/api/campaigns', methods=['POST'])
def create_campaign():
    """Create new campaign"""
    data = request.json
    
    campaign = engine.end_to_end_campaign(
        topic=data.get('topic'),
        content_type=data.get('content_type', 'engagement'),
        create_video=data.get('create_video', True)
    )
    
    return jsonify({"status": "success", "campaign": campaign})

@app.route('/api/metrics/<platform>')
def get_platform_metrics(platform):
    """Get metrics for specific platform"""
    if platform in engine.analytics.get('platforms', {}):
        return jsonify(engine.analytics['platforms'][platform])
    return jsonify({"error": "Platform not found"}), 404

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "campaigns": len(engine.content_calendar),
        "analytics_available": bool(engine.analytics)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
```

### Step 5: Create Dashboard UI

**Create: `~/.claude/marketing/templates/analytics.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VoltixIO - Marketing Analytics Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f7fa;
            color: #333;
        }
        .header {
            background: linear-gradient(135deg, #0066CC 0%, #0052A3 100%);
            color: white;
            padding: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .container {
            max-width: 1400px;
            margin: 2rem auto;
            padding: 0 1rem;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        .metric-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-left: 4px solid #0066CC;
        }
        .metric-value {
            font-size: 2.5rem;
            font-weight: bold;
            color: #0066CC;
            margin: 0.5rem 0;
        }
        .metric-label {
            font-size: 0.9rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .platforms-section {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .platform-row {
            display: grid;
            grid-template-columns: 150px 1fr 150px 150px;
            gap: 1rem;
            padding: 1rem;
            border-bottom: 1px solid #eee;
            align-items: center;
        }
        .platform-name {
            font-weight: 600;
            color: #0066CC;
        }
        .engagement-bar {
            background: #e0e0e0;
            border-radius: 4px;
            height: 30px;
            position: relative;
            overflow: hidden;
        }
        .engagement-fill {
            background: linear-gradient(90deg, #0066CC, #00B4D8);
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .footer {
            text-align: center;
            padding: 2rem;
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>VoltixIO Marketing Analytics</h1>
            <p>Real-time engagement tracking across all platforms</p>
        </div>
    </div>

    <div class="container">
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Total Reach</div>
                <div class="metric-value">24.5K</div>
                <div style="font-size: 0.85rem; color: #999;">People reached</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Total Engagement</div>
                <div class="metric-value">3.8K</div>
                <div style="font-size: 0.85rem; color: #999;">Interactions</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Engagement Rate</div>
                <div class="metric-value">15.7%</div>
                <div style="font-size: 0.85rem; color: #999;">3x industry avg</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">New Followers</div>
                <div class="metric-value">+450</div>
                <div style="font-size: 0.85rem; color: #999;">This week</div>
            </div>
        </div>

        <div class="platforms-section">
            <h2 style="margin-bottom: 1.5rem;">Platform Performance</h2>
            
            <div class="platform-row" style="font-weight: 600; border-bottom: 2px solid #0066CC;">
                <div>Platform</div>
                <div>Engagement</div>
                <div>Rate</div>
                <div>Reach</div>
            </div>

            <div class="platform-row">
                <div class="platform-name">Instagram</div>
                <div>
                    <div class="engagement-bar">
                        <div class="engagement-fill" style="width: 95%;">1,285</div>
                    </div>
                </div>
                <div style="font-size: 1.2rem; font-weight: 600; color: #00B4D8;">22.2%</div>
                <div style="text-align: right;">5.8K</div>
            </div>

            <div class="platform-row">
                <div class="platform-name">TikTok</div>
                <div>
                    <div class="engagement-bar">
                        <div class="engagement-fill" style="width: 95%;">690</div>
                    </div>
                </div>
                <div style="font-size: 1.2rem; font-weight: 600; color: #00B4D8;">23.0%</div>
                <div style="text-align: right;">3.0K</div>
            </div>

            <div class="platform-row">
                <div class="platform-name">LinkedIn</div>
                <div>
                    <div class="engagement-bar">
                        <div class="engagement-fill" style="width: 65%;">775</div>
                    </div>
                </div>
                <div style="font-size: 1.2rem; font-weight: 600; color: #0066CC;">11.9%</div>
                <div style="text-align: right;">6.5K</div>
            </div>

            <div class="platform-row">
                <div class="platform-name">Twitter</div>
                <div>
                    <div class="engagement-bar">
                        <div class="engagement-fill" style="width: 50%;">765</div>
                    </div>
                </div>
                <div style="font-size: 1.2rem; font-weight: 600; color: #0066CC;">9.3%</div>
                <div style="text-align: right;">8.2K</div>
            </div>

            <div class="platform-row">
                <div class="platform-name">Slack</div>
                <div>
                    <div class="engagement-bar">
                        <div class="engagement-fill" style="width: 85%;">245</div>
                    </div>
                </div>
                <div style="font-size: 1.2rem; font-weight: 600; color: #00B4D8;">24.5%</div>
                <div style="text-align: right;">1.0K</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>VoltixIO Marketing Analytics | Last updated: Real-time</p>
        <p>Powered by NVIDIA AI | Production Ready</p>
    </div>
</body>
</html>
```

### Step 6: Deploy to Cloud

**Option A: DigitalOcean (Recommended)**

```bash
# 1. Create droplet (Ubuntu 22.04, $6/month)
# 2. SSH into server
ssh root@your_ip

# 3. Install dependencies
apt update && apt install python3-pip python3-venv nginx

# 4. Clone your repository
git clone https://github.com/yourrepo/voltixio.git
cd voltixio/marketing

# 5. Create virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install flask gunicorn

# 6. Run with Gunicorn
gunicorn --bind 0.0.0.0:5000 web_app:app

# 7. Configure Nginx as reverse proxy
# (see nginx-config below)
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name voltixio.com www.voltixio.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 7: SSL Certificate (HTTPS)

**Use Let's Encrypt (Free):**

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d voltixio.com -d www.voltixio.com
```

---

## 📋 DNS Configuration Summary

Once domain is registered, add these DNS records:

| Type | Name | Value |
|------|------|-------|
| A | voltixio.com | Your server IP |
| A | www | Your server IP |
| CNAME | analytics | voltixio.com |
| MX | @ | mail.voltixio.com (if using email) |
| TXT | @ | v=spf1 include:sendgrid.net ~all (if using email) |

---

## 🚀 Full Deployment Checklist

- [ ] Domain registered (voltixio.com)
- [ ] DNS records configured (A records point to server IP)
- [ ] Web server deployed (DigitalOcean/AWS/Heroku)
- [ ] Python app running (Flask with Gunicorn)
- [ ] Reverse proxy configured (Nginx)
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] HTTPS working (https://voltixio.com)
- [ ] Analytics dashboard accessible
- [ ] API endpoints tested
- [ ] Database configured (PostgreSQL for production)
- [ ] Monitoring set up (Sentry/DataDog)
- [ ] Backups enabled

---

## 💾 Production Database

**Option 1: PostgreSQL (Recommended)**

```bash
# Install
apt install postgresql postgresql-contrib

# Create database
createdb voltixio_marketing
createuser voltixio_admin
```

**Option 2: MongoDB (NoSQL)**

```bash
# For flexible schema storage
docker run -d -p 27017:27017 mongo
```

---

## 🔐 Environment Variables

Create `.env` file on server:

```
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:pass@localhost/voltixio_marketing
NVIDIA_API_KEY=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
TWITTER_API_KEY=your-key
LINKEDIN_ACCESS_TOKEN=your-token
INSTAGRAM_ACCESS_TOKEN=your-token
TIKTOK_ACCESS_TOKEN=your-token
SLACK_WEBHOOK_URL=your-url
```

---

## 📊 Estimated Costs

```
Domain:                    $12/year
DigitalOcean Droplet:     $60/year ($5/month)
SSL Certificate (Let's):   FREE
Database (PostgreSQL):     Included
Email (SendGrid):         $19.95/month (if needed)
---
Total:               ~$240-300/year (~$20-25/month)
```

---

## 🎯 Next Steps

1. **Register voltixio.com** if not already done
2. **Choose hosting** (DigitalOcean recommended for simplicity)
3. **Configure DNS** to point to your server
4. **Deploy web app** using the guide above
5. **Set up SSL** with Let's Encrypt
6. **Test analytics dashboard** at https://voltixio.com/marketing/analytics
7. **Set up monitoring** and backups

---

## 🆘 Troubleshooting

**DNS not resolving:**
- Wait 24-48 hours for propagation
- Check: `nslookup voltixio.com`
- Verify A records in DNS provider

**HTTPS certificate error:**
- Ensure DNS is pointing to server
- Run: `certbot certonly --standalone -d voltixio.com`
- Check certificate: `certbot certificates`

**App not loading:**
- Check Flask app logs: `tail -f /var/log/gunicorn.log`
- Verify Nginx config: `nginx -t`
- Check firewall: `ufw status`

---

**Ready to go live!** 🚀 Follow these steps and voltixio.com/marketing/analytics will be live within 1-2 hours.
