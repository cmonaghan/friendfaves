
// Export initialization
export { initializeDatabaseStorage } from './initialization';

// Export recommendation operations
export { 
  getRecommendations,
  getRecommendationById,
  getRecommendationsByType,
  addRecommendation,
  updateRecommendation,
  deleteRecommendation
} from './recommendations';

// Export people operations
export {
  getPeople,
  addPerson
} from './people';

// Export category operations
export {
  getCustomCategories,
  addCustomCategory
} from './categories';
