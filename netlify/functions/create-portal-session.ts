import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

// Define environment
const isDevelopment = process.env.NODE_ENV !== 'production';

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
    const { userId, email } = parsedBody;

    if (!userId || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    const stripe = primaryStripe || fallbackStripe;
    if (!stripe) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Stripe client not available' }),
      };
    }

    // Find the customer in Stripe
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    let customerId: string;

    // If customer exists, use that customer
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create a new customer if not found
      const newCustomer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId,
        },
      });
      customerId = newCustomer.id;
    }

    // Create a portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${event.headers.origin || event.headers.host}/account`,
    });

    // Return the portal URL
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error('Error creating portal session:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Error creating portal session',
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
}; 