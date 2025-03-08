import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSubscription(stripeEmail?: string) {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found, setting isSubscribed to false');
          setIsSubscribed(false);
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

        if (!response.ok) {
          console.error('API request failed:', {
            status: response.status,
            statusText: response.statusText
          });
          throw new Error('Failed to check subscription status');
        }

        const data = await response.json();
        console.log('Subscription check response:', data);
        
        setIsSubscribed(data.isSubscribed);
        console.log('Updated subscription status:', data.isSubscribed);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsSubscribed(false);
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

    return () => {
      subscription.unsubscribe();
    };
  }, [stripeEmail]);

  return { isSubscribed, isLoading };
} 