
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import RecommendationCard from '@/components/RecommendationCard';
import { RecommendationType, CustomCategory } from '@/utils/types';
import { useStaggeredAnimation } from '@/utils/animations';
import { Search, Filter, Check, SortAsc, SortDesc, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useRecommendations, useCustomCategories } from '@/hooks/useRecommendationQueries';

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
  
  const filteredRecommendations = recommendations
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
  
  const cardsRef = useRef<HTMLDivElement>(null);
  useStaggeredAnimation(cardsRef, 75, 100);
  
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
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search recommendations"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter size={16} />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Show/Hide</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowCompleted(!showCompleted)}>
                <div className="flex items-center gap-2">
                  {showCompleted && <Check size={16} />}
                  <span className={!showCompleted ? 'ml-5' : ''}>
                    Completed Items
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {sortOrder === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setSortOrder('desc')}>
                  <div className="flex items-center gap-2">
                    {sortOrder === 'desc' && <Check size={16} />}
                    <span className={sortOrder !== 'desc' ? 'ml-5' : ''}>
                      Newest First
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('asc')}>
                  <div className="flex items-center gap-2">
                    {sortOrder === 'asc' && <Check size={16} />}
                    <span className={sortOrder !== 'asc' ? 'ml-5' : ''}>
                      Oldest First
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto bg-secondary" style={{ borderRadius: 'var(--radius)' }}>
          <TabsList className="w-max px-1 py-1 bg-secondary mx-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value={RecommendationType.BOOK}>Books</TabsTrigger>
            <TabsTrigger value={RecommendationType.MOVIE}>Movies</TabsTrigger>
            <TabsTrigger value={RecommendationType.TV}>TV Shows</TabsTrigger>
            <TabsTrigger value={RecommendationType.RECIPE}>Recipes</TabsTrigger>
            <TabsTrigger value={RecommendationType.RESTAURANT}>Restaurants</TabsTrigger>
            <TabsTrigger value={RecommendationType.PODCAST}>Podcasts</TabsTrigger>
            
            {/* Only show "Other" category if there are recommendations that don't have a customCategory */}
            {recommendations.some(rec => rec.type === RecommendationType.OTHER && !rec.customCategory) && (
              <TabsTrigger value={RecommendationType.OTHER}>Other</TabsTrigger>
            )}
            
            {/* List all custom categories as their own tabs */}
            {customCategories.length > 0 && customCategories.map(category => (
              <TabsTrigger 
                key={category.type} 
                value={category.type}
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <TabsContent value={activeTab} className="mt-6">
          {filteredRecommendations.length > 0 ? (
            <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map(recommendation => (
                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <h3 className="text-xl font-medium mb-2">No recommendations found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? 'Try changing your search query or filters' : 'Add your first recommendation to get started'}
              </p>
              {user && (
                <Button asChild>
                  <a href="/add">Add Recommendation</a>
                </Button>
              )}
              {!user && (
                <Button asChild>
                  <a href="/auth">Sign in to add recommendations</a>
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecommendationList;
