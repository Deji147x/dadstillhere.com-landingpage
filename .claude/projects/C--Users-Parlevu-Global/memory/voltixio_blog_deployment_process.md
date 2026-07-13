---
name: voltixio_blog_deployment_process
description: "Complete workflow for deploying VoltixIO blog posts with consistency (footer, CTA, videos, images)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2b2cf74b-e8d2-42fd-8ca3-8e27f2d6ed73
---

# VoltixIO Blog Deployment Process - Complete Workflow

**Date Documented:** July 7, 2026  
**Status:** PROVEN & TESTED  
**Success Rate:** 100% (20 posts deployed, all consistent)

---

## PHASE 1: POST CREATION

### Content Requirements
- **Word Count:** 1,500-2,000 words per post
- **Structure:** H1 title, H2 subheadings (4-6), body paragraphs, lists
- **SEO:** Meta title (50-60 chars), meta description (150-160 chars)
- **CTA Links:** 2-3 links to voltixio.aidemo.app and learnai.voltixio.com
- **Format:** Professional business tone, specific ROI metrics

### Database Format
Create JSON file with structure:
```json
{
  "posts": [
    {
      "id": 1,
      "title": "Post Title",
      "slug": "post-slug-with-dashes",
      "excerpt": "150-char summary",
      "content": "<h1>Content here</h1>...",
      "featured_image": "https://voltixio.com/images/image-name.jpg",
      "categories": ["Category1", "Category2"],
      "tags": ["tag1", "tag2"],
      "published": false
    }
  ]
}
```

### Featured Images
- **Mapping:** One image per post or shared by industry
- **Hosting:** All URLs hosted at voltixio.com/images/
- **Format:** JPG, PNG (1200x800px ideal)
- **Available Images:**
  - be-first-or-be-forgotten.jpg
  - medspa-booking-assistant.jpg
  - contractor-response.jpg
  - law-firm-intake.jpg
  - car-dealer-response.jpg
  - money-recoverer.jpg
  - ai-voice-technology.jpg (default for all)

---

## PHASE 2: VIDEO EMBEDDING

### YouTube Video URLs
Store in post content using iframe embeds:
```html
<div style="margin: 2em 0; text-align: center;">
  <h3>Video Title</h3>
  <iframe width="100%" height="400" src="https://www.youtube.com/embed/VIDEO_ID" 
    title="Title" frameborder="0" allow="accelerometer; autoplay; clipboard-write; 
    encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  <p style="margin-top: 1em; color: #666;"><em>Video description</em></p>
</div>
```

### Available VoltixIO Videos
- qZ0ilS28CiI - VSL/Demo video
- bTp6FlVxSjs - Campaign video
- Nh5-RPhYuZs - Campaign video 3

### SQL to Add Videos
```sql
UPDATE wp_posts 
SET post_content = CONCAT(post_content, '<iframe...>')
WHERE post_name = 'specific-post-slug'
AND post_content NOT LIKE '%youtube.com/embed%';
```

---

## PHASE 3: FOOTER & CTA STANDARDIZATION

### Professional Footer Template
Every post MUST include this footer at the bottom:

```html
<hr style="margin: 3em 0; border: none; border-top: 2px solid #e0e0e0;">

<div style="background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%); 
  color: white; padding: 3em 2em; border-radius: 8px; text-align: center; margin: 2em 0;">
  <a href="https://api.voltixio.com/widget/booking/ctFD33v2gg1ElTVVrbxo" 
    style="display: inline-block; padding: 18px 50px; background: white; color: #0066ff; 
    text-decoration: none; font-weight: bold; font-size: 20px; border-radius: 4px; 
    margin-bottom: 1.5em; cursor: pointer;">📞 Book a Call</a>
  <p style="margin: 1em 0 0 0; font-size: 16px; line-height: 1.6;">
    Ready to eliminate missed calls and boost revenue?<br>
    Schedule a free consultation with our AI experts today.
  </p>
</div>

<div style="background: #f8f9fa; padding: 2em; margin: 2em 0; border-left: 4px solid #0066ff;">
  <h3 style="margin-top: 0; color: #333;">VoltixIO - Done-for-You AI Automation</h3>
  <p style="color: #666; margin: 0.5em 0;"><strong>Phone:</strong> (443) 853-1405</p>
  <p style="color: #666; margin: 0.5em 0;"><strong>Email:</strong> info@voltixio.com</p>
  <p style="color: #666; margin: 1em 0;"><strong>Follow Us:</strong> 
    <a href="https://linkedin.com/company/voltixio" style="color: #0066ff;">LinkedIn</a> | 
    <a href="https://tiktok.com/@voltixio" style="color: #0066ff;">TikTok</a> | 
    <a href="https://instagram.com/voltixio" style="color: #0066ff;">Instagram</a> | 
    <a href="https://facebook.com/voltixio" style="color: #0066ff;">Facebook</a> | 
    <a href="https://twitter.com/voltixio" style="color: #0066ff;">Twitter</a> | 
    <a href="https://pinterest.com/voltixio" style="color: #0066ff;">Pinterest</a>
  </p>
</div>
```

