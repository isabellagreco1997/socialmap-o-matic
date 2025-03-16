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

export function useSubscription(stripeEmail?: string) {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    isSubscribed: false,
    customerDetails: null,
    subscriptionDetails: null
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found, setting isSubscribed to false');
          setSubscriptionData({
            isSubscribed: false,
            customerDetails: null,
            subscriptionDetails: null
          });
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
        setSubscriptionData({
          isSubscribed: data.isSubscribed,
          customerDetails: data.customerDetails,
          subscriptionDetails: data.subscriptionDetails,
          debug: data.debug
        });
        
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

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      console.log('Auth state changed, rechecking subscription');
      checkSubscription();
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [stripeEmail, toast]);

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