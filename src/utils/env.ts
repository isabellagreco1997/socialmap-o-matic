const isDevelopment = import.meta.env.MODE === 'development';

export const env = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME,
    url: import.meta.env.VITE_APP_URL,
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL,
    privacyEmail: import.meta.env.VITE_PRIVACY_EMAIL,
  },
  brand: {
    color: import.meta.env.VITE_BRAND_COLOR,
    colorSecondary: import.meta.env.VITE_BRAND_COLOR_SECONDARY,
  },
} as const;

// Validate environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_APP_NAME',
  'VITE_APP_URL',
  'VITE_SUPPORT_EMAIL',
  'VITE_PRIVACY_EMAIL',
  'VITE_BRAND_COLOR',
  'VITE_BRAND_COLOR_SECONDARY',
] as const;

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
} 