import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from 'react';
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NetworkMap from "./pages/NetworkMap";
import TodoDashboard from "./pages/TodoDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import SubscriptionProtectedRoute from "./components/SubscriptionProtectedRoute";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import { AppLayout } from "./components/AppLayout";
import AuthCallback from "./pages/AuthCallback";

// Create a component to handle app-wide side effects
const AppSideEffects = () => {
  // Clean up localStorage to prevent memory issues
  useEffect(() => {
    const cleanupLocalStorage = () => {
      try {
        // Get all keys from localStorage that start with our app prefix
        const keysToCheck = Object.keys(localStorage).filter(key => 
          key.startsWith('socialmap-nodes-') || 
          key.startsWith('socialmap-edges-')
        );
        
        // If we have too many cached networks, remove older ones
        // Keep only the 10 most recent network caches to save memory
        if (keysToCheck.length > 20) { // 10 networks = 10 node caches + 10 edge caches
          console.log('Cleaning up excess localStorage entries');
          
          // Extract timestamps from the keys if available (assuming format like socialmap-nodes-{id}-{timestamp})
          const keyData = keysToCheck.map(key => {
            const parts = key.split('-');
            const timestamp = parts.length > 3 ? parseInt(parts[3]) : 0;
            return { key, timestamp };
          });
          
          // Sort by timestamp (newer first)
          keyData.sort((a, b) => b.timestamp - a.timestamp);
          
          // Remove oldest entries beyond our limit
          keyData.slice(20).forEach(({ key }) => {
            localStorage.removeItem(key);
          });
        }
      } catch (error) {
        console.error('Error cleaning up localStorage:', error);
      }
    };
    
    // Run cleanup on mount
    cleanupLocalStorage();
    
    // Set interval to periodically clean localStorage
    const intervalId = setInterval(cleanupLocalStorage, 3600000); // Every hour
    
    return () => clearInterval(intervalId);
  }, []);
  
  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: false, // Disable automatic refetching on window focus
      retry: 1, // Only retry failed requests once
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppSideEffects />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={
            <AppLayout includeFooter={false}>
              <LoginPage />
            </AppLayout>
          } />
          <Route path="/register" element={
            <AppLayout includeFooter={false}>
              <RegisterPage />
            </AppLayout>
          } />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/terms" element={
            <AppLayout>
              <TermsOfUse />
            </AppLayout>
          } />
          <Route path="/privacy" element={
            <AppLayout>
              <PrivacyPolicy />
            </AppLayout>
          } />
          <Route path="/pricing" element={
            <AppLayout>
              <Pricing />
            </AppLayout>
          } />
          <Route path="/account" element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          } />
          <Route
            path="/network"
            element={
              <SubscriptionProtectedRoute includeFooter={false}>
                <NetworkMap />
              </SubscriptionProtectedRoute>
            }
          />
          <Route
            path="/todos"
            element={
              <SubscriptionProtectedRoute>
                <TodoDashboard />
              </SubscriptionProtectedRoute>
            }
          />
          <Route path="*" element={
            <AppLayout>
              <NotFound />
            </AppLayout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
