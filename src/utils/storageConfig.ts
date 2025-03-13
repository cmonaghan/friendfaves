
// Whether we're running in demo mode (using localStorage) or production mode (using a database)
export const isDemo = false; // Set to false to use database storage

// Storage provider types
export enum StorageProvider {
  LOCAL_STORAGE = 'localStorage',
  DATABASE = 'database',
  IN_MEMORY = 'in-memory'  // Storage type for non-authenticated users
}

// Database configuration
export const dbConfig = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: import.meta.env.VITE_DB_PORT || '5432',
  user: import.meta.env.VITE_DB_USER || 'postgres',
  password: import.meta.env.VITE_DB_PASSWORD || 'postgres',
  database: import.meta.env.VITE_DB_NAME || 'recommendations'
};

// Get current auth state - whether a user is logged in or not
export const getIsAuthenticated = () => {
  // Check if there's a valid Supabase auth token
  return !!localStorage.getItem('supabase.auth.token');
};

// Get current storage provider based on auth state
export const getCurrentStorageProvider = (): StorageProvider => {
  if (isDemo) return StorageProvider.LOCAL_STORAGE;
  return getIsAuthenticated() ? StorageProvider.DATABASE : StorageProvider.IN_MEMORY;
};

// Show test data for visitors only, not for authenticated users
export const SHOW_TEST_DATA_FOR_VISITORS = true;

// Allow non-authenticated users to add and edit recommendations (stored only in memory/session)
export const ALLOW_VISITOR_RECOMMENDATIONS = true;
