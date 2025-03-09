
import { Person, Recommendation, RecommendationType } from './types';

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
  },
  {
    id: '6',
    title: 'Nobu',
    type: RecommendationType.RESTAURANT,
    recommender: mockPeople[1],
    reason: 'Amazing sushi and Japanese fusion cuisine. The black cod with miso is their signature dish and it\'s incredible.',
    source: 'Downtown location',
    date: '2023-09-18',
    isCompleted: false
  },
  {
    id: '7',
    title: 'The Daily',
    type: RecommendationType.PODCAST,
    recommender: mockPeople[2],
    reason: 'Great daily news podcast that breaks down complex topics in an accessible way.',
    source: 'Spotify or Apple Podcasts',
    date: '2023-10-05',
    isCompleted: true
  },
  {
    id: '8',
    title: 'Farm To Table',
    type: RecommendationType.RESTAURANT,
    recommender: mockPeople[3],
    reason: 'Incredible seasonal menu that changes based on local ingredients. The atmosphere is cozy and service is excellent.',
    source: 'West side location',
    date: '2023-11-12',
    isCompleted: false
  },
  {
    id: '9',
    title: 'SmartLess',
    type: RecommendationType.PODCAST,
    recommender: mockPeople[0],
    reason: 'Hilarious conversations with surprise celebrity guests. The hosts have great chemistry.',
    source: 'Any podcast app',
    date: '2023-12-03',
    isCompleted: false
  }
];

export const getRecommendationsByType = (type: RecommendationType) => {
  return mockRecommendations.filter(rec => rec.type === type);
};

export const getRecommendationById = (id: string) => {
  return mockRecommendations.find(rec => rec.id === id);
};
