const isDevelopment = import.meta.env.MODE === 'development';

export const env = {
  site: {
    url: import.meta.env.VITE_SITE_URL,
    authRedirectUrl: import.meta.env.VITE_AUTH_REDIRECT_URL,
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME,
    url: import.meta.env.VITE_APP_URL,
  },
  stripe: {
    test: {
      publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST,
      secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY_TEST,
    },
    live: {
      publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_LIVE,
      secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY_LIVE,
    },
  },
} as const;

// Validate environment variables
const requiredEnvVars = [
  // Site Configuration
  'VITE_SITE_URL',
  'VITE_AUTH_REDIRECT_URL',
  
  // Supabase Configuration
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  
  // Application Configuration
  'VITE_APP_NAME',
  'VITE_APP_URL',
  
  // Stripe Configuration - Test Keys
  'VITE_STRIPE_PUBLISHABLE_KEY_TEST',
  'VITE_STRIPE_SECRET_KEY_TEST',
  
  // Stripe Configuration - Live Keys
  'VITE_STRIPE_PUBLISHABLE_KEY_LIVE',
  'VITE_STRIPE_SECRET_KEY_LIVE',
] as const;

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
} 