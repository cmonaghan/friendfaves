
import { dbConfig, SHOW_TEST_DATA_FOR_VISITORS } from '../storageConfig';
import { mockPeople, mockRecommendations } from '../mockData';
import { isAuthenticated } from './session';

// In a real implementation, this would use an actual database
// For now, we'll simulate a database with in-memory storage to demonstrate the concept
export let recommendationsStore: any[] = [];
export let peopleStore: any[] = [];
export let initialized = false;

// For non-authenticated users (session-specific storage)
export let visitorRecommendationsStore: any[] = [];
export let visitorCustomCategoriesStore: any[] = [];

/**
 * Initializes the database storage
 */
export const initializeDatabaseStorage = async (): Promise<void> => {
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
    const userAuthenticated = await isAuthenticated();
    
    if (userAuthenticated) {
      console.log('User is authenticated, will use real database data');
      // For authenticated users, we'll query their data from Supabase
      // Initialize with empty arrays, data will be fetched when needed
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
