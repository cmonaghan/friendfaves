
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
    
    console.log(`Transferring ${visitorRecs.length} recommendations to user account ${userId}`);
    
    // Add each recommendation to the user's account
    const transferPromises = visitorRecs.map(async (rec) => {
      try {
        // Create a new recommendation with the same data but let the system generate a new ID
        const newRec = {
          ...rec,
          id: crypto.randomUUID(), // Generate a new ID for the recommendation
        };
        
        console.log("Transferring recommendation:", newRec);
        await addRecommendation(newRec);
        return true;
      } catch (error) {
        console.error("Error transferring recommendation:", error);
        return false;
      }
    });
    
    const results = await Promise.all(transferPromises);
    const successCount = results.filter(Boolean).length;
    
    // Invalidate recommendations query to refresh the data
    await queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
    
    console.log(`Successfully transferred ${successCount} of ${visitorRecs.length} recommendations`);
    toast.success(`Transferred ${successCount} recommendations to your account!`);
  } catch (error) {
    console.error("Error transferring visitor recommendations:", error);
    toast.error("Failed to transfer your recommendations");
    throw error; // Re-throw to allow the calling code to handle it
  }
};
