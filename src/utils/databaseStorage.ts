
import { Person, Recommendation, RecommendationType } from './types';

// In a real implementation, this would use an actual database
// For now, we'll simulate a database with in-memory storage to demonstrate the concept
let recommendationsStore: Recommendation[] = [];
let peopleStore: Person[] = [];
let initialized = false;

const initializeDatabaseStorage = async (): Promise<void> => {
  if (initialized) return;
  
  console.log('Initializing database storage');
  
  // In a real implementation, this would connect to an actual database
  // and possibly load initial data if the database is empty
  
  initialized = true;
};

const getRecommendations = async (): Promise<Recommendation[]> => {
  await initializeDatabaseStorage();
  console.log('Fetching recommendations from database');
  return [...recommendationsStore];
};

const getRecommendationById = async (id: string): Promise<Recommendation | undefined> => {
  await initializeDatabaseStorage();
  return recommendationsStore.find(rec => rec.id === id);
};

const getRecommendationsByType = async (type: RecommendationType): Promise<Recommendation[]> => {
  await initializeDatabaseStorage();
  return recommendationsStore.filter(rec => rec.type === type);
};

const addRecommendation = async (recommendation: Recommendation): Promise<void> => {
  await initializeDatabaseStorage();
  recommendationsStore.push(recommendation);
  console.log('Added recommendation to database', recommendation.id);
};

const getPeople = async (): Promise<Person[]> => {
  await initializeDatabaseStorage();
  return [...peopleStore];
};

const addPerson = async (person: Person): Promise<Person> => {
  await initializeDatabaseStorage();
  peopleStore.push(person);
  console.log('Added person to database', person.id);
  return person;
};

const updateRecommendation = async (updatedRec: Recommendation): Promise<void> => {
  await initializeDatabaseStorage();
  const index = recommendationsStore.findIndex(rec => rec.id === updatedRec.id);
  
  if (index !== -1) {
    recommendationsStore[index] = updatedRec;
    console.log('Updated recommendation in database', updatedRec.id);
  }
};

const deleteRecommendation = async (id: string): Promise<void> => {
  await initializeDatabaseStorage();
  recommendationsStore = recommendationsStore.filter(rec => rec.id !== id);
  console.log('Deleted recommendation from database', id);
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
