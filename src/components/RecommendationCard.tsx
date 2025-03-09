
import { Recommendation } from "@/utils/types";
import { Link } from "react-router-dom";
import CategoryTag from "./CategoryTag";
import { Calendar } from "lucide-react";
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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Card
        ref={ref}
        className={cn(
          'group relative overflow-hidden border shadow-sm transition-all hover:shadow-md',
          isCompleted ? 'opacity-75' : '',
          className
        )}
      >
        <Link to={`/recommendation/${id}`} className="absolute inset-0 z-10" aria-label={title}></Link>
        
        <CardHeader className="pb-2 pt-5">
          <div className="mb-2">
            <CategoryTag type={type} customCategory={customCategory} />
          </div>
          
          <h3 className="text-3xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center text-muted-foreground text-sm mt-1">
            <Calendar size={16} className="mr-2" />
            {formattedDate}
          </div>
        </CardHeader>
        
        {reason && (
          <CardContent className="pb-6 pt-2">
            <h4 className="text-xl font-semibold mb-2">Why They Recommended It</h4>
            <blockquote className="pl-4 py-2 border-l-4 border-muted-foreground/30 italic text-muted-foreground">
              "{reason}"
            </blockquote>
          </CardContent>
        )}
        
        <CardFooter className={cn("flex justify-end border-t py-4", !reason && "mt-3")}>
          <div className="flex items-center gap-3">
            <div className="text-right mr-1">
              <div className="text-muted-foreground">Recommended By</div>
            </div>
            <Avatar person={recommender} size="md" showName={true} />
          </div>
        </CardFooter>
      </Card>
    );
  }
);

RecommendationCard.displayName = "RecommendationCard";

export default RecommendationCard;
