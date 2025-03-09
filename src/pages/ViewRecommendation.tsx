import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Pencil, Trash2, Calendar, MapPin } from 'lucide-react';
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
import CategoryTag from '@/components/CategoryTag';
import Avatar from '@/components/Avatar';

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
    <div className="max-w-3xl mx-auto pb-12 pt-6 px-4">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="pl-0 hover:bg-transparent">
          <Link to="/recommendations" className="flex items-center gap-2 text-base">
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>
        </Button>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end gap-2 mb-6">
        <Button 
          variant={recommendation.isCompleted ? "outline" : "default"}
          size="sm"
          className="rounded-full"
          onClick={handleToggleComplete}
        >
          <CheckCircle2 size={16} className="mr-1.5" />
          {recommendation.isCompleted ? "Mark Incomplete" : "Mark Complete"}
        </Button>
        
        <Button variant="outline" size="sm" className="rounded-full" asChild>
          <Link to={`/recommendation/${recommendation.id}/edit`}>
            <Pencil size={16} className="mr-1.5" />
            Edit
          </Link>
        </Button>
        
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm" className="rounded-full">
              <Trash2 size={16} className="mr-1.5" />
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
      
      {/* Content card */}
      <div className="bg-white dark:bg-card rounded-lg shadow-sm overflow-hidden border">
        {/* Header section */}
        <div className="p-8 pb-6">
          <div className="flex gap-2 mb-3">
            <CategoryTag type={recommendation.type} customCategory={recommendation.customCategory} />
            {recommendation.isCompleted && (
              <div className="inline-flex items-center rounded-full py-1 px-2.5 gap-1.5 bg-green-100 text-green-700">
                <CheckCircle2 size={16} />
                <span className="font-medium text-sm">Completed</span>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{recommendation.title}</h1>
          
          <div className="flex items-center text-muted-foreground text-sm">
            <Calendar size={16} className="mr-2" />
            <span>{formattedDate}</span>
            
            {recommendation.source && (
              <>
                <span className="mx-2">•</span>
                <MapPin size={16} className="mr-2" />
                <span>{recommendation.source}</span>
              </>
            )}
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-border" />
        
        {/* Content section */}
        <div className="flex flex-col lg:flex-row">
          {/* Reason section */}
          <div className="p-8 flex-1">
            <h2 className="text-lg font-semibold mb-3">Why They Recommended It</h2>
            <div className="bg-gray-50 dark:bg-secondary/50 p-4 rounded-md text-muted-foreground italic">
              "{recommendation.reason || 'No reason provided'}"
            </div>
          </div>
          
          {/* Recommender section */}
          <div className="bg-gray-50 dark:bg-secondary/50 p-8 flex-shrink-0 lg:w-1/3 flex flex-col justify-center items-center">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Recommended By</h3>
            <Avatar 
              person={recommendation.recommender} 
              size="lg" 
              showName={true} 
              className="avatar-wrapper-vertical"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRecommendation;
