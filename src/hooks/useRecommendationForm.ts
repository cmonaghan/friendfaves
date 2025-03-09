
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { RecommendationFormValues } from "@/components/recommendation-form/types";
import { Person, RecommendationType, CustomCategory } from "@/utils/types";
import { addRecommendation, addPerson, addCustomCategory } from "@/utils/storage";

export function useRecommendationForm(
  people: Person[],
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>,
  isUser?: boolean
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submitRecommendation = async (
    data: RecommendationFormValues,
    isAddingNewFriend: boolean,
    isCustomCategory: boolean
  ) => {
    setIsSubmitting(true);
    
    try {
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
      
      if (isCustomCategory && data.type === RecommendationType.OTHER && data.customCategory && isUser) {
        const customCategory: CustomCategory = {
          type: data.customCategory,
          label: data.customCategory,
          color: 'bg-gray-50'
        };
        
        await addCustomCategory(customCategory);
        console.log("Added custom category:", customCategory);
      }
      
      const newRecommendation = {
        id: uuidv4(),
        title: data.title,
        type: data.type,
        recommender: recommender,
        reason: data.reason || undefined,
        source: data.source || undefined,
        date: new Date().toISOString().split('T')[0],
        isCompleted: false,
        customCategory: isCustomCategory && data.type === RecommendationType.OTHER ? data.customCategory : undefined
      };
      
      await addRecommendation(newRecommendation);
      console.log("Added recommendation:", newRecommendation);
      
      toast.success("Recommendation added successfully!");
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
