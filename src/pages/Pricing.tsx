import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { env } from "@/utils/env";

export default function Pricing() {
  return (
    <>
      <Helmet>
        <title>Pricing - {env.app.name}</title>
        <meta name="description" content="Choose the perfect plan for your professional network visualization needs. RelMaps offers flexible pricing options to help you grow your network." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-[#0A2463] mb-4">Simple, Transparent Pricing</h1>
              <p className="text-xl text-muted-foreground">
                Choose the plan that works best for you
              </p>
            </div>

            <div className="space-y-8">
              {/* Free Plan */}
              <div className="bg-background rounded-xl p-6 shadow-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#0A2463] flex items-center justify-center">
                      <Share2 className="w-6 h-6 text-white rotate-90" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Free</h2>
                      <p className="text-muted-foreground">Get started with basic features</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">$0</div>
                    <div className="text-muted-foreground">Forever free</div>
                  </div>
                </div>
              </div>

              {/* Pro Monthly Plan */}
              <div className="bg-background rounded-xl p-6 shadow-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#0A2463] flex items-center justify-center">
                      <Share2 className="w-6 h-6 text-white rotate-90" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">RelMaps Pro</h2>
                      <p className="text-muted-foreground">Full access to all features</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">$20.00</div>
                    <div className="text-muted-foreground">Per month</div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button className="w-full bg-[#0A2463] hover:bg-[#0A2463]/90" asChild>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </div>
              </div>

              {/* Pro Annual Plan */}
              <div className="bg-background rounded-xl p-6 shadow-lg border relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#0A2463] text-white px-4 py-1 rounded-bl-lg text-sm">
                  Save 40%
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#0A2463] flex items-center justify-center">
                      <Share2 className="w-6 h-6 text-white rotate-90" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">RelMaps Pro – Annual Membership</h2>
                      <p className="text-muted-foreground">Best value for professionals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">$144.00</div>
                    <div className="text-muted-foreground">Per year</div>
                    <div className="text-sm text-[#0A2463]">$12.00/month</div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button className="w-full bg-[#0A2463] hover:bg-[#0A2463]/90" asChild>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <h2 className="text-2xl font-semibold mb-6">All Pro Plans Include</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Unlimited Networks</h3>
                  <p className="text-muted-foreground">Create and manage multiple professional networks</p>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Advanced Analytics</h3>
                  <p className="text-muted-foreground">Deep insights into your network connections</p>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Priority Support</h3>
                  <p className="text-muted-foreground">Get help when you need it most</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 