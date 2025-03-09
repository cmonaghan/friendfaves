
import { Person, Recommendation, RecommendationType, CustomCategory } from './types';
import * as localStorage from './localStorage';
import * as databaseStorage from './database';
import { isDemo, StorageProvider, currentStorageProvider } from './storageConfig';

// Initialize storage based on current provider
export const initializeStorage = async (): Promise<void> => {
  if (currentStorageProvider === StorageProvider.LOCAL_STORAGE) {
    localStorage.initializeLocalStorage();
  } else {
    await databaseStorage.initializeDatabaseStorage();
  }
  console.log(`Storage initialized using ${currentStorageProvider}`);
};

// Get all recommendations from storage
export const getRecommendations = async (): Promise<Recommendation[]> => {
  if (currentStorageProvider === StorageProvider.LOCAL_STORAGE) {
    return localStorage.getRecommendations();
  } else {
    return await databaseStorage.getRecommendations();
  }
};

// Get a recommendation by ID
export const getRecommendationById = async (id: string): Promise<Recommendation | undefined> => {
  if (currentStorageProvider === StorageProvider.LOCAL_STORAGE) {
    return localStorage.getRecommendationById(id);
  } else {
    return await databaseStorage.getRecommendationById(id);
  }
};

// Get recommendations filtered by type
export const getRecommendationsByType = async (type: RecommendationType): Promise<Recommendation[]> => {
  if (currentStorageProvider === StorageProvider.LOCAL_STORAGE) {
    return localStorage.getRecommendationsByType(type);
  } else {
    return await databaseStorage.getRecommendationsByType(type);
  }
};

// Add a new recommendation
export const addRecommendation = async (recommendation: Recommendation): Promise<void> => {
  if (currentStorageProvider === StorageProvider.LOCAL_STORAGE) {
    localStorage.addRecommendation(recommendation);
  } else {
    await databaseStorage.addRecommendation(recommendation);
  }
};

// Get all people from storage
export const getPeople = async (): Promise<Person[]> => {
  if (currentStorageProvider === StorageProvider.LOCAL_STORAGE) {
    return localStorage.getPeople();
  } else {
    return await databaseStorage.getPeople();
  }
};

// Add a new person
export const addPerson = async (person: Person): Promise<Person> => {
  if (currentStorageProvider === StorageProvider.LOCAL_STORAGE) {
    return localStorage.addPerson(person);
  } else {
    return await databaseStorage.addPerson(person);
  }
};

// Update a recommendation
export const updateRecommendation = async (updatedRec: Recommendation): Promise<void> => {
  if (currentStorageProvider === StorageProvider.LOCAL_STORAGE) {
    localStorage.updateRecommendation(updatedRec);
  } else {
    await databaseStorage.updateRecommendation(updatedRec);
  }
};

// Delete a recommendation
export const deleteRecommendation = async (id: string): Promise<void> => {
  if (currentStorageProvider === StorageProvider.LOCAL_STORAGE) {
    localStorage.deleteRecommendation(id);
  } else {
    await databaseStorage.deleteRecommendation(id);
  }
};

// Get all custom categories
export const getCustomCategories = async (): Promise<CustomCategory[]> => {
  if (currentStorageProvider === StorageProvider.LOCAL_STORAGE) {
    return [];
  } else {
    return await databaseStorage.getCustomCategories();
  }
};

// Add a new custom category
export const addCustomCategory = async (category: CustomCategory): Promise<CustomCategory | null> => {
  if (currentStorageProvider === StorageProvider.LOCAL_STORAGE) {
    return null;
  } else {
    return await databaseStorage.addCustomCategory(category);
  }
};
