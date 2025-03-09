import { Person, Recommendation, RecommendationType, CustomCategory } from './types';
import { dbConfig, SHOW_TEST_DATA_FOR_VISITORS, ALLOW_VISITOR_RECOMMENDATIONS } from './storageConfig';
import { supabase } from '@/integrations/supabase/client';
import { mockPeople, mockRecommendations } from './mockData';

// In a real implementation, this would use an actual database
// For now, we'll simulate a database with in-memory storage to demonstrate the concept
let recommendationsStore: Recommendation[] = [];
let peopleStore: Person[] = [];
let initialized = false;

// For non-authenticated users (session-specific storage)
let visitorRecommendationsStore: Recommendation[] = [];
let visitorCustomCategoriesStore: CustomCategory[] = [];

const initializeDatabaseStorage = async (): Promise<void> => {
  if (initialized) return;
  
  console.log('Initializing database storage with config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    // Not logging password for security reasons
  });
  
  try {
    // Check if we have an active session
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    
    if (session) {
      console.log('User is authenticated, will use real database data');
      // In a real implementation, this would connect to a real database
      // For this example, we'll use an empty store to simulate user-specific data
      recommendationsStore = [];
      peopleStore = [];
    } else {
      console.log('User is NOT authenticated, will use mock data');
      // Use mock data for unauthenticated users
      recommendationsStore = [...mockRecommendations];
      peopleStore = [...mockPeople];
      // Initialize empty visitor recommendations store
      visitorRecommendationsStore = [];
    }
    
    initialized = true;
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    throw new Error('Database connection failed');
  }
};

const getRecommendations = async (): Promise<Recommendation[]> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  
  if (session) {
    console.log('Fetching user-specific recommendations from database');
    // When authenticated, only show user-specific data, not mock data
    return [...recommendationsStore];
  } else if (SHOW_TEST_DATA_FOR_VISITORS) {
    console.log('Fetching mock recommendations for unauthenticated visitor');
    // Always return mock data for unauthenticated visitors
    return [...mockRecommendations, ...visitorRecommendationsStore];
  } else {
    return [...visitorRecommendationsStore];
  }
};

const getRecommendationById = async (id: string): Promise<Recommendation | undefined> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  
  if (session) {
    console.log(`Fetching user-specific recommendation with ID ${id} from database`);
    return recommendationsStore.find(rec => rec.id === id);
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

const getRecommendationsByType = async (type: RecommendationType): Promise<Recommendation[]> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  
  if (session) {
    console.log(`Fetching user-specific recommendations of type ${type} from database`);
    return recommendationsStore.filter(rec => rec.type === type);
  } else if (SHOW_TEST_DATA_FOR_VISITORS) {
    console.log(`Fetching recommendations of type ${type} for unauthenticated visitor`);
    // Combine and filter both mock data and visitor recommendations
    return [...mockRecommendations, ...visitorRecommendationsStore].filter(rec => rec.type === type);
  } else {
    console.log('Unauthorized access attempt');
    return [];
  }
};

const addRecommendation = async (recommendation: Recommendation): Promise<void> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  
  if (session) {
    console.log('Adding user-specific recommendation to database');
    // In a real implementation, this would insert into a real database
    // For this simulation, we'll just add to our in-memory store
    recommendationsStore.push(recommendation);
  } else if (ALLOW_VISITOR_RECOMMENDATIONS) {
    console.log('Adding in-memory recommendation for unauthenticated visitor');
    // Store in the visitor-specific in-memory store
    visitorRecommendationsStore.push(recommendation);
  } else {
    throw new Error('Unauthorized: Cannot add recommendations without logging in');
  }
  
  console.log('Added recommendation', recommendation.id);
};

const getPeople = async (): Promise<Person[]> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  
  if (session) {
    console.log('Fetching user-specific people from database');
    // When authenticated, only return user-specific people, not mock people
    return [...peopleStore];
  } else {
    console.log('Fetching mock people for unauthenticated user');
    return [...mockPeople];
  }
};

const addPerson = async (person: Person): Promise<Person> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  
  if (session) {
    console.log('Adding user-specific person to database');
    peopleStore.push(person);
  } else {
    console.log('Adding mock person for unauthenticated user');
    mockPeople.push(person);
  }
  
  console.log('Added person', person.id);
  return person;
};

const updateRecommendation = async (updatedRec: Recommendation): Promise<void> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  
  if (session) {
    console.log('Updating user-specific recommendation in database');
    const index = recommendationsStore.findIndex(rec => rec.id === updatedRec.id);
    
    if (index !== -1) {
      recommendationsStore[index] = updatedRec;
      console.log('Updated recommendation', updatedRec.id);
    }
  } else {
    // Check if it's a visitor-added recommendation
    const visitorIndex = visitorRecommendationsStore.findIndex(rec => rec.id === updatedRec.id);
    
    if (visitorIndex !== -1) {
      console.log('Updating visitor-specific recommendation');
      visitorRecommendationsStore[visitorIndex] = updatedRec;
      console.log('Updated recommendation', updatedRec.id);
    } else {
      console.log('Cannot update mock recommendations');
    }
  }
};

const deleteRecommendation = async (id: string): Promise<void> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  
  if (session) {
    console.log('Deleting user-specific recommendation from database');
    recommendationsStore = recommendationsStore.filter(rec => rec.id !== id);
  } else {
    // Check if it's a visitor-added recommendation
    const visitorIndex = visitorRecommendationsStore.findIndex(rec => rec.id === id);
    
    if (visitorIndex !== -1) {
      console.log('Deleting visitor-specific recommendation');
      visitorRecommendationsStore = visitorRecommendationsStore.filter(rec => rec.id !== id);
    } else {
      console.log('Cannot delete mock recommendations');
    }
  }
  
  console.log('Deleted recommendation', id);
};

const getCustomCategories = async (): Promise<CustomCategory[]> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  
  if (session) {
    console.log('Fetching user-specific custom categories from database');
    
    // Fetch custom categories from Supabase for authenticated users
    const { data, error } = await supabase
      .from('custom_categories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching custom categories:', error);
      return [];
    }
    
    return data || [];
  } else {
    console.log('Fetching in-memory custom categories for unauthenticated visitor');
    // Return visitor-created custom categories for the current session
    return [...visitorCustomCategoriesStore];
  }
};

const addCustomCategory = async (category: CustomCategory): Promise<CustomCategory | null> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  
  if (session) {
    console.log('Adding user-specific custom category to database');
    
    // Insert the custom category into Supabase
    const { data, error } = await supabase
      .from('custom_categories')
      .insert([{
        type: category.type,
        label: category.label,
        color: category.color || 'bg-gray-50',
        user_id: session.user.id
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding custom category:', error);
      return null;
    }
    
    return data || null;
  } else if (ALLOW_VISITOR_RECOMMENDATIONS) {
    console.log('Adding in-memory custom category for unauthenticated visitor');
    
    // Store in the visitor-specific in-memory store
    const newCategory = {
      ...category,
      id: `temp-${Date.now()}`
    };
    visitorCustomCategoriesStore.push(newCategory);
    return newCategory;
  } else {
    throw new Error('Unauthorized: Cannot add custom categories without logging in');
  }
};

export {
  initializeDatabaseStorage,
  getRecommendations,
  getRecommendationById,
  getRecommendationsByType,
  addRecommendation,
  getPeople,
  addPerson,
  updateRecommendation,
  deleteRecommendation,
  getCustomCategories,
  addCustomCategory
};
