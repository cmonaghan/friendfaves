import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from "sonner";
import { Recommendation } from '@/utils/types';
import { getRecommendationById, updateRecommendation, deleteRecommendation } from '@/utils/localStorage';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Calendar,
  MapPin
} from 'lucide-react';
import CategoryTag from '@/components/CategoryTag';
import Avatar from '@/components/Avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const RecommendationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch recommendation from localStorage
    const fetchRecommendation = async () => {
      try {
        if (!id) return navigate('/not-found');
        
        const data = getRecommendationById(id);
        if (!data) return navigate('/not-found');
        
        setRecommendation(data);
        setIsCompleted(data.isCompleted);
        
      } catch (error) {
        console.error('Error fetching recommendation:', error);
        toast.error('Failed to load recommendation');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendation();
  }, [id, navigate]);
  
  const handleToggleComplete = () => {
    if (!recommendation) return;
    
    // Update completed status in state
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    
    // Update in localStorage
    const updatedRecommendation = {
      ...recommendation,
      isCompleted: newStatus
    };
    
    updateRecommendation(updatedRecommendation);
    setRecommendation(updatedRecommendation);
    
    toast.success(
      newStatus 
        ? 'Marked as completed!' 
        : 'Marked as not completed'
    );
  };
  
  const handleDelete = () => {
    if (!id) return;
    
    // Delete from localStorage
    deleteRecommendation(id);
    
    toast.success('Recommendation deleted');
    navigate('/recommendations');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse">Loading recommendation...</div>
      </div>
    );
  }
  
  if (!recommendation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Recommendation not found</h2>
        <Button asChild>
          <Link to="/recommendations">Back to Recommendations</Link>
        </Button>
      </div>
    );
  }
  
  const formattedDate = new Date(recommendation.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <div className="max-w-screen-lg mx-auto animate-fade-in">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>
        <div className="ml-auto flex gap-2">
          <Button 
            variant={isCompleted ? "outline" : "default"}
            onClick={handleToggleComplete}
            className="gap-1"
          >
            {isCompleted ? (
              <>
                <XCircle size={16} />
                Mark Incomplete
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Mark Complete
              </>
            )}
          </Button>
          
          <Button variant="outline" className="gap-1">
            <Edit size={16} />
            Edit
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-1">
                <Trash2 size={16} />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this recommendation.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="bg-card rounded-xl overflow-hidden shadow-sm border">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <CategoryTag type={recommendation.type} size="md" />
            {isCompleted && (
              <span className="text-green-600 flex items-center gap-1 text-sm px-3 py-1 bg-green-50 rounded-full">
                <CheckCircle2 size={16} />
                Completed
              </span>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-3">{recommendation.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={16} />
              <span>{formattedDate}</span>
            </div>
            
            {recommendation.source && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={16} />
                <span>{recommendation.source}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-3 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Why They Recommended It</h2>
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="italic text-muted-foreground">"{recommendation.reason}"</p>
              </div>
            </div>
            
            {recommendation.notes && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Additional Notes</h2>
                <p className="text-muted-foreground">{recommendation.notes}</p>
              </div>
            )}
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-secondary/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Recommended By</h3>
              <Avatar person={recommendation.recommender} showName size="lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationDetail;
