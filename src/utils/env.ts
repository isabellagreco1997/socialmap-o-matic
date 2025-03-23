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
    name: import.meta.env.VITE_APP_NAME || 'RelMaps',
    url: import.meta.env.VITE_APP_URL,
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@relmaps.com',
    privacyEmail: import.meta.env.VITE_PRIVACY_EMAIL || 'privacy@relmaps.com',
  },
  brand: {
    color: import.meta.env.VITE_BRAND_COLOR || '#0A2463',
  },
  stripe: {
    test: {
      publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST,
      secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY_TEST,
      priceMonthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY_TEST,
      priceAnnual: import.meta.env.VITE_STRIPE_PRICE_ANNUAL_TEST,
    },
    live: {
      publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_LIVE,
      secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY_LIVE,
      priceMonthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY,
      priceAnnual: import.meta.env.VITE_STRIPE_PRICE_ANNUAL,
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
  'VITE_STRIPE_PRICE_MONTHLY_TEST',
  'VITE_STRIPE_PRICE_ANNUAL_TEST',
  
  // Stripe Configuration - Live Keys
  'VITE_STRIPE_PUBLISHABLE_KEY_LIVE',
  'VITE_STRIPE_SECRET_KEY_LIVE',
  'VITE_STRIPE_PRICE_MONTHLY',
  'VITE_STRIPE_PRICE_ANNUAL',
] as const;

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    console.warn(`Missing environment variable: ${envVar}. Using default value if available.`);
  }
} 