# GoHighLevel Social Automation Integration (Replaces Buffer)

## Context

User pivoted from Buffer (simple scheduling) to GoHighLevel (unified platform). Reason: consolidate blog + social + CRM into one system with AI optimization + lead capture.

**Current state:**
- WordPress: 200 topics, 49 posts queued for Week 2-4, image pool.json (40 Unsplash images topic-matched)
- Intended social stack: SOCIAL_30DAY_CALENDAR.md + BUFFER_QUICK_START.md (created this session)
- User's GHL workspace: API access ready, CRM workflow exists

**Why GHL instead of Buffer:**
1. **Auto-sync:** Blog post → GHL → rewrites for LinkedIn/X/Facebook tone + publishes all platforms
2. **AI optimization:** Each platform gets optimized copy (not one post three times)
3. **Image automation:** Programmatically assign from 40-image pool per post
4. **Lead capture:** Comment on social → GHL webhook → CRM workflow (email + booking link)
5. **Unified dashboard:** One view for social + CRM metrics (not GA4 + Buffer + WordPress scattered)

## Approach — WordPress → GoHighLevel Automation

1. **Connect via Zapier/Make:**
   - Trigger: WordPress post published → GHL trigger hook
   - Action: GHL receives post title, excerpt, content, featured image URL
   - GHL creates draft social posts (1 LinkedIn, 1 X, 1 Facebook per blog post)

2. **GHL AI Optimization (native feature):**
   - LinkedIn post: professional tone, B2B context, CTAs to strategy call
   - X post: <280 chars, conversational, hookline + link
   - Facebook post: casual, warm audience, lead-friendly
   - Each optimized per platform's algorithm + audience

3. **Programmatic Image Assignment:**
   - Webhook receives image_pool.json attachment ID for post slug
   - GHL assigns featured image to all 3 social drafts
   - No manual image work; keeps 40-pool consistency

4. **Scheduling + Lead Capture:**
   - Schedule posts to publish at designated times (9:15, 12:40, 3:20 EDT per calendar)
   - Comment monitoring: GHL webhook captures comments → CRM workflow triggers
   - Workflow: auto-reply email (thank you + booking link) + add to "social leads" segment

5. **Analytics & Reporting:**
   - GHL dashboard: impressions, engagement, comment sentiment, lead-capture conversion
   - GA4 remains for blog traffic; GHL handles social ROI

## Critical Files

**To create/modify:**
- `voltixio-site/GOHIGHLEVEL_SETUP.md`: step-by-step GHL workspace config + Zapier/Make setup
- `scratchpad/ghl_webhook_receiver.py`: receives WordPress payload, assigns images, triggers GHL API
- `scratchpad/test_ghl_integration.py`: verify blog → GHL flow end-to-end

**Already exist (reuse):**
- `voltixio-site/image_pool.json`: 40 images, topic-tagged (pass to GHL via webhook)
- `voltixio-site/SOCIAL_30DAY_CALENDAR.md`: post calendar + timing (GHL schedules these)
- `voltixio-site/BUFFER_QUICK_START.md`: can be archived or kept as fallback

**GHL workspace (user has):**
- API credentials (OAuth token) for GHL
- CRM workflow already configured (comment → email → booking)
- Social profiles connected (LinkedIn, X, Facebook)

## Implementation Steps

1. **Zapier/Make setup:** WordPress → GHL zap (3 min, visual UI)
   - Trigger: Post published
   - Action: Send to GHL webhook with post data + image pool JSON reference
   
2. **GHL webhook receiver:** Python script in scratchpad
   - Parse WordPress post data
   - Look up image from pool by post slug/topic
   - Call GHL API to create drafts (3 posts: LI, X, FB)
   - GHL AI optimization happens server-side

3. **Verify flow:** Manual test
   - Publish test post in WordPress
   - Check GHL dashboard: 3 draft posts auto-created with correct image + optimized text
   - Manually publish one to verify appearance on social

