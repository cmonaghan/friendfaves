
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FormActionsProps {
  isSubmitting: boolean;
}

export function FormActions({ isSubmitting }: FormActionsProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-end space-x-2 pt-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => navigate(-1)}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Recommendation"}
      </Button>
    </div>
  );
}
