import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { Flow as NetworkMap } from "./pages/NetworkMap";
import TodoDashboard from "./pages/TodoDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Pricing from "./pages/Pricing";
import { AppLayout } from "./components/AppLayout";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
          <Route
            path="/network"
            element={
              <ProtectedRoute includeFooter={false}>
                <NetworkMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/todos"
            element={
              <ProtectedRoute>
                <TodoDashboard />
              </ProtectedRoute>
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
