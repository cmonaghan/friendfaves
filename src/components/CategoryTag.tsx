
import { RecommendationType } from "@/utils/types";
import { Book, Film, Tv, Utensils, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryTagProps {
  type: RecommendationType;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const CategoryTag = ({ type, className, showLabel = true, size = 'md' }: CategoryTagProps) => {
  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 20;
  const paddingClass = size === 'sm' ? 'p-1' : size === 'md' ? 'p-1.5' : 'p-2';
  const textClass = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';
  
  let Icon = HelpCircle;
  let color = 'bg-gray-100 text-gray-700';
  let label = 'Other';

  switch (type) {
    case RecommendationType.BOOK:
      Icon = Book;
      color = 'bg-blue-50 text-blue-700';
      label = 'Book';
      break;
    case RecommendationType.MOVIE:
      Icon = Film;
      color = 'bg-purple-50 text-purple-700';
      label = 'Movie';
      break;
    case RecommendationType.TV:
      Icon = Tv;
      color = 'bg-pink-50 text-pink-700';
      label = 'TV Show';
      break;
    case RecommendationType.RECIPE:
      Icon = Utensils;
      color = 'bg-green-50 text-green-700';
      label = 'Recipe';
      break;
  }

  return (
    <div className={cn(
      'inline-flex items-center rounded-full',
      color,
      paddingClass,
      className
    )}>
      <Icon size={iconSize} className={showLabel ? 'mr-1' : ''} />
      {showLabel && <span className={cn('font-medium', textClass)}>{label}</span>}
    </div>
  );
};

export default CategoryTag;
