
export enum RecommendationType {
  BOOK = "book",
  MOVIE = "movie",
  TV = "tv",
  RECIPE = "recipe",
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
  reason: string;
  notes?: string;
  source?: string;
  date: string;
  isCompleted: boolean;
}
