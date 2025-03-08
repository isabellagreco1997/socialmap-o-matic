import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

// First, let's check both test and live keys
const stripeTest = new Stripe(process.env.VITE_STRIPE_SECRET_KEY_TEST!, {
  apiVersion: '2025-02-24.acacia',
});

const stripeLive = new Stripe(process.env.VITE_STRIPE_SECRET_KEY_LIVE!, {
  apiVersion: '2025-02-24.acacia',
});

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('Environment:', {
      mode: process.env.NODE_ENV,
      hasTestKey: !!process.env.VITE_STRIPE_SECRET_KEY_TEST,
      hasLiveKey: !!process.env.VITE_STRIPE_SECRET_KEY_LIVE,
    });

    console.log('Received request body:', event.body);
    const { email, stripeEmail } = JSON.parse(event.body || '{}');
    const emailsToCheck = [email, stripeEmail].filter(Boolean);

    if (emailsToCheck.length === 0) {
      console.log('No email provided in request');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    console.log('Checking subscription for emails:', emailsToCheck);

    // Try test environment first
    console.log('Checking test environment...');
    let customers = [];
    for (const emailToCheck of emailsToCheck) {
      const result = await stripeTest.customers.list({
        email: emailToCheck,
        limit: 100,
      });
      customers.push(...result.data);
    }

    console.log('Test environment results:', {
      customersFound: customers.length,
      customers: customers.map(c => ({
        id: c.id,
        email: c.email,
        name: c.name,
        created: new Date(c.created * 1000).toISOString()
      }))
    });

    // If no customer found in test, try live
    if (customers.length === 0) {
      console.log('No customer found in test environment, checking live...');
      for (const emailToCheck of emailsToCheck) {
        const result = await stripeLive.customers.list({
          email: emailToCheck,
          limit: 100,
        });
        customers.push(...result.data);
      }

      console.log('Live environment results:', {
        customersFound: customers.length,
        customers: customers.map(c => ({
          id: c.id,
          email: c.email,
          name: c.name,
          created: new Date(c.created * 1000).toISOString()
        }))
      });
    }

    if (customers.length === 0) {
      console.log('No customer found in either environment');
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          isSubscribed: false,
          debug: { 
            reason: 'no_customer_found',
            searchedEmails: emailsToCheck,
            checkedEnvironments: ['test', 'live']
          }
        }),
      };
    }

    // Check subscriptions for all found customers
    let activeSubscription = null;
    let activeCustomer = null;

    for (const customer of customers) {
      const stripe = customer.id.startsWith('cus_test_') ? stripeTest : stripeLive;
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
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        isSubscribed: !!activeSubscription,
        customerDetails: activeCustomer ? {
          id: activeCustomer.id,
          email: activeCustomer.email,
          name: activeCustomer.name,
          metadata: activeCustomer.metadata,
          environment: activeCustomer.id.startsWith('cus_test_') ? 'test' : 'live'
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
          environment: activeCustomer?.id.startsWith('cus_test_') ? 'test' : 'live'
        }
      }),
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to check subscription status',
        debug: {
          errorMessage: error.message,
          errorType: error.type,
          errorStack: error.stack
        }
      }),
    };
  }
}; 