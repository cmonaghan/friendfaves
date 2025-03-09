
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="mb-12 py-12 sm:py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-block mb-4 px-3 py-1 bg-secondary text-sm font-medium rounded-full">
          Never Forget a Good Recommendation
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
          Track <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">recommendations</span> from friends
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Keep track of all the amazing books, movies, TV shows, and recipes your friends recommend to you in one beautiful place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/add">
              Add Recommendation
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8">
            <Link to="/recommendations">
              Browse All
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
