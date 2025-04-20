import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
});

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const handler: Handler = async (event) => {
  // Set CORS headers for preflight requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Verify that this is a POST request
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let stripeEvent: Stripe.Event;
  
  try {
    // Get the webhook signature from headers
    const signature = event.headers['stripe-signature'] || '';
    
    // Verify webhook signature
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    if (!endpointSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Webhook secret not configured' }),
      };
    }
    
    stripeEvent = stripe.webhooks.constructEvent(
      event.body || '',
      signature,
      endpointSecret
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid webhook signature' }),
    };
  }

  console.log('Received webhook event:', stripeEvent.type);

  try {
    // Handle the different event types
    switch (stripeEvent.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.resumed':
        await handleActiveSubscription(stripeEvent.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
        await handleCanceledSubscription(stripeEvent.data.object as Stripe.Subscription);
        break;
        
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

async function handleActiveSubscription(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  try {
    // Get the customer to find their email
    const customer = await stripe.customers.retrieve(customerId);
    
    if (!customer || customer.deleted) {
      console.error('Customer not found or deleted:', customerId);
      return;
    }
    
    const email = (customer as Stripe.Customer).email;
    
    if (!email) {
      console.error('Customer has no email:', customerId);
      return;
    }
    
    console.log(`Updating subscription_status to active for user with email: ${email}`);
    
    // Find the user in Supabase by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
      
    if (userError || !userData) {
      console.error('Error finding user by email:', email, userError);
      
      // Try to find user through auth.users table
      const { data: users, error: authError } = await supabase.auth.admin
        .listUsers();
        
      if (authError || !users || users.users.length === 0) {
        console.error('Error listing users:', authError);
        return;
      }
      
      // Find user with matching email
      const authUser = users.users.find(user => user.email === email);
      
      if (!authUser) {
        console.error('User not found with email:', email);
        return;
      }
      
      // Update profile with user ID from auth
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ subscription_status: 'active' })
        .eq('id', authUser.id);
        
      if (updateError) {
        console.error('Error updating user subscription status:', updateError);
      }
    } else {
      // Update profile with found ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ subscription_status: 'active' })
        .eq('id', userData.id);
        
      if (updateError) {
        console.error('Error updating user subscription status:', updateError);
      }
    }
  } catch (error) {
    console.error('Error handling active subscription:', error);
    throw error;
  }
}

async function handleCanceledSubscription(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  try {
    // Get the customer to find their email
    const customer = await stripe.customers.retrieve(customerId);
    
    if (!customer || customer.deleted) {
      console.error('Customer not found or deleted:', customerId);
      return;
    }
    
    const email = (customer as Stripe.Customer).email;
    
    if (!email) {
      console.error('Customer has no email:', customerId);
      return;
    }
    
    console.log(`Updating subscription_status to inactive for user with email: ${email}`);
    
    // Find the user in Supabase by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
      
    if (userError || !userData) {
      console.error('Error finding user by email:', email, userError);
      
      // Try to find user through auth.users table
      const { data: users, error: authError } = await supabase.auth.admin
        .listUsers();
        
      if (authError || !users || users.users.length === 0) {
        console.error('Error listing users:', authError);
        return;
      }
      
      // Find user with matching email
      const authUser = users.users.find(user => user.email === email);
      
      if (!authUser) {
        console.error('User not found with email:', email);
        return;
      }
      
      // Update profile with user ID from auth
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ subscription_status: 'inactive' })
        .eq('id', authUser.id);
        
      if (updateError) {
        console.error('Error updating user subscription status:', updateError);
      }
    } else {
      // Update profile with found ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ subscription_status: 'inactive' })
        .eq('id', userData.id);
        
      if (updateError) {
        console.error('Error updating user subscription status:', updateError);
      }
    }
  } catch (error) {
    console.error('Error handling canceled subscription:', error);
    throw error;
  }
} 