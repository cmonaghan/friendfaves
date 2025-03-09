
import { Recommendation } from "@/utils/types";
import { Link } from "react-router-dom";
import CategoryTag from "./CategoryTag";
import Avatar from "./Avatar";
import { CheckCircle2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface RecommendationCardProps {
  recommendation: Recommendation;
  className?: string;
}

const RecommendationCard = forwardRef<HTMLDivElement, RecommendationCardProps>(
  ({ recommendation, className }, ref) => {
    const { id, title, type, recommender, reason, date, isCompleted, customCategory } = recommendation;
    
    // Format date
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <div
        ref={ref}
        className={cn(
          'group relative overflow-hidden bg-card rounded-lg border shadow-sm transition-all duration-300 hover:shadow-md',
          isCompleted ? 'opacity-75' : '',
          className
        )}
      >
        <Link to={`/recommendation/${id}`} className="block absolute inset-0 z-10" aria-label={title}></Link>
        
        <div className="p-4 sm:p-5">
          <div className="flex justify-between items-start mb-3">
            <CategoryTag type={type} size="sm" customCategory={customCategory} />
            
            {isCompleted && (
              <span className="text-green-500 flex items-center gap-1 text-sm">
                <CheckCircle2 size={16} />
                Completed
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors mb-2">
            {title}
          </h3>
          
          {reason && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
              {reason}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
            <Avatar person={recommender} size="sm" />
            
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar size={14} className="mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

RecommendationCard.displayName = "RecommendationCard";

export default RecommendationCard;
