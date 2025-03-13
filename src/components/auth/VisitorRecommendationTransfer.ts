
import { getRecommendations, addRecommendation } from "@/utils/storage";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/useRecommendationQueries";

// Transfer visitor recommendations to the user's account
export const transferVisitorRecommendations = async (
  userId: string,
  queryClient: QueryClient
) => {
  try {
    // Get all visitor recommendations from storage
    const recommendations = await getRecommendations();
    
    // Filter out visitor recommendations (those not starting with mock- or demo-)
    const visitorRecs = recommendations.filter(rec => 
      !rec.id.startsWith('mock-') && !rec.id.startsWith('demo-') && 
      isNaN(Number(rec.id))
    );
    
    if (visitorRecs.length === 0) {
      console.log("No visitor recommendations to transfer");
      return;
    }
    
    console.log(`Transferring ${visitorRecs.length} recommendations to user account`);
    
    // Add each recommendation to the user's account
    const transferPromises = visitorRecs.map(async (rec) => {
      try {
        // Create a new recommendation with the same data but let the system generate a new ID
        const newRec = {
          ...rec,
          id: crypto.randomUUID(), // Generate a new ID for the recommendation
        };
        
        await addRecommendation(newRec);
        return true;
      } catch (error) {
        console.error("Error transferring recommendation:", error);
        return false;
      }
    });
    
    await Promise.all(transferPromises);
    
    // Invalidate recommendations query to refresh the data
    queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
    
    toast.success(`Transferred ${visitorRecs.length} recommendations to your account!`);
  } catch (error) {
    console.error("Error transferring visitor recommendations:", error);
    toast.error("Failed to transfer your recommendations");
  }
};
