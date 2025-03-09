
export enum RecommendationType {
  BOOK = "book",
  MOVIE = "movie",
  TV = "tv",
  RECIPE = "recipe",
  RESTAURANT = "restaurant",
  PODCAST = "podcast", 
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
  reason?: string;
  source?: string;
  date: string;
  isCompleted: boolean;
  customCategory?: string;
}

export interface CustomCategory {
  id?: string;
  type: string;
  label: string;
  color?: string;
  icon?: string;
  user_id?: string;
}
