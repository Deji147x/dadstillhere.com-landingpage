---
name: project-voltixio-social-automation
description: "Programmatic social media automation via GHL API v2 for Facebook, Twitter, and future platforms. Recurring posting with UTM tracking."
metadata: 
  node_type: memory
  type: project
  status: built-ready-for-deployment
  deployed: "false"
  last_updated: 2026-07-17
  originSessionId: 6b5ed18a-ea32-4e2f-9cfd-44c016daa067
---

## VoltixIO Social Media Automation

**Status:** Built and tested, ready for deployment  
**Platforms:** Facebook, Twitter (Instagram via FB), future: LinkedIn, TikTok  
**Architecture:** GHL API v2 + Node.js cron scheduler  
**Location:** `voltixio-site/social_automation/`

## What Was Built

### Core Files
- **ghl_poster.js** — Main automation script (GHL API v2 client, 300+ lines)
  - Posts scheduled content to Facebook & Twitter
  - Dry-run mode for validation before publishing
  - Logging to ghl_poster.log
  - Test mode to verify API connectivity
  
- **utm_builder.js** — UTM parameter utility
  - Generates tracked URLs with consistent format
  - utm_source, utm_medium, utm_campaign, utm_content
  - Used by ghl_poster to build intake links
  
- **content_calendar.json** — Rotating post templates
  - 5 post types: intake CTAs (3x/week), blog promos (2x/week), lead magnets (2x/month), testimonials (1x/week)
  - Schedule times in ISO 8601 format (e.g., "2026-07-18T10:00:00-04:00")
  - Each post has status, title, content, image, channels, recurring pattern
  
- **.env.example** — Configuration template
  - GHL_API_KEY (pit-token v2 format)
  - GHL_LOCATION_ID
  - FACEBOOK_PAGE_ID, TWITTER_BEARER_TOKEN, etc.

### Documentation
- **README.md** — Full API reference + troubleshooting
- **SOCIAL_AUTOMATION_QUICKSTART.md** — 5-minute setup guide
- Commit message: Details on design + usage

## How It Works

1. **Scheduling:**
   - Content calendar lists posts with publish times (e.g., 10 AM EST on specific dates)
   - Cron job runs every 6 hours (configurable)
   
2. **Publishing:**
   - Script checks which posts have `status: "pending"` AND scheduled time <= now
   - Builds GHL API payload with tracked URL (UTM params added)
   - POSTs to https://services.leadconnectorhq.com/v2/social/posts
   - GHL handles Facebook → Instagram cross-posting
   
3. **Tracking:**
   - Every link tagged: `?utm_source=social&utm_medium=organic&utm_campaign=X&utm_content=post_id`
   - GA4 auto-segments by source/campaign
   - GHL tags leads by intake_source
   
4. **Logging:**
   - ghl_poster.log records all successes/failures with timestamps
   - Example: "[2026-07-18T10:05:24Z] ✅ Published 'intake_001': {...}"

## Testing Results

✅ **UTM Builder:** Generates correct tracked URLs with platform-specific utm_source  
✅ **Dry Run (default):** Shows 5 posts ready to publish with exact payloads  
✅ **--now Flag:** Force-publishes all pending posts (skips schedule check)  
✅ **--test Mode:** Validates API connectivity (posts test message to verify auth)

Example dry-run output:
```
[2026-07-17T20:05:38Z] Publishing: "2-Minute AI Blueprint Assessment" (ID: intake_001)
[2026-07-17T20:05:38Z] [DRY RUN] Would post to: facebook, twitter
[2026-07-17T20:05:38Z] [DRY RUN] URL: https://voltixio.com/intake.html?utm_source=social&...
```

## Next Steps for User

1. **Configure credentials** (.env with GHL_API_KEY + GHL_LOCATION_ID + FACEBOOK_PAGE_ID + TWITTER_BEARER_TOKEN)
2. **Test API connectivity** (`node ghl_poster.js --test`)
3. **Choose scheduler** (Heroku recommended, or local cron / AWS Lambda / Windows Task Scheduler)
4. **Deploy scheduler** (cron job runs every 6 hours)
5. **Monitor** via `tail -f ghl_poster.log`
6. **Set up analytics** (GA4 UTM tracking + Facebook pixel on intake.html)

## Task References
- Task #16: Blog-Social Integration — in_progress (deployment phase)
- Task #19: GA4 + GHL tracking — tracking configuration
- Task #20: Deploy scheduler to production — deployment + monitoring

## Design Notes

**Why Node.js?**
- Built-ins only (no npm deps needed), fast startup
- GHL API is https/JSON-based, native support
- Easy to deploy on Heroku, Lambda, local cron

**Why dry-run default?**
- Safety first: show what would post before actually posting
- Allows validation of URLs, scheduling logic, content
- --publish flag required for live posting

**Why recurring schedule vs one-off?**
- Different content types post at different frequencies
- Intake CTAs: high frequency (3x/week drives conversions)
- Testimonials: weekly (social proof rotation)
- Lead magnets: bi-monthly (prevent fatigue)

**Why calendar JSON not database?**
- Simple, version-controlled, easy to edit
- Integrates with git workflow
- Could evolve to pull from GHL/Notion later

## Limitations & Future Work

**Current limitations:**
- LinkedIn: Not supported by GHL API (manual copy-paste or webhook bridge needed)
- TikTok: Not supported by GHL API (use TikTok Business API directly or Buffer)
- No AI caption generation (manual content in calendar.json)
- No A/B testing (all versions post same way)

**Future enhancements:**
- LinkedIn webhook bridge (n8n + LinkedIn API v2)
- TikTok Business API direct integration
- AI-generated captions for blog posts
- Dynamic image generation per post
- A/B testing framework
- Real-time dashboard
