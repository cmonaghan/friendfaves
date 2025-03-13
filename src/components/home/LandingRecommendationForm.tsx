
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RecommendationType } from '@/utils/types';
import { toast } from 'sonner';
import { 
  formSchema, 
  RecommendationFormValues 
} from '@/components/recommendation-form/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRecommendationForm } from '@/hooks/useRecommendationForm';
import { getPeople } from '@/utils/storage';
import { Link } from 'react-router-dom';

const LandingRecommendationForm = ({ onFormSubmit }: { onFormSubmit: () => void }) => {
  const [people, setPeople] = useState([]);
  const navigate = useNavigate();
  
  const { isSubmitting, submitRecommendation } = useRecommendationForm(
    people, 
    setPeople, 
    false // this is for unauthenticated users
  );

  useState(() => {
    const loadPeople = async () => {
      try {
        const fetchedPeople = await getPeople();
        setPeople(fetchedPeople);
      } catch (error) {
        console.error("Error fetching people:", error);
      }
    };
    
    loadPeople();
  }, []);

  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: RecommendationType.BOOK,
      recommenderId: "",
      newFriendName: "Friend",
      reason: "",
      customCategory: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: RecommendationFormValues) => {
    try {
      await submitRecommendation(data, true, false);
      form.reset();
      toast.success("Your recommendation has been saved!");
      onFormSubmit(); // Call the callback to notify the parent component
    } catch (error) {
      console.error("Error adding recommendation:", error);
      toast.error("Failed to save recommendation");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">Save your first recommendation</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Title Field */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter a title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Type Field */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={RecommendationType.BOOK}>Book</SelectItem>
                    <SelectItem value={RecommendationType.MOVIE}>Movie</SelectItem>
                    <SelectItem value={RecommendationType.TV}>TV Show</SelectItem>
                    <SelectItem value={RecommendationType.PODCAST}>Podcast</SelectItem>
                    <SelectItem value={RecommendationType.RECIPE}>Recipe</SelectItem>
                    <SelectItem value={RecommendationType.RESTAURANT}>Restaurant</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Reason Field */}
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Why is it recommended? (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter reason for recommendation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Recommendation"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LandingRecommendationForm;
