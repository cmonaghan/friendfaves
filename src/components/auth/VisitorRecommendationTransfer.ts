
import { getRecommendations, addRecommendation } from "@/utils/storage";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/useRecommendationQueries";
import { supabase } from "@/integrations/supabase/client";

// Transfer visitor recommendations to the user's account
export const transferVisitorRecommendations = async (
  userId: string,
  queryClient: QueryClient
) => {
  console.log("Starting recommendation transfer process for user:", userId);
  
  try {
    // Get all visitor recommendations from storage
    const recommendations = await getRecommendations();
    console.log("Total recommendations before filtering:", recommendations.length);
    
    // Filter out visitor recommendations (those not starting with mock- or demo-)
    const visitorRecs = recommendations.filter(rec => 
      !rec.id.startsWith('mock-') && !rec.id.startsWith('demo-') && 
      isNaN(Number(rec.id))
    );
    
    console.log("Visitor recommendations identified:", visitorRecs.length);
    console.log("Visitor recommendation IDs:", visitorRecs.map(rec => rec.id));
    
    if (visitorRecs.length === 0) {
      console.log("No visitor recommendations to transfer");
      return;
    }
    
    console.log(`Transferring ${visitorRecs.length} recommendations to user account ${userId}`);
    
    // Verify user session before proceeding
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      console.error("No active session found during transfer");
      toast.error("Authentication error during recommendation transfer");
      return;
    }
    
    // Add each recommendation to the user's account
    const transferPromises = visitorRecs.map(async (rec, index) => {
      try {
        // Create a new recommendation with the same data but let the system generate a new ID
        const newRec = {
          ...rec,
          id: crypto.randomUUID(), // Generate a new ID for the recommendation
        };
        
        console.log(`Transferring recommendation ${index + 1}/${visitorRecs.length}:`, newRec);
        await addRecommendation(newRec);
        console.log(`Successfully transferred recommendation ${index + 1}`);
        return true;
      } catch (error) {
        console.error(`Error transferring recommendation ${index + 1}:`, error);
        return false;
      }
    });
    
    const results = await Promise.all(transferPromises);
    const successCount = results.filter(Boolean).length;
    
    // Direct database verification - check if recommendations were actually saved
    console.log("Verifying recommendations in database...");
    const { data: dbRecs, error: dbError } = await supabase
      .from('recommendations')
      .select('id, title')
      .eq('user_id', userId);
      
    if (dbError) {
      console.error("Error verifying recommendations:", dbError);
    } else {
      console.log(`Found ${dbRecs?.length || 0} recommendations in database for user ${userId}`);
      console.log("Database recommendation titles:", dbRecs?.map(r => r.title));
    }
    
    // Invalidate recommendations query to refresh the data
    console.log("Invalidating queries to refresh data...");
    await queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
    
    console.log(`Successfully transferred ${successCount} of ${visitorRecs.length} recommendations`);
    toast.success(`Transferred ${successCount} recommendations to your account!`);
  } catch (error) {
    console.error("Error transferring visitor recommendations:", error);
    toast.error("Failed to transfer your recommendations");
    throw error; // Re-throw to allow the calling code to handle it
  }
};
