
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthProvider';

const HeroSection = () => {
  const { user } = useAuth();
  
  return (
    <section className="mb-12 py-12 sm:py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
          Track <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">recommendations</span> from friends
        </h1>
        <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
          Keep track of all the amazing books, movies, TV shows, and recipes your friends recommend to you in one beautiful place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/auth">
              Sign Up
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8">
            <Link to="/recommendations">
              {user ? "Browse All" : "Browse Examples"}
            </Link>
          </Button>
        </div>
        <p className="mt-6 text-base text-muted-foreground max-w-2xl mx-auto">
          Try it out with sample data below. Any recommendations you create as a guest will be reset when you refresh the page.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
