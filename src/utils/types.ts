
export enum RecommendationType {
  BOOK = "book",
  MOVIE = "movie",
  TV = "tv",
  RECIPE = "recipe",
  RESTAURANT = "restaurant",
  OTHER = "other"
}

export interface Person {
  id: string;
  name: string;
  avatar?: string;
}

export interface NewPerson {
  name: string;
  avatar?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  type: RecommendationType;
  recommender: Person;
  reason?: string; // Make reason optional
  notes?: string;
  source?: string;
  date: string;
  isCompleted: boolean;
  customCategory?: string; // Add field for custom category
}
