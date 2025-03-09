import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RecommendationType, CustomCategory } from '@/utils/types';
import { Plus, Book, Film, Tv, Utensils, Store, Headphones, HelpCircle } from 'lucide-react';
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

  const customCategories: CustomCategory[] = user 
    ? customCategoriesData 
    : recommendations
        .filter(rec => rec.type === RecommendationType.OTHER && rec.customCategory)
        .map(rec => ({ 
          type: rec.customCategory as string, 
          label: rec.customCategory as string 
        }))
        .reduce((unique: CustomCategory[], cat) => {
          return unique.some(item => item.type === cat.type) 
            ? unique 
            : [...unique, cat];
        }, []);

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
    
    if (categoryType === RecommendationType.OTHER) {
      return recommendations.filter(rec => rec.type === RecommendationType.OTHER).length;
    }
    
    const isCustomCategory = customCategories.some(cat => cat.type === categoryType);
    if (isCustomCategory) {
      return recommendations.filter(
        rec => rec.type === RecommendationType.OTHER && rec.customCategory === categoryType
      ).length;
    }
    
    return recommendations.filter(rec => rec.type === categoryType).length;
  };

  const defaultCategories = [
    { type: RecommendationType.BOOK, label: 'Books', icon: Book, color: 'bg-blue-50' },
    { type: RecommendationType.MOVIE, label: 'Movies', icon: Film, color: 'bg-purple-50' },
    { type: RecommendationType.TV, label: 'TV Shows', icon: Tv, color: 'bg-pink-50' },
    { type: RecommendationType.RECIPE, label: 'Recipes', icon: Utensils, color: 'bg-green-50' },
    { type: RecommendationType.RESTAURANT, label: 'Restaurants', icon: Store, color: 'bg-amber-50' },
    { type: RecommendationType.PODCAST, label: 'Podcasts', icon: Headphones, color: 'bg-blue-100' },
  ];
  
  const categories = [
    ...defaultCategories,
    ...customCategories.map(cat => ({
      type: cat.type,
      label: cat.label,
      icon: HelpCircle,
      color: cat.color || 'bg-gray-50'
    }))
  ];
  
  const getFilteredRecommendations = () => {
    if (!recommendations || recommendations.length === 0) {
      console.log("No recommendations available to filter"); 
      return [];
    }
    
    console.log(`Filtering recommendations for tab: ${activeTab}, total recommendations:`, recommendations);
    
    let filtered = [];
    
    if (activeTab === RecommendationType.OTHER) {
      filtered = recommendations.filter(rec => rec.type === RecommendationType.OTHER);
    } else {
      const isCustomCategory = customCategories.some(cat => cat.type === activeTab);
      if (isCustomCategory) {
        filtered = recommendations.filter(
          rec => rec.type === RecommendationType.OTHER && rec.customCategory === activeTab
        );
      } else {
        filtered = recommendations.filter(rec => rec.type === activeTab);
      }
    }
    
    console.log(`Found ${filtered.length} recommendations for tab ${activeTab}:`, filtered);
    return filtered.slice(0, 3);
  };
  
  let filteredRecommendations = getFilteredRecommendations();
  
  if (filteredRecommendations.length === 0 && defaultCategories.some(cat => cat.type === activeTab)) {
    console.log("No recommendations for this category, showing fallback recommendations");
    filteredRecommendations = recommendations.slice(0, 3);
  }
  
  if (recommendations.length > 0 && filteredRecommendations.length === 0) {
    console.log("Using fallback recommendations");
    filteredRecommendations = recommendations.slice(0, 3);
  }
  
  useEffect(() => {
    if (!user) {
      import('@/utils/storageConfig').then(config => {
        console.log("SHOW_TEST_DATA_FOR_VISITORS:", config.SHOW_TEST_DATA_FOR_VISITORS);
      });
    }
  }, [user]);
  
  const handleCategoryClick = (categoryType: RecommendationType | string) => {
    setActiveTab(categoryType);
    
    // Scroll to the results section with smooth animation
    if (resultsSectionRef.current) {
      resultsSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  
  // This function is passed to the RecommendationsSection to get the ref
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
      <div className="mb-8 flex justify-end">
        <Button asChild className="flex items-center gap-2">
          <Link to="/add">
            <Plus size={16} />
            Add Recommendation
          </Link>
        </Button>
      </div>

      {!user && <HeroSection />}

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
