/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_SUPPORT_EMAIL: string
  readonly VITE_PRIVACY_EMAIL: string
  readonly VITE_BRAND_COLOR: string
  readonly VITE_BRAND_COLOR_SECONDARY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY_TEST: string
  readonly VITE_STRIPE_SECRET_KEY_TEST: string
  readonly VITE_STRIPE_WEBHOOK_SECRET_TEST: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY_LIVE: string
  readonly VITE_STRIPE_SECRET_KEY_LIVE: string
  readonly VITE_STRIPE_WEBHOOK_SECRET_LIVE: string
  readonly VITE_STRIPE_PRODUCT_MASTER_NETWORKER: string
  readonly VITE_STRIPE_PRICE_MONTHLY: string
  readonly VITE_STRIPE_PRICE_ANNUAL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 