
import { useState, useEffect } from 'react';
import { RecommendationFormValues } from '@/components/recommendation-form/types';
import { TitleAndTypeFields } from '@/components/recommendation-form/TitleAndTypeFields';
import { RecommenderField } from '@/components/recommendation-form/RecommenderField';
import { ReasonSourceFields } from '@/components/recommendation-form/ReasonSourceFields';
import { FormActions } from '@/components/recommendation-form/FormActions';
import { CustomCategoryField } from '@/components/recommendation-form/CustomCategoryField';
import { getPeople } from '@/utils/storage';
import { useRecommendationForm } from '@/hooks/useRecommendationForm';
import { Person, RecommendationType } from '@/utils/types';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';

const LandingRecommendationForm = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [isAddingNewFriend, setIsAddingNewFriend] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const { isSubmitting, submitRecommendation } = useRecommendationForm(
    people, 
    setPeople,
    false, // Not a user
    true // Skip navigation after submission
  );

  const form = useForm<RecommendationFormValues>({
    defaultValues: {
      title: '',
      type: 'MOVIE',
      recommenderId: '',
      newFriendName: '',
      reason: '',
      customCategory: '',
    },
  });

  useEffect(() => {
    const loadPeople = async () => {
      const loadedPeople = await getPeople();
      setPeople(loadedPeople);
    };

    loadPeople();
  }, []);

  const onSubmit = (data: RecommendationFormValues) => {
    submitRecommendation(data, isAddingNewFriend, isCustomCategory);
    form.reset();
    setIsAddingNewFriend(false);
    setIsCustomCategory(false);
  };

  const resetForm = () => {
    form.reset();
    setIsAddingNewFriend(false);
    setIsCustomCategory(false);
  };

  return (
    <Card className="w-full p-6 shadow-sm border-muted bg-card">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TitleAndTypeFields 
          form={form} 
          onTypeChange={(value) => {
            form.setValue("type", value, { shouldValidate: false });
            setIsCustomCategory(value === RecommendationType.OTHER);
          }}
        />
        
        <RecommenderField
          form={form}
          people={people}
          isAddingNewFriend={isAddingNewFriend}
          onRecommenderChange={(value) => {
            if (value === "new") {
              setIsAddingNewFriend(true);
              form.setValue("recommenderId", "new");
            } else {
              setIsAddingNewFriend(false);
              form.setValue("recommenderId", value);
            }
          }}
        />
        
        <CustomCategoryField 
          form={form} 
          isCustomCategory={isCustomCategory}
        />
        
        <ReasonSourceFields form={form} />
        
        <FormActions isSubmitting={isSubmitting} />
      </form>
    </Card>
  );
};

export default LandingRecommendationForm;
