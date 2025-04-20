import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Environment & debug flags
const isDevelopment = process.env.NODE_ENV === 'development';

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Stripe for test and live environments
const stripeTestKey = process.env.STRIPE_TEST_SECRET_KEY;
const stripeLiveKey = process.env.STRIPE_LIVE_SECRET_KEY;

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
    // FIRST: Check subscription status in Supabase for the primary email
    if (email) {
      console.log('Checking Supabase subscription status for email:', email);
      
      // First, try to get the user ID from auth
      const { data: users, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError && users) {
        // Find user with matching email
        const authUser = users.users.find(user => user.email === email);
        
        if (authUser) {
          console.log('Found user in auth with ID:', authUser.id);
          
          // Check if user has a profile with subscription status
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('subscription_status')
            .eq('id', authUser.id)
            .single();
          
          if (!profileError && profile && profile.subscription_status) {
            console.log('Found subscription status in Supabase:', profile.subscription_status);
            
            // If we have a clear active status, return it
            if (profile.subscription_status === 'active') {
              console.log('Returning active subscription status from Supabase');
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                  isSubscribed: true,
                  customerDetails: {
                    id: authUser.id,
                    email: authUser.email,
                    name: authUser.user_metadata?.full_name || null,
                    metadata: {},
                    environment: useTestByDefault ? 'test' : 'live'
                  },
                  subscriptionDetails: {
                    id: 'supabase-subscription',
                    status: 'active',
                    currentPeriodEnd: 'N/A',
                    cancelAtPeriodEnd: false
                  },
                  debug: {
                    source: 'supabase',
                    searchedEmails: emailsToCheck,
                    profile: profile
                  }
                }),
              };
            }
            
            // If we have a clear inactive status, continue to check Stripe as fallback
            if (profile.subscription_status === 'inactive') {
              console.log('Found inactive status in Supabase, will check Stripe as fallback');
              // Will continue to Stripe check below
            }
          }
        }
      }
    }
    
    // SECOND: If Supabase didn't give a clear answer, check Stripe
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

    // Combine results based on environment priority
    if (useTestByDefault) {
      // If using test environment by default, prioritize test customers
      customers = [...testCustomers, ...liveCustomers];
    } else {
      // If using live environment by default, prioritize live customers
      customers = [...liveCustomers, ...testCustomers];
    }

    console.log('Combined results:', {
      customersFound: customers.length,
      testCustomersFound: testCustomers.length,
      liveCustomersFound: liveCustomers.length
    });

    // Early return if no customers found
    if (customers.length === 0) {
      console.log('No Stripe customers found for the provided emails');
      
      // If we didn't find customers, try to update Supabase to be consistent
      await tryUpdateSupabaseStatus(email, 'inactive');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          isSubscribed: false,
          customerDetails: null,
          subscriptionDetails: null,
          debug: {
            searchedEmails: emailsToCheck,
            customersFound: 0,
            testCustomersFound: 0,
            liveCustomersFound: 0,
            environment: isDevelopment ? 'development' : 'production',
            customerEnvironment: null
          }
        }),
      };
    }

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
          
          // Update Supabase with active status
          await tryUpdateSupabaseStatus(email, 'active');
          
          break;
        }
      } catch (error) {
        console.error(`Error checking subscriptions for customer ${customer.id}:`, error);
        // Continue with other customers
      }
    }
    
    // If no active subscription found, update Supabase
    if (!activeSubscription) {
      await tryUpdateSupabaseStatus(email, 'inactive');
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
    
    // Try to update Supabase with active status to ensure user can access
    if (email) {
      await tryUpdateSupabaseStatus(email, 'active');
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        isSubscribed: true, // Default to true on error to prevent access issues
        customerDetails: null,
        subscriptionDetails: null,
        debug: {
          errorMessage: error.message,
          errorType: error.type || error.name,
          fallbackResponse: true,
          environment: isDevelopment ? 'development' : 'production'
        }
      }),
    };
  }
};

// Helper function to update Supabase subscription status
async function tryUpdateSupabaseStatus(email: string | undefined, status: 'active' | 'inactive') {
  if (!email) return;
  
  try {
    console.log(`Updating Supabase subscription_status to ${status} for email: ${email}`);
    
    // First, try to get the user ID from auth
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError || !users) {
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
      .update({ subscription_status: status })
      .eq('id', authUser.id);
      
    if (updateError) {
      console.error('Error updating user subscription status:', updateError);
    } else {
      console.log(`Successfully updated subscription_status to ${status} for user ID: ${authUser.id}`);
    }
  } catch (error) {
    console.error('Error updating Supabase subscription status:', error);
  }
} 