
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import Layout from './components/Layout';
import Index from './pages/Index';
import RecommendationList from './pages/RecommendationList';
import RecommendationDetail from './pages/RecommendationDetail';
import ViewRecommendation from './pages/ViewRecommendation';
import AddRecommendation from './pages/AddRecommendation';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthProvider';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5, // 5 minutes
      staleTime: 1000 * 60 * 1, // 1 minute
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <AuthProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/recommendations" element={<RecommendationList />} />
                <Route path="/recommendation/:id" element={<ViewRecommendation />} />
                <Route path="/recommendation/:id/edit" element={<RecommendationDetail />} />
                <Route path="/add" element={<AddRecommendation />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            <Toaster />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
