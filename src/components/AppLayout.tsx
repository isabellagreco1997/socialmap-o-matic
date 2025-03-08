import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
  includeFooter?: boolean;
}

export function AppLayout({ children, includeFooter = true }: AppLayoutProps) {
  const location = useLocation();
  const showNavbar = location.pathname !== "/network";

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