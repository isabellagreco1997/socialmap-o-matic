import { loadStripe } from '@stripe/stripe-js';
import { env } from '@/utils/env';
import { supabase } from '@/integrations/supabase/client';

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.MODE === 'development'
    ? env.stripe.test.publishableKey
    : env.stripe.live.publishableKey
);

export async function redirectToCheckout(priceId: string) {
  try {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to initialize');

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await stripe.redirectToCheckout({
      mode: 'subscription',
      lineItems: [{ price: priceId, quantity: 1 }],
      successUrl: `${window.location.origin}/network?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/network`,
      customerEmail: user.email,
      clientReferenceId: user.id, // This will be used to link the customer to the user
    });

    if (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
} 