
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getRecommendations } from '@/utils/storage';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import RecommendationCard from '@/components/RecommendationCard';
import { Recommendation } from '@/utils/types';

const MAX_VISITOR_RECOMMENDATIONS = 3;

const VisitorRecommendationsManager = () => {
  const [visitorRecommendations, setVisitorRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVisitorRecommendations = async () => {
    setIsLoading(true);
    try {
      const recommendations = await getRecommendations();
      // Filter out mock recommendations to only get visitor-added ones
      const visitorRecs = recommendations.filter(rec => 
        !rec.id.startsWith('mock-') && !rec.id.startsWith('demo-') && 
        // Exclude mock data which typically has numerical IDs
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

  // Set up a listener to refresh recommendations when the recommendations
  // query cache is invalidated (when a new recommendation is added)
  useEffect(() => {
    const handleStorageChange = () => {
      loadVisitorRecommendations();
    };

    // Listen for custom event that will be dispatched when recommendations change
    window.addEventListener('recommendations-updated', handleStorageChange);
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('recommendations-updated', handleStorageChange);
    };
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  const visitorRecommendationsCount = visitorRecommendations.length;

  if (visitorRecommendationsCount >= MAX_VISITOR_RECOMMENDATIONS) {
    return (
      <Card className="max-w-lg mx-auto mt-8 shadow-sm border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3 text-amber-800">
            <AlertCircle size={20} />
            <h3 className="text-lg font-medium">You've reached the limit</h3>
          </div>
          <p className="mb-6 text-amber-700">
            You've saved {visitorRecommendationsCount} recommendations. Create an account to save unlimited 
            recommendations and access them from any device!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="w-full">
              <Link to="/auth">Create Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link to="/recommendations">View My Recommendations</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-8 mb-12">
      {visitorRecommendationsCount > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Your Saved Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {visitorRecommendations.map(recommendation => (
              <RecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button asChild variant="outline" className="mx-2">
              <Link to="/recommendations">View All ({visitorRecommendationsCount})</Link>
            </Button>
            {visitorRecommendationsCount < MAX_VISITOR_RECOMMENDATIONS && (
              <div className="text-muted-foreground flex items-center ml-4">
                {visitorRecommendationsCount} of {MAX_VISITOR_RECOMMENDATIONS} recommendations saved
              </div>
            )}
          </div>
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
