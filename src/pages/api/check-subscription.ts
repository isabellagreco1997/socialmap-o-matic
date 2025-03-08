import { env } from '@/utils/env';
import Stripe from 'stripe';

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
    const { userId } = await request.json();

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: userId,
      status: 'active',
      limit: 1,
    });

    return new Response(
      JSON.stringify({
        isSubscribed: subscriptions.data.length > 0,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to check subscription status',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 