
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRecommendationForm } from '@/hooks/useRecommendationForm';
import { useForm } from 'react-hook-form';
import { getPeople } from '@/utils/storage';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { RecommendationType, Person } from '@/utils/types';
import { formSchema, RecommendationFormValues } from '@/components/recommendation-form/types';
import { TitleAndTypeFields } from '@/components/recommendation-form/TitleAndTypeFields';
import { RecommenderField } from '@/components/recommendation-form/RecommenderField';
import { CustomCategoryField } from '@/components/recommendation-form/CustomCategoryField';
import { ReasonSourceFields } from '@/components/recommendation-form/ReasonSourceFields';
import { FormActions } from '@/components/recommendation-form/FormActions';

export default function LandingRecommendationForm() {
  const [isAddingNewFriend, setIsAddingNewFriend] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const navigate = useNavigate();
  
  const { isSubmitting, submitRecommendation } = useRecommendationForm(
    people, 
    setPeople
  );
  
  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: RecommendationType.BOOK,
      recommenderId: "",
      newFriendName: "",
      reason: "",
      customCategory: "",
    },
    mode: "onBlur",
  });

  useState(() => {
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

  const onSubmit = async (data: RecommendationFormValues) => {
    await submitRecommendation(data, isAddingNewFriend, isCustomCategory);
  };

  const handleRecommenderChange = (value: string) => {
    if (value === "new") {
      setIsAddingNewFriend(true);
      form.setValue("recommenderId", "new", { shouldValidate: false });
    } else {
      setIsAddingNewFriend(false);
      form.setValue("recommenderId", value, { shouldValidate: false });
    }
  };

  const handleTypeChange = (value: string) => {
    form.setValue("type", value, { shouldValidate: false });
    const isCustom = value === RecommendationType.OTHER;
    setIsCustomCategory(isCustom);
    
    if (!isCustom) {
      form.setValue("customCategory", "", { shouldValidate: false });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-8 mb-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 bg-card border rounded-lg shadow-sm">
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
    </div>
  );
}
