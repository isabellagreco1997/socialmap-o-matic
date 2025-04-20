import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Environment & debug flags
const isDevelopment = process.env.NODE_ENV === 'development';

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Stripe for test and live environments
const stripeTestKey = process.env.VITE_STRIPE_SECRET_KEY_TEST;
const stripeLiveKey = process.env.VITE_STRIPE_SECRET_KEY_LIVE;

const stripeTest = stripeTestKey 
  ? new Stripe(stripeTestKey, { apiVersion: '2025-02-24.acacia' }) 
  : null;

const stripeLive = stripeLiveKey 
  ? new Stripe(stripeLiveKey, { apiVersion: '2025-02-24.acacia' }) 
  : null;

// Determine which environment to use by default
const useTestByDefault = process.env.STRIPE_USE_TEST === 'true' || isDevelopment;

function isTestCustomer(customerId: string): boolean {
  return customerId.startsWith('cus_test_');
}

function getStripeClientForCustomer(customerId: string): Stripe | null {
  // Use the appropriate client based on customer ID prefix
  if (isTestCustomer(customerId)) {
    return stripeTest;
  } else {
    return stripeLive;
  }
}

export const handler: Handler = async (event) => {
  // CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let parsedBody;
  
  try {
    parsedBody = JSON.parse(event.body || '{}');
  } catch (error) {
    console.error('Failed to parse request body:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Invalid request body',
        debug: { receivedBody: event.body }
      }),
    };
  }

  console.log('Received request body:', parsedBody);
  const { email, stripeEmail } = parsedBody;
  const emailsToCheck = [email, stripeEmail].filter(Boolean);

  if (emailsToCheck.length === 0) {
    console.log('No email provided in request');
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Email is required' }),
    };
  }

  console.log('Checking subscription for emails:', emailsToCheck);

  try {
    // Simple approach: just check if there are any active subscriptions in Stripe
    // Default to 'true' if something goes wrong to avoid blocking users
    
    // If we don't have properly configured Stripe APIs, return 'true' by default
    if (!stripeTest && !stripeLive) {
      console.log('No Stripe API keys configured, defaulting to true');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          isSubscribed: true,
          debug: {
            reason: 'no_stripe_keys_configured'
          }
        }),
      };
    }
    
    // Check both test and live environments
    let hasActiveSubscription = false;
    let customerDetails: {
      id: string;
      email: string | null;
      name: string | null | undefined;
      metadata: Stripe.Metadata;
      environment: string;
    } | null = null;
    let subscriptionDetails: {
      id: string;
      status: Stripe.Subscription.Status;
      currentPeriodEnd: string;
      cancelAtPeriodEnd: boolean;
    } | null = null;
    
    // First try test environment if available
    if (stripeTest) {
      for (const emailToCheck of emailsToCheck) {
        try {
          // Find customers with this email
          const customers = await stripeTest.customers.list({
            email: emailToCheck,
            limit: 10,
          });
          
          // Check each customer for active subscriptions
          for (const customer of customers.data) {
            const subscriptions = await stripeTest.subscriptions.list({
              customer: customer.id,
              status: 'active',
              limit: 1,
            });
            
            if (subscriptions.data.length > 0) {
              hasActiveSubscription = true;
              customerDetails = {
                id: customer.id,
                email: customer.email,
                name: customer.name,
                metadata: customer.metadata,
                environment: 'test'
              };
              subscriptionDetails = {
                id: subscriptions.data[0].id,
                status: subscriptions.data[0].status,
                currentPeriodEnd: new Date(subscriptions.data[0].current_period_end * 1000).toISOString(),
                cancelAtPeriodEnd: subscriptions.data[0].cancel_at_period_end,
              };
              break;
            }
          }
          
          if (hasActiveSubscription) break;
        } catch (error) {
          console.error(`Error checking test subscriptions for ${emailToCheck}:`, error);
        }
      }
    }
    
    // If no active subscription found in test env, try live
    if (!hasActiveSubscription && stripeLive) {
      for (const emailToCheck of emailsToCheck) {
        try {
          // Find customers with this email
          const customers = await stripeLive.customers.list({
            email: emailToCheck,
            limit: 10,
          });
          
          // Check each customer for active subscriptions
          for (const customer of customers.data) {
            const subscriptions = await stripeLive.subscriptions.list({
              customer: customer.id,
              status: 'active',
              limit: 1,
            });
            
            if (subscriptions.data.length > 0) {
              hasActiveSubscription = true;
              customerDetails = {
                id: customer.id,
                email: customer.email,
                name: customer.name,
                metadata: customer.metadata,
                environment: 'live'
              };
              subscriptionDetails = {
                id: subscriptions.data[0].id,
                status: subscriptions.data[0].status,
                currentPeriodEnd: new Date(subscriptions.data[0].current_period_end * 1000).toISOString(),
                cancelAtPeriodEnd: subscriptions.data[0].cancel_at_period_end,
              };
              break;
            }
          }
          
          if (hasActiveSubscription) break;
        } catch (error) {
          console.error(`Error checking live subscriptions for ${emailToCheck}:`, error);
        }
      }
    }
    
    // Try to update Supabase if possible
    if (email && supabaseUrl && supabaseAnonKey) {
      try {
        await updateSubscriptionStatus(email, hasActiveSubscription);
      } catch (error) {
        console.error('Error updating Supabase:', error);
      }
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        isSubscribed: hasActiveSubscription,
        customerDetails,
        subscriptionDetails,
        debug: {
          searchedEmails: emailsToCheck
        }
      }),
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    
    // Default to true on error to avoid blocking access
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        isSubscribed: true,
        customerDetails: null,
        subscriptionDetails: null,
        debug: {
          errorMessage: error.message,
          errorType: error.name,
          fallbackResponse: true
        }
      }),
    };
  }
};

// Helper function to update Supabase subscription status
async function updateSubscriptionStatus(email: string, isActive: boolean) {
  try {
    const { data: user } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy-password-that-will-fail',
    });
    
    console.log('User lookup result:', user);
    
    // This won't actually log the user in, but it will tell us if the user exists
    // If needed, you could replace this with a more direct check
    
    // Since we don't have admin permissions with anon key, we'll try a direct table query
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        subscription_status: isActive ? 'active' : 'inactive' 
      })
      .eq('email', email);
    
    if (error) {
      console.error('Error updating profile:', error);
    } else {
      console.log('Updated profile successfully:', data);
    }
  } catch (error) {
    console.error('Error in updateSubscriptionStatus:', error);
  }
}