
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
    
    // Fetch people from the database
    const session = await getCurrentSession();
    
    if (session) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'eq', session.user.id);
      
      if (error) {
        console.error('Error fetching people:', error);
        return [...peopleStore];
      }
      
      // Map database results to our Person type and combine with local store
      const dbPeople = data.map(profile => ({
        id: profile.id,
        name: profile.name || `Friend ${profile.id.substring(0, 4)}`,
        avatar: profile.avatar_url || '/placeholder.svg'
      }));
      
      return [...dbPeople, ...peopleStore];
    }
    
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
  
  // Only use placeholder for user-created friends
  const personWithPlaceholder = {
    ...person,
    avatar: person.avatar || '/placeholder.svg' // Use the placeholder SVG that comes with the project
  };
  
  // Get the current session
  const userAuthenticated = await isAuthenticated();
  
  if (userAuthenticated) {
    console.log('Adding user-specific person to database');
    
    // Add to Supabase database - ensure we're using upsert to handle existing profiles
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: personWithPlaceholder.id,
        name: personWithPlaceholder.name,
        avatar_url: personWithPlaceholder.avatar,
        // Add updated_at to match the schema requirements
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error('Error adding person to database:', error);
      // Still add to local store even if database insert fails
      peopleStore.push(personWithPlaceholder);
    } else {
      console.log('Successfully added person to database:', personWithPlaceholder.id);
      // Add to local store for immediate use
      peopleStore.push(personWithPlaceholder);
    }
  } else {
    console.log('Adding mock person for unauthenticated user');
    // For mock data, we can keep any provided avatar or add one
    // This ensures mock data still has avatars but user-created friends use placeholders
    mockPeople.push(personWithPlaceholder);
  }
  
  console.log('Added person', personWithPlaceholder.id);
  return personWithPlaceholder;
};
