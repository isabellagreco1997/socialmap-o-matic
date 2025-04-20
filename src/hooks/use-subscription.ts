import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define types
export interface SubscriptionData {
  isSubscribed: boolean;
  customerDetails: any | null;
  subscriptionDetails: any | null;
}

// Global circuit breaker mechanism
let IS_CHECKING = false;
let LAST_CHECK_TIME = 0;
let CHECK_COUNT = 0;
let HAS_CHECKED_SESSION = false;
const MAX_CHECKS = 3;
const COOLDOWN_MS = 5000; // 5 seconds between checks

// Reset counter after 10 minutes
setInterval(() => {
  if (CHECK_COUNT > 0) {
    console.log(`[Subscription] Resetting check counter. Had ${CHECK_COUNT} checks.`);
    CHECK_COUNT = 0;
  }
}, 10 * 60 * 1000);

export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<number>(0);

  // The main function to check subscription status
  const checkSubscription = useCallback(async (forceCheck = false) => {
    // Circuit breaker to prevent loops
    if (IS_CHECKING) {
      console.log('[Subscription] Check already in progress, skipping');
      return;
    }

    // If we've already checked this session, don't check again (unless forced)
    if (HAS_CHECKED_SESSION && !forceCheck) {
      console.log('[Subscription] Already checked this session');
      return;
    }

    // Prevent checks too close together
    const now = Date.now();
    if (!forceCheck && now - LAST_CHECK_TIME < COOLDOWN_MS) {
      console.log(`[Subscription] Too many requests (wait ${Math.ceil((COOLDOWN_MS - (now - LAST_CHECK_TIME))/1000)}s)`);
      return;
    }

    // Limit total number of checks 
    if (CHECK_COUNT >= MAX_CHECKS && !forceCheck) {
      console.log(`[Subscription] Maximum check count reached (${MAX_CHECKS})`);
      // Default to subscribed to avoid blocking users
      setIsSubscribed(true);
      return;
    }

    // Check if we have a valid cached result
    const cachedResult = localStorage.getItem('subscription-status');
    if (!forceCheck && cachedResult) {
      try {
        const parsed = JSON.parse(cachedResult);
        const cacheAge = now - parsed.timestamp;
        // Use cache for 1 hour for subscribers, 5 minutes for others
        const maxAge = parsed.data.isSubscribed ? 60 * 60 * 1000 : 5 * 60 * 1000;
        
        if (cacheAge < maxAge) {
          console.log('[Subscription] Using cached data');
          setIsSubscribed(parsed.data.isSubscribed);
          return;
        }
      } catch (e) {
        console.error('[Subscription] Error reading cache', e);
      }
    }

    // Check if we have an authenticated session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('[Subscription] No active session');
      return;
    }

    // Update circuit breaker state
    IS_CHECKING = true;
    LAST_CHECK_TIME = now;
    CHECK_COUNT++;
    
    console.log(`[Subscription] Check #${CHECK_COUNT} starting...`);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the Netlify function
      const response = await fetch('/.netlify/functions/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: session.user.email,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Subscription] Status:', data.isSubscribed ? 'ACTIVE' : 'INACTIVE');
        
        // Update state
        setIsSubscribed(data.isSubscribed);
        setLastChecked(now);
        
        // Cache the result
        localStorage.setItem('subscription-status', JSON.stringify({
          data,
          timestamp: now
        }));
        
        // If user is subscribed, set session flag
        if (data.isSubscribed) {
          HAS_CHECKED_SESSION = true;
        }
      } else {
        console.error('[Subscription] API error:', response.status);
        setError(`API error: ${response.status}`);
        
        // Default to subscribed on error to prevent blocking users
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('[Subscription] Error:', error);
      setError('Unknown error checking subscription');
      
      // Default to subscribed on error
      setIsSubscribed(true);
    } finally {
      setIsLoading(false);
      IS_CHECKING = false;
    }
  }, []);

  // Initial check on mount
  useEffect(() => {
    // Try to load from cache first
    const cachedResult = localStorage.getItem('subscription-status');
    if (cachedResult) {
      try {
        const parsed = JSON.parse(cachedResult);
        const now = Date.now();
        const cacheAge = now - parsed.timestamp;
        const maxAge = parsed.data.isSubscribed ? 60 * 60 * 1000 : 5 * 60 * 1000;
        
        if (cacheAge < maxAge) {
          console.log('[Subscription] Using initial cached data');
          setIsSubscribed(parsed.data.isSubscribed);
          setLastChecked(parsed.timestamp);
          
          // If cached data says subscribed, set session flag
          if (parsed.data.isSubscribed) {
            HAS_CHECKED_SESSION = true;
            return; // No need to check again
          }
        }
      } catch (e) {
        console.error('[Subscription] Error reading initial cache', e);
      }
    }
    
    // Only run check if we don't have valid cached data
    if (!HAS_CHECKED_SESSION) {
      checkSubscription();
    }
    
    // Set up auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        console.log(`[Subscription] Auth changed: ${event}`);
        
        // Clear cache on auth change
        localStorage.removeItem('subscription-status');
        HAS_CHECKED_SESSION = false;
        
        // Force check on sign in, skip on sign out
        if (event === 'SIGNED_IN') {
          checkSubscription(true);
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [checkSubscription]);

  return {
    isSubscribed,
    isLoading,
    error,
    checkSubscription: () => checkSubscription(true),
    lastChecked
  };
} 