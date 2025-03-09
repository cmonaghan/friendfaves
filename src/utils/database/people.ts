
import { Person } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { 
  initializeDatabaseStorage, 
  peopleStore 
} from './initialization';
import { mockPeople } from '../mockData';
import { getCurrentSession, isAuthenticated } from './session';

/**
 * Gets all people
 */
export const getPeople = async (): Promise<Person[]> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const userAuthenticated = await isAuthenticated();
  
  if (userAuthenticated) {
    console.log('Fetching user-specific people from database');
    // When authenticated, only return user-specific people, not mock people
    return [...peopleStore];
  } else {
    console.log('Fetching mock people for unauthenticated user');
    return [...mockPeople];
  }
};

/**
 * Adds a new person
 */
export const addPerson = async (person: Person): Promise<Person> => {
  await initializeDatabaseStorage();
  
  // Use a placeholder gray avatar instead of random avatars
  const personWithPlaceholder = {
    ...person,
    avatar: person.avatar || '/placeholder.svg' // Use the placeholder SVG that comes with the project
  };
  
  // Get the current session
  const userAuthenticated = await isAuthenticated();
  
  if (userAuthenticated) {
    console.log('Adding user-specific person to database');
    peopleStore.push(personWithPlaceholder);
  } else {
    console.log('Adding mock person for unauthenticated user');
    mockPeople.push(personWithPlaceholder);
  }
  
  console.log('Added person', personWithPlaceholder.id);
  return personWithPlaceholder;
};
