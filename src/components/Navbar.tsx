import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export function Navbar() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <nav className="flex h-16 items-center relative" aria-label="Main navigation">
        <div className="flex items-center gap-2 pl-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0A2463] flex items-center justify-center text-white">
              <Share2 className="w-5 h-5 rotate-90" />
            </div>
            <span className="text-xl font-semibold">RelMaps</span>
          </Link>
        </div>
        <div className="flex-1">
          {/* No navigation links in center section */}
        </div>
        <div className="pr-8 flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/login">Log In</Link>
          </Button>
          <Button className="bg-[#0A2463] hover:bg-[#0A2463]/90" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
} 