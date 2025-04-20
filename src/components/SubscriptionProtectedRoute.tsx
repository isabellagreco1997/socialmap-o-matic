import { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { AppLayout } from "./AppLayout";
import { useSubscription } from "@/hooks/use-subscription";

interface SubscriptionProtectedRouteProps {
  children: React.ReactNode;
  includeFooter?: boolean;
}

// Global check tracking - we only want to check once per app session
let hasGloballyCheckedSubscription = false;

const SubscriptionProtectedRoute = ({ children, includeFooter = true }: SubscriptionProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { isSubscribed, isLoading: subscriptionLoading } = useSubscription();
  const location = useLocation();
  const hasCheckedSubscription = useRef(hasGloballyCheckedSubscription);
  const hasCheckedAuth = useRef(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Capture the initial subscription status to prevent unnecessary re-checks
  const initialIsSubscribed = useRef(isSubscribed);

  // Set the global flag if we're already subscribed
  useEffect(() => {
    if (isSubscribed && !hasGloballyCheckedSubscription) {
      console.log('[SubscriptionProtectedRoute] User is subscribed, setting global flag');
      hasGloballyCheckedSubscription = true;
      hasCheckedSubscription.current = true;
    }
  }, [isSubscribed]);

  useEffect(() => {
    const checkAuth = async () => {
      // Don't check auth multiple times
      if (hasCheckedAuth.current) {
        return;
      }
      
      setIsCheckingAuth(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        hasCheckedAuth.current = true;
        
        // Skip subscription check if we've already checked globally
        if (hasGloballyCheckedSubscription) {
          console.log('[SubscriptionProtectedRoute] Already checked subscription globally');
          hasCheckedSubscription.current = true;
          return;
        }
        
        // Skip subscription check if we already know from cache that they're subscribed
        if (initialIsSubscribed.current) {
          console.log('[SubscriptionProtectedRoute] User already known to be subscribed from initial state');
          hasGloballyCheckedSubscription = true;
          hasCheckedSubscription.current = true;
          return;
        }
        
        // No need to explicitly call checkSubscription() - the hook will handle it
        if (session) {
          console.log('[SubscriptionProtectedRoute] Auth session exists, subscription check handled by hook');
          hasGloballyCheckedSubscription = true;
          hasCheckedSubscription.current = true;
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    // Set up auth listener, but avoid redundant subscription checks
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      
      // Skip if we've already checked globally
      if (hasGloballyCheckedSubscription) {
        return;
      }
      
      // Skip if we already know they're subscribed
      if (initialIsSubscribed.current) {
        hasGloballyCheckedSubscription = true;
        return;
      }
      
      // The hook will handle the subscription check on auth change
      if (session) {
        console.log('[SubscriptionProtectedRoute] Auth state changed with session');
        hasGloballyCheckedSubscription = true;
        hasCheckedSubscription.current = true;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialIsSubscribed]);

  // Show loading state while checking auth
  if (isCheckingAuth || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show loading state during initial subscription check - but only if we're not already subscribed
  // and we haven't already checked globally
  if (subscriptionLoading && !hasGloballyCheckedSubscription && !initialIsSubscribed.current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Checking your subscription...</h2>
          <p className="text-muted-foreground">Just a moment while we verify your access.</p>
        </div>
      </div>
    );
  }

  // Only redirect to pricing if we're certain the user isn't subscribed
  if (!isSubscribed && !subscriptionLoading) {
    console.log('[SubscriptionProtectedRoute] User not subscribed, redirecting to pricing');
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  // If authenticated and subscribed (or still checking), render the content
  return (
    <AppLayout includeFooter={includeFooter}>
      {children}
    </AppLayout>
  );
};

export default SubscriptionProtectedRoute; 