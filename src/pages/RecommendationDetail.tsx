
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRecommendationById } from '@/hooks/useRecommendationQueries';
import EditRecommendationForm from '@/components/EditRecommendationForm';

const RecommendationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch recommendation with caching
  const { data: recommendation, isLoading, error } = useRecommendationById(id || '');
  
  if (isLoading) {
    return (
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <LoadingSpinner size={40} text="Loading recommendation..." />
        </div>
      </div>
    );
  }
  
  if (error || !recommendation) {
    return (
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <h2 className="text-2xl font-bold mb-4">Recommendation Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The recommendation you're looking for doesn't exist or has been deleted.
          </p>
          <Button asChild>
            <Link to="/recommendations">Back to Recommendations</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-screen-lg mx-auto animate-fade-in py-6">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Edit Recommendation</h1>
        <p className="text-muted-foreground">
          Update details for '{recommendation.title}'
        </p>
      </div>
      
      <EditRecommendationForm recommendation={recommendation} />
    </div>
  );
};

export default RecommendationDetail;