4. **Enable comment capture:** GHL webhook + CRM workflow
   - GHL monitors social comments 24/7
   - Auto-triggers CRM email sequence on comment
   - Test: comment on published post → verify email received

## Verification

- [ ] Test post publishes in WordPress
- [ ] 3 drafts auto-appear in GHL (LinkedIn, X, Facebook) within 2 min
- [ ] Featured image assigned correctly to all 3 drafts
- [ ] GHL AI text differs per platform (check: X is shorter, LI is formal)
- [ ] Scheduled posts publish at correct times (9:15, 12:40, 3:20 EDT)
- [ ] Comment on social post → CRM email arrives within 5 min
- [ ] GA4 + GHL dashboard both show traffic from social (verify UTM tags flow through)

## Why This Works

- **No manual work:** Blog publishes → social auto-creates + optimizes + schedules
- **Consistency:** 40-image pool applies to all posts; no duplicates per week
- **Lead capture:** Every comment is a prospect; auto-email + CRM adds them
- **Scalable:** Week 3+ posts use same pipeline; just keep publishing blog

## CSV Transformation: Week 2 Posts (New)

### Context
User wants to convert Week 2 posts (49 posts, Jul 20-26) to a platform-specific CSV format that supports:
- Date/Time in ISO format (2026-07-20 09:15)
- Text with captions + hashtags
- Link (OG meta tag, one per post)
- Image assignments (multiple comma-separated from 40-image pool)
- Video/GIF fields (optional, one GIF max)
- Supports up to 90 posts per CSV

### Approach

**1. Transform Existing CSVs:**
- Source: `twitter_week2_manual.csv` + `facebook_week2_schedule.csv`
- Target: `week2_social_posts.csv` (unified format)
- Columns: `Date, Text, Link, Image, Video, GIF`

**2. Create Transformation Script:**
- File: `convert_csv_format.py`
- Reads both existing CSVs
- Merges and reformats data
- Assigns images from `image_pool.json` (round-robin rotation)
- Adds hashtags based on post category
- Outputs single CSV with proper date format: `YYYY-MM-DD HH:mm`

**3. Image Pool Assignment:**
- Use existing: `image_pool.json` (40 topic-matched Unsplash images)
- Assign one image per post (rotation to avoid repeats within 7-day window)
- Format: Comma-separated Unsplash URLs in Image column

**4. Hashtags:**
- Extract from post title/category
- Add relevant tags: `#AIAutomation #LeadGeneration #BusinessAutomation` etc.
- Append to Text column

**5. Output CSV:**
- Single file: `week2_social_posts.csv`
- 49 posts (under 90-post limit)
- Ready for platform upload (Buffer, native schedulers, etc.)

### Critical Files

**To create:**
- `voltixio-site/convert_csv_format.py`: Transform script
- `voltixio-site/week2_social_posts.csv`: Final output CSV

**Already exist (reuse):**
- `voltixio-site/twitter_week2_manual.csv`: Source data
- `voltixio-site/facebook_week2_schedule.csv`: Source data
- `voltixio-site/image_pool.json`: 40 images for assignment

### Implementation Steps

1. **Read image pool:** Extract 40 Unsplash image URLs from `image_pool.json`
2. **Parse source CSVs:** Read Twitter + Facebook CSVs
3. **Transform data:**
   - Convert date format to ISO: `2026-07-20 09:15`
   - Merge text (caption + hashtags)
   - Assign link (OG meta tag URL)
   - Assign image (rotation from pool)
   - Leave video/GIF empty
4. **Output CSV:** Write `week2_social_posts.csv` with proper headers
5. **Verify:** Check row count (49), date formats, image URLs, links

### Verification

