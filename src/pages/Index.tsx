
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RecommendationType, CustomCategory } from '@/utils/types';
import { Plus, Book, Film, Tv, Utensils, Store, Headphones, HelpCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRecommendations, useCustomCategories } from '@/hooks/useRecommendationQueries';
import CategorySection from '@/components/home/CategorySection';
import RecommendationsSection from '@/components/home/RecommendationsSection';
import HeroSection from '@/components/home/HeroSection';

const Index = () => {
  const [activeTab, setActiveTab] = useState<RecommendationType | string>(RecommendationType.BOOK);
  const { user } = useAuth();
  const [animationComplete, setAnimationComplete] = useState(false);
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  
  const { data: recommendations = [], isLoading: recommendationsLoading } = useRecommendations();
  const { data: customCategoriesData = [], isLoading: categoriesLoading } = useCustomCategories();
  
  const loading = recommendationsLoading || categoriesLoading;

  const customCategories: CustomCategory[] = customCategoriesData;

  useEffect(() => {
    if (!loading && document.querySelectorAll('.recommendation-card').length > 0) {
      const cards = document.querySelectorAll('.recommendation-card');
      
      cards.forEach((card, index) => {
        setTimeout(() => {
          (card as HTMLElement).style.opacity = '1';
          (card as HTMLElement).style.transform = 'translateY(0)';
        }, index * 100);
      });
      
      setTimeout(() => {
        setAnimationComplete(true);
      }, cards.length * 100 + 200);
    }
  }, [loading, recommendations, activeTab]);
  
  const getCategoryCount = (categoryType: RecommendationType | string) => {
    if (!recommendations || recommendations.length === 0) return 0;
    
    const isCustomCategory = customCategories.some(cat => cat.type === categoryType);
    
    if (isCustomCategory) {
      return recommendations.filter(
        rec => rec.type === RecommendationType.OTHER && rec.customCategory === categoryType
      ).length;
    } else if (categoryType === RecommendationType.OTHER) {
      return recommendations.filter(
        rec => rec.type === RecommendationType.OTHER && !rec.customCategory
      ).length;
    } else {
      return recommendations.filter(rec => rec.type === categoryType).length;
    }
  };

  const defaultCategories = [
    { type: RecommendationType.BOOK, label: 'Books', icon: Book as LucideIcon, color: 'bg-blue-50' },
    { type: RecommendationType.MOVIE, label: 'Movies', icon: Film as LucideIcon, color: 'bg-purple-50' },
    { type: RecommendationType.TV, label: 'TV Shows', icon: Tv as LucideIcon, color: 'bg-pink-50' },
    { type: RecommendationType.RECIPE, label: 'Recipes', icon: Utensils as LucideIcon, color: 'bg-green-50' },
    { type: RecommendationType.RESTAURANT, label: 'Restaurants', icon: Store as LucideIcon, color: 'bg-amber-50' },
    { type: RecommendationType.PODCAST, label: 'Podcasts', icon: Headphones as LucideIcon, color: 'bg-blue-100' },
  ];
  
  const categories = [
    ...defaultCategories,
    ...customCategories.map(cat => ({
      type: cat.type,
      label: cat.label,
      icon: HelpCircle as LucideIcon,
      color: cat.color || 'bg-gray-50'
    }))
  ];
  
  const getFilteredRecommendations = () => {
    if (!recommendations || recommendations.length === 0) {
      console.log("No recommendations available to filter"); 
      return [];
    }
    
    console.log(`Filtering recommendations for tab: ${activeTab}, total recommendations:`, recommendations);
    
    const isCustomCategory = customCategories.some(cat => cat.type === activeTab);
    
    if (isCustomCategory) {
      // Only show recommendations that are of type OTHER and have the matching customCategory
      const filtered = recommendations.filter(
        rec => rec.type === RecommendationType.OTHER && rec.customCategory === activeTab
      );
      console.log(`Found ${filtered.length} recommendations for custom category ${activeTab}:`, filtered);
      return filtered.slice(0, 3);
    } 
    
    if (activeTab === RecommendationType.OTHER) {
      // Only show recommendations that are of type OTHER and DON'T have a customCategory
      const filtered = recommendations.filter(rec => 
        rec.type === RecommendationType.OTHER && !rec.customCategory
      );
      console.log(`Found ${filtered.length} recommendations for general "Other" category:`, filtered);
      return filtered.slice(0, 3);
    } 
    
    // Standard categories - show recommendations matching the type
    const filtered = recommendations.filter(rec => rec.type === activeTab);
    console.log(`Found ${filtered.length} recommendations for standard category ${activeTab}:`, filtered);
    return filtered.slice(0, 3);
  };
  
  let filteredRecommendations = getFilteredRecommendations();
  
  const isCustomCategory = customCategories.some(cat => cat.type === activeTab);
  
  // Never show fallback recommendations for custom categories
  // Only show fallback recommendations for standard categories when they have no specific recommendations
  if (filteredRecommendations.length === 0 && 
      !isCustomCategory && 
      activeTab !== RecommendationType.OTHER) {
    console.log("No recommendations for this standard category, showing fallback recommendations");
    filteredRecommendations = recommendations.slice(0, 3);
  }
  
  // This fallback was causing confusion - remove it for custom categories
  // Now if there are no recommendations for a custom category, we'll show an empty state
  
  useEffect(() => {
    if (!user) {
      import('@/utils/storageConfig').then(config => {
        console.log("SHOW_TEST_DATA_FOR_VISITORS:", config.SHOW_TEST_DATA_FOR_VISITORS);
      });
    }
  }, [user]);
  
  const handleCategoryClick = (categoryType: RecommendationType | string) => {
    setActiveTab(categoryType);
    
    if (resultsSectionRef.current) {
      resultsSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  
  const setResultsSectionRef = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      resultsSectionRef.current = ref.current;
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <LoadingSpinner size={40} text="Loading your recommendations..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto">
      {!user && <HeroSection />}

      <div className="mb-4">
        <Button asChild className="flex items-center gap-2">
          <Link to="/add">
            <Plus size={16} />
            Add Recommendation
          </Link>
        </Button>
      </div>

      <CategorySection 
        customCategories={customCategories}
        recommendationsCount={getCategoryCount}
        activeTab={activeTab}
        onCategoryClick={handleCategoryClick}
      />

      <RecommendationsSection 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        categories={categories}
        filteredRecommendations={filteredRecommendations}
        recommendations={recommendations}
        user={user}
        onRef={setResultsSectionRef}
      />
    </div>
  );
};

export default Index;
