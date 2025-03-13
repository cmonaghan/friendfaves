
import { useAuth } from "@/contexts/AuthProvider";
import AddRecommendationForm from "@/components/AddRecommendationForm";

const AddRecommendation = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-screen-lg mx-auto animate-fade-in py-6">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Add Recommendation</h1>
        {user ? (
          <p className="text-muted-foreground">
            Save something a friend has recommended to you
          </p>
        ) : (
          <div>
            <p className="text-muted-foreground">
              Try out adding a recommendation. It will only be visible to you in this browser session.
            </p>
            <p className="text-sm mt-2 inline-block font-medium text-primary">
              Sign in to permanently save your recommendations!
            </p>
          </div>
        )}
      </div>
      
      <AddRecommendationForm />
    </div>
  );
};

export default AddRecommendation;
