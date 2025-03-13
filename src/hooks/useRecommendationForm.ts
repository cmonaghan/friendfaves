
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { RecommendationFormValues } from "@/components/recommendation-form/types";
import { Person, RecommendationType, CustomCategory } from "@/utils/types";
import { addRecommendation, addPerson, addCustomCategory } from "@/utils/storage";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./useRecommendationQueries";
import { getCurrentStorageProvider, StorageProvider } from "@/utils/storageConfig";

export function useRecommendationForm(
  people: Person[],
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>,
  isUser?: boolean
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Get storage provider dynamically each time the form is submitted
  // This ensures we use the correct provider even if auth state changed
  const getStorageProvider = () => getCurrentStorageProvider();

  const submitRecommendation = async (
    data: RecommendationFormValues,
    isAddingNewFriend: boolean,
    isCustomCategory: boolean
  ) => {
    setIsSubmitting(true);
    
    try {
      console.log("Submitting recommendation with storage provider:", getStorageProvider());
      let recommender: Person;
      
      if (isAddingNewFriend && data.newFriendName) {
        console.log("Adding new friend:", data.newFriendName);
        const newPerson: Person = {
          id: uuidv4(),
          name: data.newFriendName,
          avatar: `/placeholder.svg`
        };
        
        recommender = await addPerson(newPerson);
        console.log("Added new friend result:", recommender);
        
        setPeople(prevPeople => [...prevPeople, recommender]);
      } else {
        recommender = people.find(p => p.id === data.recommenderId)!;
      }
      
      // Handle custom category if needed
      if (isCustomCategory && data.type === RecommendationType.OTHER && data.customCategory && isUser) {
        const customCategory: CustomCategory = {
          type: data.customCategory.toLowerCase().replace(/\s+/g, '-'),
          label: data.customCategory,
          color: 'bg-gray-50'
        };
        
        // Only add custom category if it doesn't exist
        await addCustomCategory(customCategory);
        console.log("Added custom category:", customCategory);
        
        // Invalidate custom categories query to refresh the data
        queryClient.invalidateQueries({
          queryKey: queryKeys.customCategories
        });
      }
      
      let categoryForSaving: string | undefined;
      
      // For a custom type that's not OTHER, we're selecting an existing custom category
      // For OTHER type with customCategory, we're creating a new category
      if (data.type !== RecommendationType.OTHER && 
          !Object.values(RecommendationType).includes(data.type as RecommendationType)) {
        // Using an existing custom category
        categoryForSaving = data.type;
      } else if (isCustomCategory && data.customCategory) {
        // Creating a new custom category
        categoryForSaving = data.customCategory.toLowerCase().replace(/\s+/g, '-');
      }
      
      const newRecommendation = {
        id: uuidv4(),
        title: data.title,
        type: (Object.values(RecommendationType).includes(data.type as RecommendationType) 
               ? data.type as RecommendationType 
               : RecommendationType.OTHER),
        recommender: recommender,
        reason: data.reason || undefined,
        source: undefined, // Set source as undefined since it's been removed from the form
        date: new Date().toISOString().split('T')[0],
        isCompleted: false,
        customCategory: categoryForSaving
      };
      
      await addRecommendation(newRecommendation);
      console.log("Added recommendation:", newRecommendation);
      
      // Invalidate recommendations query to refresh the data
      queryClient.invalidateQueries({
        queryKey: queryKeys.recommendations
      });
      
      const storageType = getStorageProvider();
      if (storageType === StorageProvider.IN_MEMORY) {
        toast.success("Recommendation added to your session!");
      } else {
        toast.success("Recommendation added successfully!");
      }
      
      navigate("/recommendations");
    } catch (error) {
      toast.error("Failed to add recommendation. Please try again.");
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitRecommendation
  };
}
