
import { useRef } from 'react';
import { Recommendation } from '@/utils/types';
import RecommendationCard from '@/components/RecommendationCard';
import { useStaggeredAnimation } from '@/utils/animations';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthProvider';
import { Link } from 'react-router-dom';

interface RecommendationGridProps {
  recommendations: Recommendation[];
  filteredRecommendations: Recommendation[];
  searchQuery: string;
}

const RecommendationGrid = ({ 
  recommendations, 
  filteredRecommendations,
  searchQuery
}: RecommendationGridProps) => {
  const { user } = useAuth();
  const cardsRef = useRef<HTMLDivElement>(null);
  
  useStaggeredAnimation(cardsRef, 75, 100);
  
  if (filteredRecommendations.length > 0) {
    return (
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecommendations.map(recommendation => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>
    );
  }
  
  return (
    <div className="py-16 text-center">
      <h3 className="text-xl font-medium mb-2">No recommendations found</h3>
      <p className="text-muted-foreground mb-6">
        {searchQuery ? 'Try changing your search query or filters' : 'Add your first recommendation to get started'}
      </p>
      
      <Button asChild>
        <Link to="/add">
          {user 
            ? 'Add Recommendation' 
            : 'Create Temporary Recommendation'
          }
        </Link>
      </Button>
      
      {!user && (
        <p className="mt-4 text-sm text-muted-foreground">
          Any recommendations you create will be stored temporarily in this browser session.
          <br />
          <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to save them permanently.
        </p>
      )}
    </div>
  );
};

export default RecommendationGrid;
