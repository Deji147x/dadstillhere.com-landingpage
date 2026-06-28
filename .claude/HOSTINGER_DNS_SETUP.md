# Hostinger DNS Setup for VoltixIO
## Complete Guide for voltixio.com → Analytics Dashboard

---

## 🎯 Goal
Point **https://voltixio.com/marketing/analytics** to your VoltixIO marketing dashboard

---

## 📝 Prerequisites

Before starting, you need:

1. ✅ **Hostinger account** with voltixio.com registered
2. ✅ **Web hosting** (Hostinger Shared Hosting or VPS)
3. ✅ **Server IP address** (your hosting provider gives this)
4. ✅ **Hosting account** set up with your IP

---

## 🔍 Find Your Server IP Address

**If using Hostinger hosting:**

1. Log in to **Hostinger Control Panel**
2. Go to **Hosting** → **Your Domain**
3. Look for **Server Information** section
4. Find your **IP Address** (looks like: `123.45.67.89`)
5. **Copy this IP** - you'll need it below

**If using different hosting:**
- Contact your hosting provider for the IP address
- Or check your hosting control panel

---

## 🚀 Step-by-Step DNS Setup in Hostinger

### **Step 1: Access DNS Management**

```
1. Login to Hostinger.com
2. Go to "My Domains"
3. Find "voltixio.com"
4. Click "Manage" (or the three dots icon)
5. Select "Manage DNS" or "DNS Settings"
```

### **Step 2: Add DNS Records**

You'll see existing records. Add these NEW records:

---

## 📋 DNS Records to Add

**Copy exactly as shown below:**

### **Record 1: Main Domain (A Record)**

```
Type:   A
Host:   @ (or leave blank)
Value:  YOUR_SERVER_IP (e.g., 123.45.67.89)
TTL:    3600 (or default)
```

**Visual Example in Hostinger:**
```
┌─────────────────────────────────────────┐
│ Type: [A        ▼]                      │
│ Host: [@]                               │
│ Value: [123.45.67.89              ]    │
│ TTL: [3600    ▼]                       │
└─────────────────────────────────────────┘
```

✅ **Click "Add" or "Save"**

---

### **Record 2: WWW Subdomain (A Record)**

```
Type:   A
Host:   www
Value:  YOUR_SERVER_IP (same as above)
TTL:    3600 (or default)
```

**Visual Example:**
```
┌─────────────────────────────────────────┐
│ Type: [A        ▼]                      │
│ Host: [www]                             │
│ Value: [123.45.67.89              ]    │
│ TTL: [3600    ▼]                       │
└─────────────────────────────────────────┘
```

✅ **Click "Add" or "Save"**

---

### **Record 3: Analytics Subdomain (A Record)**

```
Type:   A
Host:   analytics
Value:  YOUR_SERVER_IP (same as above)
TTL:    3600 (or default)
```

**Visual Example:**
```
┌─────────────────────────────────────────┐
│ Type: [A        ▼]                      │
│ Host: [analytics]                       │
│ Value: [123.45.67.89              ]    │
│ TTL: [3600    ▼]                       │
└─────────────────────────────────────────┘
```

✅ **Click "Add" or "Save"**

---

### **Record 4: Optional - Email (MX Record)**

*Only if you want email for voltixio.com*

```
Type:   MX
Host:   @ (or leave blank)
Value:  mail.voltixio.com (or your mail server)
TTL:    3600
Priority: 10
```

---

## ✅ After Adding Records

**Your DNS should look like this:**

```
Type  | Host     | Value           | TTL
------|----------|-----------------|------
A     | @        | 123.45.67.89    | 3600
A     | www      | 123.45.67.89    | 3600
A     | analytics| 123.45.67.89    | 3600
```

---

## 🔒 SSL/HTTPS Setup

### **Option 1: Hostinger Auto SSL (Recommended)**

