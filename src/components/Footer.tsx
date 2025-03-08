import { Link } from "react-router-dom";
import { Share2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-12 bg-background">
      <div className="container grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#0A2463] flex items-center justify-center text-white">
              <Share2 className="w-5 h-5 rotate-90" />
            </div>
            <h3 className="font-semibold">RelMaps</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Mapping the connections that shape our world.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/features" className="hover:text-foreground transition-colors">Features</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            <li><Link to="/enterprise" className="hover:text-foreground transition-colors">Enterprise</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
            <li><Link to="/support" className="hover:text-foreground transition-colors">Support</Link></li>
            <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link></li>
            <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mt-8 pt-8 border-t">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} RelMaps. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 