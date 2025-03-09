
import { useMemo } from 'react';
import { Recommendation, RecommendationType, CustomCategory } from '@/utils/types';

export const useFilteredRecommendations = (
  recommendations: Recommendation[],
  activeTab: string,
  searchQuery: string,
  showCompleted: boolean,
  sortOrder: 'asc' | 'desc',
  customCategories: CustomCategory[]
) => {
  const filteredRecommendations = useMemo(() => {
    return recommendations
      .filter(rec => {
        if (activeTab === 'all') {
          return true;
        }
        
        if (activeTab === RecommendationType.OTHER) {
          return rec.type === RecommendationType.OTHER && !rec.customCategory;
        }
        
        const isCustomCategory = customCategories.some(cat => cat.type === activeTab);
        if (isCustomCategory) {
          return rec.type === RecommendationType.OTHER && 
                 (typeof rec.customCategory === 'string' && rec.customCategory === activeTab) ||
                 (typeof rec.customCategory === 'object' && (rec.customCategory as CustomCategory).type === activeTab);
        }
        
        return rec.type === activeTab;
      })
      .filter(rec => {
        if (searchQuery && !rec.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        if (!showCompleted && rec.isCompleted) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [recommendations, activeTab, searchQuery, showCompleted, sortOrder, customCategories]);

  return filteredRecommendations;
};
