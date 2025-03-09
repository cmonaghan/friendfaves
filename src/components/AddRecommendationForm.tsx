
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RecommendationType, Person } from "@/utils/types";
import { getPeople } from "@/utils/storage";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthProvider";
import { useRecommendationForm } from "@/hooks/useRecommendationForm";

// Import form components
import { TitleAndTypeFields } from "./recommendation-form/TitleAndTypeFields";
import { RecommenderField } from "./recommendation-form/RecommenderField";
import { CustomCategoryField } from "./recommendation-form/CustomCategoryField";
import { ReasonSourceFields } from "./recommendation-form/ReasonSourceFields";
import { FormActions } from "./recommendation-form/FormActions";
import { formSchema, RecommendationFormValues } from "./recommendation-form/types";

const AddRecommendationForm = () => {
  const [isAddingNewFriend, setIsAddingNewFriend] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const { user } = useAuth();
  
  const { isSubmitting, submitRecommendation } = useRecommendationForm(
    people, 
    setPeople, 
    !!user
  );

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
    await submitRecommendation(data, isAddingNewFriend, isCustomCategory);
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
    // Only show the custom category field if the type is "other"
    // For existing custom categories, we don't need to show the input field
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
