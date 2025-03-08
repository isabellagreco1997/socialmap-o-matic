import Stripe from 'stripe';
import { env } from '@/utils/env';

const stripe = new Stripe(
  import.meta.env.MODE === 'development'
    ? env.stripe.test.secretKey
    : env.stripe.live.secretKey,
  {
    apiVersion: '2025-02-24.acacia',
  }
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400 }
      );
    }

    // Get customer ID from Stripe
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ isSubscribed: false }),
        { status: 200 }
      );
    }

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1,
    });

    return new Response(
      JSON.stringify({
        isSubscribed: subscriptions.data.length > 0,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking subscription:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check subscription status' }),
      { status: 500 }
    );
  }
} 