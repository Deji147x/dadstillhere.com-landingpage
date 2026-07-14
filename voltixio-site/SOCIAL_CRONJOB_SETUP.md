# VoltixIO Social Media Automation — Cron Job Setup Guide

**Goal:** Automate 30-day social posting calendar (Jul 12–Aug 10) via scheduled tasks. Posts publish automatically 2 hours after blog goes live.

**Current status:** Blog publishing works (wp-cron, Hostinger scheduler). Social posting = manual. Goal: automate the manual step.

---

## OPTION 1: Buffer API (Recommended for Ease)

Buffer handles scheduling to all platforms (LinkedIn, X, Facebook) from one dashboard.

### Setup

1. **Create Buffer account** (free tier: 1 post/platform/week; paid: unlimited)
   - Sign up: https://buffer.com
   - Authenticate all platforms (LinkedIn, X, Facebook, Instagram)

2. **Generate API token**
   - Settings → API Integrations
   - Copy API token

3. **Install Buffer CLI** (optional; if you want command-line scheduling)
   ```bash
   # macOS
   brew install bufferapp/tap/buffer-cli
   
   # Or use web dashboard instead (simpler)
   ```

4. **Import 30-day calendar into Buffer**
   - Copy posts from SOCIAL_30DAY_CALENDAR.md
   - Paste into Buffer's "Compose" tool
   - Attach link + media
   - Select platforms (LinkedIn, X, Facebook)
   - Choose publish time (9:15 AM, 12:40 PM, 3:20 PM, etc.)
   - Click "Schedule"

5. **Set reply reminders**
   - Buffer dashboard shows engagement in real time
   - 2 hours after publish, check engagement tab
   - Reply to top comments (algorithm boost)

### Cron/Scheduling Rule (If Using CLI)

If automating post upload to Buffer via cron (advanced):

```bash
# /etc/cron.d/voltixio-social (Linux/macOS)
# Run daily at 8:00 AM to check blog posts and schedule social posts

0 8 * * * /usr/bin/python3 /home/user/voltixio-social-scheduler.py

# Script would:
# 1. Query wp.getPosts (future posts scheduled for today)
# 2. Extract title, slug, excerpt
# 3. Build social post text from template
# 4. Call Buffer API to schedule post
# 5. Log result
```

---

## OPTION 2: Hootsuite (More Powerful)

Hootsuite offers advanced scheduling, analytics, and team collaboration.

### Setup

1. **Create Hootsuite account** (30-day free trial available)
   - Sign up: https://hootsuite.com
   - Connect all social profiles

2. **Import calendar**
   - Bulk import feature: paste CSV of posts + times
   - Or manually add posts to calendar view

3. **Enable autoscheduling**
   - Compose → Schedule → Pick date/time → "Save to queue"
   - Posts publish automatically at scheduled time

4. **Team approval workflow** (optional)
   - Assign team members to review posts before publish
   - Automate reply management (Hootsuite AI can draft responses)

### Cron Integration (If Custom)

```bash
# Advanced: call Hootsuite API from cron to auto-schedule
# Requires Hootsuite Pro + API access

0 8 * * * curl -X POST https://api.hootsuite.com/v1/socialMessages \
  -H "Authorization: Bearer YOUR_HOOTSUITE_API_KEY" \
  -d '{
    "text": "Your post text here",
    "scheduledSendTime": "2026-07-20T09:15:00Z",
    "socialProfileIds": ["PROFILE_ID"]
  }'
```

---

## OPTION 3: Native Platform Scheduling (Simplest, Manual)

Use each platform's built-in scheduling (no third-party tools).

### LinkedIn (Native)

1. **Create post** → Click "Schedule"
2. **Pick date/time** → LinkedIn queues it
3. **Post publishes automatically** at scheduled time

*Limitation:* Must do this on LinkedIn web app for each post. No bulk import.

### X/Twitter (Native)

1. **Compose tweet** → Click "Schedule" (bottom-left)
2. **Pick date/time** → Tweet queues
3. **Auto-publishes** at time

