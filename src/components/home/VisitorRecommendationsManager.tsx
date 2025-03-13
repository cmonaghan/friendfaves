
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getRecommendations } from '@/utils/storage';
import LandingRecommendationForm from './LandingRecommendationForm';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const MAX_VISITOR_RECOMMENDATIONS = 3;

const VisitorRecommendationsManager = () => {
  const [visitorRecommendationsCount, setVisitorRecommendationsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadVisitorRecommendations = async () => {
    setIsLoading(true);
    try {
      const recommendations = await getRecommendations();
      // Filter out mock recommendations to only count visitor-added ones
      const visitorRecs = recommendations.filter(rec => 
        !rec.id.startsWith('mock-') && !rec.id.startsWith('demo-')
      );
      setVisitorRecommendationsCount(visitorRecs.length);
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVisitorRecommendations();
  }, []);

  const handleFormSubmit = () => {
    loadVisitorRecommendations();
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

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
    <div className="mt-8">
      <LandingRecommendationForm onFormSubmit={handleFormSubmit} />
      
      {visitorRecommendationsCount > 0 && (
        <div className="max-w-lg mx-auto mt-4 text-center">
          <p className="text-muted-foreground mb-3">
            You've saved {visitorRecommendationsCount} of {MAX_VISITOR_RECOMMENDATIONS} recommendations.
          </p>
          <Button asChild variant="outline">
            <Link to="/recommendations">View My Recommendations</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default VisitorRecommendationsManager;
