
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, UsersRound, GraduationCap, Network, HeartPulse, Route, UserRoundSearch, Globe2, Building2 } from "lucide-react";

const LandingPage = () => {
  return <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-center relative">
          <div className="flex items-center gap-8">
            <span className="text-xl font-semibold">Science of Six</span>
            <div className="hidden md:flex items-center gap-6">
              <Link to="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link to="#about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
              <Link to="#faq" className="text-sm font-medium hover:text-primary transition-colors">
                FAQs
              </Link>
              <span className="text-sm font-medium text-muted-foreground cursor-not-allowed flex items-center gap-2">
                Community
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Coming Soon</span>
              </span>
            </div>
          </div>
          <Button asChild className="absolute right-8">
            <Link to="/network">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-48 bg-gradient-to-b from-background to-secondary/20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://img.freepik.com/premium-vector/global-network-connection-world-map-point-line-composition-concept-global-business-vector-illustration_41981-1906.jpg?w=2000" alt="Global Network Connection" className="w-full h-full object-cover opacity-25" />
        </div>
        <div className="max-w-4xl space-y-10 relative z-10">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight flex flex-col gap-4">
            <span>Connect with</span>
            <span>Anyone in the World</span>
          </h1>
          <p className="text-2xl max-w-3xl mx-auto text-center text-slate-950">
            Map and visualize your network connections. Discover how you're connected to anyone through six degrees of separation.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="bg-[#1A1F2C] hover:bg-[#1A1F2C]/90 text-lg h-14 px-10" asChild>
              <Link to="/network">Start Mapping</Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden rotate-180">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-background"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background relative">
        <div className="container grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Visualize Connections</h3>
            <p className="text-muted-foreground">
              Create an interactive map of your professional and social networks
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Track Relationships</h3>
            <p className="text-muted-foreground">
              Monitor the strength and frequency of your connections
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Discover Paths</h3>
            <p className="text-muted-foreground">
              Find the shortest path to connect with anyone in your extended network
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container">
          <div className="rounded-lg overflow-hidden border shadow-lg max-w-[78%] mx-auto">
            <img src="/lovable-uploads/4e6120a9-6483-43a1-acfb-f127780a4ffe.png" alt="Network Dashboard Preview" className="w-full h-auto" />
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 bg-secondary/10">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Use Cases</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-background p-8 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <UsersRound className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Professional Networking</h3>
              </div>
              <p className="text-muted-foreground">
                Find warm introductions to potential clients, employers, or business partners through your existing network.
              </p>
            </div>
            <div className="bg-background p-8 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Academic Collaboration</h3>
              </div>
              <p className="text-muted-foreground">
                Connect with researchers and experts in your field through mutual colleagues and institutions.
              </p>
            </div>
            <div className="bg-background p-8 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <UserRoundSearch className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Social Connection</h3>
              </div>
              <p className="text-muted-foreground">
                Discover how you're connected to new friends and acquaintances through your social circles.
              </p>
            </div>
            <div className="bg-background p-8 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Globe2 className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Global Reach</h3>
              </div>
              <p className="text-muted-foreground">
                Expand your network internationally and bridge cultural gaps through mutual connections worldwide.
              </p>
            </div>
            <div className="bg-background p-8 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Business Development</h3>
              </div>
              <p className="text-muted-foreground">
                Identify strategic partnerships and business opportunities by leveraging your extended professional network.
              </p>
            </div>
            <div className="bg-background p-8 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Network className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Industry Insights</h3>
              </div>
              <p className="text-muted-foreground">
                Gain valuable industry knowledge and trends through your connected network of professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Background Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">The Science Behind Six Degrees</h2>
          <div className="prose prose-gray mx-auto">
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              The concept of "Six Degrees of Separation" suggests that all people are six or fewer social connections away from each other. This theory was first proposed by Frigyes Karinthy in 1929 and has since been explored in numerous social experiments and scientific studies.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              In today's interconnected world, this phenomenon is more relevant than ever. Our platform helps you visualize and leverage these connections, making it easier to navigate your extended social and professional networks.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-secondary/10">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <div className="bg-background p-8 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-4">Free</h3>
              <p className="text-3xl font-bold mb-6">$0<span className="text-base font-normal text-muted-foreground">/month</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Up to 50 connections</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Basic visualization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Community support</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/network">Get Started</Link>
              </Button>
            </div>
            <div className="bg-background p-8 rounded-lg shadow-sm border border-primary">
              <h3 className="text-xl font-semibold mb-4">Pro</h3>
              <p className="text-3xl font-bold mb-6">$9<span className="text-base font-normal text-muted-foreground">/month</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Unlimited connections</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button className="w-full">Subscribe Now</Button>
            </div>
            <div className="bg-background p-8 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
              <p className="text-3xl font-bold mb-6">Custom</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Custom integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>SLA guarantee</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How does Science of Six work?</AccordionTrigger>
              <AccordionContent>
                Science of Six helps you map and visualize your professional and social connections. You can add people you know directly, and our platform will help you discover paths to connect with others through your network.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is my network data private?</AccordionTrigger>
              <AccordionContent>
                Yes, your network data is completely private and secure. You have full control over what information is shared and with whom.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I export my network data?</AccordionTrigger>
              <AccordionContent>
                Yes, Pro and Enterprise users can export their network data in various formats for backup or analysis purposes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Do you offer team accounts?</AccordionTrigger>
              <AccordionContent>
                Yes, our Enterprise plan includes team collaboration features. Contact our sales team for more information about team pricing and features.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-semibold mb-4">Science of Six</h3>
            <p className="text-sm text-muted-foreground">
              Mapping the connections that shape our world.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/enterprise">Enterprise</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/docs">Documentation</Link></li>
              <li><Link to="/support">Support</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mt-8 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 Science of Six. All rights reserved.
          </p>
        </div>
      </footer>
    </div>;
};
export default LandingPage;
