
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CreateAccountPrompt = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-8 space-y-4">
      <p className="text-base text-muted-foreground">
        Create an account to save these recommendations and access them from any device
      </p>
      <Button asChild className="px-8">
        <Link to="/auth?tab=register">Create account</Link>
      </Button>
    </div>
  );
};

export default CreateAccountPrompt;
