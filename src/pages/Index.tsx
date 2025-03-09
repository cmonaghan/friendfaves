
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RecommendationType } from '@/utils/types';
import RecommendationCard from '@/components/RecommendationCard';
import { ArrowRight, Book, Film, Tv, Utensils, Store, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthProvider';
import { getRecommendations } from '@/utils/storage';

const Index = () => {
  const [activeTab, setActiveTab] = useState<RecommendationType>(RecommendationType.BOOK);
  const categoryRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customCategories, setCustomCategories] = useState<{type: string, label: string}[]>([]);
  
  // Fetch recommendations when component mounts
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await getRecommendations();
        setRecommendations(data);
        
        // Extract unique custom categories
        const customCats = data
          .filter(rec => rec.type === RecommendationType.OTHER && rec.customCategory)
          .map(rec => ({ 
            type: rec.customCategory as string, 
            label: rec.customCategory as string 
          }));
        
        // Remove duplicates by type
        const uniqueCustomCats = Array.from(
          new Map(customCats.map(cat => [cat.type, cat])).values()
        );
        
        setCustomCategories(uniqueCustomCats);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [user]); // Re-fetch when user changes
  
  const defaultCategories = [
    { type: RecommendationType.BOOK, label: 'Books', icon: Book, color: 'bg-blue-50' },
    { type: RecommendationType.MOVIE, label: 'Movies', icon: Film, color: 'bg-purple-50' },
    { type: RecommendationType.TV, label: 'TV Shows', icon: Tv, color: 'bg-pink-50' },
    { type: RecommendationType.RECIPE, label: 'Recipes', icon: Utensils, color: 'bg-green-50' },
    { type: RecommendationType.RESTAURANT, label: 'Restaurants', icon: Store, color: 'bg-amber-50' },
  ];
  
  // Add custom categories
  const categories = [
    ...defaultCategories,
    ...customCategories.map(cat => ({
      type: cat.type,
      label: cat.label,
      icon: HelpCircle,
      color: 'bg-gray-50'
    }))
  ];
  
  // Filter recommendations by active tab - match both enum types and custom category strings
  const filteredRecommendations = recommendations
    .filter(rec => {
      if (activeTab === RecommendationType.OTHER) {
        return rec.type === RecommendationType.OTHER;
      }
      
      // Check if it's a custom category
      const isCustomCategory = customCategories.some(cat => cat.type === activeTab);
      if (isCustomCategory) {
        return rec.type === RecommendationType.OTHER && rec.customCategory === activeTab;
      }
      
      // Regular category
      return rec.type === activeTab;
    })
    .slice(0, 3);
    
  // Count recommendations by type
  const recommendationCounts = categories.map(category => {
    if (defaultCategories.some(cat => cat.type === category.type)) {
      // Standard category
      return {
        ...category,
        count: recommendations.filter(rec => rec.type === category.type).length
      };
    } else {
      // Custom category
      return {
        ...category,
        count: recommendations.filter(
          rec => rec.type === RecommendationType.OTHER && rec.customCategory === category.type
        ).length
      };
    }
  });
  
  // Staggered animation for cards
  const cardsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const cards = cardsRef.current?.children;
    if (!cards) return;
    
    Array.from(cards).forEach((card, index) => {
      setTimeout(() => {
        (card as HTMLElement).style.opacity = '1';
        (card as HTMLElement).style.transform = 'translateY(0)';
      }, 100 + index * 100);
    });
  }, [activeTab]);

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-pulse">Loading recommendations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto">
      {/* Hero Section */}
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

      {/* Categories Section */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold">Categories</h2>
          <Link to="/recommendations" className="text-primary flex items-center hover:underline">
            View all <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div ref={categoryRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendationCounts.map((category, index) => (
            <Card 
              key={category.type}
              className={`cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md`}
              onClick={() => setActiveTab(category.type)}
            >
              <CardContent className={`p-6 flex flex-col items-center text-center ${activeTab === category.type ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
                <div className={`p-3 rounded-full ${category.color} mb-4`}>
                  <category.icon size={24} />
                </div>
                <h3 className="font-semibold mb-1">{category.label}</h3>
                <p className="text-2xl font-bold">{category.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Recommendations Section */}
      <section className="mb-12">
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
            filteredRecommendations.map((recommendation) => (
              <RecommendationCard 
                key={recommendation.id} 
                recommendation={recommendation} 
                className="opacity-0 transform translate-y-10 transition-all duration-500"
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">
                {user ? 'No recommendations yet. Add your first one!' : 'No recommendations found for this category.'}
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/add">Add your first {activeTab} recommendation</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
