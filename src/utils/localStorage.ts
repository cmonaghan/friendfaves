
import { Person, Recommendation, RecommendationType } from './types';
import { mockPeople, mockRecommendations } from './mockData';

// LocalStorage keys
const STORAGE_KEYS = {
  RECOMMENDATIONS: 'recommendations',
  PEOPLE: 'people',
  INITIALIZED: 'storage_initialized'
};

// Check if local storage is available
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('LocalStorage is not available:', e);
    return false;
  }
};

// Initialize local storage with mock data if it's empty
export const initializeLocalStorage = () => {
  if (!isLocalStorageAvailable()) return;
  
  // Check if already initialized to avoid re-initializing on every reload
  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (initialized === 'true') return;
  
  // Set mock data
  localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(mockRecommendations));
  localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(mockPeople));
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  
  console.log('Local storage initialized with mock data');
};

// Get all recommendations from local storage
export const getRecommendations = (): Recommendation[] => {
  if (!isLocalStorageAvailable()) return mockRecommendations;
  
  try {
    const storedData = localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
    return storedData ? JSON.parse(storedData) : mockRecommendations;
  } catch (e) {
    console.error('Error getting recommendations from localStorage:', e);
    return mockRecommendations;
  }
};

// Get a recommendation by ID
export const getRecommendationById = (id: string): Recommendation | undefined => {
  const recommendations = getRecommendations();
  return recommendations.find(rec => rec.id === id);
};

// Get recommendations filtered by type
export const getRecommendationsByType = (type: RecommendationType): Recommendation[] => {
  const recommendations = getRecommendations();
  return recommendations.filter(rec => rec.type === type);
};

// Add a new recommendation
export const addRecommendation = (recommendation: Recommendation): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const recommendations = getRecommendations();
    recommendations.push(recommendation);
    localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(recommendations));
  } catch (e) {
    console.error('Error adding recommendation to localStorage:', e);
  }
};

// Get all people from local storage
export const getPeople = (): Person[] => {
  if (!isLocalStorageAvailable()) return mockPeople;
  
  try {
    const storedData = localStorage.getItem(STORAGE_KEYS.PEOPLE);
    return storedData ? JSON.parse(storedData) : mockPeople;
  } catch (e) {
    console.error('Error getting people from localStorage:', e);
    return mockPeople;
  }
};

// Add a new person
export const addPerson = (person: Person): Person => {
  if (!isLocalStorageAvailable()) return person;
  
  try {
    const people = getPeople();
    people.push(person);
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
  } catch (e) {
    console.error('Error adding person to localStorage:', e);
  }
  
  return person;
};

// Update a recommendation
export const updateRecommendation = (updatedRec: Recommendation): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const recommendations = getRecommendations();
    const index = recommendations.findIndex(rec => rec.id === updatedRec.id);
    
    if (index !== -1) {
      recommendations[index] = updatedRec;
      localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(recommendations));
    }
  } catch (e) {
    console.error('Error updating recommendation in localStorage:', e);
  }
};

// Delete a recommendation
export const deleteRecommendation = (id: string): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const recommendations = getRecommendations();
    const updatedRecommendations = recommendations.filter(rec => rec.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(updatedRecommendations));
  } catch (e) {
    console.error('Error deleting recommendation from localStorage:', e);
  }
};
