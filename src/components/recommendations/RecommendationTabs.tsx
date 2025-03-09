
import { RecommendationType, CustomCategory, Recommendation } from '@/utils/types';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface RecommendationTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  customCategories: CustomCategory[];
  recommendations: Recommendation[];
  children: React.ReactNode;
}

const RecommendationTabs = ({
  activeTab,
  setActiveTab,
  customCategories,
  recommendations,
  children,
}: RecommendationTabsProps) => {
  return (
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
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default RecommendationTabs;
