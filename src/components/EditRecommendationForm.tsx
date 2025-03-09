
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RecommendationType, Person, Recommendation, CustomCategory } from "@/utils/types";
import { getPeople, updateRecommendation } from "@/utils/storage";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/useRecommendationQueries";

// Import form components
import { TitleAndTypeFields } from "./recommendation-form/TitleAndTypeFields";
import { RecommenderField } from "./recommendation-form/RecommenderField";
import { CustomCategoryField } from "./recommendation-form/CustomCategoryField";
import { ReasonSourceFields } from "./recommendation-form/ReasonSourceFields";
import { FormActions } from "./recommendation-form/FormActions";
import { formSchema, RecommendationFormValues } from "./recommendation-form/types";

interface EditRecommendationFormProps {
  recommendation: Recommendation;
}

const EditRecommendationForm = ({ recommendation }: EditRecommendationFormProps) => {
  const [isAddingNewFriend, setIsAddingNewFriend] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(recommendation.type === RecommendationType.OTHER);
  const [people, setPeople] = useState<Person[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Prepare the default values based on the provided recommendation
  const getCustomCategoryValue = () => {
    if (!recommendation.customCategory) return "";
    
    if (typeof recommendation.customCategory === 'object') {
      return (recommendation.customCategory as CustomCategory).label;
    }
    
    return recommendation.customCategory;
  };

  useEffect(() => {
    const loadPeople = async () => {
      try {
        const fetchedPeople = await getPeople();
        setPeople(fetchedPeople);
      } catch (error) {
        console.error("Error fetching people:", error);
        toast.error("Failed to load friends list");
      }
    };

    loadPeople();
  }, []);

  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: recommendation.title,
      type: recommendation.type,
      recommenderId: recommendation.recommender.id,
      newFriendName: "",
      reason: recommendation.reason || "",
      source: recommendation.source || "",
      customCategory: getCustomCategoryValue(),
    },
  });

  const handleSubmit = async (data: RecommendationFormValues) => {
    setIsSubmitting(true);
    
    try {
      const recommender = people.find(p => p.id === data.recommenderId);
      
      if (!recommender) {
        throw new Error("Recommender not found");
      }
      
      // Determine if we're using a standard type or custom type
      let recommendationType: RecommendationType;
      let customCategoryValue: string | undefined = undefined;
      
      // Check if the type is one of the standard enum values
      if (Object.values(RecommendationType).includes(data.type as RecommendationType)) {
        recommendationType = data.type as RecommendationType;
      } else {
        // If it's a custom category already saved as a type
        recommendationType = RecommendationType.OTHER;
        customCategoryValue = data.type;
      }
      
      // If it's a new custom category being entered
      if (isCustomCategory && data.customCategory) {
        customCategoryValue = data.customCategory;
      }
      
      const updatedRecommendation: Recommendation = {
        ...recommendation,
        title: data.title,
        type: recommendationType,
        recommender: recommender,
        reason: data.reason || undefined,
        source: data.source || undefined,
        customCategory: customCategoryValue
      };
      
      await updateRecommendation(updatedRecommendation);
      
      // Update the cache
      queryClient.setQueryData(
        queryKeys.recommendationById(recommendation.id),
        updatedRecommendation
      );
      
      // Invalidate the recommendations list to refresh the data
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
      
      toast.success("Recommendation updated successfully!");
      navigate(`/recommendation/${recommendation.id}`);
    } catch (error) {
      console.error("Error updating recommendation:", error);
      toast.error("Failed to update recommendation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecommenderChange = (value: string) => {
    if (value === "new") {
      setIsAddingNewFriend(true);
      form.setValue("recommenderId", "new");
    } else {
      setIsAddingNewFriend(false);
      form.setValue("recommenderId", value);
    }
  };

  const handleTypeChange = (value: string) => {
    form.setValue("type", value, {
      shouldValidate: false  // Avoid triggering validation on programmatic changes
    });
    setIsCustomCategory(value === RecommendationType.OTHER);
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Edit Recommendation</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <TitleAndTypeFields 
              form={form} 
              onTypeChange={handleTypeChange} 
            />
            
            <RecommenderField 
              form={form} 
              people={people} 
              isAddingNewFriend={isAddingNewFriend}
              onRecommenderChange={handleRecommenderChange}
            />
            
            <CustomCategoryField 
              form={form} 
              isCustomCategory={isCustomCategory} 
            />
            
            <ReasonSourceFields form={form} />
            
            <FormActions isSubmitting={isSubmitting} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditRecommendationForm;
