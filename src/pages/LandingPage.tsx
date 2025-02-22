
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <span className="text-xl font-semibold">Science of Six</span>
          <Button asChild>
            <Link to="/network">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            Meet Anyone in the World
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Map and visualize your network connections. Discover how you're connected to anyone through six degrees of separation.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/network">Start Mapping</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
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

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 Science of Six. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
