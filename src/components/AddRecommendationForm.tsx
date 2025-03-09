
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RecommendationType, Person, CustomCategory } from "@/utils/types";
import { getPeople, addPerson, addRecommendation, addCustomCategory } from "@/utils/storage";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthProvider";

// Import form components
import { TitleAndTypeFields } from "./recommendation-form/TitleAndTypeFields";
import { RecommenderField } from "./recommendation-form/RecommenderField";
import { CustomCategoryField } from "./recommendation-form/CustomCategoryField";
import { ReasonSourceFields } from "./recommendation-form/ReasonSourceFields";
import { FormActions } from "./recommendation-form/FormActions";
import { formSchema, RecommendationFormValues } from "./recommendation-form/types";

const AddRecommendationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingNewFriend, setIsAddingNewFriend] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadPeople = async () => {
      try {
        const fetchedPeople = await getPeople();
        console.log('Loaded people for dropdown:', fetchedPeople);
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
      title: "",
      type: RecommendationType.BOOK,
      recommenderId: "",
      newFriendName: "",
      reason: "",
      source: "",
      customCategory: "",
    },
  });

  const onSubmit = async (data: RecommendationFormValues) => {
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
      
      if (isCustomCategory && data.type === RecommendationType.OTHER && data.customCategory && user) {
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
    form.setValue("type", value as RecommendationType);
    setIsCustomCategory(value === RecommendationType.OTHER);
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Add New Recommendation</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

export default AddRecommendationForm;
