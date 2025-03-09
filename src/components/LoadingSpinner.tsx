
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
  text?: string;
}

const LoadingSpinner = ({ className, size = 24, text }: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-4", className)}>
      <Loader2 className="animate-spin text-primary" size={size} />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
