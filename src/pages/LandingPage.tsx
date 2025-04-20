import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Network, Route, Share2, Star, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isYearlyBilling, setIsYearlyBilling] = useState(false);
  
  // Add smooth scrolling effect with scroll padding to account for fixed header
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.style.scrollPaddingTop = '80px'; // Add padding to account for fixed header
    
    // Cleanup function to reset scroll behavior when component unmounts
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.documentElement.style.scrollPaddingTop = '0';
    };
  }, []);
  
  // Handle anchor link click to scroll smoothly and close mobile menu
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
      setMobileMenuOpen(false);
    }
  };

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
        <header className="border-b border-gray-100 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
          <div className="container mx-auto">
            <nav className="flex h-20 items-center justify-between" aria-label="Main navigation">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                  <Share2 className="w-5 h-5 rotate-90" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">RelMaps</span>
              </div>
              
              <div className="hidden md:flex items-center gap-10">
                <a href="#features" className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors relative group" onClick={handleAnchorClick}>
                  Features
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </a>
                <a href="#testimonials" className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors relative group" onClick={handleAnchorClick}>
                  Testimonials
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </a>
                <a href="#pricing" className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors relative group" onClick={handleAnchorClick}>
                  Pricing
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </a>
                <a href="#faq" className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors relative group" onClick={handleAnchorClick}>
                  FAQs
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="md:hidden">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                    className="hover:bg-blue-50"
                  >
                    {mobileMenuOpen ? <X className="h-6 w-6 text-blue-700" /> : <Menu className="h-6 w-6 text-blue-700" />}
                  </Button>
                </div>
                <Button variant="ghost" asChild className="rounded-full hidden md:inline-flex hover:bg-blue-50 hover:text-blue-700">
                  <Link to="/login">Log In</Link>
                </Button>
                <Button className="bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 rounded-full hidden md:inline-flex shadow-sm hover:shadow-md transition-all duration-300" asChild>
                  <Link to="/login">Get Started</Link>
                </Button>
              </div>
            </nav>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-6 px-6 bg-white border-b">
              <nav className="flex flex-col space-y-5">
                <a 
                  href="#features" 
                  className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors py-1"
                  onClick={handleAnchorClick}
                >
                  Features
                </a>
                <a 
                  href="#testimonials" 
                  className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors py-1"
                  onClick={handleAnchorClick}
                >
                  Testimonials
                </a>
                <a 
                  href="#pricing" 
                  className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors py-1"
                  onClick={handleAnchorClick}
                >
                  Pricing
                </a>
                <a 
                  href="#faq" 
                  className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors py-1"
                  onClick={handleAnchorClick}
                >
                  FAQs
                </a>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" asChild className="rounded-full flex-1 border-blue-200">
                    <Link to="/login">Log In</Link>
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 rounded-full flex-1" asChild>
                    <Link to="/login">Get Started</Link>
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </header>

        <main>
          {/* Hero Section */}
          <section className="py-32 md:py-40 px-4 relative overflow-hidden" id="hero" aria-labelledby="hero-heading">
            {/* Background gradient with animated shapes */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 z-0">
              <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-blue-300/20 blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-indigo-300/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="container mx-auto relative z-10">
              <div className="max-w-3xl mx-auto text-center space-y-8">
                <div className="inline-block mb-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium animate-fadeIn">
                  AI-Powered Network Mapping
                </div>
                <h1 id="hero-heading" className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent">
                  Map Your Network<br />Unleash Opportunities
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  RelMaps uses AI to visualize, analyze, and optimize your professional connections, 
                  revealing hidden opportunities and powerful pathways to success.
                </p>
                <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
                  <Button size="lg" className="bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-lg h-14 px-10 rounded-full shadow-lg shadow-blue-700/20 transition-all duration-300 hover:shadow-blue-700/30 hover:scale-105" asChild>
                    <Link to="/network">Start for Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg h-14 px-10 rounded-full border-2 border-blue-200 hover:bg-blue-50 transition-all duration-300" asChild>
                    <a href="#features" onClick={handleAnchorClick}>See How It Works</a>
                  </Button>
                </div>
                <div className="pt-4 flex items-center justify-center text-sm text-gray-500">
                  <div className="flex -space-x-2 mr-3">
                    {[1, 2, 3, 4].map(i => (
                      <Avatar key={i} className="border-2 border-white w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/personas/svg?seed=user${i}`} />
                        <AvatarFallback>{i}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span>Join <span className="text-blue-700 font-medium">2,500+</span> professionals</span>
                </div>
              </div>
              
              <div className="mt-20 max-w-5xl mx-auto relative">
                <div className="absolute inset-0 -left-4 -right-4 -top-4 -bottom-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-10"></div>
                <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-100 bg-white relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                  <img 
                    src="/lovable-uploads/8b314916-5aa3-481f-8918-7421d57be8b9.png" 
                    alt="Network Visualization Interface" 
                    className="w-full h-auto"
                  />
                </div>
                
                {/* Browser-like control dots */}
                <div className="absolute top-4 left-8 flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-32 px-4 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50 rounded-bl-full opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-indigo-50 rounded-tr-full opacity-60"></div>
            
            <div className="container mx-auto relative z-10">
              <div className="text-center mb-20">
                <div className="inline-block mb-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Designed for Professionals
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Powerful Features</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Everything you need to map, analyze, and leverage your professional network.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Feature 1 */}
                <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6">
                    <Network className="w-7 h-7 text-blue-700" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Network Visualization</h3>
                  <p className="text-gray-600">
                    Map out complex relationships between people, organizations, venues, and events. Discover hidden connections instantly.
                  </p>
                </div>
                
                {/* Feature 2 */}
                <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center mb-6">
                    <Route className="w-7 h-7 text-indigo-700" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Optimal Pathways</h3>
                  <p className="text-gray-600">
                    Find the most effective way to connect with anyone in your extended network through trusted mutual connections.
                  </p>
                </div>
                
                {/* Feature 3 */}
                <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-purple-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path>
                      <path d="m8 16 4-4 4 4"></path>
                      <path d="M16 16v6"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">AI Insights</h3>
                  <p className="text-gray-600">
                    Get intelligent recommendations for strengthening your network and identifying high-value connection opportunities.
                  </p>
                </div>
              </div>
              
              <div className="mt-24 grid md:grid-cols-2 gap-16 max-w-6xl mx-auto items-center">
                <div className="relative">
                  <div className="absolute inset-0 -m-6 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-3xl blur-sm"></div>
                  <div className="rounded-xl overflow-hidden shadow-xl relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <img 
                      src="/lovable-uploads/0f4e6749-603a-4738-a4cc-189c60492f5f.png" 
                      alt="Network Mapping Interface" 
                      className="w-full h-auto" 
                    />
                  </div>
                </div>
                
                <div className="space-y-8">
                  <h3 className="text-3xl font-bold text-gray-900">Interactive Mapping</h3>
                  <p className="text-lg text-gray-600">
                    Create stunning visualizations of your personal and professional network relationships with our intuitive drag-and-drop interface.
                  </p>
                  <ul className="space-y-4">
                    {['Auto-arrange connections', 'Custom node grouping', 'Relationship strength visualization', 'Dynamic filtering'].map(item => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-24 grid md:grid-cols-2 gap-16 max-w-6xl mx-auto items-center">
                <div className="space-y-8 order-2 md:order-1">
                  <h3 className="text-3xl font-bold text-gray-900">Task Management</h3>
                  <p className="text-lg text-gray-600">
                    Keep track of networking tasks, follow-ups, and relationship-building activities all in one convenient dashboard.
                  </p>
                  <ul className="space-y-4">
                    {['Smart follow-up reminders', 'Activity tracking', 'Meeting scheduler', 'Relationship history'].map(item => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-indigo-700" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="relative order-1 md:order-2">
                  <div className="absolute inset-0 -m-6 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 rounded-3xl blur-sm"></div>
                  <div className="rounded-xl overflow-hidden shadow-xl relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                    <img 
                      src="/lovable-uploads/63771b4f-0415-470a-b75f-29616c68f487.png" 
                      alt="Task Tracking System" 
                      className="w-full h-auto" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section id="testimonials" className="py-24 px-4 bg-blue-50">
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
          <section id="pricing" className="py-24 px-4 bg-white">
            <div className="container mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Choose the plan that works best for you and your network.
                </p>
                
                <div className="flex items-center justify-center mt-8 gap-4">
                  <span className={`text-sm font-medium ${!isYearlyBilling ? 'text-[#0A2463]' : 'text-gray-500'}`}>
                    Monthly
                  </span>
                  <Switch
                    checked={isYearlyBilling}
                    onCheckedChange={setIsYearlyBilling}
                    id="billing-toggle"
                  />
                  <Label 
                    htmlFor="billing-toggle" 
                    className={`text-sm font-medium ${isYearlyBilling ? 'text-[#0A2463]' : 'text-gray-500'}`}
                  >
                    Yearly <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full ml-1">Save 40%</span>
                  </Label>
                </div>
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
                      <span>Basic task management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#0A2463]" />
                      <span>Basic visualization</span>
                    </li>
                  </ul>
                  <Button className="w-full rounded-full" variant="outline" asChild>
                    <Link to="/login">Get Started</Link>
                  </Button>
                </div>
                
                <div className="bg-[#0A2463] p-8 rounded-xl shadow-xl text-white text-center flex-1 transform md:scale-105 relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm">Most Popular</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-4">RelMaps Pro</h3>
                  {isYearlyBilling ? (
                    <>
                      <p className="text-3xl font-bold mb-2">$144<span className="text-base font-normal text-blue-200">/year</span></p>
                      <p className="text-sm text-blue-200 mb-4">Just $12/month, billed annually</p>
                    </>
                  ) : (
                    <>
                      <p className="text-3xl font-bold mb-6">$20<span className="text-base font-normal text-blue-200">/month</span></p>
                      <p className="text-sm text-blue-200 mb-4">Billed monthly</p>
                    </>
                  )}
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
                  <Button className="w-full bg-white text-[#0A2463] hover:bg-blue-50 rounded-full" asChild>
                    <Link to="/login">Get Started</Link>
                  </Button>
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
          <section id="cta" className="py-32 px-4 bg-gradient-to-br from-blue-700 to-indigo-800 text-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-20 bg-white/5"></div>
              <div className="absolute top-40 -left-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl"></div>
            </div>
            
            <div className="container mx-auto max-w-5xl text-center relative z-10">
              <div className="inline-block mb-5 px-3 py-1 bg-blue-600/30 text-blue-100 rounded-full text-sm font-medium">
                Get Started Today
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to transform your network?</h2>
              <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
                Start visualizing your professional connections today and unlock hidden opportunities in your network.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 justify-center mb-10">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-lg h-14 px-10 rounded-full shadow-lg shadow-blue-800/30 transition-all duration-300 hover:shadow-xl hover:scale-105" asChild>
                  <Link to="/login">Get Started for Free</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg h-14 px-10 rounded-full border-2 border-white/30 text-white hover:bg-blue-600/20 transition-all duration-300" asChild>
                  <Link to="/login">Book a Demo</Link>
                </Button>
              </div>
              
              <div className="pt-4 grid md:grid-cols-3 gap-8 text-left">
                <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                  <div className="mb-2 font-semibold">No credit card required</div>
                  <p className="text-blue-100 text-sm">Start for free without any payment details.</p>
                </div>
                <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                  <div className="mb-2 font-semibold">Cancel anytime</div>
                  <p className="text-blue-100 text-sm">No commitment, cancel your subscription whenever you want.</p>
                </div>
                <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                  <div className="mb-2 font-semibold">24/7 Support</div>
                  <p className="text-blue-100 text-sm">Get help whenever you need it from our support team.</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
