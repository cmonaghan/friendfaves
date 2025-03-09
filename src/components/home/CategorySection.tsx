
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { RecommendationType, CustomCategory } from '@/utils/types';
import { ArrowRight, Book, Film, Tv, Utensils, Store, Headphones, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CategorySectionProps {
  customCategories: CustomCategory[];
  recommendationsCount: (categoryType: RecommendationType | string) => number;
  activeTab: RecommendationType | string;
  onCategoryClick: (categoryType: RecommendationType | string) => void;
}

const CategorySection = ({ 
  customCategories, 
  recommendationsCount, 
  activeTab, 
  onCategoryClick 
}: CategorySectionProps) => {
  const categoryRef = useRef<HTMLDivElement>(null);
  
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

  return (
    <section className="mb-12">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Link to="/recommendations" className="text-primary flex items-center hover:underline">
          View all <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
      
      <div ref={categoryRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card 
            key={category.type}
            className="cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
            onClick={() => onCategoryClick(category.type)}
          >
            <CardContent className={`p-6 flex flex-col items-center text-center ${activeTab === category.type ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
              <div className={`p-3 rounded-full ${category.color} mb-4`}>
                <category.icon size={24} />
              </div>
              <h3 className="font-semibold mb-1">{category.label}</h3>
              <p className="text-2xl font-bold">{recommendationsCount(category.type)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
