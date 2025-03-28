
import { useState, useEffect } from 'react';
import { getRecommendations } from '@/utils/storage';
import VisitorRecommendationsList from './VisitorRecommendationsList';
import VisitorLimitAlert from './VisitorLimitAlert';
import CreateAccountPrompt from './CreateAccountPrompt';
import { Recommendation } from '@/utils/types';

const MAX_VISITOR_RECOMMENDATIONS = 15;

const VisitorRecommendationsManager = () => {
  const [visitorRecommendations, setVisitorRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVisitorRecommendations = async () => {
    setIsLoading(true);
    try {
      const recommendations = await getRecommendations();
      const visitorRecs = recommendations.filter(rec => 
        !rec.id.startsWith('mock-') && !rec.id.startsWith('demo-') && 
        isNaN(Number(rec.id))
      );
      setVisitorRecommendations(visitorRecs);
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVisitorRecommendations();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      loadVisitorRecommendations();
    };

    window.addEventListener('recommendations-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('recommendations-updated', handleStorageChange);
    };
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  const visitorRecommendationsCount = visitorRecommendations.length;

  if (visitorRecommendationsCount >= MAX_VISITOR_RECOMMENDATIONS) {
    return <VisitorLimitAlert recommendationsCount={visitorRecommendationsCount} />;
  }

  return (
    <div className="mt-8 mb-12">
      {visitorRecommendationsCount > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Your Recommendations</h2>
          <VisitorRecommendationsList />
          {visitorRecommendationsCount > 0 && <CreateAccountPrompt />}
        </div>
      ) : (
        <div className="text-center text-muted-foreground mt-4">
          No recommendations saved yet. Use the form above to add your first recommendation.
        </div>
      )}
    </div>
  );
};

export default VisitorRecommendationsManager;
