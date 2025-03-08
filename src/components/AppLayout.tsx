import { Footer } from "./Footer";

interface AppLayoutProps {
  children: React.ReactNode;
  includeFooter?: boolean;
}

export function AppLayout({ children, includeFooter = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      {includeFooter && <Footer />}
    </div>
  );
} 