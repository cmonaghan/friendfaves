
import { Person, Recommendation, RecommendationType } from './types';

// Original mock data - used to seed localStorage on first load
export const mockPeople: Person[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: '3',
    name: 'Emma Thompson',
    avatar: 'https://i.pravatar.cc/150?img=3'
  },
  {
    id: '4',
    name: 'David Rodriguez',
    avatar: 'https://i.pravatar.cc/150?img=4'
  }
];

export const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Project Hail Mary',
    type: RecommendationType.BOOK,
    recommender: mockPeople[0],
    reason: 'Incredible sci-fi with actual science. The character development is amazing and there are some great twists.',
    notes: 'Available on Kindle Unlimited',
    date: '2023-05-15',
    isCompleted: false
  },
  {
    id: '2',
    title: 'Everything Everywhere All at Once',
    type: RecommendationType.MOVIE,
    recommender: mockPeople[1],
    reason: 'Mind-bending multiverse story with heart. It\'s funny, sad, and thought-provoking all at once.',
    source: 'Available on Prime Video',
    date: '2023-06-22',
    isCompleted: true
  },
  {
    id: '3',
    title: 'Succession',
    type: RecommendationType.TV,
    recommender: mockPeople[2],
    reason: 'Best drama on television. The writing and acting are phenomenal.',
    notes: 'They said to give it at least 3 episodes',
    source: 'HBO Max',
    date: '2023-07-10',
    isCompleted: false
  },
  {
    id: '4',
    title: 'Overnight Oats with Berries',
    type: RecommendationType.RECIPE,
    recommender: mockPeople[3],
    reason: 'Quick, healthy breakfast that you can prep the night before. Tastes amazing with fresh berries.',
    source: 'They\'ll send me the link',
    date: '2023-08-05',
    isCompleted: true
  },
  {
    id: '5',
    title: 'The Bear',
    type: RecommendationType.TV,
    recommender: mockPeople[0],
    reason: 'Intense, realistic look at restaurant kitchens with great characters and storytelling.',
    source: 'Hulu',
    date: '2023-08-12',
    isCompleted: false
  }
];
