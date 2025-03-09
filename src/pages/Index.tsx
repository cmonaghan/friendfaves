
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RecommendationType, CustomCategory } from '@/utils/types';
import RecommendationCard from '@/components/RecommendationCard';
import { ArrowRight, Book, Film, Tv, Utensils, Store, Headphones, HelpCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRecommendations, useCustomCategories } from '@/hooks/useRecommendationQueries';

const Index = () => {
  const [activeTab, setActiveTab] = useState<RecommendationType | string>(RecommendationType.BOOK);
  const categoryRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [animationComplete, setAnimationComplete] = useState(false);
  
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
    if (!loading && cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.recommendation-card');
      
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

      {!user && (
        <section className="mb-12 py-12 sm:py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block mb-4 px-3 py-1 bg-secondary text-sm font-medium rounded-full">
              Never Forget a Good Recommendation
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Track <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">recommendations</span> from friends
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Keep track of all the amazing books, movies, TV shows, and recipes your friends recommend to you in one beautiful place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/add">
                  Add Recommendation
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                <Link to="/recommendations">
                  Browse All
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold">Categories</h2>
          <Link to="/recommendations" className="text-primary flex items-center hover:underline">
            View all <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div ref={categoryRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <Card 
              key={category.type}
              className={`cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md`}
              onClick={() => handleCategoryClick(category.type)}
            >
              <CardContent className={`p-6 flex flex-col items-center text-center ${activeTab === category.type ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
                <div className={`p-3 rounded-full ${category.color} mb-4`}>
                  <category.icon size={24} />
                </div>
                <h3 className="font-semibold mb-1">{category.label}</h3>
                <p className="text-2xl font-bold">{getCategoryCount(category.type)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section ref={resultsSectionRef} className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Recent Recommendations</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.type}
                  onClick={() => setActiveTab(category.type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeTab === category.type 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          
          <Link 
            to={`/recommendations?type=${activeTab}`} 
            className="text-primary flex items-center hover:underline"
          >
            View all <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div 
          ref={cardsRef} 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((recommendation, index) => (
              <RecommendationCard 
                key={recommendation.id} 
                recommendation={recommendation} 
                className="recommendation-card transition-all duration-500 opacity-100"
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">
                {user ? 'No recommendations yet. Add your first one!' : 'No recommendations found for this category.'}
              </p>
              {user && (
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/add">Add your first {activeTab} recommendation</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
