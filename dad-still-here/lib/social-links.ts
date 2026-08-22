/**
 * Centralized social media links configuration
 * Update this file to change all social media URLs across the site
 */

export const SOCIAL_LINKS = {
  instagram: {
    name: 'Instagram',
    url: 'https://www.instagram.com/dadstillhere/',
    icon: '📷',
    color: '#E4405F',
  },
  facebook: {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61593247216715',
    icon: 'f',
    color: '#1877F2',
  },
  twitter: {
    name: 'Twitter/X',
    url: 'https://x.com/dadstillhere',
    icon: '𝕏',
    color: '#000000',
  },
  youtube: {
    name: 'YouTube',
    url: 'https://www.youtube.com/channel/UCNZ-b1JmtT8dTcjY9MiO8xQ',
    icon: '▶',
    color: '#FF0000',
  },
  googleBusiness: {
    name: 'Google Business',
    url: 'https://share.google/zplmWJDMgqjb3wE2r',
    icon: '🏢',
    color: '#4285F4',
  },
  newsletter: {
    name: 'Newsletter',
    url: '/subscribe',
    icon: '✉️',
    color: '#D4A574',
  },
};

/**
 * Get all social media links as an array
 */
export const getSocialLinksArray = () => {
  return Object.values(SOCIAL_LINKS).filter(link => link.url.startsWith('http'));
};

/**
 * Get social media link by key
 */
export const getSocialLink = (key: keyof typeof SOCIAL_LINKS) => {
  return SOCIAL_LINKS[key];
};

/**
 * Get all external social links (exclude internal links like newsletter)
 */
export const getExternalSocialLinks = () => {
  return getSocialLinksArray();
};
