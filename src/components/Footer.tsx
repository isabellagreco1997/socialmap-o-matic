import { Link } from "react-router-dom";
import { Share2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6 bg-background">
      <div className="container flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0A2463] flex items-center justify-center text-white">
            <Share2 className="w-5 h-5 rotate-90" />
          </div>
          <h3 className="font-semibold">RelMaps</h3>
        </div>
        
        <div className="flex items-center gap-6">
          <Link 
            to="/terms" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Use
          </Link>
          <div className="h-4 w-px bg-gray-300"></div>
          <Link 
            to="/privacy" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
        
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} RelMaps. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 