*Limitation:* No bulk scheduling; 300-post limit per account.

### Facebook (Native)

1. **Create post** → Click "Schedule" (before publishing)
2. **Pick date/time** → Post queues
3. **Auto-publishes** at time

*Limitation:* Must use web app; 30-day max scheduling window.

### **Recommended if Manual:** 
Copy Week 2-4 posts into Buffer on Sunday evening (takes 20 min). Buffer schedules all platforms for the week. You check comments/replies daily.

---

## OPTION 4: Custom Python Cron Script (Advanced)

For full automation: blog publish → social post schedule.

### Script Flow

```python
#!/usr/bin/env python3
# /home/user/voltixio-auto-social.py
# Runs every 2 hours via cron; checks for new blog posts and schedules social posts

import json
import time
from datetime import datetime, timedelta
import xmlrpc.client
import requests

# WordPress XML-RPC
wp = xmlrpc.client.ServerProxy('https://voltixio.com/xmlrpc.php')
WP_USER = 'admin_voltixio'
WP_PASS = 'YOUR_PASSWORD_IN_ENV'  # Load from env var, not hardcoded

# Buffer API
BUFFER_API_KEY = 'YOUR_BUFFER_API_KEY'  # Load from env
BUFFER_PROFILES = {
    'linkedin': 'PROFILE_ID_1',
    'twitter': 'PROFILE_ID_2',
    'facebook': 'PROFILE_ID_3',
}

# Social post template (maps to blog topic)
SOCIAL_TEMPLATES = {
    'ai-scheduling-healthcare': {
        'linkedin': 'Healthcare: your patient acquisition engine is your phone. Missed calls = lost patients = $150K/year revenue leak. AI answers every call, confirms appointments, reduces no-shows from 20% to 8%. Read the case study: {url}',
        'twitter': 'Healthcare clinics: every unanswered call is a patient choosing your competitor. AI booking automation = 25% more patients + 60% fewer no-shows. Case study: {url}',
        'facebook': 'Medical practices: AI answering + appointment confirmation = full calendar, fewer no-shows, more revenue. See how one clinic grew 25% in 90 days: {url}',
    },
    # ... more templates for other topics
}

def get_new_posts():
    """Fetch posts published in last 2 hours."""
    now = datetime.utcnow()
    two_hours_ago = now - timedelta(hours=2)
    
    posts = wp.wp.getPosts(0, WP_USER, WP_PASS, {
        'post_status': 'publish',
        'number': 50,
    }, ['post_id', 'post_name', 'post_title', 'post_excerpt', 'post_date'])
    
    recent = [p for p in posts if datetime.fromisoformat(p['post_date'].split('.')[0]) > two_hours_ago]
    return recent

def build_social_post(post):
    """Generate social posts from blog post data."""
    slug = post['post_name']
    title = post['post_title']
    excerpt = post['post_excerpt']
    url = f"https://voltixio.com/blog/{slug}/?utm_source=social&utm_medium=social&utm_campaign=auto"
    
    # Match slug to template
    if slug in SOCIAL_TEMPLATES:
        template = SOCIAL_TEMPLATES[slug]
    else:
        # Generic fallback
        template = {
            'linkedin': f"{title}: {excerpt} Read more: {url}",
            'twitter': f"{title} - {excerpt} {url}",
            'facebook': f"{title}\n\n{excerpt}\n\nRead the full post: {url}",
        }
    
    return {platform: text.format(url=url) for platform, text in template.items()}

def schedule_to_buffer(post, social_texts):
    """Schedule post to Buffer API."""
    # Publish time: 2 hours after blog went live
    blog_pub_time = datetime.fromisoformat(post['post_date'].split('.')[0])
    social_pub_time = blog_pub_time + timedelta(hours=2)
    
    for platform, text in social_texts.items():
        profile_id = BUFFER_PROFILES.get(platform)
        if not profile_id:
            continue
        
        payload = {
            'profiles': [profile_id],
            'text': text,
            'shorten': True,
            'scheduled_at': social_pub_time.isoformat(),
        }
        
        headers = {'Authorization': f'Bearer {BUFFER_API_KEY}'}
        response = requests.post(
            'https://api.buffer.com/1/updates/create.json',
            json=payload,
            headers=headers,
        )
        
        if response.status_code == 200:
            print(f"✓ Scheduled {platform} post for {social_pub_time}")
        else:
            print(f"✗ Failed {platform}: {response.text}")
            
        time.sleep(1)  # Rate limit

def main():
    posts = get_new_posts()
    if not posts:
        print(f"{datetime.now().isoformat()} - No new posts.")
        return
    
    for post in posts:
        print(f"Processing: {post['post_name']}")
        social_texts = build_social_post(post)
        schedule_to_buffer(post, social_texts)

if __name__ == '__main__':
    main()
```

