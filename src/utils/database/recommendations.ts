import { Recommendation, RecommendationType } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { 
  initializeDatabaseStorage, 
  visitorRecommendationsStore,
  recommendationsStore,
  removeVisitorRecommendation
} from './initialization';
import { SHOW_TEST_DATA_FOR_VISITORS, ALLOW_VISITOR_RECOMMENDATIONS } from '../storageConfig';
import { mockRecommendations } from '../mockData';
import { getCurrentSession, isAuthenticated } from './session';
import { getPeople } from './people';
import { useToast } from '@/hooks/use-toast';

// Initialize hidden recommendations array
if (typeof window !== 'undefined' && !window.hiddenMockRecommendations) {
  window.hiddenMockRecommendations = [];
}

// Add a small artificial delay to simulate loading for demo purposes
const addArtificialDelay = async () => {
  if (process.env.NODE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 800));
  }
};

/**
 * Gets all recommendations from the database
 */
export const getRecommendations = async (): Promise<Recommendation[]> => {
  await initializeDatabaseStorage();
  
  // Add a small artificial delay for better loading experience
  await addArtificialDelay();
  
  // Get the current session
  const userAuthenticated = await isAuthenticated();
  const session = await getCurrentSession();
  
  if (userAuthenticated && session) {
    console.log('Fetching user-specific recommendations from database');
    
    // Fetch user's recommendations from Supabase
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
    
    // Get all people to find recommender information
    const people = await getPeople();
    
    // Map the database records to our Recommendation type
    const recommendations: Recommendation[] = data.map((rec) => {
      // Find the recommender by ID in our people list
      const recommender = people.find(person => person.id === rec.recommender_id);
      
      // If we can't find the recommender, create a fallback with a friendly name
      const fallbackRecommender = {
        id: rec.recommender_id,
        name: `Friend ${rec.recommender_id.substring(0, 4)}`, // Create a more friendly name from the ID
        avatar: '/placeholder.svg'
      };
      
      return {
        id: rec.id,
        title: rec.title,
        type: rec.type as RecommendationType,
        recommender: recommender || fallbackRecommender,
        reason: rec.reason || undefined,
        source: rec.source || undefined,
        date: rec.date,
        isCompleted: rec.is_completed,
        customCategory: rec.custom_category || undefined
      };
    });
    
    return recommendations;
  } else if (SHOW_TEST_DATA_FOR_VISITORS) {
    console.log('Fetching mock recommendations for unauthenticated visitor');
    
    // Filter out hidden mock recommendations
    const filteredMockRecommendations = mockRecommendations.filter(rec => 
      !window.hiddenMockRecommendations?.includes(rec.id)
    );
    
    // Return filtered mock data plus visitor recommendations
    return [...filteredMockRecommendations, ...visitorRecommendationsStore];
  } else {
    return [...visitorRecommendationsStore];
  }
};

/**
 * Gets a recommendation by ID
 */
export const getRecommendationById = async (id: string): Promise<Recommendation | undefined> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const userAuthenticated = await isAuthenticated();
  const session = await getCurrentSession();
  
  if (userAuthenticated && session) {
    console.log(`Fetching user-specific recommendation with ID ${id} from database`);
    
    // Fetch the specific recommendation from Supabase
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching recommendation:', error);
      return undefined;
    }
    
    if (!data) return undefined;
    
    // Get all people to find recommender information
    const people = await getPeople();
    
    // Find the recommender by ID in our people list
    const recommender = people.find(person => person.id === data.recommender_id);
    
    // If we can't find the recommender, create a fallback with a friendly name
    const fallbackRecommender = {
      id: data.recommender_id,
      name: `Friend ${data.recommender_id.substring(0, 4)}`, // Create a more friendly name from the ID
      avatar: '/placeholder.svg'
    };
    
    // Map the database record to our Recommendation type
    return {
      id: data.id,
      title: data.title,
      type: data.type as RecommendationType,
      recommender: recommender || fallbackRecommender,
      reason: data.reason || undefined,
      source: data.source || undefined,
      date: data.date,
      isCompleted: data.is_completed,
      customCategory: data.custom_category || undefined
    };
  } else if (SHOW_TEST_DATA_FOR_VISITORS) {
    console.log(`Fetching recommendation with ID ${id} for unauthenticated visitor`);
    // Check in visitor recommendations first, then in mock data
    return visitorRecommendationsStore.find(rec => rec.id === id) || 
           mockRecommendations.find(rec => rec.id === id);
  } else {
    console.log('Unauthorized access attempt');
    return undefined;
  }
};

/**
 * Gets recommendations filtered by type
 */
export const getRecommendationsByType = async (type: RecommendationType): Promise<Recommendation[]> => {
  await initializeDatabaseStorage();
  
  // Get all recommendations first
  const allRecommendations = await getRecommendations();
  
  // Filter by type
  return allRecommendations.filter(rec => rec.type === type);
};

