import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription as useSubscriptionHook } from "@/hooks/use-subscription";
import { env } from "@/utils/env";
import { redirectToCheckout } from "@/utils/stripe";

export function useSubscriptionManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const { isSubscribed, isLoading: isSubscriptionLoading } = useSubscriptionHook();

  // Check for fromLogin parameter and directly redirect to Stripe checkout
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fromLogin = searchParams.get('fromLogin');
    
    if (fromLogin === 'true') {
      console.log("Detected fromLogin=true parameter", { 
        isSubscriptionLoading, 
        isSubscribed 
      });
      
      // Remove the query parameter from URL without refreshing the page
      navigate(location.pathname, { replace: true });
      
      // Always show the checkout for free users regardless of loading state
      // This ensures free users can subscribe without waiting for subscription check
      const redirectToStripeCheckout = async () => {
        try {
          const isDevelopment = import.meta.env.MODE === 'development';
          
          // Get price ID - use any to bypass typescript checking for now
          const stripeEnv = env as any;
          const priceId = isDevelopment 
            ? stripeEnv.stripe.test.priceMonthly 
            : stripeEnv.stripe.live.priceMonthly;
          
          console.log("Redirecting to checkout with price ID:", priceId);
          await redirectToCheckout(priceId);
        } catch (error) {
          console.error('Error redirecting to checkout:', error);
          
          // If redirect fails, show the subscription modal as fallback
          setIsSubscriptionModalOpen(true);
          
          toast({
            title: "Checkout Error",
            description: "Could not redirect to checkout. Please try again.",
            variant: "destructive",
          });
        }
      };
      
      // Handle different states based on subscription loading/status
      if (isSubscriptionLoading) {
        // While loading, assume user is free and show subscription modal
        console.log("Subscription status is still loading, showing subscription modal as fallback");
        setIsSubscriptionModalOpen(true);
      } else if (isSubscribed) {
        // User is already subscribed, show a welcoming toast
        console.log("User already has an active subscription - not redirecting to checkout");
        toast({
          title: "Welcome back!",
          description: "You're already subscribed to our premium plan. Enjoy all features!",
        });
      } else {
        // User is not subscribed, redirect to checkout
        console.log("User is not subscribed - redirecting to checkout");
        redirectToStripeCheckout();
      }
    }
  }, [location, navigate, isSubscribed, isSubscriptionLoading, toast]);

  return {
    isPricingModalOpen,
    setIsPricingModalOpen,
    isAccountModalOpen,
    setIsAccountModalOpen,
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    isSubscribed,
    isSubscriptionLoading
  };
} 