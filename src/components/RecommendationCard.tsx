
import { Recommendation } from "@/utils/types";
import { Link } from "react-router-dom";
import CategoryTag from "./CategoryTag";
import Avatar from "./Avatar";
import { Calendar } from "lucide-react";
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
        
        <div className="divide-y">
          <div className="p-4 sm:p-5">
            <div className="mb-3">
              <CategoryTag type={type} size="sm" customCategory={customCategory} />
            </div>
            
            <h3 className="text-2xl font-bold line-clamp-1 group-hover:text-primary transition-colors mb-2">
              {title}
            </h3>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar size={14} className="mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          {reason && (
            <div className="p-4 sm:p-5">
              <h4 className="font-medium mb-2">Why They Recommended It</h4>
              <blockquote className="bg-muted p-3 rounded-md italic text-sm">
                "{reason}"
              </blockquote>
              
              <div className="mt-4">
                <div className="flex justify-end">
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm">Recommended By</div>
                    </div>
                    <Avatar person={recommender} size="sm" showName={true} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {!reason && (
            <div className="p-4 sm:p-5">
              <div className="flex justify-end">
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm">Recommended By</div>
                  </div>
                  <Avatar person={recommender} size="sm" showName={true} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

RecommendationCard.displayName = "RecommendationCard";

export default RecommendationCard;
