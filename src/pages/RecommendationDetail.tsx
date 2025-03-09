import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Pencil, Trash2, CheckSquare, Square } from 'lucide-react';
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
import { RecommendationType } from '@/utils/types';
import CategoryTag from '@/components/CategoryTag';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useQueryClient } from '@tanstack/react-query';
import { useRecommendationById } from '@/hooks/useRecommendationQueries';

// Import the queryKeys for cache invalidation
import { queryKeys } from '@/hooks/useRecommendationQueries';

const RecommendationDetail = () => {
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
  
  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/recommendations">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{recommendation.title}</h1>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleComplete}
            title={recommendation.isCompleted ? "Mark as not completed" : "Mark as completed"}
          >
            {recommendation.isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
          </Button>
          
          <Button variant="outline" size="icon" asChild>
            <Link to={`/recommendation/${recommendation.id}/edit`}>
              <Pencil size={20} />
            </Link>
          </Button>
          
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Trash2 size={20} />
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
      </div>
      
      <div className="mb-6">
        <CategoryTag type={recommendation.type} customCategory={recommendation.customCategory} />
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                src={recommendation.recommender.avatar || '/placeholder.svg'} 
                alt={recommendation.recommender.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              Recommended by <strong>{recommendation.recommender.name}</strong>
            </span>
          </div>
          <span className="text-sm text-muted-foreground mx-2">•</span>
          <span className="text-sm text-muted-foreground">
            {new Date(recommendation.date).toLocaleDateString()}
          </span>
          {recommendation.isCompleted && (
            <>
              <span className="text-sm text-muted-foreground mx-2">•</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-500">
                Completed
              </span>
            </>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          {recommendation.reason && (
            <div>
              <h3 className="text-lg font-medium mb-2">Why it was recommended</h3>
              <div className="bg-muted p-4 rounded-md">
                <p>{recommendation.reason}</p>
              </div>
            </div>
          )}
          
          {recommendation.source && (
            <div>
              <h3 className="text-lg font-medium mb-2">Where to find it</h3>
              <div className="bg-muted p-4 rounded-md">
                <p>{recommendation.source}</p>
              </div>
            </div>
          )}
          
          {!recommendation.reason && !recommendation.source && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No additional details available.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-6">
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No notes added yet.</p>
            <Button variant="outline" disabled>Add Note (Coming Soon)</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecommendationDetail;
