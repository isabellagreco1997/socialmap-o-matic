import { env } from '@/utils/env';
import { supabase } from '@/integrations/supabase/client';
import Stripe from 'stripe';

const stripe = new Stripe(
  import.meta.env.MODE === 'development'
    ? env.stripe.test.secretKey
    : env.stripe.live.secretKey,
  {
    apiVersion: '2023-10-16',
  }
);

const webhookSecret = import.meta.env.MODE === 'development'
  ? env.stripe.test.webhookSecret
  : env.stripe.live.webhookSecret;

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Get the customer to find the associated user
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.metadata.userId) {
          throw new Error('No userId found in customer metadata');
        }

        // Update the user's subscription status
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_status: subscription.status === 'active' ? 'active' : 'inactive' })
          .eq('id', customer.metadata.userId);

        if (error) throw error;
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Get the customer to find the associated user
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.metadata.userId) {
          throw new Error('No userId found in customer metadata');
        }

        // Update the user's subscription status
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'cancelled' })
          .eq('id', customer.metadata.userId);

        if (error) throw error;
        break;
      }
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Webhook processing failed', { status: 400 });
  }
} 