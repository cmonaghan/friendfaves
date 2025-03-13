
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RecommendationType, CustomCategory } from '@/utils/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRecommendations, useCustomCategories } from '@/hooks/useRecommendationQueries';
import HeroSection from '@/components/home/HeroSection';
import AddRecommendationForm from '@/components/AddRecommendationForm';
import VisitorRecommendationsManager from '@/components/home/VisitorRecommendationsManager';

const Index = () => {
  const { user } = useAuth();
  const { data: recommendations = [], isLoading: recommendationsLoading } = useRecommendations();
  const { data: customCategoriesData = [], isLoading: categoriesLoading } = useCustomCategories();
  
  const loading = recommendationsLoading || categoriesLoading;

  useEffect(() => {
    if (!user) {
      import('@/utils/storageConfig').then(config => {
        console.log("SHOW_TEST_DATA_FOR_VISITORS:", config.SHOW_TEST_DATA_FOR_VISITORS);
      });
    }
  }, [user]);
  
  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <LoadingSpinner size={40} text="Loading your recommendations..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto">
      {!user && <HeroSection />}
      
      {/* Display form for unauthenticated users */}
      {!user && (
        <div className="mt-8 mb-12">
          <AddRecommendationForm />
        </div>
      )}

      {/* Display visitor recommendations manager */}
      {!user && <VisitorRecommendationsManager />}

      {/* For authenticated users, show the add button */}
      {user && (
        <div className="mb-4 mt-12">
          <div className="inline-block">
            <Button asChild className="flex items-center gap-2">
              <Link to="/add">
                <Plus size={16} />
                Add Recommendation
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
