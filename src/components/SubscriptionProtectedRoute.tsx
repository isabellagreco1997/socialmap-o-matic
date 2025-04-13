import { useEffect, useState } from "react";
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
  const { isSubscribed, isLoading: subscriptionLoading } = useSubscription();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading state while checking auth and subscription
  if (isAuthenticated === null ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to pricing page if authenticated but no active subscription
  if (!isSubscribed) {
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  // If authenticated and subscribed, render the content
  return (
    <AppLayout includeFooter={includeFooter}>
      {children}
    </AppLayout>
  );
};

export default SubscriptionProtectedRoute; 