- [ ] CSV file created: `week2_social_posts.csv`
- [ ] All 49 posts present
- [ ] Date format correct: `2026-07-20 HH:mm` format
- [ ] Text includes captions + hashtags
- [ ] Link column populated (one per post)
- [ ] Image column has Unsplash URLs (no duplicates in 7-day window)
- [ ] Video/GIF columns empty (as expected)
- [ ] CSV imports successfully into platform (Buffer, native scheduler, etc.)

### Why This Works

- **Unified format:** Single CSV for all platforms + posting tools
- **Image consistency:** Uses existing 40-image pool (no duplicates)
- **Hashtags:** Auto-generated from post content
- **Ready to upload:** Works with Buffer, native schedulers, platform-specific tools
- **Scalable:** Same format for Week 3-4 posts

## ROOT CAUSE: Automation Never Deployed to Production

**Discovery from WordPress audit:**
- ✅ All automation scripts written and ready (in voltixio-site/)
- ✅ All documentation complete (SOCIAL_CRONJOB_SETUP.md, IFTTT_AUTOMATION_SETUP.md, etc.)
- ✅ Blog posts ARE publishing (180 completed, 14 for Jul 20-21 live with comments)
- ❌ **No cron job actually running** (cronjob was never deployed)
- ❌ **No .env credentials configured** (Buffer API keys, Twitter Bearer token missing)
- ❌ **No IFTTT applets created** (XML-RPC connection not configured)
- ❌ **No Windows Task Scheduler jobs** (blog publishing automation never set up)

