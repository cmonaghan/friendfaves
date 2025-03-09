import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  CheckSquare, 
  Square, 
  Calendar, 
  Quote,
  ExternalLink,
  User,
  Tag
} from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
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

  // Generate a gradient background based on the type
  const getBackgroundGradient = () => {
    if (!recommendation) return 'from-gray-50 to-gray-100';
    
    switch (recommendation.type) {
      case 'book':
        return 'bg-gradient-to-r from-blue-50 to-blue-100';
      case 'movie':
        return 'bg-gradient-to-r from-purple-50 to-purple-100';
      case 'tv':
        return 'bg-gradient-to-r from-pink-50 to-pink-100';
      case 'recipe':
        return 'bg-gradient-to-r from-green-50 to-green-100';
      case 'restaurant':
        return 'bg-gradient-to-r from-amber-50 to-amber-100';
      case 'podcast':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100';
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto pb-12 pt-4">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link to="/recommendations">
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{recommendation.title}</h1>
      </div>
      
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className={cn(
          "p-6 flex flex-row items-start justify-between gap-4",
          getBackgroundGradient()
        )}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CategoryTag type={recommendation.type} customCategory={recommendation.customCategory} />
              
              {recommendation.isCompleted && (
                <span className="inline-flex items-center text-sm font-medium text-green-600">
                  <CheckSquare size={16} className="mr-1" />
                  Completed
                </span>
              )}
            </div>
            
            <h2 className="text-2xl font-bold">{recommendation.title}</h2>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={16} className="opacity-70" />
              <span>Added on {new Date(recommendation.date).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleComplete}
              title={recommendation.isCompleted ? "Mark as not completed" : "Mark as completed"}
              className="bg-white/80"
            >
              {recommendation.isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
            </Button>
            
            <Button variant="outline" size="icon" asChild className="bg-white/80">
              <Link to={`/recommendation/${recommendation.id}/edit`}>
                <Pencil size={20} />
              </Link>
            </Button>
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="bg-white/80">
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
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
            <Avatar person={recommendation.recommender} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <User size={14} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Recommended by</span>
              </div>
              <h3 className="text-lg font-medium">{recommendation.recommender.name}</h3>
            </div>
          </div>
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              {recommendation.reason && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Quote size={16} className="text-muted-foreground" />
                    <h3 className="text-lg font-medium">Why it was recommended</h3>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <p className="italic">{recommendation.reason}</p>
                  </div>
                </div>
              )}
              
              {recommendation.source && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ExternalLink size={16} className="text-muted-foreground" />
                    <h3 className="text-lg font-medium">Where to find it</h3>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <p>
                      {recommendation.source.startsWith('http') ? (
                        <a 
                          href={recommendation.source} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          {recommendation.source}
                          <ExternalLink size={14} className="ml-1" />
                        </a>
                      ) : (
                        recommendation.source
                      )}
                    </p>
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
        </CardContent>
        
        <CardFooter className="flex justify-between p-6 border-t">
          <Button variant="outline" asChild>
            <Link to="/recommendations">Back to List</Link>
          </Button>
          
          <Button variant="default" asChild>
            <Link to={`/recommendation/${recommendation.id}/edit`}>
              <Pencil size={16} className="mr-2" />
              Edit Recommendation
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ViewRecommendation;
