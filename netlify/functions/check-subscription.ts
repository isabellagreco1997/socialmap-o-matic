import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

// Define environment
const isDevelopment = process.env.NODE_ENV !== 'production';
console.log('Environment mode:', { isDevelopment, NODE_ENV: process.env.NODE_ENV });

// Initialize Stripe with fallback error handling
let stripeTest: Stripe | null = null;
let stripeLive: Stripe | null = null;

try {
  if (process.env.VITE_STRIPE_SECRET_KEY_TEST) {
    stripeTest = new Stripe(process.env.VITE_STRIPE_SECRET_KEY_TEST, {
      apiVersion: '2025-02-24.acacia',
    });
  }
} catch (error) {
  console.error('Failed to initialize Stripe Test client:', error);
}

try {
  if (process.env.VITE_STRIPE_SECRET_KEY_LIVE) {
    stripeLive = new Stripe(process.env.VITE_STRIPE_SECRET_KEY_LIVE, {
      apiVersion: '2025-02-24.acacia',
    });
  }
} catch (error) {
  console.error('Failed to initialize Stripe Live client:', error);
}

// Determine which Stripe client to use based on environment
const primaryStripe = isDevelopment ? stripeTest : stripeLive;
const fallbackStripe = isDevelopment ? stripeLive : stripeTest;

// Helper function to determine if a customer ID is from test mode
function isTestCustomer(customerId: string): boolean {
  return customerId.startsWith('cus_test_') || 
         (customerId.includes('_test_')) || 
         (isDevelopment && !customerId.includes('_live_'));
}

// Helper function to get the appropriate Stripe client for a customer
function getStripeClientForCustomer(customerId: string): Stripe | null {
  const isTest = isTestCustomer(customerId);
  console.log(`Customer ${customerId} detected as ${isTest ? 'test' : 'live'} mode`);
  return isTest ? stripeTest : stripeLive;
}

export const handler: Handler = async (event) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Log environment info
    console.log('Environment:', {
      mode: process.env.NODE_ENV,
      isDevelopment,
      hasTestKey: !!process.env.VITE_STRIPE_SECRET_KEY_TEST,
      hasLiveKey: !!process.env.VITE_STRIPE_SECRET_KEY_LIVE,
      stripeTestInitialized: !!stripeTest,
      stripeLiveInitialized: !!stripeLive,
      primaryStripe: primaryStripe ? 'initialized' : 'not initialized',
      fallbackStripe: fallbackStripe ? 'initialized' : 'not initialized',
    });

    // Validate Stripe initialization
    if (!primaryStripe && !fallbackStripe) {
      console.error('No Stripe clients initialized');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Stripe configuration error',
          debug: {
            message: 'No Stripe clients could be initialized',
            environment: isDevelopment ? 'development' : 'production'
          }
        }),
      };
    }

    // Parse request body
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

    // Try primary environment first
    let customers: Stripe.Customer[] = [];
    let testCustomers: Stripe.Customer[] = [];
    let liveCustomers: Stripe.Customer[] = [];

    // Check test environment
    if (stripeTest) {
      console.log('Checking test environment...');
      for (const emailToCheck of emailsToCheck) {
        try {
          const result = await stripeTest.customers.list({
            email: emailToCheck,
            limit: 100,
          });
          testCustomers.push(...result.data);
        } catch (error) {
          console.error(`Error listing customers for ${emailToCheck} in test environment:`, error);
          // Continue with other emails
        }
      }

      console.log('Test environment results:', {
        customersFound: testCustomers.length,
        customers: testCustomers.map(c => ({
          id: c.id,
          email: c.email,
          name: c.name,
          created: new Date(c.created * 1000).toISOString()
        }))
      });
    }

    // Check live environment
    if (stripeLive) {
      console.log('Checking live environment...');
      for (const emailToCheck of emailsToCheck) {
        try {
          const result = await stripeLive.customers.list({
            email: emailToCheck,
            limit: 100,
          });
          liveCustomers.push(...result.data);
        } catch (error) {
          console.error(`Error listing customers for ${emailToCheck} in live environment:`, error);
          // Continue with other emails
        }
      }

      console.log('Live environment results:', {
        customersFound: liveCustomers.length,
        customers: liveCustomers.map(c => ({
          id: c.id,
          email: c.email,
          name: c.name,
          created: new Date(c.created * 1000).toISOString()
        }))
      });
    }

    // Prioritize customers based on environment
    if (isDevelopment) {
      customers = [...testCustomers, ...liveCustomers];
    } else {
      customers = [...liveCustomers, ...testCustomers];
    }

    if (customers.length === 0) {
      console.log('No customer found in either environment');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          isSubscribed: false,
          debug: { 
            reason: 'no_customer_found',
            searchedEmails: emailsToCheck,
            checkedEnvironments: [
              stripeTest ? 'test' : null,
              stripeLive ? 'live' : null
            ].filter(Boolean)
          }
        }),
      };
    }

    // Check subscriptions for all found customers
    let activeSubscription: Stripe.Subscription | null = null;
    let activeCustomer: Stripe.Customer | null = null;

    for (const customer of customers) {
      try {
        // Get the appropriate Stripe client for this customer
        const stripe = getStripeClientForCustomer(customer.id);
        
        if (!stripe) {
          console.log(`Skipping customer ${customer.id} - no matching Stripe client available`);
          continue;
        }

        console.log(`Checking subscriptions for customer ${customer.id} using ${isTestCustomer(customer.id) ? 'test' : 'live'} client`);
        
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
          expand: ['data.default_payment_method'],
          limit: 100,
        });

        console.log(`Subscriptions found for customer ${customer.email}:`, {
          count: subscriptions.data.length,
          subscriptions: subscriptions.data.map(s => ({
            id: s.id,
            status: s.status,
            currentPeriodEnd: new Date(s.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: s.cancel_at_period_end
          }))
        });

        const hasActive = subscriptions.data.some(sub => 
          sub.status === 'active' || sub.status === 'trialing'
        );

        if (hasActive) {
          activeSubscription = subscriptions.data[0];
          activeCustomer = customer;
          break;
        }
      } catch (error) {
        console.error(`Error checking subscriptions for customer ${customer.id}:`, error);
        // Continue with other customers
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        isSubscribed: !!activeSubscription,
        customerDetails: activeCustomer ? {
          id: activeCustomer.id,
          email: activeCustomer.email,
          name: activeCustomer.name,
          metadata: activeCustomer.metadata,
          environment: isTestCustomer(activeCustomer.id) ? 'test' : 'live'
        } : null,
        subscriptionDetails: activeSubscription ? {
          id: activeSubscription.id,
          status: activeSubscription.status,
          currentPeriodEnd: new Date(activeSubscription.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
        } : null,
        debug: {
          searchedEmails: emailsToCheck,
          customersFound: customers.length,
          testCustomersFound: testCustomers.length,
          liveCustomersFound: liveCustomers.length,
          environment: isDevelopment ? 'development' : 'production',
          customerEnvironment: activeCustomer ? (isTestCustomer(activeCustomer.id) ? 'test' : 'live') : null
        }
      }),
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to check subscription status',
        debug: {
          errorMessage: error.message,
          errorType: error.type || error.name,
          errorStack: error.stack,
          environment: isDevelopment ? 'development' : 'production'
        }
      }),
    };
  }
}; 