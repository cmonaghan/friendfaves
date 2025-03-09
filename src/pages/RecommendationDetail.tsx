
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from "sonner";
import { Recommendation, RecommendationType } from '@/utils/types';
import { getRecommendationById, updateRecommendation, deleteRecommendation, getPeople } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Calendar,
  MapPin,
  Save
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Person } from '@/utils/types';

const RecommendationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  
  // Editing state
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<RecommendationType>(RecommendationType.BOOK);
  const [editRecommenderId, setEditRecommenderId] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSource, setEditSource] = useState('');
  
  useEffect(() => {
    // Fetch recommendation from storage
    const fetchRecommendation = async () => {
      try {
        if (!id) return navigate('/not-found');
        
        const data = await getRecommendationById(id);
        if (!data) return navigate('/not-found');
        
        setRecommendation(data);
        setIsCompleted(data.isCompleted);
        
        // Set edit form initial values
        setEditTitle(data.title);
        setEditType(data.type);
        setEditRecommenderId(data.recommender.id);
        setEditReason(data.reason || '');
        setEditNotes(data.notes || '');
        setEditSource(data.source || '');
        
        // Fetch people for recommender dropdown
        const peopleData = await getPeople();
        setPeople(peopleData);
      } catch (error) {
        console.error('Error fetching recommendation:', error);
        toast.error('Failed to load recommendation');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendation();
  }, [id, navigate]);
  
  const handleToggleComplete = async () => {
    if (!recommendation) return;
    
    try {
      // Update completed status in state
      const newStatus = !isCompleted;
      setIsCompleted(newStatus);
      
      // Update in storage
      const updatedRecommendation = {
        ...recommendation,
        isCompleted: newStatus
      };
      
      await updateRecommendation(updatedRecommendation);
      setRecommendation(updatedRecommendation);
      
      toast.success(
        newStatus 
          ? 'Marked as completed!' 
          : 'Marked as not completed'
      );
    } catch (error) {
      console.error('Error updating recommendation:', error);
      toast.error('Failed to update recommendation');
      // Revert state on error
      setIsCompleted(recommendation.isCompleted);
    }
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      // Delete from storage
      await deleteRecommendation(id);
      
      toast.success('Recommendation deleted');
      navigate('/recommendations');
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      toast.error('Failed to delete recommendation');
    }
  };
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    
    // Reset form values if canceling edit
    if (isEditing && recommendation) {
      setEditTitle(recommendation.title);
      setEditType(recommendation.type);
      setEditRecommenderId(recommendation.recommender.id);
      setEditReason(recommendation.reason || '');
      setEditNotes(recommendation.notes || '');
      setEditSource(recommendation.source || '');
    }
  };
  
  const handleSaveEdit = async () => {
    if (!recommendation) return;
    
    try {
      // Find the selected recommender
      const selectedRecommender = people.find(p => p.id === editRecommenderId);
      
      if (!selectedRecommender) {
        toast.error('Please select a valid recommender');
        return;
      }
      
      // Create updated recommendation object
      const updatedRecommendation = {
        ...recommendation,
        title: editTitle,
        type: editType,
        recommender: selectedRecommender,
        reason: editReason || undefined,
        notes: editNotes || undefined,
        source: editSource || undefined,
      };
      
      // Save to storage
      await updateRecommendation(updatedRecommendation);
      
      // Update local state
      setRecommendation(updatedRecommendation);
      setIsEditing(false);
      
      toast.success('Recommendation updated successfully');
    } catch (error) {
      console.error('Error updating recommendation:', error);
      toast.error('Failed to update recommendation');
    }
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
          
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleEditToggle} className="gap-1">
                <XCircle size={16} />
                Cancel
              </Button>
              <Button variant="default" onClick={handleSaveEdit} className="gap-1">
                <Save size={16} />
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleEditToggle} className="gap-1">
              <Edit size={16} />
              Edit
            </Button>
          )}
          
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
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Select
                    value={editType}
                    onValueChange={(value) => setEditType(value as RecommendationType)}
                  >
                    <SelectTrigger className="w-full md:w-auto min-w-[180px]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={RecommendationType.BOOK}>Book</SelectItem>
                      <SelectItem value={RecommendationType.MOVIE}>Movie</SelectItem>
                      <SelectItem value={RecommendationType.TV}>TV Show</SelectItem>
                      <SelectItem value={RecommendationType.RECIPE}>Recipe</SelectItem>
                      <SelectItem value={RecommendationType.RESTAURANT}>Restaurant</SelectItem>
                      <SelectItem value={RecommendationType.PODCAST}>Podcast</SelectItem>
                      <SelectItem value={RecommendationType.OTHER}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-xl font-medium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Where to find it</label>
                <Input 
                  type="text"
                  value={editSource}
                  onChange={(e) => setEditSource(e.target.value)}
                  placeholder="E.g. Netflix, Local Bookstore, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Recommended By</label>
                <Select
                  value={editRecommenderId}
                  onValueChange={setEditRecommenderId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select who recommended this" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
        
        {/* Content */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-3 space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Why They Recommended It</label>
                  <Textarea
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="Enter their reason for recommending it"
                    className="min-h-24"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Additional Notes</label>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Any additional notes about this recommendation"
                    className="min-h-20"
                  />
                </div>
              </div>
            ) : (
              <>
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
              </>
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
