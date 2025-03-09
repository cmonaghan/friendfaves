
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RecommendationType, CustomCategory } from '@/utils/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import RecommendationFilters from '@/components/recommendations/RecommendationFilters';
import RecommendationTabs from '@/components/recommendations/RecommendationTabs';
import RecommendationGrid from '@/components/recommendations/RecommendationGrid';
import { useRecommendations, useCustomCategories } from '@/hooks/useRecommendationQueries';
import { useFilteredRecommendations } from '@/hooks/useFilteredRecommendations';

const RecommendationList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type') as RecommendationType | string | null;
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>(typeParam || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCompleted, setShowCompleted] = useState(true);
  
  const { data: recommendations = [], isLoading: recommendationsLoading } = useRecommendations();
  const { data: customCategoriesData = [], isLoading: categoriesLoading } = useCustomCategories();
  
  const loading = recommendationsLoading || categoriesLoading;
  
  useEffect(() => {
    console.log("Custom categories data:", customCategoriesData);
    console.log("All recommendations:", recommendations);
  }, [customCategoriesData, recommendations]);
  
  // Process all custom categories from both API data and recommendation data
  const customCategories: CustomCategory[] = customCategoriesData.length > 0
    ? customCategoriesData  // Use the API-provided custom categories if available
    : recommendations
        .filter(rec => rec.type === RecommendationType.OTHER && rec.customCategory)
        .map(rec => {
          // Handle both string and object customCategory formats
          if (typeof rec.customCategory === 'string') {
            return { 
              type: rec.customCategory, 
              label: rec.customCategory 
            };
          } else if (rec.customCategory && typeof rec.customCategory === 'object') {
            return rec.customCategory as CustomCategory;
          }
          return null;
        })
        .filter((cat): cat is CustomCategory => cat !== null)
        .reduce((unique: CustomCategory[], cat) => {
          return unique.some(item => item.type === cat.type) 
            ? unique 
            : [...unique, cat];
        }, []);
  
  useEffect(() => {
    console.log("Processed custom categories:", customCategories);
  }, [customCategories]);
  
  // Update URL when activeTab changes
  useEffect(() => {
    if (activeTab === 'all') {
      searchParams.delete('type');
    } else {
      searchParams.set('type', activeTab);
    }
    setSearchParams(searchParams);
  }, [activeTab, searchParams, setSearchParams]);
  
  const filteredRecommendations = useFilteredRecommendations(
    recommendations, 
    activeTab, 
    searchQuery, 
    showCompleted, 
    sortOrder, 
    customCategories
  );
  
  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto py-12">
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <LoadingSpinner size={40} text="Loading recommendations..." />
          <div className="mt-4 bg-muted p-2 px-4 rounded-md text-sm text-muted-foreground">
            <p>First time here? Your recommendations will appear shortly.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Recommendations</h1>
          <p className="text-muted-foreground">
            {user 
              ? "Browse and filter all your saved recommendations" 
              : "Browse our sample recommendations or sign in to create your own"}
          </p>
        </div>
        
        {user && (
          <Button asChild className="flex items-center gap-2">
            <a href="/add">
              <Plus size={16} />
              Add Recommendation
            </a>
          </Button>
        )}
      </div>
      
      <RecommendationFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      
      <RecommendationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        customCategories={customCategories}
        recommendations={recommendations}
      >
        <RecommendationGrid
          recommendations={recommendations}
          filteredRecommendations={filteredRecommendations}
          searchQuery={searchQuery}
        />
      </RecommendationTabs>
    </div>
  );
};

export default RecommendationList;
