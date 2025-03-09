
import { Person, Recommendation, RecommendationType } from './types';
import { dbConfig } from './storageConfig';
import { supabase } from '@/integrations/supabase/client';
import { mockPeople, mockRecommendations } from './mockData';

// In a real implementation, this would use an actual database
// For now, we'll simulate a database with in-memory storage to demonstrate the concept
let recommendationsStore: Recommendation[] = [];
let peopleStore: Person[] = [];
let initialized = false;

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
    // In a real implementation, this would query the database for user-specific data
    // For this example, we're using the in-memory store which would be empty for authenticated users
    return [...recommendationsStore];
  } else {
    console.log('Fetching mock recommendations for unauthenticated user');
    // Return mock data for unauthenticated users
    return [...mockRecommendations];
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
  } else {
    console.log(`Fetching mock recommendation with ID ${id} for unauthenticated user`);
    return mockRecommendations.find(rec => rec.id === id);
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
  } else {
    console.log(`Fetching mock recommendations of type ${type} for unauthenticated user`);
    return mockRecommendations.filter(rec => rec.type === type);
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
  } else {
    console.log('Adding mock recommendation for unauthenticated user');
    mockRecommendations.push(recommendation);
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
    console.log('Updating mock recommendation for unauthenticated user');
    const index = mockRecommendations.findIndex(rec => rec.id === updatedRec.id);
    
    if (index !== -1) {
      mockRecommendations[index] = updatedRec;
      console.log('Updated recommendation', updatedRec.id);
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
    console.log('Deleting mock recommendation for unauthenticated user');
    const mockIndex = mockRecommendations.findIndex(rec => rec.id === id);
    if (mockIndex !== -1) {
      mockRecommendations.splice(mockIndex, 1);
    }
  }
  
  console.log('Deleted recommendation', id);
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
  deleteRecommendation
};
