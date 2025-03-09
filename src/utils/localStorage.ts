
import { mockPeople, mockRecommendations } from './mockData';
import { Recommendation, Person, NewPerson } from './types';

const STORAGE_KEYS = {
  RECOMMENDATIONS: 'recommendations',
  PEOPLE: 'people'
};

// Initialize localStorage with mock data if empty
export const initializeLocalStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS)) {
    localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(mockRecommendations));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.PEOPLE)) {
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(mockPeople));
  }
};

// Get all recommendations from localStorage
export const getRecommendations = (): Recommendation[] => {
  const storedRecommendations = localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
  return storedRecommendations ? JSON.parse(storedRecommendations) : [];
};

// Get all people from localStorage
export const getPeople = (): Person[] => {
  const storedPeople = localStorage.getItem(STORAGE_KEYS.PEOPLE);
  return storedPeople ? JSON.parse(storedPeople) : [];
};

// Get recommendation by ID
export const getRecommendationById = (id: string): Recommendation | undefined => {
  const recommendations = getRecommendations();
  return recommendations.find(rec => rec.id === id);
};

// Add a new person and return the created person
export const addPerson = (newPerson: NewPerson): Person => {
  const people = getPeople();
  const person: Person = {
    id: `p-${Date.now()}`, // Generate a unique ID
    ...newPerson
  };
  
  people.push(person);
  localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
  
  return person;
};

// Add a new recommendation
export const addRecommendation = (recommendation: Omit<Recommendation, 'id'>): Recommendation => {
  const recommendations = getRecommendations();
  const newRecommendation: Recommendation = {
    id: `r-${Date.now()}`, // Generate a unique ID
    ...recommendation
  };
  
  recommendations.push(newRecommendation);
  localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(recommendations));
  
  return newRecommendation;
};

// Delete a recommendation
export const deleteRecommendation = (id: string): boolean => {
  const recommendations = getRecommendations();
  const updatedRecommendations = recommendations.filter(rec => rec.id !== id);
  
  if (updatedRecommendations.length < recommendations.length) {
    localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(updatedRecommendations));
    return true;
  }
  
  return false;
};

// Toggle recommendation completion status
export const toggleRecommendationCompletion = (id: string): Recommendation | undefined => {
  const recommendations = getRecommendations();
  const recommendation = recommendations.find(rec => rec.id === id);
  
  if (recommendation) {
    recommendation.isCompleted = !recommendation.isCompleted;
    localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(recommendations));
    return recommendation;
  }
  
  return undefined;
};

// These helper functions for getting data can be used throughout the application
export const getRecommendationsByType = (type: RecommendationType) => {
  return getRecommendations().filter(rec => rec.type === type);
};
