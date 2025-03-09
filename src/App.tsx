
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { initializeStorage } from "./utils/storage";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import RecommendationList from "./pages/RecommendationList";
import RecommendationDetail from "./pages/RecommendationDetail";
import AddRecommendation from "./pages/AddRecommendation";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./contexts/AuthProvider";
import RequireAuth from "./components/RequireAuth";

const queryClient = new QueryClient();

const App = () => {
  // Initialize storage on app start
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/auth" element={<Layout><Auth /></Layout>} />
              <Route 
                path="/recommendations" 
                element={<Layout><RecommendationList /></Layout>} 
              />
              <Route 
                path="/recommendation/:id" 
                element={
                  <Layout>
                    <RequireAuth>
                      <RecommendationDetail />
                    </RequireAuth>
                  </Layout>
                } 
              />
              <Route 
                path="/add" 
                element={
                  <Layout>
                    <RequireAuth>
                      <AddRecommendation />
                    </RequireAuth>
                  </Layout>
                } 
              />
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