/**
 * Adds a new recommendation
 */
export const addRecommendation = async (recommendation: Recommendation): Promise<void> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const userAuthenticated = await isAuthenticated();
  const session = await getCurrentSession();
  
  if (userAuthenticated && session) {
    console.log('Adding user-specific recommendation to database');
    
    // Insert the recommendation into Supabase
    const { error } = await supabase
      .from('recommendations')
      .insert([{
        id: recommendation.id,
        title: recommendation.title,
        type: recommendation.type,
        recommender_id: recommendation.recommender.id,
        reason: recommendation.reason,
        source: recommendation.source,
        date: recommendation.date,
        is_completed: recommendation.isCompleted,
        custom_category: recommendation.customCategory,
        user_id: session.user.id
      }]);
    
    if (error) {
      console.error('Error adding recommendation:', error);
      throw new Error('Failed to add recommendation to database');
    }
    
    console.log('Added recommendation to database:', recommendation.id);
  } else if (ALLOW_VISITOR_RECOMMENDATIONS) {
    console.log('Adding in-memory recommendation for unauthenticated visitor');
    // Store in the visitor-specific in-memory store
    visitorRecommendationsStore.push(recommendation);
  } else {
    throw new Error('Unauthorized: Cannot add recommendations without logging in');
  }
  
  console.log('Added recommendation', recommendation.id);
};

/**
 * Updates an existing recommendation
 */
export const updateRecommendation = async (updatedRec: Recommendation): Promise<void> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const userAuthenticated = await isAuthenticated();
  const session = await getCurrentSession();
  
  if (userAuthenticated && session) {
    console.log('Updating user-specific recommendation in database');
    
    // Update the recommendation in Supabase
    const { error } = await supabase
      .from('recommendations')
      .update({
        title: updatedRec.title,
        type: updatedRec.type,
        recommender_id: updatedRec.recommender.id,
        reason: updatedRec.reason,
        source: updatedRec.source,
        is_completed: updatedRec.isCompleted,
        custom_category: updatedRec.customCategory
      })
      .eq('id', updatedRec.id)
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error updating recommendation:', error);
      throw new Error('Failed to update recommendation in database');
    }
    
    console.log('Updated recommendation', updatedRec.id);
  } else if (ALLOW_VISITOR_RECOMMENDATIONS) {
    // Check if it's a visitor-added recommendation
    const visitorIndex = visitorRecommendationsStore.findIndex(rec => rec.id === updatedRec.id);
    
    if (visitorIndex !== -1) {
      console.log('Updating visitor-specific recommendation');
      visitorRecommendationsStore[visitorIndex] = updatedRec;
      console.log('Updated recommendation', updatedRec.id);
    } else {
      // Also allow visitors to update mock recommendations (store in visitor recommendations)
      const mockIndex = mockRecommendations.findIndex(rec => rec.id === updatedRec.id);
      if (mockIndex !== -1) {
        console.log('Visitor updating a mock recommendation - copying to visitor store');
        // Remove the original from mock display but keep a copy in the visitor store
        visitorRecommendationsStore.push(updatedRec);
        console.log('Updated recommendation', updatedRec.id);
      } else {
        console.log('Cannot find recommendation to update');
      }
    }
  } else {
    console.log('Cannot update - visitor updates not allowed');
  }
};

/**
 * Deletes a recommendation
 */
export const deleteRecommendation = async (id: string): Promise<void> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const userAuthenticated = await isAuthenticated();
  const session = await getCurrentSession();
  
  if (userAuthenticated && session) {
    console.log('Deleting user-specific recommendation from database');
    
    // Delete the recommendation from Supabase
    const { error } = await supabase
      .from('recommendations')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error deleting recommendation:', error);
      throw new Error('Failed to delete recommendation from database');
    }
    
    console.log('Deleted recommendation', id);
  } else if (ALLOW_VISITOR_RECOMMENDATIONS) {
    // Check if it's a visitor-added recommendation
    const visitorIndex = visitorRecommendationsStore.findIndex(rec => rec.id === id);
    
    if (visitorIndex !== -1) {
      console.log('Deleting visitor-specific recommendation');
      // Use the helper function instead of direct reassignment
      removeVisitorRecommendation(id);
    } else {
      // For mock recommendations, we "hide" them by adding to a hidden list
      const mockIndex = mockRecommendations.findIndex(rec => rec.id === id);
      if (mockIndex !== -1) {
        console.log('Visitor "deleting" a mock recommendation - just hiding it');
        // Add this ID to the hidden list that's checked during getRecommendations
        if (window.hiddenMockRecommendations) {
          window.hiddenMockRecommendations.push(id);
        }
      } else {
        console.log('Cannot delete mock recommendations');
      }
    }
  } else {
    console.log('Cannot delete - visitor deletions not allowed');
  }
  
  console.log('Deleted recommendation', id);
};
