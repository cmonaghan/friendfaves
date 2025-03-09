
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Recommendation, RecommendationType, CustomCategory } from '@/utils/types';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RecommendationCard from '@/components/RecommendationCard';

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
  activeTab: RecommendationType | string;
  setActiveTab: (tab: RecommendationType | string) => void;
  categories: Array<{
    type: RecommendationType | string;
    label: string;
    icon: React.FC<{ size?: number }>;
    color: string;
  }>;
  filteredRecommendations: Recommendation[];
  user: any;
  onRef: (ref: React.RefObject<HTMLDivElement>) => void;
}

const RecommendationsSection = ({
  activeTab,
  setActiveTab,
  categories,
  filteredRecommendations,
  user,
  onRef
}: RecommendationsSectionProps) => {
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  
  // Pass the ref to the parent component
  onRef(resultsSectionRef);
  
  return (
    <section ref={resultsSectionRef} className="mb-12">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Recent Recommendations</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.type}
                onClick={() => setActiveTab(category.type)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeTab === category.type 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        
        <Link 
          to={`/recommendations?type=${activeTab}`} 
          className="text-primary flex items-center hover:underline"
        >
          View all <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
      
      <div 
        ref={cardsRef} 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map((recommendation) => (
            <RecommendationCard 
              key={recommendation.id} 
              recommendation={recommendation} 
              className="recommendation-card transition-all duration-500 opacity-100"
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">
              {user ? 'No recommendations yet. Add your first one!' : 'No recommendations found for this category.'}
            </p>
            {user && (
              <Button asChild variant="outline" className="mt-4">
                <Link to="/add">Add your first {activeTab} recommendation</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendationsSection;
