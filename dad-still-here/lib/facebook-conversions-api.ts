/**
 * Facebook Conversions API Integration
 * Server-side event tracking for improved data accuracy and compliance
 */

interface ConversionEvent {
  eventName:
    | 'PageView'
    | 'ViewContent'
    | 'AddToCart'
    | 'InitiateCheckout'
    | 'Purchase'
    | 'Lead'
    | 'Subscribe'
    | 'Contact'
    | 'CustomEvent';
  eventId: string;
  eventTime: number;
  userData?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  customData?: {
    value?: number;
    currency?: string;
    contentName?: string;
    contentType?: string;
    contentId?: string;
    [key: string]: any;
  };
  eventSourceUrl: string;
  userAgent?: string;
}

const FACEBOOK_CONVERSIONS_API_URL =
  'https://graph.facebook.com/v18.0/1534484327973771/events';

const ACCESS_TOKEN = process.env.FACEBOOK_CONVERSIONS_API_TOKEN;
const PIXEL_ID = process.env.FACEBOOK_PIXEL_ID || '1534484327973771';

/**
 * Hash data for Facebook (SHA256)
 */
function hashData(data: string): string {
  if (!data) return '';

  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

/**
 * Prepare user data with hashing
 */
function prepareUserData(userData?: ConversionEvent['userData']) {
  if (!userData) return {};

  return {
    em: userData.email ? hashData(userData.email) : undefined,
    ph: userData.phone ? hashData(userData.phone.replace(/\D/g, '')) : undefined,
    fn: userData.firstName ? hashData(userData.firstName) : undefined,
    ln: userData.lastName ? hashData(userData.lastName) : undefined,
    ct: userData.city ? hashData(userData.city) : undefined,
    st: userData.state ? hashData(userData.state) : undefined,
    zp: userData.zipCode ? hashData(userData.zipCode) : undefined,
    country: userData.country ? hashData(userData.country) : undefined,
  };
}

/**
 * Send event to Facebook Conversions API
 */
export async function sendConversionEvent(event: ConversionEvent): Promise<boolean> {
  if (!ACCESS_TOKEN) {
    console.warn('Facebook Conversions API token not configured');
    return false;
  }

  try {
    const payload = {
      data: [
        {
          event_name: event.eventName,
          event_id: event.eventId,
          event_time: event.eventTime,
          event_source_url: event.eventSourceUrl,
          user_data: prepareUserData(event.userData),
          custom_data: event.customData || {},
          ...(event.userAgent && { user_agent: event.userAgent }),
        },
      ],
      access_token: ACCESS_TOKEN,
    };

    const response = await fetch(FACEBOOK_CONVERSIONS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Facebook Conversions API error:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending conversion event to Facebook:', error);
    return false;
  }
}

/**
 * Track letter submission conversion
 */
export async function trackLetterSubmission(
  userId: string,
  letterType: 'private' | 'public' | 'shared'
) {
  const eventId = `letter_${userId}_${Date.now()}`;

  return sendConversionEvent({
    eventName: 'Lead',
    eventId,
    eventTime: Math.floor(Date.now() / 1000),
    customData: {
      contentName: `Letter Submission - ${letterType}`,
      contentType: 'letter',
      contentId: letterType,
    },
    eventSourceUrl: `https://dadstillhere.com/write`,
  });
}

/**
 * Track newsletter subscription
 */
export async function trackNewsletterSubscription(email: string) {
  const eventId = `subscribe_${email}_${Date.now()}`;

  return sendConversionEvent({
    eventName: 'Subscribe',
    eventId,
    eventTime: Math.floor(Date.now() / 1000),
    userData: {
      email,
    },
    eventSourceUrl: `https://dadstillhere.com/`,
  });
}

/**
 * Track journal entry
 */
export async function trackJournalEntry(userId: string) {
  const eventId = `journal_${userId}_${Date.now()}`;

  return sendConversionEvent({
    eventName: 'CustomEvent',
    eventId,
    eventTime: Math.floor(Date.now() / 1000),
    customData: {
      contentName: 'Journal Entry',
      contentType: 'journal',
    },
    eventSourceUrl: `https://dadstillhere.com/journal`,
  });
}

/**
 * Track community response
 */
export async function trackCommunityResponse(userId: string, promptId: string) {
  const eventId = `community_${userId}_${promptId}_${Date.now()}`;

  return sendConversionEvent({
    eventName: 'CustomEvent',
    eventId,
    eventTime: Math.floor(Date.now() / 1000),
    customData: {
      contentName: 'Community Response',
      contentType: 'community',
      contentId: promptId,
    },
    eventSourceUrl: `https://dadstillhere.com/community`,
  });
}
