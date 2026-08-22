# Integration Guides

Complete setup instructions for Meta Pixel, Conversions API, and HubSpot CRM.

---

## 📊 Meta Pixel & Conversions API Setup

### What's Included

**1. Client-Side Pixel Tracking (Already Installed)**
- Meta Pixel ID: `1534484327973771`
- Embedded in `app/layout.tsx`
- Tracks PageView events automatically
- No-script fallback for privacy-focused users

**2. Server-Side Conversions API (Ready for Setup)**
- Converts user events to API calls
- More accurate than pixel-only (less affected by ad blockers)
- Required for iOS 14+ data accuracy
- Better for GDPR/privacy compliance

### Step 1: Get Facebook Conversions API Token

1. Go to [Facebook Business Suite](https://business.facebook.com)
2. Navigate to **Settings → Business Settings → Users**
3. Create a new System User or use existing one
4. Grant **Admin** role
5. Go to **Apps & Assets → Apps**
6. Find or create your app
7. Go to **Settings → Basic**
8. Copy **Access Token** (or generate new one under **Tools → Access Tokens**)

Alternatively:

1. Go to [Meta Developer Console](https://developers.facebook.com)
2. Select your app
3. Go to **Settings → Basic**
4. Create a new token with permissions: `ads_management`, `business_management`

### Step 2: Configure Environment Variable

Add to `.env.local`:

```env
FACEBOOK_CONVERSIONS_API_TOKEN="your-access-token-here"
FACEBOOK_PIXEL_ID="1534484327973771"
```

### Step 3: Implement Event Tracking

Import in your API routes:

```typescript
import { trackLetterSubmission, trackNewsletterSubscription } from '@/lib/facebook-conversions-api';

// In your API route handler
export async function POST(req: Request) {
  // ... your logic ...

  // Track the event
  await trackLetterSubmission(userId, letterType);
  // or
  await trackNewsletterSubscription(userEmail);

  return Response.json({ success: true });
}
```

### Available Tracking Functions

- `trackLetterSubmission(userId, letterType)` - Track letter submissions
- `trackNewsletterSubscription(email)` - Track newsletter signups
- `trackJournalEntry(userId)` - Track journal entries
- `trackCommunityResponse(userId, promptId)` - Track community engagement
- `sendConversionEvent(event)` - Send custom events

### Step 4: Verify Pixel is Working

1. Go to [Meta Pixel](https://facebook.com/ads/manager/pixel)
2. Select pixel `1534484327973771`
3. Go to **Settings → Pixel Details**
4. Check "Real-time Testing" tab
5. Load your website - you should see **PageView** events

---

## 🔗 HubSpot CRM Integration

### Step 1: Get HubSpot API Key

1. Login to [HubSpot](https://app.hubspot.com)
2. Go to **Settings → Account Setup → Private Apps**
3. Click **Create private app**
4. Name it: "Dad, Still Here"
5. Go to **Scopes** tab
6. Enable these scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`
   - `crm.schemas.contacts.read`
   - `crm.schemas.deals.read`
7. Click **Create app**
8. Copy the **Private App Token**

### Step 2: Configure Environment Variable

Add to `.env.local`:

```env
HUBSPOT_API_KEY="your-private-app-token"
HUBSPOT_PORTAL_ID="247128708"
```

### Step 3: Implement CRM Syncing

Import in your API routes:

```typescript
import { trackNewsletterSignupInHubSpot, trackLetterSubmissionInHubSpot } from '@/lib/hubspot-crm';

// In your newsletter signup handler
export async function POST(req: Request) {
  const { email, firstName, lastName } = await req.json();

  // Sync to HubSpot
  await trackNewsletterSignupInHubSpot(email, firstName, lastName);

  return Response.json({ success: true });
}
```

### Available CRM Functions

- `syncContactToHubSpot(contact)` - Create/update contact
- `getHubSpotContact(email)` - Retrieve contact
- `trackNewsletterSignupInHubSpot(email, firstName, lastName)` - Newsletter signup
- `trackLetterSubmissionInHubSpot(email, letterType)` - Letter submission
- `createHubSpotDeal(email, dealName, stage)` - Create deal
- `associateContactWithDeal(contactId, dealId)` - Link contact to deal

### Step 4: Custom Properties (Optional)

To track custom fields in HubSpot:

1. Go to **Settings → Data Management → Properties**
2. Click **Create property**
3. Set up custom fields like:
   - `newsletter_subscriber` (Boolean)
   - `letter_writer` (Boolean)
   - `last_letter_type` (Single-line text)
   - `last_letter_date` (Date)
   - `community_participation_count` (Number)

These will sync automatically via the integration.

### Step 5: Verify Integration

1. Go to [Contacts](https://app.hubspot.com/contacts)
2. Look for contacts created from your site
3. Verify fields are populated correctly
4. Check Deals tab for associated deals

---

## 📈 Recommended Tracking Events

### Critical Conversions (Track These First)

1. **Newsletter Signup**
   - Event: `Subscribe` (Pixel) + HubSpot sync
   - When: Form submission
   - Data: Email, first/last name, signup source

2. **Letter Submission**
   - Event: `Lead` (Pixel) + HubSpot sync
   - When: Letter published
   - Data: Letter type (private/public/shared), user ID

3. **Account Creation**
   - Event: `CompleteRegistration` (Pixel) + HubSpot sync
   - When: New user signs up
   - Data: Email, signup method

### Secondary Events

4. **Video Watch** (if applicable)
   - Event: `ViewContent`
   - When: Video player starts
   - Data: Video ID, duration watched

5. **Community Engagement**
   - Event: `CustomEvent` → "Community Response"
   - When: User responds to prompt
   - Data: Prompt ID, user sentiment (if available)

6. **Journal Entry**
   - Event: `CustomEvent` → "Journal Entry"
   - When: User saves journal entry
   - Data: Entry count for user

---

## 🔒 Privacy & Compliance

### GDPR Compliance

- User data is hashed before sending to Facebook
- No third-party cookies set
- Pixel respects consent/opt-out preferences
- Conversions API uses hashed PII only

### Setup Consent Layer (Recommended)

```typescript
// Check user consent before tracking
if (window.dataLayer?.consent?.marketing) {
  fbq('track', 'PageView');
}
```

### Facebook Pixel Settings

To enable CCPA/GDPR compliance:

1. Go to Pixel Settings
2. Enable **Data Use Restrictions**
3. Set **Data Processing Terms** to "Data Processing Addendum"
4. Configure Cookie Consent Banner integration

---

## 🧪 Testing & Validation

### Test Pixel Events

Use [Meta Pixel Helper Browser Extension](https://chrome.google.com/webstore/detail/meta-pixel-helper/gdebfgdjlkobdfdkbhknkgibkgopkigb)

1. Install extension
2. Load your website
3. Open extension
4. Should see "Pixel Loaded" and events firing

### Test Conversions API

1. Use [Conversions API Testing Tool](https://developers.facebook.com/docs/conversions-api/get-started)
2. Paste your token
3. Send test events
4. Verify in Pixel → Event Manager

### Test HubSpot Sync

1. Submit a newsletter signup
2. Go to HubSpot Contacts
3. Find the contact by email
4. Verify all fields populated correctly

---

## 📊 Analytics Dashboard Setup

### Facebook Analytics

1. Go to [Facebook Analytics](https://analytics.facebook.com)
2. Create custom event for "Letter Submission"
3. Create cohorts:
   - Newsletter subscribers
   - Letter writers
   - Active journal users

### HubSpot Reporting

1. Go to **Reports → Create custom report**
2. Create views for:
   - **Contacts by Lifecycle Stage**
   - **Deals by Letter Type**
   - **Revenue/Engagement by Source**

### Recommended Metrics

**By Week:**
- Newsletter signups
- Letter submissions (by type)
- New community members

**By Month:**
- Content engagement rate
- Conversion funnel (Visitor → Subscriber → Member)
- Most active topics/themes

---

## 🚨 Troubleshooting

### Pixel Not Tracking Events

1. Check pixel ID: `1534484327973771`
2. Verify in browser DevTools → Network
3. Look for Facebook domain calls
4. Check for ad blockers

### Conversions API Not Sending

1. Verify token in `.env.local`
2. Check server logs: `console.error()` output
3. Ensure `crypto` module available (Node.js built-in)
4. Test with cURL:
   ```bash
   curl -X POST https://graph.facebook.com/v18.0/1534484327973771/events \
     -d "access_token=YOUR_TOKEN" \
     -d "data=[{\"event_name\":\"PageView\"}]"
   ```

### HubSpot Sync Failing

1. Verify API key valid: `HUBSPOT_API_KEY`
2. Check scopes in Private App
3. Test with API directly:
   ```bash
   curl -H "Authorization: Bearer YOUR_KEY" \
     https://api.hubapi.com/crm/v3/objects/contacts
   ```

---

## 📞 Support Resources

- [Meta Pixel Docs](https://developers.facebook.com/docs/facebook-pixel)
- [Conversions API Docs](https://developers.facebook.com/docs/conversions-api)
- [HubSpot API Docs](https://developers.hubspot.com)
- [Privacy Best Practices](https://facebook.com/privacy)

---

## Next Steps

1. ✅ Pixel already installed
2. ⬜ Get Conversions API token
3. ⬜ Configure environment variables
4. ⬜ Get HubSpot API key
5. ⬜ Test integrations
6. ⬜ Set up reporting dashboards

Questions? Check the individual library files:
- `/lib/facebook-conversions-api.ts`
- `/lib/hubspot-crm.ts`