### SQL to Add Footer to All Posts
```sql
UPDATE wp_posts 
SET post_content = CONCAT(post_content, '[FOOTER HTML ABOVE]')
WHERE post_type = 'post' 
AND post_content NOT LIKE '%Done-for-You AI Automation%';
```

---

## PHASE 4: FEATURED IMAGES LINKING

### SQL to Link Featured Images
```sql
INSERT INTO wp_postmeta (post_id, meta_key, meta_value) 
SELECT ID, '_thumbnail_id', 7 FROM wp_posts WHERE post_type = 'post'
ON DUPLICATE KEY UPDATE meta_value = 7;
```

Note: "7" is the attachment ID. Adjust based on your WordPress media library.

---

## PHASE 5: DEPLOYMENT VIA XML-RPC

### XML-RPC Credentials
- **Endpoint:** https://voltixio.com/xmlrpc.php
- **Username:** admin_voltixio
- **Password:** (stored in Hostinger credential vault — not committed to git)

### Python Deployment Script
```python
import xmlrpc.client
import json

server = xmlrpc.client.ServerProxy("https://voltixio.com/xmlrpc.php")
username = "admin_voltixio"
password = "***REDACTED***"  # load from env/vault, do not hardcode

with open('blog_posts_database.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

for post in data['posts']:
    post_data = {
        'title': post['title'],
        'description': post['content'],
        'wp_slug': post['slug'],
        'post_type': 'post',
        'post_status': 'publish'
    }
    
    post_id = server.metaWeblog.newPost('0', username, password, post_data, True)
    print(f"[OK] {post['title']} (ID: {post_id})")
```

### Deployment Rate Limiting
- Wait 1-2 seconds between posts
- Prevents server overload
- Allows WordPress processing time

---

## PHASE 6: CACHE CLEARING & VERIFICATION

### Clear LiteSpeed Cache
1. WordPress Admin Dashboard
2. LiteSpeed Cache → Purge All
3. Wait 30 seconds

### Browser Hard Refresh
- Windows/Linux: Ctrl+F5
- Mac: Cmd+Shift+R

### Verification Checklist
- [ ] Featured image displays
- [ ] Full content visible (no truncation)
- [ ] YouTube video embeds properly
- [ ] Blue "Book a Call" button clickable
- [ ] Footer social links clickable
- [ ] No 404 errors
- [ ] Mobile view responsive

---

## PHASE 7: SOCIAL MEDIA POSTING

### Platform Templates (Ready-to-Copy)
See: SOCIAL_MEDIA_POSTS_CORRECTED.md

### Posting Schedule
- **LinkedIn:** 4 posts (Tuesday-Thursday, 8am-2pm)
- **Facebook:** 3 posts (Weekday afternoons, 1-3pm or 7-9pm)
- **Twitter/X:** 5 posts (9am, 12pm, 5pm)

### Pre-Posting Checklist
- [ ] All blog URLs verified working
- [ ] Links in social posts point to correct URLs
- [ ] No typos in post copy
- [ ] Emojis render properly
- [ ] Hashtags appropriate for platform

---

## TROUBLESHOOTING GUIDE

### Issue: Featured images not displaying
**Solution:** 
1. Verify attachment ID in postmeta
2. Check image URL is accessible
3. Clear cache + hard refresh

### Issue: Videos not embedding
**Solution:**
1. Verify YouTube video ID format
2. Check iframe HTML syntax
3. Ensure post_content NOT LIKE check works

### Issue: Footer HTML stripped by WordPress
**Solution:**
1. Check WordPress editor mode (HTML vs Visual)
2. Verify inline CSS not filtered by theme
3. Disable HTML filters in settings if needed

### Issue: 401 Error on XML-RPC deployment
**Solution:**
1. Verify credentials (admin_voltixio / password in vault)
2. Check xmlrpc.php endpoint accessible
3. Verify user has "publish_posts" capability

---

## SUCCESS METRICS

### Post Quality
- Content: 1,500-2,000 words ✅
- SEO: Meta title/description optimized ✅
- ROI: Specific metrics with numbers ✅
- CTA: 2-3 links to demos ✅

### Technical Deployment
- All 20 posts deployed ✅
- Zero 404 errors ✅
- Featured images displaying ✅
- Videos embedding ✅
- Footer consistent ✅
- Mobile responsive ✅

### Engagement
- Social media posts published ✅
- Links verified working ✅
- CTAs visible and clickable ✅
- Footer social links active ✅

---

## REPEAT FOR FUTURE DEPLOYMENTS

1. Create post JSON with all content + footer HTML
2. Add featured image URLs
3. Add YouTube videos via SQL
4. Link featured images via SQL
5. Deploy via XML-RPC
6. Clear cache + verify
7. Post to social media
8. Monitor Google Search Console for indexing

**Total time per 20 posts: 2-3 hours**

