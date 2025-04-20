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

const SubscriptionProtectedRoute = ({ children, includeFooter = true }: SubscriptionProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { isSubscribed, isLoading: subscriptionLoading, checkSubscription } = useSubscription();
  const location = useLocation();
  const hasCheckedSubscription = useRef(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        // If authenticated and we haven't already checked subscription, check it once
        if (session && !hasCheckedSubscription.current) {
          console.log('Initial subscription check on protected route mount');
          checkSubscription();
          hasCheckedSubscription.current = true;
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      
      // Only force check on auth change if the state changed to logged in
      if (session && !hasCheckedSubscription.current) {
        console.log('Auth state changed, forcing initial subscription check');
        checkSubscription();
        hasCheckedSubscription.current = true;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkSubscription]);

  // Show loading state while checking auth and subscription
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

  // Show loading state during initial subscription check
  if (subscriptionLoading && !hasCheckedSubscription.current) {
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
    console.log('User not subscribed, redirecting to pricing');
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