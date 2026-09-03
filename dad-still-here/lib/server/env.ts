import 'server-only';

const requiredEnvVars = [
  'SENDGRID_API_KEY',
  'SENDGRID_FROM_EMAIL',
];

const optionalEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

export function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

export const env = {
  // Required
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY!,
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL!,

  // Optional
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

// Validate on import
if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}
