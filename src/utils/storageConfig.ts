
// Whether we're running in demo mode (using localStorage) or production mode (using a database)
export const isDemo = true; // Set to false to use database storage

// Storage provider types
export enum StorageProvider {
  LOCAL_STORAGE = 'localStorage',
  DATABASE = 'database'
}

// The current storage provider based on demo mode
export const currentStorageProvider = isDemo ? StorageProvider.LOCAL_STORAGE : StorageProvider.DATABASE;
