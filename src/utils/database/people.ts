
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
      // Get both the user's own profile and other profiles
      // Fix: Removed reference to non-existent created_by column
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Error fetching people:', error);
        // Return only user-created people from local store, not mock data
        return [...peopleStore.filter(p => !mockPeople.some(mp => mp.id === p.id))];
      }
      
      console.log('Fetched profiles from database:', data);
      
      // Map database results to our Person type and combine with local store
      // (filtering out any mock people from the local store)
      const dbPeople = data.map(profile => ({
        id: profile.id,
        name: profile.name || `Friend ${profile.id.substring(0, 4)}`,
        avatar: profile.avatar_url || '/placeholder.svg'
      }));
      
      const nonMockPeopleStore = peopleStore.filter(p => !mockPeople.some(mp => mp.id === p.id));
      return [...dbPeople, ...nonMockPeopleStore];
    }
    
    // Return only user-created people from local store, not mock data
    return [...peopleStore.filter(p => !mockPeople.some(mp => mp.id === p.id))];
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
    
    // Get the current user's ID to mark as creator
    const session = await getCurrentSession();
    
    if (!session) {
      console.error('No session found while trying to add person');
      peopleStore.push(personWithPlaceholder);
      return personWithPlaceholder;
    }
    
    // Add to Supabase database - ensure we're using upsert to handle existing profiles
    // and tracking which user created this profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: personWithPlaceholder.id,
        name: personWithPlaceholder.name,
        avatar_url: personWithPlaceholder.avatar,
        created_by: session.user.id, // Add the creator's ID
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error('Error adding person to database:', error);
      console.error('Error details:', error.details, error.message, error.hint);
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
