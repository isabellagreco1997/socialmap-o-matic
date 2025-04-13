import { useEffect, useState } from 'react';
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
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
let cachedData: {
  data: SubscriptionData;
  timestamp: number;
} | null = null;

export function useSubscription(stripeEmail?: string) {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>(() => {
    // Try to use cached data on initial load
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
      return cachedData.data;
    }
    
    // Check localStorage for cached data
    const storedData = localStorage.getItem(CACHE_KEY);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < CACHE_EXPIRY) {
          cachedData = parsed;
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

  useEffect(() => {
    // Don't refetch if we've fetched recently
    if (Date.now() - lastFetched < CACHE_EXPIRY) {
      return;
    }
    
    const checkSubscription = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
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
          email: user.email,
          stripeEmail
        });

        // Call the Netlify function to check subscription
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

        console.log('Subscription check response:', data);
        
        // Store the full subscription data
        const newData = {
          isSubscribed: data.isSubscribed,
          customerDetails: data.customerDetails,
          subscriptionDetails: data.subscriptionDetails,
          debug: data.debug
        };
        
        setSubscriptionData(newData);
        
        // Update cache
        cachedData = {
          data: newData,
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
        
        setLastFetched(Date.now());
        console.log('Updated subscription status:', data.isSubscribed);
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
          description: "There was a problem checking your subscription. Please refresh the page or try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();

    // Only subscribe to auth changes, not on every render
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // Clear cache on auth state change to force refetching
      cachedData = null;
      localStorage.removeItem(CACHE_KEY);
      console.log('Auth state changed, rechecking subscription');
      checkSubscription();
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [stripeEmail, toast, lastFetched]);

  // For backward compatibility
  const { isSubscribed } = subscriptionData;

  return { 
    isSubscribed, 
    isLoading, 
    error,
    subscriptionData,
    customerDetails: subscriptionData.customerDetails,
    subscriptionDetails: subscriptionData.subscriptionDetails
  };
} 