### Cron Setup

```bash
# /etc/cron.d/voltixio-auto-social
# Run every 2 hours
0 */2 * * * /usr/bin/python3 /home/user/voltixio-auto-social.py >> /var/log/voltixio-social.log 2>&1

# Or run every 4 hours (less resource-intensive)
0 */4 * * * /usr/bin/python3 /home/user/voltixio-auto-social.py
```

### Environment Variables

```bash
# ~/.bashrc or /etc/environment (never hardcode passwords)
export WP_PASSWORD="your_wordpress_password"
export BUFFER_API_KEY="your_buffer_api_key"
export VOLTIXIO_BLOG_URL="https://voltixio.com"
```

Then in script:
```python
import os
WP_PASS = os.getenv('WP_PASSWORD')
BUFFER_API_KEY = os.getenv('BUFFER_API_KEY')
```

---

## RECOMMENDED SETUP (Minimal Effort, Maximum Impact)

**For immediate 30-day automation with zero code:**

1. **Use Buffer** (easiest path)
   - Free or $15/month for all platforms
   - Copy 30-day posts from SOCIAL_30DAY_CALENDAR.md
   - Paste into Buffer's bulk scheduler (20 min work)
   - Buffer automates everything

2. **Manual Week 1** (already live via SOCIAL_WEEK1_CALENDAR.md)
   - Posts posted by hand or Buffer
   - Works, proven, no surprises

3. **Automate Weeks 2-4**
   - Copy posts into Buffer Sunday evening
   - Set forget it; posts publish automatically
   - Check engagement 2x daily

4. **Monitor GA4**
   - utm_source=social shows which posts drive traffic
   - Optimize next month's calendar based on wins

---

## TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Posts not scheduling | Check Buffer/platform auth; regenerate API token |
| Duplicate posts | Check Buffer queue; remove duplicates |
| Wrong timing | Verify timezone settings in Buffer (should be EDT/UTC-4) |
| Link tracking missing | Ensure utm_* params in all URLs |
| No comments/replies | Content might be off-target; review blog analytics |

---

## MAINTENANCE (Weekly)

- [ ] Monday: Review previous week's social analytics (GA4, platform insights)
- [ ] Tuesday: Schedule next week's posts (30 min via Buffer)
- [ ] Wednesday–Sunday: Reply to comments daily (2 hours after posts)
- [ ] Friday: Top-5 posts summary → save for repurposing (TikTok, email, case studies)

---

## METRICS TO TRACK (Monthly)

```json
{
  "impressions": "50K+ expected",
  "engagement_rate": "3-5% (platform avg: 1-2%)",
  "clicks_to_blog": "10K+ (utm_source=social)",
  "blog_to_conversion": "Track via GA4 goals (form fills, book call)",
  "top_post": "Identify by engagement; repurpose",
  "platform_performance": "LinkedIn 60%, X 25%, FB 15%, TikTok TBD"
}
```

---

## NEXT: Week 2+ Automation Readiness

- [x] 30-day calendar created (SOCIAL_30DAY_CALENDAR.md)
- [x] Automation options documented (this guide)
- [ ] Choose tool: Buffer (recommended) or manual
- [ ] Seed 2-week posts into scheduler
- [ ] Test first post; iterate

**Ready to set up Buffer, or prefer manual scheduling for now?**