**Why manual CSV was used:**
Since no automation exists, we manually created + scheduled 49 social posts via CSV → GHL upload (today's workflow).

## Recommended Solution: IFTTT + Hostinger (Simplest Path)

**Option:** Use IFTTT to auto-trigger social posting when WordPress publishes blog posts

### Implementation Plan

**Phase 1: Enable XML-RPC on Hostinger (5 min)**
1. Verify `https://voltixio.com/xmlrpc.php` is accessible
   - If returns XML: ✓ Ready
   - If returns 403: Contact Hostinger to unblock XML-RPC
2. Disable 2FA temporarily (IFTTT can't handle 2FA)
3. Test XML-RPC connection via browser

**Phase 2: Set Up IFTTT Applets (20 min)**
1. Create IFTTT account (free tier supports 3 applets)
2. Create 3 applets (one per platform):
   - Applet 1: WordPress publish → Twitter auto-post
   - Applet 2: WordPress publish → Facebook auto-post
   - Applet 3: WordPress publish → LinkedIn auto-post
3. Configure each applet:
   - Trigger: New WordPress post published
   - Action: Post to platform with title + link + image
   - Check interval: Every 15 minutes

**Phase 3: Test End-to-End (10 min)**
1. Publish test blog post
2. Wait 15 minutes for IFTTT to detect it
3. Verify post appears on Twitter, Facebook, LinkedIn
4. Monitor for 1 week to confirm reliability

**Critical Files to Reference:**
- `C:\Users\Parlevu_Global\voltixio-site\IFTTT_AUTOMATION_SETUP.md` (detailed setup guide)
- `C:\Users\Parlevu_Global\voltixio-site\IFTTT_WORDPRESS_TROUBLESHOOTING.md` (XML-RPC fixes)
- `C:\Users\Parlevu_Global\voltixio-site\.env.example` (template for credentials)

### Why IFTTT?
- No server/cron setup needed
- No code deployment to Hostinger
- Works directly from Hostinger WordPress
- Free tier (or $4.99/mo Pro for unlimited applets)
- Auto-posts with 15-min check interval
- Handles social platform authentication

### Alternative: Windows Task Scheduler (More Control)
If you prefer scheduled publishing at exact times (9:15 AM, 12 PM, etc.):
- Use `blog_deployment_guide.md` to create Windows Task Scheduler jobs
- Script: `publish_blog_posts_jul2026.py` (already working—used for Jul 20-21)
- Run on your machine every 4 hours to publish blog batches
- More manual, more control over timing

## FINAL APPROACH: Hostinger Cron Job (User Selected)

Deploy a Python cron job directly to Hostinger server to auto-publish blog posts and trigger social media posts.

### Why Hostinger Cron?
- Runs 24/7 on Hostinger servers (not dependent on your machine)
- Continuous automation (every 2-4 hours checks for new blog posts)
- Most reliable for production use
- Scales automatically as blog post volume grows

### Implementation: 4-Step Deployment

**Step 1: Prepare Python Script for Hostinger**
- File to deploy: `publish_blog_posts_scheduled.py` (new, based on `publish_blog_posts_jul2026.py`)
- Modifications needed:
  - Load credentials from environment variables (not hardcoded)
  - Add logging to Hostinger file system (track cron runs)
  - Handle errors gracefully (email alerts on failure)
  - Query for future-dated unpublished posts only (avoid republishing)

**Step 2: Set Up Hostinger Environment**
1. **Login to Hostinger hPanel:** https://hpanel.hostinger.com
2. **Navigate to:** Advanced → Cron Jobs
3. **Create cron job entry:**
   - Command: `/usr/bin/python3 /home/voltixio/public_html/publish_blog_posts_scheduled.py`
   - Frequency: Every 2 hours (0 */2 * * *)
   - Email alerts: On (notify admin@voltixio.com on errors)
4. **Set environment variables in Hostinger:**
   - `WORDPRESS_USER=admin_voltixio`
   - `WORDPRESS_PASS=Voltixio2024!`
   - `WORDPRESS_ENDPOINT=https://voltixio.com/xmlrpc.php`

**Step 3: Deploy Script to Hostinger**
1. Upload `publish_blog_posts_scheduled.py` to Hostinger via File Manager
   - Target directory: `/home/voltixio/public_html/`
   - Permissions: 755 (executable)
2. Create log directory: `/home/voltixio/public_html/logs/`
3. Create `.env.hostinger` on server with credentials (not in version control)

**Step 4: Test Cron Job**
1. **Manual test:** Run script directly via Hostinger terminal
   - Check output for errors
   - Verify log file created
2. **Schedule test:** Let cron run once (2 hours)
   - Check Hostinger logs: `logs/cron_output.log`
   - Verify no errors reported
3. **Production validation:** Monitor for 1 week
   - Confirm new blog posts auto-publish at scheduled times
   - Track email alerts for any failures

### Critical Implementation Details

**Script Requirements (`publish_blog_posts_scheduled.py`):**
- Query WordPress for posts with future publish_date ≤ now() AND post_status='draft' or 'future'
- Use XML-RPC to publish each post
- Handle WordPress rate-limiting (1 post per second)
- Log success/failure to `/logs/cron_output.log`
- Send error email if any posts fail
- Add cooldown (don't re-run within 60 seconds of last run)

**Hostinger Cron Limits:**
- Max execution time: 30 minutes per run (sufficient for ~50 posts at 1/sec)
- Max memory: 256 MB (sufficient for XML-RPC)
- Concurrent runs: Only 1 at a time (Hostinger enforces)

**Monitoring & Maintenance:**
- Check logs weekly: `ls -la /home/voltixio/public_html/logs/`
- Set up email alerts in Hostinger for cron failures
- Test XML-RPC endpoint monthly: `curl https://voltixio.com/xmlrpc.php`

### Files to Create/Modify

**New files to create:**
- `voltixio-site/publish_blog_posts_scheduled.py` (production-ready cron script)
- `voltixio-site/HOSTINGER_CRON_DEPLOYMENT.md` (detailed deployment guide)

**Existing files to reference:**
- `voltixio-site/publish_blog_posts_jul2026.py` (base script—can be refactored)
- `voltixio-site/.env.example` (credential template)

### Verification Checklist

- [ ] Python script created and tested locally
- [ ] Environment variables set up on Hostinger
- [ ] Script uploaded to `/home/voltixio/public_html/`
- [ ] Cron job created in Hostinger → Advanced → Cron Jobs
- [ ] Cron frequency set to: `0 */2 * * *` (every 2 hours)
- [ ] Manual test run succeeds (check logs)
- [ ] Cron logs show successful execution after first 2-hour interval
- [ ] Blog post publishes automatically on next scheduled date
- [ ] Email alerts working (test by force-failing script)

### Post-Deployment

Once cron is running:
1. **Future blog posts:** Just draft them with future publish dates—cron will auto-publish
2. **Social posts:** Cron publishes blog → You upload CSV to GHL for social (or set up GHL webhook later)
3. **Monitoring:** Check logs weekly to ensure cron is healthy

---

## AUDIT FINDINGS (Jul 20-21 Blog + Jul 22-28 Social)

### Blog Publication Status
✅ **14 posts published** via `publish_blog_posts_jul2026.py` (XML-RPC automation)
- **Jul 20:** 7 posts (9:15 AM - 10:00 PM)
- **Jul 21:** 7 posts (9:15 AM - 10:00 PM)
- **Timing Pattern:** Exact 2-2.5 hour intervals (automated publication signature)
- **Categories:** "AI Automations" (141) + "DFY AI Automation" (142)
- **Tags:** AIAutomation, LeadGeneration, BusinessAutomation, VoiceAI, CallAutomation
- **Status:** All hardcoded to `post_status='publish'` (no draft stage)

### Image Attachment Compliance
✅ **100% PASS** - All images from 40-image pool
- 14 blog posts: All featured images from pool
- 42 scheduled social promotions (GHL CSV): All images from pool
- **No deviations:** No external sources, no AI-generated images
- **Pool size:** 40 approved Unsplash images (attachment IDs 780-1109)

### Draft Posts Since July 19th
✅ **Zero draft posts found**
- All Jul 20-21 posts published immediately (no drafts)
- **Pending items:** 42 scheduled social media posts in GHL (Jul 22-28, not blog posts)

### Automation Detection
✅ **Confirmed automated publication**
- Script: `publish_blog_posts_jul2026.py` (hardcoded 14 posts)
- Method: WordPress XML-RPC API (`wp.newPost()`)
- Delivery: Immediate publish (no review stage)
- **Gap:** Post IDs returned by XML-RPC but not logged/tracked

### Current State (As of Jul 22, 2026)
- ✅ Jul 20-21 blog posts: LIVE on voltixio.com/blog/ (14 posts)
- ✅ Jul 22-28 social promotions: SCHEDULED in GHL (42 scheduled posts, awaiting upload)
- ⏳ Hostinger cron job: NOT YET DEPLOYED (this plan addresses deployment)
- ❓ Week 3-4 posts (49 more posts): NOT YET SCHEDULED or automated

---

## FINAL PLAN: Parallel Automation + Full Pipeline

**User Selected:** Deploy BOTH hardcoded scripts AND query-based cronjob, maintain full pipeline tracking.

### Complete Pipeline (Blog → Social → Leads)

```
┌─────────────────────────────────────────────────────────────┐
│ WORKFLOW: Blog Creation → Publishing → Social Promotion     │
└─────────────────────────────────────────────────────────────┘

PATH A: Bulk Batches (Hardcoded Scripts)
  ├─ Use: publish_blog_posts_jul2026.py (Week 1: Jul 20-21)
  ├─ Method: Hardcoded 14 posts in Python
  ├─ Output: Blog posts LIVE at voltixio.com/blog/
  ├─ Logging: Current log shows publication success/failures
  └─ Schedule: One-time or as-needed bulk runs

PATH B: Ongoing Automation (Cronjob)
  ├─ Use: publish_blog_posts_scheduled.py (deployed to Hostinger)
  ├─ Method: Query WordPress for future-dated posts ≤ now()
  ├─ Output: Auto-publish scheduled posts to voltixio.com/blog/
  ├─ Logging: Daily log file + email alerts on errors
  ├─ Frequency: Every 2 hours (0 */2 * * *)
  └─ Schedule: Continuous 24/7 automation

BOTH PATHS → Image Assignment
  ├─ Source: 40-image pool (image_pool.json)
  ├─ Protocol: All featured images from approved Unsplash pool
  ├─ Compliance: 100% verified (no external sources)
  └─ Maintenance: Rotate images to avoid repeats within 7 days

BOTH PATHS → Social Media Amplification (GHL)
  ├─ Convert: Blog posts → Social media posts (CSV)
  ├─ Tools: week2_social_posts_ghl_future.csv (manual today)
  ├─ Platform: GoHighLevel bulk upload (7 posts/day, 6 days)
  ├─ Schedule: Jul 22-28, 2026 (42 social posts)
  └─ Future: Automate via GHL webhook (Phase 2)

BOTH PATHS → Lead Capture
  ├─ CTA: "Book a Call" button (https://voltixio.com/intake/)
  ├─ Tracking: Comments on blog posts tagged as leads
  ├─ Workflow: Blog comment → CRM email sequence → booking
  └─ Measurement: GA4 UTM tracking + WordPress comment analytics
```

### Deployment Architecture

**Hostinger Server (Continuous):**
- `publish_blog_posts_scheduled.py` runs every 2 hours
- Queries WordPress for posts with status='future' and publish_date ≤ now()
- Publishes each post via XML-RPC
- Logs to `/home/voltixio/public_html/logs/cron_auto_publish_YYYY-MM-DD.log`
- Emails admin on errors

**Local Machine (As-Needed):**
- `publish_blog_posts_jul2026.py` for bulk batches (Week 1 complete)
- Can be repurposed for Week 3-4 posts if needed
- Manual CSV generation for social posts (current workflow)

**Post ID Tracking (Comprehensive):**
- ✅ XML-RPC returns post IDs on publish (not currently logged)
- ✅ Cronjob logs to file: `{postId} | {title} | {date} | {image}`
- ✅ Email alerts on publish success AND failures
- ✅ Weekly audit of published posts vs. scheduled posts

---

## Implementation Priority

1. **Phase 1 (This Week):** Deploy Hostinger cronjob (publish_blog_posts_scheduled.py)
   - Automates ongoing blog post publishing
   - Maintains parallel hardcoded script support
   - Enables continuous Week 3-4 automation

2. **Phase 2 (Next Week):** Social automation enhancement
   - Set up GHL webhook to auto-create social posts when blog publishes
   - Eliminate manual CSV creation step
   - Full end-to-end automation: blog → social → leads

3. **Phase 3 (Future):** Lead capture optimization
   - CRM workflow refinement based on initial results
   - GA4 → CRM integration for lead scoring
   - Weekly performance reports

---

## Files Ready for Deployment

✅ **Created (Ready to Deploy):**
1. `publish_blog_posts_scheduled.py` (production cron script)
2. `HOSTINGER_CRON_DEPLOYMENT.md` (deployment guide)

✅ **Existing (Maintain in Parallel):**
1. `publish_blog_posts_jul2026.py` (hardcoded bulk script)
2. `image_pool.json` (40-image library)
3. `week2_social_posts_ghl_future.csv` (social schedule)

**Next Actions:**
- [ ] Review plan with user
- [ ] Deploy cronjob to Hostinger (following HOSTINGER_CRON_DEPLOYMENT.md)
- [ ] Test cronjob with scheduled blog posts for Week 3
- [ ] Launch Phase 2 (GHL webhook for auto-social posts)

---

## Success Metrics

Once deployed, monitor:
- ✓ Blog posts auto-publish at scheduled times (0% missed)
- ✓ Cronjob logs show zero errors for 7 days
- ✓ All images from approved pool (100% compliance)
- ✓ Social posts in GHL align with blog publish dates
- ✓ Comments on blog drive leads to intake form
- ✓ GA4 shows social-to-blog traffic spike on publish dates
