
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthProvider';

const HeroSection = () => {
  const { user } = useAuth();
  
  return (
    <section className="mb-8 py-12 sm:py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
          Track <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">recommendations</span> from friends
        </h1>
        <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
          Keep track of all the amazing books, movies, TV shows, podcasts, and restaurants that your friends recommend to you in one beautiful place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/auth">
              Get Started
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8">
            <Link to="/recommendations">
              See the Demo
            </Link>
          </Button>
        </div>
        <p className="text-base text-muted-foreground mt-8 max-w-2xl mx-auto">
          Save your first recommendation below, or try out the demo to see how the app works first.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