1. In Hostinger Control Panel
2. Go to **SSL/TLS Certificate**
3. Click **"Install SSL"** or **"Activate AutoSSL"**
4. Select **Free SSL** (Let's Encrypt)
5. Click **"Install"**
6. **Wait 5-10 minutes** for activation

✅ HTTPS will work automatically!

### **Option 2: Manual with Let's Encrypt**

If you're using your own VPS:

```bash
# SSH into your server
ssh root@your_ip

# Install certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot certonly --standalone -d voltixio.com -d www.voltixio.com -d analytics.voltixio.com

# Follow the prompts and accept terms
```

---

## 📊 DNS Propagation

After adding records:

⏱️ **Wait time:** 5 minutes to 48 hours (usually 15-30 minutes)

**Check status:**

```bash
# In terminal/cmd on your computer:
nslookup voltixio.com

# Or use online tool:
# https://www.nslookup.io/domains/voltixio.com/
```

**Expected output:**
```
Server: 8.8.8.8
Address: 8.8.8.8#53

Non-authoritative answer:
Name: voltixio.com
Address: 123.45.67.89 ✅
```

---

## 🧪 Test Your Setup

### **Test 1: Check DNS Resolution**

```bash
nslookup voltixio.com
# Should return: 123.45.67.89
```

### **Test 2: Check HTTPS Works**

```bash
# Open in browser:
https://voltixio.com
# Should show your website
```

### **Test 3: Check Analytics Dashboard**

```bash
# Open in browser:
https://voltixio.com/marketing/analytics
# Should show analytics dashboard
```

### **Test 4: Check Subdomains**

```bash
# All should work:
https://www.voltixio.com
https://analytics.voltixio.com
https://voltixio.com/marketing/analytics
```

---

## 🛠️ Troubleshooting

### **Problem: Domain still shows Hostinger parking page**

**Solution:**
1. Go to **Hostinger Control Panel**
2. Click **Hosting**
3. Set **Primary Domain** to **voltixio.com**
4. Wait 30 minutes
5. Clear browser cache (Ctrl+Shift+Delete)

### **Problem: HTTPS certificate error**

**Solution:**
1. Wait 10 minutes (certificate still installing)
2. Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
3. If still not working:
   - Go to SSL/TLS in Hostinger
   - Click "Install SSL" again
   - Wait another 5 minutes

### **Problem: DNS not resolving**

**Solution:**
1. Verify DNS records are correct in Hostinger
2. Check you used YOUR_SERVER_IP (not example IP)
3. Wait 24 hours (rare cases)
4. Contact Hostinger support: **support.hostinger.com**

### **Problem: analytics subdomain not working**

**Solution:**
1. Make sure you added the "analytics" A record (Step Record 3)
2. Hostinger might need 5-30 minutes to activate subdomains
3. Try accessing directly: `https://analytics.voltixio.com`

---

## 📋 Checklist Before Going Live

```
DNS Records (in Hostinger):
[ ] A record: @ → YOUR_SERVER_IP
[ ] A record: www → YOUR_SERVER_IP
[ ] A record: analytics → YOUR_SERVER_IP
[ ] TTL set to 3600

SSL Certificate:
[ ] AutoSSL enabled or certificate installed
[ ] HTTPS working (padlock icon visible)

Testing:
[ ] https://voltixio.com loads
[ ] https://www.voltixio.com loads
[ ] https://analytics.voltixio.com loads
[ ] https://voltixio.com/marketing/analytics shows dashboard

DNS Propagation:
[ ] nslookup voltixio.com returns correct IP
[ ] Global DNS propagated (check nslookup.io)
```

---

## 🚀 Summary

| Step | What To Do | Where |
|------|-----------|-------|
| 1 | Get your server IP | Hostinger Hosting Info |
| 2 | Add 3 A records | Hostinger DNS Settings |
| 3 | Enable AutoSSL | Hostinger SSL/TLS |
| 4 | Wait 15-30 min | (DNS propagation) |
| 5 | Test in browser | https://voltixio.com |
| 6 | Test analytics | https://voltixio.com/marketing/analytics |

---

## 📞 Need Help?

**Hostinger Support:**
- **Live Chat:** https://support.hostinger.com
- **Phone:** Available 24/7
- **Email:** support@hostinger.com

**Verification:**
```bash
# Verify everything is set up correctly:
# 1. Check DNS:
nslookup voltixio.com

# 2. Check HTTPS:
curl -I https://voltixio.com

# 3. Check status:
curl https://voltixio.com/api/health
```

---

## ✨ Once Complete

After DNS and SSL are working:

1. ✅ Your domain works: **https://voltixio.com**
2. ✅ Marketing analytics live: **https://voltixio.com/marketing/analytics**
3. ✅ SSL/HTTPS secure: 🔒 padlock visible
4. ✅ Email ready: if configured

---

**You're all set! Your VoltixIO marketing dashboard will be live at https://voltixio.com/marketing/analytics** 🎉
