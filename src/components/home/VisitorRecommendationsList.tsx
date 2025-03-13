
import { useEffect, useState } from 'react';
import { Recommendation } from '@/utils/types';
import { getRecommendations } from '@/utils/storage';
import RecommendationCard from '@/components/RecommendationCard';

const VisitorRecommendationsList = () => {
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

  if (visitorRecommendations.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-4">
        No recommendations saved yet. Use the form above to add your first recommendation.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {visitorRecommendations.map(recommendation => (
        <RecommendationCard key={recommendation.id} recommendation={recommendation} />
      ))}
    </div>
  );
};

export default VisitorRecommendationsList;
