
// Whether we're running in demo mode (using localStorage) or production mode (using a database)
export const isDemo = false; // Set to false to use database storage

// Storage provider types
export enum StorageProvider {
  LOCAL_STORAGE = 'localStorage',
  DATABASE = 'database'
}

// Database configuration
export const dbConfig = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: import.meta.env.VITE_DB_PORT || '5432',
  user: import.meta.env.VITE_DB_USER || 'postgres',
  password: import.meta.env.VITE_DB_PASSWORD || 'postgres',
  database: import.meta.env.VITE_DB_NAME || 'recommendations'
};

// The current storage provider based on demo mode
export const currentStorageProvider = isDemo ? StorageProvider.LOCAL_STORAGE : StorageProvider.DATABASE;

// Get current auth state - whether a user is logged in or not
export const getIsAuthenticated = () => {
  return !!localStorage.getItem('supabase.auth.token');
};
