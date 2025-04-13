import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Calendar, CreditCard } from 'lucide-react';
import { env } from "@/utils/env";
import { redirectToCheckout, redirectToCustomerPortal } from "@/utils/stripe";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import { format } from "date-fns";

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const planFeatures = {
  pro: [
    "Unlimited networks",
    "Advanced task management",
    "AI-powered insights",
    "Advanced analytics",
    "Priority support",
    "Export data",
    "Team collaboration",
    "Custom reports",
  ]
};

// Define environment
const isDevelopment = import.meta.env.MODE === 'development';

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isSubscribed, subscriptionDetails, customerDetails, isLoading: subscriptionLoading } = useSubscription();

  const handleSubscribe = async (isAnnual: boolean) => {
    try {
      setIsLoading(true);
      const priceId = isAnnual 
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

  // Function to handle redirecting to the Stripe customer portal
  const handleManageBilling = async () => {
    try {
      setIsLoading(true);
      await redirectToCustomerPortal();
    } catch (error) {
      console.error('Error redirecting to customer portal:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {subscriptionLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : isSubscribed ? (
          <>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl">Premium Subscription Active</DialogTitle>
              <DialogDescription className="text-sm">
                You're currently on the premium plan with access to all features
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              {subscriptionDetails && (
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-3">Subscription Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium">Status</p>
                        <p className="text-sm capitalize">{subscriptionDetails.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium">Next Billing Date</p>
                        <p className="text-sm">{formatDate(subscriptionDetails.currentPeriodEnd)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-background rounded-lg p-6 border">
                <div className="flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-12 h-12 text-[#0A2463]" />
                </div>
                <h3 className="text-lg font-semibold text-center mb-4">Premium Features</h3>
                <ul className="space-y-3">
                  {planFeatures.pro.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Manage Billing"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl">Upgrade Your Plan</DialogTitle>
              <DialogDescription className="text-sm">
                Choose the plan that works best for you
              </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-4 py-4">
              {/* Pro Monthly Plan */}
              <div className="bg-background rounded-lg p-4 shadow-sm border relative flex flex-col">
                <div className="absolute -top-2 right-2 bg-[#0A2463] text-white px-2 py-0.5 rounded-full text-xs">
                  Most Popular
                </div>
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold mb-1">RelMaps Pro</h2>
                  <div className="text-2xl font-bold">$20.00</div>
                  <div className="text-sm text-muted-foreground">Per month</div>
                </div>
                <div className="flex-grow">
                  <ul className="space-y-2 mb-4">
                    {planFeatures.pro.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  className="w-full bg-[#0A2463] hover:bg-[#0A2463]/90" 
                  size="sm"
                  onClick={() => handleSubscribe(false)}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Subscribe Monthly"}
                </Button>
              </div>

              {/* Pro Annual Plan */}
              <div className="bg-background rounded-lg p-4 shadow-sm border relative flex flex-col">
                <div className="absolute -top-2 right-2 bg-[#0A2463] text-white px-2 py-0.5 rounded-full text-xs">
                  Save 40%
                </div>
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold mb-1">RelMaps Pro – Annual</h2>
                  <div className="text-2xl font-bold">$144.00</div>
                  <div className="text-sm text-muted-foreground">Per year</div>
                  <div className="text-xs text-[#0A2463]">$12.00/month</div>
                </div>
                <div className="flex-grow">
                  <ul className="space-y-2 mb-4">
                    {planFeatures.pro.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  className="w-full bg-[#0A2463] hover:bg-[#0A2463]/90" 
                  size="sm"
                  onClick={() => handleSubscribe(true)}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Subscribe Annually"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 