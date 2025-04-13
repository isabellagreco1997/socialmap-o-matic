import { loadStripe } from '@stripe/stripe-js';
import { env } from '@/utils/env';
import { supabase } from '@/integrations/supabase/client';

// Define environment
const isDevelopment = import.meta.env.MODE === 'development';

// Initialize Stripe
const stripePromise = loadStripe(
  isDevelopment
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

    console.log('Redirecting to checkout with:', {
      environment: isDevelopment ? 'development' : 'production',
      priceId,
      user: {
        id: user.id,
        email: user.email
      }
    });

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

export async function redirectToCustomerPortal() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Call the Netlify function instead of a direct API endpoint
    const response = await fetch('/.netlify/functions/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create portal session');
    }

    const { url } = await response.json();
    
    // Redirect to the portal
    window.location.href = url;
  } catch (error) {
    console.error('Error redirecting to customer portal:', error);
    throw error;
  }
} 