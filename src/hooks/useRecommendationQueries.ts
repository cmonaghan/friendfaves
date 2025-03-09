
import { useQuery } from '@tanstack/react-query';
import { 
  getRecommendations, 
  getRecommendationById, 
  getRecommendationsByType,
  getPeople,
  getCustomCategories
} from '@/utils/storage';
import { RecommendationType, CustomCategory } from '@/utils/types';

// Stale time of 5 minutes for recommendations data
const RECOMMENDATIONS_STALE_TIME = 1000 * 60 * 5;

// Query key factory to maintain consistent keys
export const queryKeys = {
  recommendations: ['recommendations'] as const,
  recommendationById: (id: string) => ['recommendation', id] as const,
  recommendationsByType: (type: RecommendationType) => ['recommendations', type] as const,
  people: ['people'] as const,
  customCategories: ['custom-categories'] as const,
};

/**
 * Hook to fetch all recommendations with caching
 */
export const useRecommendations = () => {
  return useQuery({
    queryKey: queryKeys.recommendations,
    queryFn: getRecommendations,
    staleTime: RECOMMENDATIONS_STALE_TIME,
  });
};

/**
 * Hook to fetch a specific recommendation by ID with caching
 */
export const useRecommendationById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.recommendationById(id),
    queryFn: () => getRecommendationById(id),
    staleTime: RECOMMENDATIONS_STALE_TIME,
    enabled: !!id, // Only run the query if id is provided
  });
};

/**
 * Hook to fetch recommendations by type with caching
 */
export const useRecommendationsByType = (type: RecommendationType) => {
  return useQuery({
    queryKey: queryKeys.recommendationsByType(type),
    queryFn: () => getRecommendationsByType(type),
    staleTime: RECOMMENDATIONS_STALE_TIME,
    enabled: !!type, // Only run the query if type is provided
  });
};

/**
 * Hook to fetch people with caching
 */
export const usePeople = () => {
  return useQuery({
    queryKey: queryKeys.people,
    queryFn: getPeople,
    staleTime: RECOMMENDATIONS_STALE_TIME,
  });
};

/**
 * Hook to fetch custom categories with caching
 */
export const useCustomCategories = () => {
  return useQuery({
    queryKey: queryKeys.customCategories,
    queryFn: getCustomCategories,
    staleTime: RECOMMENDATIONS_STALE_TIME,
  });
};
