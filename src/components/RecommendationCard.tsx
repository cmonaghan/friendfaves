
import { Recommendation } from "@/utils/types";
import { Link } from "react-router-dom";
import CategoryTag from "./CategoryTag";
import Avatar from "./Avatar";
import { 
  Calendar, 
  CheckCircle2, 
  Quote, 
  ExternalLink, 
  ArrowUpRight, 
  Star,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface RecommendationCardProps {
  recommendation: Recommendation;
  className?: string;
}

const RecommendationCard = forwardRef<HTMLDivElement, RecommendationCardProps>(
  ({ recommendation, className }, ref) => {
    const { id, title, type, recommender, reason, date, isCompleted, customCategory, source } = recommendation;
    
    // Format date
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Generate a gradient background based on the type
    const getBackgroundGradient = () => {
      switch (type) {
        case 'book':
          return 'from-blue-50 to-blue-100';
        case 'movie':
          return 'from-purple-50 to-purple-100';
        case 'tv':
          return 'from-pink-50 to-pink-100';
        case 'recipe':
          return 'from-green-50 to-green-100';
        case 'restaurant':
          return 'from-amber-50 to-amber-100';
        case 'podcast':
          return 'from-blue-100 to-indigo-100';
        default:
          return 'from-gray-50 to-gray-100';
      }
    };

    return (
      <Card
        ref={ref}
        className={cn(
          'group relative overflow-hidden transition-all duration-300 hover:shadow-md border hover:border-primary/20',
          isCompleted ? 'opacity-75' : '',
          className
        )}
      >
        <Link to={`/recommendation/${id}`} className="absolute inset-0 z-10" aria-label={title}></Link>
        
        <div className={cn(
          'absolute top-0 left-0 w-1 h-full bg-gradient-to-b',
          getBackgroundGradient()
        )}></div>
        
        <CardContent className="p-0">
          {/* Card Header */}
          <div className="p-5 pb-4 border-b">
            <div className="flex justify-between items-start mb-3">
              <CategoryTag type={type} size="sm" customCategory={customCategory} />
              
              {isCompleted && (
                <span className="text-green-500 flex items-center gap-1 text-sm">
                  <CheckCircle2 size={16} />
                  Completed
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-semibold line-clamp-1 group-hover:text-primary transition-colors mb-1">
              {title}
            </h3>
            
            <div className="flex items-center justify-between mt-3">
              <Avatar person={recommender} size="sm" showName={true} />
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar size={14} className="mr-1" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          
          {/* Card Body */}
          <div className="p-5 pt-4">
            {reason && (
              <div className="relative mb-3">
                <Quote size={16} className="absolute top-0 left-0 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground text-sm pl-6 line-clamp-2">
                  {reason}
                </p>
              </div>
            )}
            
            {/* Card Footer */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm">
                <Star size={16} className="text-amber-500" />
                <span className="font-medium">
                  Recommended
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {source && (
                  <span className="text-primary relative z-20 cursor-pointer flex items-center text-xs font-medium" 
                     onClick={(e) => {
                       e.preventDefault();
                       window.open(source.startsWith('http') ? source : `https://${source}`, '_blank');
                     }}>
                    <ExternalLink size={14} className="mr-1" />
                    Source
                  </span>
                )}
                
                <span className="text-primary flex items-center text-xs font-medium group-hover:underline">
                  Details
                  <ArrowUpRight size={14} className="ml-1" />
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

RecommendationCard.displayName = "RecommendationCard";

export default RecommendationCard;
