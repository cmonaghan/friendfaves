
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteRecommendation, updateRecommendation } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useQueryClient } from '@tanstack/react-query';
import { useRecommendationById } from '@/hooks/useRecommendationQueries';

// Import the queryKeys for cache invalidation
import { queryKeys } from '@/hooks/useRecommendationQueries';
import { CustomCategory } from '@/utils/types';
import CategoryTag from '@/components/CategoryTag';

const ViewRecommendation = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Access the query client for cache invalidation
  const queryClient = useQueryClient();
  
  // Fetch recommendation with caching
  const { data: recommendation, isLoading, error } = useRecommendationById(id || '');
  
  const handleToggleComplete = async () => {
    if (!recommendation) return;
    
    try {
      const updatedRecommendation = {
        ...recommendation,
        isCompleted: !recommendation.isCompleted
      };
      
      await updateRecommendation(updatedRecommendation);
      
      // Update the cache with the new data
      queryClient.setQueryData(
        queryKeys.recommendationById(recommendation.id),
        updatedRecommendation
      );
      
      // Invalidate the recommendations list to refresh the data
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
      
      toast({
        title: updatedRecommendation.isCompleted ? "Marked as completed" : "Marked as not completed",
        description: updatedRecommendation.title,
      });
    } catch (error) {
      console.error('Error updating recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to update recommendation status",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async () => {
    if (!recommendation) return;
    
    setIsDeleting(true);
    
    try {
      await deleteRecommendation(recommendation.id);
      
      // Invalidate the cache to refresh the data
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
      
      toast({
        title: "Recommendation deleted",
        description: recommendation.title,
      });
      
      navigate('/recommendations');
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to delete recommendation",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-screen-xl mx-auto py-12">
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <LoadingSpinner size={40} text="Loading recommendation..." />
        </div>
      </div>
    );
  }
  
  if (error || !recommendation) {
    return (
      <div className="max-w-screen-xl mx-auto py-12">
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
  
  // Format date
  const formattedDate = new Date(recommendation.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  return (
    <div className="max-w-4xl mx-auto pb-12 pt-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/recommendations">
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <h1 className="font-bold text-xl">Back</h1>
      </div>
      
      <div className="flex gap-3 mb-6">
        <Button 
          variant={recommendation.isCompleted ? "outline" : "default"} 
          className="gap-2"
          onClick={handleToggleComplete}
        >
          <CheckCircle2 size={18} />
          {recommendation.isCompleted ? "Mark Incomplete" : "Mark Complete"}
        </Button>
        
        <Button variant="outline" className="gap-2" asChild>
          <Link to={`/recommendation/${recommendation.id}/edit`}>
            <Pencil size={18} />
            Edit
          </Link>
        </Button>
        
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 size={18} />
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Recommendation</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{recommendation.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <LoadingSpinner size={16} /> : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="bg-white dark:bg-card border rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="mb-3">
            <CategoryTag type={recommendation.type} customCategory={recommendation.customCategory} />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{recommendation.title}</h1>
          
          <div className="text-sm text-muted-foreground">
            {formattedDate}
          </div>
        </div>
        
        {recommendation.reason && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Why They Recommended It</h2>
            <div className="bg-muted p-4 rounded-md">
              <p>{recommendation.reason}</p>
            </div>
          </div>
        )}
        
        {recommendation.source && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Where to Find It</h2>
            <div className="bg-muted p-4 rounded-md">
              <p>{recommendation.source}</p>
            </div>
          </div>
        )}
        
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recommended By</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img 
                src={recommendation.recommender.avatar || '/placeholder.svg'} 
                alt={recommendation.recommender.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium">{recommendation.recommender.name}</p>
              {recommendation.recommender.relation && (
                <p className="text-sm text-muted-foreground">{recommendation.recommender.relation}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRecommendation;
