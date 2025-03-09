
import AddRecommendationForm from "@/components/AddRecommendationForm";

const AddRecommendation = () => {
  return (
    <div className="max-w-screen-lg mx-auto animate-fade-in py-6">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Add Recommendation</h1>
        <p className="text-muted-foreground">
          Save something a friend has recommended to you
        </p>
      </div>
      
      <AddRecommendationForm />
    </div>
  );
};

export default AddRecommendation;
