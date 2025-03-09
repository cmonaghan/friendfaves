
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { initializeLocalStorage } from "./utils/localStorage";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import RecommendationList from "./pages/RecommendationList";
import RecommendationDetail from "./pages/RecommendationDetail";
import AddRecommendation from "./pages/AddRecommendation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Initialize localStorage when the app starts
  useEffect(() => {
    initializeLocalStorage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/recommendations" element={<Layout><RecommendationList /></Layout>} />
            <Route path="/recommendation/:id" element={<Layout><RecommendationDetail /></Layout>} />
            <Route path="/add" element={<Layout><AddRecommendation /></Layout>} />
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
