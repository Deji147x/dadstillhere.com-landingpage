/**
 * HubSpot CRM Integration
 * Contact management and data sync with HubSpot
 * Portal ID: 247128708
 */

interface HubSpotContact {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  lifecycleStage?: 'subscriber' | 'lead' | 'customer';
  source?: string;
  customProperties?: Record<string, string | number | boolean>;
}

interface HubSpotResponse {
  id?: string;
  portalId?: number;
  vid?: number;
  [key: string]: any;
}

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const HUBSPOT_API_BASE_URL = 'https://api.hubapi.com';
const HUBSPOT_PORTAL_ID = '247128708';

/**
 * Create or update contact in HubSpot
 */
export async function syncContactToHubSpot(
  contact: HubSpotContact
): Promise<HubSpotResponse | null> {
  if (!HUBSPOT_API_KEY) {
    console.warn('HubSpot API key not configured');
    return null;
  }

  try {
    // Prepare properties for HubSpot
    const properties = [
      {
        property: 'email',
        value: contact.email,
      },
      ...(contact.firstName ? [{ property: 'firstname', value: contact.firstName }] : []),
      ...(contact.lastName ? [{ property: 'lastname', value: contact.lastName }] : []),
      ...(contact.phone ? [{ property: 'phone', value: contact.phone }] : []),
      ...(contact.lifecycleStage
        ? [{ property: 'lifecyclestage', value: contact.lifecycleStage }]
        : []),
      ...(contact.source ? [{ property: 'hs_lead_status', value: contact.source }] : []),

      // Custom properties
      ...(contact.customProperties
        ? Object.entries(contact.customProperties).map(([key, value]) => ({
            property: key,
            value: String(value),
          }))
        : []),
    ];

    const response = await fetch(
      `${HUBSPOT_API_BASE_URL}/crm/v3/objects/contacts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties,
        }),
      }
    );

    if (!response.ok) {
      // If contact exists, update it
      if (response.status === 409) {
        return updateHubSpotContact(contact);
      }

      console.error('HubSpot API error:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error syncing contact to HubSpot:', error);
    return null;
  }
}

/**
 * Update existing contact in HubSpot
 */
async function updateHubSpotContact(
  contact: HubSpotContact
): Promise<HubSpotResponse | null> {
  if (!HUBSPOT_API_KEY) return null;

  try {
    const properties = [
      ...(contact.firstName ? [{ property: 'firstname', value: contact.firstName }] : []),
      ...(contact.lastName ? [{ property: 'lastname', value: contact.lastName }] : []),
      ...(contact.phone ? [{ property: 'phone', value: contact.phone }] : []),
      ...(contact.lifecycleStage
        ? [{ property: 'lifecyclestage', value: contact.lifecycleStage }]
        : []),
      ...(contact.source ? [{ property: 'hs_lead_status', value: contact.source }] : []),
      ...(contact.customProperties
        ? Object.entries(contact.customProperties).map(([key, value]) => ({
            property: key,
            value: String(value),
          }))
        : []),
    ];

    const response = await fetch(
      `${HUBSPOT_API_BASE_URL}/crm/v3/objects/contacts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties,
        }),
      }
    );

    if (!response.ok) {
      console.error('HubSpot update error:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating contact in HubSpot:', error);
    return null;
  }
}

/**
 * Get contact from HubSpot by email
 */
export async function getHubSpotContact(email: string): Promise<HubSpotResponse | null> {
  if (!HUBSPOT_API_KEY) {
    console.warn('HubSpot API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${HUBSPOT_API_BASE_URL}/crm/v3/objects/contacts`,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error('HubSpot API error:', response.statusText);
      return null;
    }

    const data = await response.json();
    const contact = data.results?.find(
      (c: any) => c.properties?.email === email
    );

    return contact || null;
  } catch (error) {
    console.error('Error fetching contact from HubSpot:', error);
    return null;
  }
}

/**
 * Create HubSpot deal for newsletter subscription
 */
export async function createHubSpotDeal(
  contactEmail: string,
  dealName: string,
  dealStage: string = 'negotiation'
): Promise<HubSpotResponse | null> {
  if (!HUBSPOT_API_KEY) return null;

  try {
    const response = await fetch(
      `${HUBSPOT_API_BASE_URL}/crm/v3/objects/deals`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: [
            { property: 'dealname', value: dealName },
            { property: 'dealstage', value: dealStage },
            { property: 'hubspotsourceid', value: contactEmail },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error('HubSpot deal creation error:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating deal in HubSpot:', error);
    return null;
  }
}

/**
 * Track newsletter subscription in HubSpot
 */
export async function trackNewsletterSignupInHubSpot(
  email: string,
  firstName?: string,
  lastName?: string
): Promise<boolean> {
  const contact = await syncContactToHubSpot({
    email,
    firstName,
    lastName,
    lifecycleStage: 'subscriber',
    source: 'Newsletter Signup',
    customProperties: {
      newsletter_subscriber: true,
      newsletter_signup_date: new Date().toISOString(),
    },
  });

  if (!contact) return false;

  // Create associated deal
  const deal = await createHubSpotDeal(
    email,
    `Newsletter Subscriber: ${email}`,
    'customer'
  );

  return !!deal;
}

/**
 * Track letter submission in HubSpot
 */
export async function trackLetterSubmissionInHubSpot(
  email: string,
  letterType: 'private' | 'public' | 'shared'
): Promise<boolean> {
  const contact = await syncContactToHubSpot({
    email,
    lifecycleStage: 'lead',
    source: 'Letter Submission',
    customProperties: {
      letter_writer: true,
      last_letter_type: letterType,
      last_letter_date: new Date().toISOString(),
    },
  });

  return !!contact;
}

/**
 * Connect contact as deal association
 */
export async function associateContactWithDeal(
  contactId: string,
  dealId: string,
  associationType: string = 'contact_to_deal'
): Promise<boolean> {
  if (!HUBSPOT_API_KEY) return false;

  try {
    const response = await fetch(
      `${HUBSPOT_API_BASE_URL}/crm/v3/objects/contacts/${contactId}/associations/deals/${dealId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          associationCategory: 'HUBSPOT_DEFINED',
          associationTypeId: 1,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error associating contact with deal:', error);
    return false;
  }
}
