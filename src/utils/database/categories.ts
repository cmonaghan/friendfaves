
import { CustomCategory } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { 
  initializeDatabaseStorage, 
  visitorCustomCategoriesStore 
} from './initialization';
import { ALLOW_VISITOR_RECOMMENDATIONS } from '../storageConfig';
import { getCurrentSession, isAuthenticated, getCurrentUserId } from './session';

/**
 * Gets all custom categories for the current user
 */
export const getCustomCategories = async (): Promise<CustomCategory[]> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const userAuthenticated = await isAuthenticated();
  
  if (userAuthenticated) {
    console.log('Fetching user-specific custom categories from database');
    
    // Fetch custom categories from Supabase for authenticated users
    const { data, error } = await supabase
      .from('custom_categories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching custom categories:', error);
      return [];
    }
    
    return data || [];
  } else {
    console.log('Fetching in-memory custom categories for unauthenticated visitor');
    // Return visitor-created custom categories for the current session
    return [...visitorCustomCategoriesStore];
  }
};

/**
 * Adds a new custom category
 */
export const addCustomCategory = async (category: CustomCategory): Promise<CustomCategory | null> => {
  await initializeDatabaseStorage();
  
  // Get the current session
  const userAuthenticated = await isAuthenticated();
  const userId = await getCurrentUserId();
  
  if (userAuthenticated && userId) {
    console.log('Adding user-specific custom category to database');
    
    // Insert the custom category into Supabase
    const { data, error } = await supabase
      .from('custom_categories')
      .insert([{
        type: category.type,
        label: category.label,
        color: category.color || 'bg-gray-50',
        user_id: userId
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding custom category:', error);
      return null;
    }
    
    return data || null;
  } else if (ALLOW_VISITOR_RECOMMENDATIONS) {
    console.log('Adding in-memory custom category for unauthenticated visitor');
    
    // Store in the visitor-specific in-memory store
    const newCategory = {
      ...category,
      id: `temp-${Date.now()}`
    };
    visitorCustomCategoriesStore.push(newCategory);
    return newCategory;
  } else {
    throw new Error('Unauthorized: Cannot add custom categories without logging in');
  }
};
