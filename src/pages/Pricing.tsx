import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Share2, CheckCircle2, X, Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { env } from "@/utils/env";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import { useToast } from "@/components/ui/use-toast";
import { redirectToCheckout } from "@/utils/stripe";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Define features for the pro plan
const proFeatures = [
  "Unlimited networks",
  "Unlimited connections",
  "Advanced task management",
  "Advanced network visualization",
  "AI-powered insights",
  "Advanced analytics",
  "Priority support",
  "Export data",
  "Custom tags",
  "Advanced network search",
  "Unlimited connection history",
  "API access",
  "Team collaboration",
  "Custom reports",
];

// Define environment
const isDevelopment = import.meta.env.MODE === 'development';

export default function Pricing() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isYearlyBilling, setIsYearlyBilling] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const checkCompleted = useRef(false);
  
  // Don't trigger subscription check on component mount
  const { isSubscribed, isLoading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/network';
  
  // Show loading screen initially, but with a timeout to prevent hanging
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setShowLoading(false);
    }, 5000); // Show loading for max 5 seconds
    
    return () => clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      // Mark initial check as completed after authentication check
      if (!checkCompleted.current) {
        checkCompleted.current = true;
        setInitialCheckDone(true);
        setTimeout(() => {
          setShowLoading(false);
        }, 500); // Give a short delay to ensure subscription state is updated
      }
    };

    checkAuth();

    // Only listen for auth changes - don't check subscription here
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // If user is already subscribed, redirect to dashboard
  useEffect(() => {
    // Only redirect if we've completed the initial check and loading is done
    if (initialCheckDone && !subscriptionLoading && isAuthenticated) {
      if (isSubscribed) {
        console.log('User is subscribed, redirecting to:', from);
        navigate(from);
      } else {
        console.log('User is not subscribed, staying on pricing page');
        // Just stay on pricing page
      }
    }
  }, [isAuthenticated, isSubscribed, subscriptionLoading, navigate, from, initialCheckDone]);

  // Show loading overlay while we're checking
  if (showLoading && (subscriptionLoading || !initialCheckDone)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Checking subscription status...</h2>
          <p className="text-muted-foreground">Just a moment while we verify your account.</p>
        </div>
      </div>
    );
  }

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      // If not logged in, redirect to signup with return URL to pricing
      navigate('/signup', { state: { from: location } });
      return;
    }

    try {
      setIsLoading(true);
      const priceId = isYearlyBilling
        ? (isDevelopment ? env.stripe.test.priceAnnual : env.stripe.live.priceAnnual)
        : (isDevelopment ? env.stripe.test.priceMonthly : env.stripe.live.priceMonthly);
      
      await redirectToCheckout(priceId);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Pricing - {env.app.name}</title>
        <meta name="description" content="Choose the perfect plan for your professional network visualization needs. RelMaps offers flexible pricing options to help you grow your network." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-[#0A2463] mb-4">Simple, Transparent Pricing</h1>
              <p className="text-xl text-muted-foreground">
                Get full access to all features with one simple plan
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-10">
              <span className={`mr-3 text-sm ${!isYearlyBilling ? 'font-medium' : 'text-muted-foreground'}`}>Monthly</span>
              <div className="relative inline-flex items-center cursor-pointer" onClick={() => setIsYearlyBilling(!isYearlyBilling)}>
                <Switch checked={isYearlyBilling} onCheckedChange={setIsYearlyBilling} />
              </div>
              <div className="flex items-center ml-3">
                <span className={`text-sm ${isYearlyBilling ? 'font-medium' : 'text-muted-foreground'}`}>Yearly</span>
                <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                  Save 40%
                </span>
              </div>
            </div>

            {/* Pro Plan with Toggle */}
            <div className="bg-background rounded-xl p-8 shadow-lg border relative flex flex-col">
              <div className="absolute -top-4 right-4 bg-[#0A2463] text-white px-4 py-1 rounded-full text-sm">
                {isYearlyBilling ? "Best Value" : "Most Popular"}
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">RelMaps Pro</h2>
                <div className="text-4xl font-bold">
                  {isYearlyBilling ? "$144.00" : "$20.00"}
                </div>
                <div className="text-muted-foreground">
                  {isYearlyBilling ? "Per year" : "Per month"}
                </div>
                {isYearlyBilling && (
                  <div className="text-sm text-[#0A2463]">$12.00/month</div>
                )}
                <div className="text-sm text-muted-foreground mt-2">Software as a service (SaaS) - personal use</div>
              </div>
              <div className="flex-grow">
                <div className="grid md:grid-cols-2 gap-4">
                  {proFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                className="w-full bg-[#0A2463] hover:bg-[#0A2463]/90 mt-8"
                onClick={handleSubscribe}
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : isAuthenticated ? `Subscribe${isYearlyBilling ? ' Yearly' : ' Monthly'}` : "Get Started"}
              </Button>
            </div>

            {/* Enterprise Section */}
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-semibold mb-4">Need a Custom Solution?</h2>
              <p className="text-muted-foreground mb-8">
                Contact us for enterprise pricing and custom features tailored to your organization's needs.
              </p>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 