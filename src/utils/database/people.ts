
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
      // First fetch user's friends from user_friends table
      const { data: userFriends, error: userFriendsError } = await supabase
        .from('user_friends')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (userFriendsError) {
        console.error('Error fetching user friends:', userFriendsError);
      }
      
      // Then get profiles from the profiles table, excluding the current user
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', session.user.id); // Exclude the current user's profile
      
      // Combine results from both sources
      const dbPeople: Person[] = [];
      
      // Add user's personal friends first
      if (userFriends && userFriends.length > 0) {
        userFriends.forEach(friend => {
          dbPeople.push({
            id: friend.id,
            name: friend.friend_name,
            avatar: friend.avatar_url || '/placeholder.svg'
          });
        });
      }
      
      // Then add profiles from the profiles table
      if (!profilesError && profilesData) {
        profilesData.forEach(profile => {
          // Check if this profile isn't already included as a user friend
          if (!dbPeople.some(p => p.id === profile.id)) {
            dbPeople.push({
              id: profile.id,
              name: profile.name || `Friend ${profile.id.substring(0, 4)}`,
              avatar: profile.avatar_url || '/placeholder.svg'
            });
          }
        });
      }
      
      // If database queries failed, fall back to local store (excluding mock data and current user)
      if ((userFriendsError || profilesError) && peopleStore.length > 0) {
        const nonMockPeopleStore = peopleStore.filter(p => 
          !mockPeople.some(mp => mp.id === p.id) && 
          p.id !== session.user.id
        );
        
        return [...dbPeople, ...nonMockPeopleStore];
      }
      
      return dbPeople;
    }
    
    // Fall back to local store (excluding mock data) if session couldn't be retrieved
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
    
    // Get the current user's ID
    const session = await getCurrentSession();
    
    if (!session) {
      console.error('No session found while trying to add person');
      peopleStore.push(personWithPlaceholder);
      return personWithPlaceholder;
    }
    
    // For authenticated users, add to user_friends table
    const { data, error } = await supabase
      .from('user_friends')
      .insert({
        id: personWithPlaceholder.id,
        user_id: session.user.id,
        friend_name: personWithPlaceholder.name,
        avatar_url: personWithPlaceholder.avatar,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding person to user_friends table:', error);
      console.error('Error details:', error.details, error.message, error.hint);
      // Still add to local store even if database insert fails
      peopleStore.push(personWithPlaceholder);
    } else {
      console.log('Successfully added person to user_friends table:', data.id);
      // Map the returned data to our Person type
      return {
        id: data.id,
        name: data.friend_name,
        avatar: data.avatar_url
      };
    }
  } else {
    console.log('Adding mock person for unauthenticated user');
    // For unauthenticated users, add to mock data
    mockPeople.push(personWithPlaceholder);
  }
  
  console.log('Added person', personWithPlaceholder.id);
  return personWithPlaceholder;
};
