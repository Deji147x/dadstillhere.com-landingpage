import { type ClassValue, clsx } from 'classnames';
import { twMerge } from 'tailwind-merge';

// Merge classnames with tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, (char) => ({ '<': '&lt;', '>': '&gt;' }[char] || char))
    .trim();
}

// Detect sensitive information in text
export function detectSensitiveInfo(text: string): { type: string; text: string }[] {
  const issues: { type: string; text: string }[] = [];

  // Email detection
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex);
  if (emails) {
    emails.forEach((email) => issues.push({ type: 'EMAIL', text: email }));
  }

  // Phone number detection (US format)
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
  const phones = text.match(phoneRegex);
  if (phones) {
    phones.forEach((phone) => issues.push({ type: 'PHONE', text: phone }));
  }

  // Address detection (basic)
  const addressRegex = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)/gi;
  const addresses = text.match(addressRegex);
  if (addresses) {
    addresses.forEach((addr) => issues.push({ type: 'ADDRESS', text: addr }));
  }

  // School names (look for patterns like "High School", "Elementary")
  const schoolRegex = /[A-Za-z\s]+(?:High School|Elementary|Middle School|School)/gi;
  const schools = text.match(schoolRegex);
  if (schools) {
    schools.slice(0, 3).forEach((school) => issues.push({ type: 'SCHOOL', text: school }));
  }

  // Court case numbers
  const courtRegex = /[A-Z]{2}\d{2}-\d{4,6}/g;
  const cases = text.match(courtRegex);
  if (cases) {
    cases.forEach((courtCase) => issues.push({ type: 'COURT_CASE', text: courtCase }));
  }

  // Threat detection (simple keywords)
  const threatKeywords = ['kill', 'harm', 'hurt', 'destroy', 'death'];
  if (threatKeywords.some((keyword) => text.toLowerCase().includes(keyword))) {
    issues.push({ type: 'THREAT', text: 'Potential threatening language detected' });
  }

  return issues;
}

// Format date
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Calculate reading time
export function calculateReadTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Generate slug
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');
}

// Generate secure token
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Check if email is valid
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Truncate text
export function truncateText(text: string, length: number = 150): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Format numbers with commas
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

// Delay execution
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
