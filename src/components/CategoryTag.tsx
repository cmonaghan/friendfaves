import { RecommendationType } from "@/utils/types";
import { Book, Film, Tv, Utensils, Store, Headphones, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomCategories } from "@/hooks/useRecommendationQueries";

interface CategoryTagProps {
  type: RecommendationType;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  customCategory?: string;
}

const CategoryTag = ({ type, className, showLabel = true, size = 'md', customCategory }: CategoryTagProps) => {
  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 20;
  const paddingClass = size === 'sm' ? 'py-0.5 px-2' : size === 'md' ? 'py-1 px-2.5' : 'py-1.5 px-3';
  const textClass = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';
  
  const { data: customCategories = [] } = useCustomCategories();
  
  let Icon = HelpCircle;
  let color = 'bg-gray-100 text-gray-700';
  let label = customCategory || 'Other';

  if (customCategory) {
    const matchedCategory = customCategories.find(cat => cat.type === customCategory);
    if (matchedCategory?.icon) {
      switch (matchedCategory.icon) {
        case 'Book': Icon = Book; break;
        case 'Film': Icon = Film; break;
        case 'Tv': Icon = Tv; break;
        case 'Utensils': Icon = Utensils; break;
        case 'Store': Icon = Store; break;
        case 'Headphones': Icon = Headphones; break;
        default: Icon = HelpCircle;
      }
      label = matchedCategory.label;
      return (
        <div className={cn(
          'inline-flex items-center rounded-full gap-1.5',
          color,
          paddingClass,
          className
        )}>
          <Icon size={iconSize} />
          {showLabel && <span className={cn('font-medium', textClass)}>{label}</span>}
        </div>
      );
    }
  }

  switch (type) {
    case RecommendationType.BOOK:
      Icon = Book;
      color = 'bg-blue-100 text-blue-700';
      label = 'Book';
      break;
    case RecommendationType.MOVIE:
      Icon = Film;
      color = 'bg-purple-100 text-purple-700';
      label = 'Movie';
      break;
    case RecommendationType.TV:
      Icon = Tv;
      color = 'bg-pink-100 text-pink-700';
      label = 'TV Show';
      break;
    case RecommendationType.RECIPE:
      Icon = Utensils;
      color = 'bg-green-100 text-green-700';
      label = 'Recipe';
      break;
    case RecommendationType.RESTAURANT:
      Icon = Store;
      color = 'bg-amber-100 text-amber-700';
      label = 'Restaurant';
      break;
    case RecommendationType.PODCAST:
      Icon = Headphones;
      color = 'bg-blue-200 text-blue-700';
      label = 'Podcast';
      break;
    case RecommendationType.OTHER:
      Icon = HelpCircle;
      label = customCategory || 'Other';
      break;
  }

  return (
    <div className={cn(
      'inline-flex items-center rounded-full gap-1.5',
      color,
      paddingClass,
      className
    )}>
      <Icon size={iconSize} />
      {showLabel && <span className={cn('font-medium', textClass)}>{label}</span>}
    </div>
  );
};

export default CategoryTag;
