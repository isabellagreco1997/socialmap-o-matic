import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Network, Route, Share2, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";

const LandingPage = () => {
  // Structured data for Google
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "RelMaps",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "AI-powered professional network visualization and mapping tool to discover, manage, and leverage your professional relationships.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "ratingCount": "3"
    }
  };

  return (
    <>
      <Helmet>
        <title>RelMaps - Professional Network Visualization & Mapping Tool</title>
        <meta name="description" content="Map and visualize your professional connections with RelMaps. AI-powered network visualization tool to discover, manage, and leverage your professional relationships." />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-white">
        <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
          <div className="container mx-auto">
            <nav className="flex h-16 items-center justify-between" aria-label="Main navigation">
              <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0A2463] flex items-center justify-center text-white">
                <Share2 className="w-5 h-5 rotate-90" />
              </div>
              <span className="text-xl font-semibold">RelMaps</span>
            </div>
              <div className="hidden md:flex items-center gap-8">
                <Link to="/pricing" className="text-sm font-medium text-gray-600 hover:text-[#0A2463] transition-colors">
                  Pricing
                </Link>
                <Link to="#features" className="text-sm font-medium text-gray-600 hover:text-[#0A2463] transition-colors">
                  Features
                </Link>
                <Link to="#faq" className="text-sm font-medium text-gray-600 hover:text-[#0A2463] transition-colors">
                  FAQs
                </Link>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild className="rounded-full">
                <Link to="/login">Log In</Link>
              </Button>
                <Button className="bg-[#0A2463] hover:bg-[#0A2463]/90 rounded-full" asChild>
                <Link to="/login">Get Started</Link>
              </Button>
            </div>
          </nav>
          </div>
        </header>

        <main>
          {/* Hero Section */}
          <section className="py-24 md:py-32 px-4 bg-gradient-to-b from-white to-blue-50" aria-labelledby="hero-heading">
            <div className="container mx-auto">
              <div className="max-w-3xl mx-auto text-center space-y-8">
                <h1 id="hero-heading" className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
                  Map Your Professional Network with AI
              </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Visualize, manage, and leverage your connections to unlock new opportunities.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button size="lg" className="bg-[#0A2463] hover:bg-[#0A2463]/90 text-lg h-14 px-10 rounded-full" asChild>
                    <Link to="/network">Start Mapping</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg h-14 px-10 rounded-full" asChild>
                    <Link to="#features">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="mt-16 max-w-5xl mx-auto">
                <div className="rounded-xl overflow-hidden shadow-2xl">
                  <img 
                    src="/lovable-uploads/8b314916-5aa3-481f-8918-7421d57be8b9.png" 
                    alt="Network Visualization Interface" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-24 px-4 bg-white">
            <div className="container mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Everything you need to map, manage, and leverage your professional network.
                  </p>
                </div>
              
              <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Network className="w-6 h-6 text-[#0A2463]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">Visualize Connections</h3>
                  <p className="text-gray-600">
                    Map out complex networks including individuals, organizations, venues, and events. Discover hidden relationships within your network.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Route className="w-6 h-6 text-[#0A2463]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">Find Paths</h3>
                  <p className="text-gray-600">
                    Discover the shortest path to connect with anyone in your extended network. You're only a few introductions away from your ideal connection.
                  </p>
                </div>
                
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img src="/lovable-uploads/0f4e6749-603a-4738-a4cc-189c60492f5f.png" alt="Network Mapping Interface" className="w-full h-auto" />
                </div>
                
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img src="/lovable-uploads/63771b4f-0415-470a-b75f-29616c68f487.png" alt="Task Tracking System" className="w-full h-auto" />
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-24 px-4 bg-blue-50">
            <div className="container mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Join thousands of professionals already leveraging the power of network visualization.
                </p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
                <Card className="bg-white border-none shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-[#0A2463] text-[#0A2463]" />)}
                    </div>
                    <p className="text-gray-600 mb-6">
                      "RelMaps has completely transformed how I approach networking. I've made connections I never thought possible."
                    </p>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="https://api.dicebear.com/7.x/personas/svg?seed=sarah" alt="Sarah Chen" />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">Sarah Chen</p>
                        <p className="text-sm text-gray-500">Startup Founder</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-[#0A2463] text-[#0A2463]" />)}
                    </div>
                    <p className="text-gray-600 mb-6">
                      "The visualization tools are incredible. Being able to see my network mapped out has helped me identify connections I didn't know I had."
                    </p>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="https://api.dicebear.com/7.x/personas/svg?seed=marcus" alt="Marcus Johnson" />
                        <AvatarFallback>MJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">Marcus Johnson</p>
                        <p className="text-sm text-gray-500">Business Development</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-[#0A2463] text-[#0A2463]" />)}
                    </div>
                    <p className="text-gray-600 mb-6">
                      "As a recruiter, RelMaps has become an invaluable tool. It's helped me find perfect candidates through unexpected connections."
                    </p>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="https://api.dicebear.com/7.x/personas/svg?seed=elena" alt="Elena Rodriguez" />
                        <AvatarFallback>ER</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">Elena Rodriguez</p>
                        <p className="text-sm text-gray-500">Senior Recruiter</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-24 px-4 bg-white">
            <div className="container mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Choose the plan that works best for you and your network.
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center flex-1">
                  <h3 className="text-xl font-semibold mb-4">Free</h3>
                  <p className="text-3xl font-bold mb-6">$0<span className="text-base font-normal text-gray-500">/month</span></p>
                  <ul className="space-y-4 mb-8 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#0A2463]" />
                      <span>Create one network</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#0A2463]" />
                      <span>Unlimited connections</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#0A2463]" />
                      <span>Task management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#0A2463]" />
                      <span>Basic visualization</span>
                    </li>
                  </ul>
                  <Button className="w-full rounded-full" variant="outline" asChild>
                    <Link to="/network">Get Started</Link>
                  </Button>
                </div>
                
                <div className="bg-[#0A2463] p-8 rounded-xl shadow-xl text-white text-center flex-1 transform md:scale-105">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm">Most Popular</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Master Networker</h3>
                  <p className="text-3xl font-bold mb-6">$12<span className="text-base font-normal text-blue-200">/month</span></p>
                  <p className="text-sm text-blue-200 mb-4">Billed annually at $144</p>
                  <ul className="space-y-4 mb-8 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-300" />
                        <span>Everything in Free</span>
                      </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-300" />
                        <span className="font-medium">Unlimited networks</span>
                      </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-300" />
                      <span className="font-medium">AI-powered insights</span>
                      </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-300" />
                        <span>Advanced analytics</span>
                      </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-300" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                  <Button className="w-full bg-white text-[#0A2463] hover:bg-blue-50 rounded-full">Subscribe Now</Button>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="py-24 px-4 bg-blue-50">
            <div className="container mx-auto max-w-3xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Everything you need to know about RelMaps.
                </p>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b border-gray-200">
                  <AccordionTrigger className="text-lg font-medium text-gray-900">How does RelMaps work?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    RelMaps helps you map and visualize your professional and social connections. You can add people you know directly, and our platform will help you discover paths to connect with others through your network.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="border-b border-gray-200">
                  <AccordionTrigger className="text-lg font-medium text-gray-900">Is my network data private?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Yes, your network data is completely private and secure. You have full control over what information is shared and with whom.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="border-b border-gray-200">
                  <AccordionTrigger className="text-lg font-medium text-gray-900">Can I export my network data?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Yes, Pro and Enterprise users can export their network data in various formats for backup or analysis purposes.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="border-b border-gray-200">
                  <AccordionTrigger className="text-lg font-medium text-gray-900">Do you offer team accounts?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Yes, our Enterprise plan includes team collaboration features. Contact our sales team for more information about team pricing and features.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 px-4 bg-[#0A2463] text-white">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to map your network?</h2>
              <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
                Start visualizing your professional connections today and unlock new opportunities.
              </p>
              <Button size="lg" className="bg-white text-[#0A2463] hover:bg-blue-50 text-lg h-14 px-10 rounded-full" asChild>
                <Link to="/network">Get Started for Free</Link>
              </Button>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
