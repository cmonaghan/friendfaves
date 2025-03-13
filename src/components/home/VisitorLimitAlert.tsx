
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface VisitorLimitAlertProps {
  recommendationsCount: number;
}

const VisitorLimitAlert = ({ recommendationsCount }: VisitorLimitAlertProps) => {
  return (
    <Card className="max-w-lg mx-auto mt-8 shadow-sm border-amber-200 bg-amber-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3 text-amber-800">
          <AlertCircle size={20} />
          <h3 className="text-lg font-medium">You've reached the limit</h3>
        </div>
        <p className="mb-6 text-amber-700">
          You've saved {recommendationsCount} recommendations. Create an account to save unlimited 
          recommendations and access them from any device!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="w-full">
            <Link to="/auth?tab=register">Create Account</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/recommendations">View My Recommendations</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitorLimitAlert;
