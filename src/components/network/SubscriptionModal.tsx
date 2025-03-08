import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2 } from 'lucide-react';
import { env } from "@/utils/env";
import { redirectToCheckout } from "@/utils/stripe";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/hooks/use-subscription";

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

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isSubscribed } = useSubscription();

  const handleSubscribe = async (isAnnual: boolean) => {
    try {
      setIsLoading(true);
      const priceId = isAnnual 
        ? (import.meta.env.MODE === 'development' ? env.stripe.test.priceAnnual : env.stripe.live.priceAnnual)
        : (import.meta.env.MODE === 'development' ? env.stripe.test.priceMonthly : env.stripe.live.priceMonthly);
      
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {isSubscribed ? (
          <>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl">Premium Subscription Active</DialogTitle>
              <DialogDescription className="text-sm">
                You're currently on the premium plan with access to all features
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
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