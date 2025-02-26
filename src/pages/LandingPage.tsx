import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, UsersRound, GraduationCap, Network, HeartPulse, Route, UserRoundSearch, Globe2, Building2, Eye, Activity, Route as RouteIcon, Star } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
const LandingPage = () => {
  return <div className="min-h-screen flex flex-col">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex h-16 items-center relative">
          <span className="text-xl font-semibold pl-8">SocialMapr</span>
          <div className="flex-1 flex justify-center">
            <div className="hidden md:flex items-center gap-6">
              <Link to="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link to="#about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
              <Link to="#blog" className="text-sm font-medium hover:text-primary transition-colors">
                Blog
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
          <div className="pr-8 flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button className="bg-[#0A2463] hover:bg-[#0A2463]/90" asChild>
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 bg-gradient-to-b from-background to-secondary/20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://img.freepik.com/free-vector/vector-network-background-abstract-polygon-triangle_2065-76.jpg?t=st=1740493025~exp=1740496625~hmac=5bfe53753bd93346b572a737c5442767d86a489c52b6eb9b92dfef770741aa74&w=1480" alt="Global Network Connection" className="w-full h-full object-cover opacity-40" />
        </div>
        <div className="max-w-4xl space-y-10 relative z-10">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight flex flex-col gap-4">
            <span>Map & Visualize your</span>
            <span><span className="text-[#0A2463]">Professional</span> <span className="text-[#0A2463]">Network</span></span>
          </h1>
          <p className="text-2xl max-w-3xl mx-auto text-center text-slate-950">Map relationships with exceptional business leaders, alumni, and wealthy individuals to drive your organization’s success.</p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="bg-[#0A2463] hover:bg-[#0A2463]/90 text-lg h-14 px-10" asChild>
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
      <section className="py-12 px-4 bg-background relative">
        <div className="container grid gap-8 md:grid-cols-3">
          <div className="space-y-4 flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#0A2463]" />
              <h3 className="text-xl font-semibold">Visualize Connections</h3>
            </div>
            <p className="text-muted-foreground">
              Create an interactive map of your professional and social networks
            </p>
          </div>
          <div className="space-y-4 flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0A2463]" />
              <h3 className="text-xl font-semibold">Track Relationships</h3>
            </div>
            <p className="text-muted-foreground">
              Monitor the strength and frequency of your connections
            </p>
          </div>
          <div className="space-y-4 flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
              <RouteIcon className="w-5 h-5 text-[#0A2463]" />
              <h3 className="text-xl font-semibold">Discover Paths</h3>
            </div>
            <p className="text-muted-foreground">
              Find the shortest path to connect with anyone in your extended network
            </p>
          </div>
        </div>
      </section>

      {/* Network Visualization Section */}
      <section className="py-20 px-4 bg-background">
        <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-sky-950 font-bold">
          Let me guess... you want to expand your network, but either forget to or don't know where to start?
        </p>
        <div className="container max-w-5xl mx-auto">
          <div className="rounded-lg overflow-hidden shadow-lg bg-white">
            <img src="/lovable-uploads/8b314916-5aa3-481f-8918-7421d57be8b9.png" alt="Network Visualization Interface" className="w-full h-auto" />
          </div>
        </div>
      </section>

      {/* Public Figures Carousel Section */}
      <section className="py-20 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-6 mb-12">
            <h2 className="text-4xl font-bold text-[#0A2463]">Connect with Influential Figures</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              On average, you are only 6 introductions away from your ideal connection. Map this out using SocialMapr.
            </p>
          </div>
        </div>
        <div className="w-full overflow-hidden">
          <Carousel opts={{
          align: "start",
          loop: true,
          dragFree: true,
          duration: 40
        }} className="w-full">
            <CarouselContent className="flex animate-carousel">
              {[...Array(2)].map((_, outerIndex) => <React.Fragment key={outerIndex}>
                  <CarouselItem className="basis-1/8 md:basis-1/8">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="w-20 h-20 shadow-lg border-2 border-[#0A2463]/10">
                        <AvatarImage src="https://api.dicebear.com/7.x/personas/svg?seed=elon" alt="Elon Musk" />
                        <AvatarFallback>EM</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-[#0A2463] bg-[#0A2463]/10 px-2 py-0.5 rounded-full">CEO</span>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-1/8 md:basis-1/8">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="w-20 h-20 shadow-lg border-2 border-[#0A2463]/10">
                        <AvatarImage src="https://api.dicebear.com/7.x/personas/svg?seed=obama" alt="Barack Obama" />
                        <AvatarFallback>BO</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-[#0A2463] bg-[#0A2463]/10 px-2 py-0.5 rounded-full">Politician</span>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-1/8 md:basis-1/8">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="w-20 h-20 shadow-lg border-2 border-[#0A2463]/10">
                        <AvatarImage src="https://api.dicebear.com/7.x/personas/svg?seed=taylor" alt="Taylor Swift" />
                        <AvatarFallback>TS</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-[#0A2463] bg-[#0A2463]/10 px-2 py-0.5 rounded-full">Celebrity</span>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-1/8 md:basis-1/8">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="w-20 h-20 shadow-lg border-2 border-[#0A2463]/10">
                        <AvatarImage src="https://api.dicebear.com/7.x/personas/svg?seed=bill" alt="Bill Gates" />
                        <AvatarFallback>BG</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-[#0A2463] bg-[#0A2463]/10 px-2 py-0.5 rounded-full">Billionaire</span>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-1/8 md:basis-1/8">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="w-20 h-20 shadow-lg border-2 border-[#0A2463]/10">
                        <AvatarImage src="https://api.dicebear.com/7.x/personas/svg?seed=angelina" alt="Angelina Jolie" />
                        <AvatarFallback>AJ</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-[#0A2463] bg-[#0A2463]/10 px-2 py-0.5 rounded-full">Celebrity</span>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-1/8 md:basis-1/8">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="w-20 h-20 shadow-lg border-2 border-[#0A2463]/10">
                        <AvatarImage src="https://api.dicebear.com/7.x/personas/svg?seed=mark" alt="Mark Zuckerberg" />
                        <AvatarFallback>MZ</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-[#0A2463] bg-[#0A2463]/10 px-2 py-0.5 rounded-full">CEO</span>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-1/8 md:basis-1/8">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="w-20 h-20 shadow-lg border-2 border-[#0A2463]/10">
                        <AvatarImage src="https://api.dicebear.com/7.x/personas/svg?seed=oprah" alt="Oprah Winfrey" />
                        <AvatarFallback>OW</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-[#0A2463] bg-[#0A2463]/10 px-2 py-0.5 rounded-full">Celebrity</span>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="basis-1/8 md:basis-1/8">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="w-20 h-20 shadow-lg border-2 border-[#0A2463]/10">
                        <AvatarImage src="https://api.dicebear.com/7.x/personas/svg?seed=jeff" alt="Jeff Bezos" />
                        <AvatarFallback>JB</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-[#0A2463] bg-[#0A2463]/10 px-2 py-0.5 rounded-full">CEO</span>
                    </div>
                  </CarouselItem>
                </React.Fragment>)}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* Map Preview Section */}
      <section className="py-20 px-4 bg-secondary/10">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-[#0A2463]">Map Complexity</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Map out complex networks including individuals, organizations, venues, and events. Visualize interconnections and discover hidden relationships within your network through an intuitive interface.
              </p>
              <Button size="lg" className="bg-[#0A2463] hover:bg-[#0A2463]/90" asChild>
                <Link to="/network">Start Mapping</Link>
              </Button>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img src="/lovable-uploads/0f4e6749-603a-4738-a4cc-189c60492f5f.png" alt="Network Mapping Interface" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img src="/lovable-uploads/63771b4f-0415-470a-b75f-29616c68f487.png" alt="Task Tracking System" className="w-full h-auto" />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-[#0A2463]">Maintain Relationships</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Keep your network active and engaged with our comprehensive task tracking system. Schedule follow-ups, set reminders for important dates, and maintain meaningful connections through organized relationship management.
              </p>
              <Button size="lg" className="bg-[#0A2463] hover:bg-[#0A2463]/90" asChild>
                <Link to="/network">Try Task Manager</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat Section */}
      <section className="py-20 px-4 bg-secondary/10">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-[#0A2463]">Chat with your Network</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Leverage AI-powered insights to understand your network better. Get personalized suggestions for connecting with others, discover optimal outreach strategies, and uncover valuable opportunities within your professional circle.
              </p>
              <Button size="lg" className="bg-[#0A2463] hover:bg-[#0A2463]/90" asChild>
                <Link to="/network">Start Chatting</Link>
              </Button>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img src="/lovable-uploads/c8f0e758-66af-47cc-a027-984a8fe16ab4.png" alt="AI Network Chat Interface" className="w-full h-auto" />
            </div>
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
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="prose prose-gray">
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                The concept of "<a href="https://en.wikipedia.org/wiki/Six_degrees_of_separation" target="_blank" rel="noopener noreferrer" className="text-[#0A2463] hover:underline">Six Degrees of Separation</a>" was first introduced by Hungarian writer Frigyes Karinthy in his 1929 short story "Chains." This groundbreaking idea suggests that any two individuals on Earth are connected through a chain of no more than six social connections.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Karinthy's theory was revolutionary for its time, predicting the interconnected nature of modern society decades before the advent of social media and the internet. His work laid the foundation for network science and influenced countless studies in social psychology and network theory.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                In the digital age, this phenomenon has become even more relevant. Recent studies, including those by Microsoft and Facebook, have shown that the average degree of separation between any two people has decreased to approximately 3.5 connections, making our world more interconnected than ever.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                SocialMapr leverages this principle to help you visualize and navigate your extended social and professional networks, making it easier than ever to discover and utilize these powerful connections.
              </p>
            </div>
            <div className="space-y-8">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img src="/lovable-uploads/e7e15ff6-a7fb-402d-b577-923ffedd9b0e.png" alt="Frigyes Karinthy" className="w-full h-auto grayscale" />
                <div className="p-4 bg-secondary/20">
                  <p className="text-sm text-muted-foreground">Frigyes Karinthy (1887-1938), Hungarian author who first proposed the concept of six degrees of separation in his 1929 short story "Chains."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-4 bg-secondary/10">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">What Our Users Say</h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Join thousands of professionals who are already leveraging the power of network visualization.
          </p>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-[#0A2463] text-[#0A2463]" />)}
                </div>
                <p className="text-muted-foreground mb-6">
                  "SocialMapr has completely transformed how I approach networking. I've made connections I never thought possible, leading to several successful business partnerships."
                </p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://api.dicebear.com/7.x/personas/svg?seed=sarah" alt="Sarah Chen" />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">Startup Founder</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-[#0A2463] text-[#0A2463]" />)}
                </div>
                <p className="text-muted-foreground mb-6">
                  "The visualization tools are incredible. Being able to see my network mapped out has helped me identify and leverage connections I didn't even know I had."
                </p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://api.dicebear.com/7.x/personas/svg?seed=marcus" alt="Marcus Johnson" />
                    <AvatarFallback>MJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Marcus Johnson</p>
                    <p className="text-sm text-muted-foreground">Business Development</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-[#0A2463] text-[#0A2463]" />)}
                </div>
                <p className="text-muted-foreground mb-6">
                  "As a recruiter, SocialMapr has become an invaluable tool. It's helped me find perfect candidates through unexpected connections and referrals."
                </p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://api.dicebear.com/7.x/personas/svg?seed=elena" alt="Elena Rodriguez" />
                    <AvatarFallback>ER</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Elena Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Senior Recruiter</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-secondary/10">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
          <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
            <div className="bg-background p-8 rounded-lg shadow-sm border text-center flex-1">
              <h3 className="text-xl font-semibold mb-4">Free</h3>
              <p className="text-3xl font-bold mb-6">$0<span className="text-base font-normal text-muted-foreground">/month</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Create one network</span>
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Unlimited connections</span>
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Task management</span>
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Basic visualization</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/network">Get Started</Link>
              </Button>
            </div>
            <div className="flex flex-col md:flex-row gap-8 flex-1">
              <div className="bg-background p-8 rounded-lg shadow-sm border border-primary relative text-center flex-1">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#0A2463] text-white px-4 py-1 rounded-full text-sm">Monthly</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Master Networker</h3>
                <p className="text-3xl font-bold mb-6">$30<span className="text-base font-normal text-muted-foreground">/month</span></p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">Unlimited networks</span>
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">AI-powered network insights</span>
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="w-full bg-[#0A2463] hover:bg-[#0A2463]/90">Subscribe Now</Button>
              </div>
              <div className="bg-background p-8 rounded-lg shadow-sm border border-primary relative text-center flex-1">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#0A2463] text-white px-4 py-1 rounded-full text-sm">Annual (Save 60%)</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Master Networker</h3>
                <p className="text-3xl font-bold mb-6">$12<span className="text-base font-normal text-muted-foreground">/month</span></p>
                <p className="text-sm text-muted-foreground mb-4">Billed annually at $144</p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">Unlimited networks</span>
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">AI-powered network insights</span>
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="w-full bg-[#0A2463] hover:bg-[#0A2463]/90">Subscribe Annually</Button>
              </div>
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
              <AccordionTrigger>How does SocialMapr work?</AccordionTrigger>
              <AccordionContent>
                SocialMapr helps you map and visualize your professional and social connections. You can add people you know directly, and our platform will help you discover paths to connect with others through your network.
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
            <h3 className="font-semibold mb-4">SocialMapr</h3>
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
            © 2024 SocialMapr. All rights reserved.
          </p>
        </div>
      </footer>
    </div>;
};
export default LandingPage;