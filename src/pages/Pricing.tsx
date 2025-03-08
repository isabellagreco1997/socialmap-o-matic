import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Share2, CheckCircle2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { env } from "@/utils/env";

// Define features for each plan
const planFeatures = {
  free: [
    "1 network",
    "Unlimited connections",
    "Basic task management",
    "Basic network visualization",
    "Basic network search",
    "30 days connection history",
  ],
  pro: [
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
  ]
};

export default function Pricing() {
  return (
    <>
      <Helmet>
        <title>Pricing - {env.app.name}</title>
        <meta name="description" content="Choose the perfect plan for your professional network visualization needs. RelMaps offers flexible pricing options to help you grow your network." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-[#0A2463] mb-4">Simple, Transparent Pricing</h1>
              <p className="text-xl text-muted-foreground">
                Choose the plan that works best for you
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="bg-background rounded-xl p-6 shadow-lg border flex flex-col">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold mb-2">Free</h2>
                  <div className="text-3xl font-bold">$0</div>
                  <div className="text-muted-foreground">Forever free</div>
                  <div className="text-sm text-muted-foreground mt-2">Software as a service (SaaS) - personal use</div>
                </div>
                <div className="flex-grow">
                  <ul className="space-y-3 mb-8">
                    {planFeatures.free.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>

              {/* Pro Monthly Plan */}
              <div className="bg-background rounded-xl p-6 shadow-lg border relative flex flex-col">
                <div className="absolute -top-4 right-4 bg-[#0A2463] text-white px-4 py-1 rounded-full text-sm">
                  Most Popular
                </div>
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold mb-2">RelMaps Pro</h2>
                  <div className="text-3xl font-bold">$20.00</div>
                  <div className="text-muted-foreground">Per month</div>
                  <div className="text-sm text-muted-foreground mt-2">Software as a service (SaaS) - personal use</div>
                </div>
                <div className="flex-grow">
                  <ul className="space-y-3 mb-8">
                    {planFeatures.pro.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button className="w-full bg-[#0A2463] hover:bg-[#0A2463]/90" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>

              {/* Pro Annual Plan */}
              <div className="bg-background rounded-xl p-6 shadow-lg border relative flex flex-col">
                <div className="absolute -top-4 right-4 bg-[#0A2463] text-white px-4 py-1 rounded-full text-sm">
                  Save 40%
                </div>
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold mb-2">RelMaps Pro – Annual</h2>
                  <div className="text-3xl font-bold">$144.00</div>
                  <div className="text-muted-foreground">Per year</div>
                  <div className="text-sm text-[#0A2463]">$12.00/month</div>
                  <div className="text-sm text-muted-foreground mt-2">Software as a service (SaaS) - personal use</div>
                </div>
                <div className="flex-grow">
                  <ul className="space-y-3 mb-8">
                    {planFeatures.pro.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button className="w-full bg-[#0A2463] hover:bg-[#0A2463]/90" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
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