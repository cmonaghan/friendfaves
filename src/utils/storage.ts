
import { Person, Recommendation, RecommendationType, CustomCategory } from './types';
import * as localStorage from './localStorage';
import * as databaseStorage from './database';
import { StorageProvider, getCurrentStorageProvider } from './storageConfig';

// Initialize storage based on current provider
export const initializeStorage = async (): Promise<void> => {
  const currentProvider = getCurrentStorageProvider();
  if (currentProvider === StorageProvider.LOCAL_STORAGE) {
    localStorage.initializeLocalStorage();
  } else {
    await databaseStorage.initializeDatabaseStorage();
  }
  console.log(`Storage initialized using ${currentProvider}`);
};

// Helper to get the current storage provider dynamically
const getProvider = () => getCurrentStorageProvider();

// Helper to notify listeners that recommendations have been updated
const notifyRecommendationsUpdated = () => {
  // Dispatch a custom event that components can listen for
  window.dispatchEvent(new CustomEvent('recommendations-updated'));
};

// Get all recommendations from storage
export const getRecommendations = async (): Promise<Recommendation[]> => {
  const provider = getProvider();
  console.log(`Using ${provider} provider for getRecommendations`);
  
  if (provider === StorageProvider.LOCAL_STORAGE) {
    return localStorage.getRecommendations();
  } else {
    return await databaseStorage.getRecommendations();
  }
};

// Get a recommendation by ID
export const getRecommendationById = async (id: string): Promise<Recommendation | undefined> => {
  const provider = getProvider();
  console.log(`Using ${provider} provider for getRecommendationById`);
  
  if (provider === StorageProvider.LOCAL_STORAGE) {
    return localStorage.getRecommendationById(id);
  } else {
    return await databaseStorage.getRecommendationById(id);
  }
};

// Get recommendations filtered by type
export const getRecommendationsByType = async (type: RecommendationType): Promise<Recommendation[]> => {
  const provider = getProvider();
  console.log(`Using ${provider} provider for getRecommendationsByType`);
  
  if (provider === StorageProvider.LOCAL_STORAGE) {
    return localStorage.getRecommendationsByType(type);
  } else {
    return await databaseStorage.getRecommendationsByType(type);
  }
};

// Add a new recommendation
export const addRecommendation = async (recommendation: Recommendation): Promise<void> => {
  const provider = getProvider();
  console.log(`Using ${provider} provider for addRecommendation`);
  
  if (provider === StorageProvider.LOCAL_STORAGE) {
    localStorage.addRecommendation(recommendation);
  } else {
    await databaseStorage.addRecommendation(recommendation);
  }
  
  // Notify listeners that recommendations have been updated
  notifyRecommendationsUpdated();
};

// Get all people from storage
export const getPeople = async (): Promise<Person[]> => {
  const provider = getProvider();
  console.log(`Using ${provider} provider for getPeople`);
  
  if (provider === StorageProvider.LOCAL_STORAGE) {
    return localStorage.getPeople();
  } else {
    return await databaseStorage.getPeople();
  }
};

// Add a new person
export const addPerson = async (person: Person): Promise<Person> => {
  const provider = getProvider();
  console.log(`Using ${provider} provider for addPerson`);
  
  if (provider === StorageProvider.LOCAL_STORAGE) {
    return localStorage.addPerson(person);
  } else {
    return await databaseStorage.addPerson(person);
  }
};

// Update a recommendation
export const updateRecommendation = async (updatedRec: Recommendation): Promise<void> => {
  const provider = getProvider();
  console.log(`Using ${provider} provider for updateRecommendation`);
  
  if (provider === StorageProvider.LOCAL_STORAGE) {
    localStorage.updateRecommendation(updatedRec);
  } else {
    await databaseStorage.updateRecommendation(updatedRec);
  }
  
  // Notify listeners that recommendations have been updated
  notifyRecommendationsUpdated();
};

// Delete a recommendation
export const deleteRecommendation = async (id: string): Promise<void> => {
  const provider = getProvider();
  console.log(`Using ${provider} provider for deleteRecommendation`);
  
  if (provider === StorageProvider.LOCAL_STORAGE) {
    localStorage.deleteRecommendation(id);
  } else {
    await databaseStorage.deleteRecommendation(id);
  }
  
  // Notify listeners that recommendations have been updated
  notifyRecommendationsUpdated();
};

// Get all custom categories
export const getCustomCategories = async (): Promise<CustomCategory[]> => {
  const provider = getProvider();
  console.log(`Using ${provider} provider for getCustomCategories`);
  
  if (provider === StorageProvider.LOCAL_STORAGE) {
    return [];
  } else {
    return await databaseStorage.getCustomCategories();
  }
};

// Add a new custom category
export const addCustomCategory = async (category: CustomCategory): Promise<CustomCategory | null> => {
  const provider = getProvider();
  console.log(`Using ${provider} provider for addCustomCategory`);
  
  if (provider === StorageProvider.LOCAL_STORAGE) {
    return null;
  } else {
    return await databaseStorage.addCustomCategory(category);
  }
};
