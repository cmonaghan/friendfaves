
import { Recommendation } from "@/utils/types";
import { Link } from "react-router-dom";
import CategoryTag from "./CategoryTag";
import { Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import Avatar from "./Avatar";

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
      <Card
        ref={ref}
        className={cn(
          'group relative overflow-hidden border shadow-sm transition-all hover:shadow-md',
          className
        )}
      >
        <Link to={`/recommendation/${id}`} className="absolute inset-0 z-10" aria-label={title}></Link>
        
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex justify-between items-start mb-1">
            <CategoryTag type={type} customCategory={customCategory} />
            {isCompleted && (
              <div className="flex items-center text-green-500 text-sm font-medium">
                <CheckCircle size={16} className="mr-1" />
                <span>Completed</span>
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          {reason && (
            <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
              {reason}
            </p>
          )}
        </CardHeader>
        
        <CardFooter className="pt-3 pb-4 px-5 flex justify-between items-center border-t">
          <Avatar person={recommender} size="sm" showName={true} />
          <div className="flex items-center text-muted-foreground text-sm">
            <Calendar size={14} className="mr-1.5" />
            {formattedDate}
          </div>
        </CardFooter>
      </Card>
    );
  }
);

RecommendationCard.displayName = "RecommendationCard";

export default RecommendationCard;
