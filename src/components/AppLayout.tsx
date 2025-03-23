import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
  includeFooter?: boolean;
}

export function AppLayout({ children, includeFooter = true }: AppLayoutProps) {
  const location = useLocation();
  // Don't show navbar on network, login, and register pages
  const showNavbar = !(["/network", "/login", "/register"].includes(location.pathname));

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {includeFooter && <Footer />}
    </div>
  );
} 