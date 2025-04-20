import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Define types for subscription data
export interface CustomerDetails {
  id: string;
  email: string;
  name: string | null;
  metadata: Record<string, any>;
  environment: 'test' | 'live';
}

export interface SubscriptionDetails {
  id: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface SubscriptionData {
  isSubscribed: boolean;
  customerDetails: CustomerDetails | null;
  subscriptionDetails: SubscriptionDetails | null;
  debug?: any;
}

// Cache subscription data
const CACHE_KEY = 'subscription-data';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour for active subscriptions
const CACHE_EXPIRY_INACTIVE = 5 * 60 * 1000; // 5 minutes for inactive subscriptions
let cachedData: {
  data: SubscriptionData;
  timestamp: number;
} | null = null;

// Track check attempts globally
let checkAttempts = 0;
let lastCheckTime = 0;
const CHECK_THROTTLE_TIME = 2000; // Don't check more often than every 2 seconds

export function useSubscription(stripeEmail?: string) {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>(() => {
    // Try to use cached data on initial load
    if (cachedData && Date.now() - cachedData.timestamp < getCacheExpiry(cachedData.data.isSubscribed)) {
      console.log('Using cached subscription data:', cachedData.data.isSubscribed ? 'Subscribed' : 'Not subscribed');
      return cachedData.data;
    }
    
    // Check localStorage for cached data
    const storedData = localStorage.getItem(CACHE_KEY);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed && parsed.timestamp && 
            Date.now() - parsed.timestamp < getCacheExpiry(parsed.data.isSubscribed)) {
          cachedData = parsed;
          console.log('Using localStorage subscription data:', parsed.data.isSubscribed ? 'Subscribed' : 'Not subscribed');
          return parsed.data;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    return {
      isSubscribed: false,
      customerDetails: null,
      subscriptionDetails: null
    };
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(!cachedData);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number>(cachedData?.timestamp || 0);
  const { toast } = useToast();

  // Helper function to determine cache expiry time based on subscription status
  function getCacheExpiry(isSubscribed: boolean): number {
    return isSubscribed ? CACHE_EXPIRY : CACHE_EXPIRY_INACTIVE;
  }

  // Create the subscription checking function that can be called on demand
  const checkSubscription = useCallback(async (forceCheck: boolean = false) => {
    // Throttle checks to prevent rapid consecutive calls
    const now = Date.now();
    if (!forceCheck && now - lastCheckTime < CHECK_THROTTLE_TIME) {
      console.log('Throttling subscription check - too soon since last check');
      return;
    }
    lastCheckTime = now;
    
    // Log and count check attempts
    checkAttempts++;
    console.log(`Subscription check attempt ${checkAttempts} (forced: ${forceCheck})`);

    try {
      setIsLoading(true);
      setError(null);
      
      // Skip if we've fetched recently and not forcing a check
      if (!forceCheck && cachedData && 
          Date.now() - cachedData.timestamp < getCacheExpiry(cachedData.data.isSubscribed)) {
        console.log('Using cached subscription data, skipping API call');
        setIsLoading(false);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, setting isSubscribed to false');
        const newData = {
          isSubscribed: false,
          customerDetails: null,
          subscriptionDetails: null
        };
        
        setSubscriptionData(newData);
        
        // Update cache
        cachedData = {
          data: newData,
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
        
        setLastFetched(Date.now());
        setIsLoading(false);
        return;
      }

      console.log('Checking subscription for user:', {
        id: user.id,
        email: user.email
      });

      // Call the Netlify function to check subscription
      console.log('Calling Netlify function to check subscription');
      
      const response = await fetch('/.netlify/functions/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: user.email,
          stripeEmail 
        }),
      });

      // Log the raw response for debugging
      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', responseText);
        throw new Error(`Invalid response: ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`);
      }

      if (!response.ok) {
        console.error('API request failed:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        
        const errorMessage = data?.error || `Request failed with status ${response.status}`;
        setError(errorMessage);
        
        toast({
          title: "Subscription Check Failed",
          description: "We couldn't verify your subscription status. Please try again later.",
          variant: "destructive",
        });
        
        return;
      }

      console.log('Subscription check result:', data.isSubscribed ? 'Subscribed' : 'Not subscribed');
      
      // Store the full subscription data
      const newData = {
        isSubscribed: data.isSubscribed,
        customerDetails: data.customerDetails,
        subscriptionDetails: data.subscriptionDetails,
        debug: data.debug
      };
      
      setSubscriptionData(newData);
      
      // Update cache with longer expiry for active subscriptions
      cachedData = {
        data: newData,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
      
      setLastFetched(Date.now());
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionData({
        isSubscribed: false,
        customerDetails: null,
        subscriptionDetails: null
      });
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      toast({
        title: "Subscription Check Error",
        description: "There was a problem checking your subscription. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [stripeEmail, toast, lastFetched, setLastFetched]);

  useEffect(() => {
    // Run the check without forcing on component mount - only if no recent checks
    const now = Date.now();
    if (!cachedData || now - cachedData.timestamp > getCacheExpiry(cachedData.data.isSubscribed)) {
      console.log('No recent subscription check found, performing initial check');
      checkSubscription(false);
    } else {
      console.log('Using cached subscription data on mount, skipping check');
    }

    // Only subscribe to auth changes, not on every render
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // Clear cache on auth state change to force refetching
      cachedData = null;
      localStorage.removeItem(CACHE_KEY);
      console.log('Auth state changed, forcing subscription check');
      checkSubscription(true);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [checkSubscription]);

  // For backward compatibility
  const { isSubscribed } = subscriptionData;

  return { 
    isSubscribed, 
    isLoading, 
    error,
    subscriptionData,
    customerDetails: subscriptionData.customerDetails,
    subscriptionDetails: subscriptionData.subscriptionDetails,
    checkSubscription: () => checkSubscription(true) // Expose function to force check
  };
} 