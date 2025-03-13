
import { CustomCategory } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { 
  initializeDatabaseStorage, 
  visitorCustomCategoriesStore,
  addVisitorCustomCategory
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
    
    // Map the data to include default icon if not present in the database
    return (data || []).map(category => ({
      ...category,
      // Add the icon property, it might not exist in the database schema
      icon: 'icon' in category ? category.icon : 'HelpCircle'
    }));
  } else {
    console.log('Fetching in-memory custom categories for unauthenticated visitor', visitorCustomCategoriesStore);
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
    
    try {
      // Check if the table has the 'icon' column
      const { data: columnInfo, error: columnError } = await supabase
        .from('custom_categories')
        .select('*')
        .limit(1);
        
      // Only include the icon field if it exists in the database schema
      const hasIconColumn = columnInfo && columnInfo.length > 0 && 'icon' in columnInfo[0];
      
      // Create base category data
      const categoryData: any = {
        type: category.type,
        label: category.label,
        color: category.color || 'bg-gray-50',
        user_id: userId
      };
      
      // Only add icon if the column exists
      if (hasIconColumn) {
        categoryData.icon = category.icon || 'HelpCircle';
      }
      
      console.log('Saving category with data:', categoryData);
      
      // Insert the custom category into Supabase
      const { data, error } = await supabase
        .from('custom_categories')
        .insert([categoryData])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding custom category:', error);
        return null;
      }
      
      // Return the category with the default icon if not in database
      return {
        ...data,
        // Add the icon property using optional chaining and nullish coalescing
        icon: ('icon' in data ? data.icon : null) || category.icon || 'HelpCircle'
      };
    } catch (error) {
      console.error('Error in addCustomCategory:', error);
      return null;
    }
  } else if (ALLOW_VISITOR_RECOMMENDATIONS) {
    console.log('Adding in-memory custom category for unauthenticated visitor');
    
    // Store in the visitor-specific in-memory store
    const newCategory = {
      ...category,
      id: `temp-${Date.now()}`
    };
    
    // Add to the visitor custom categories store
    addVisitorCustomCategory(newCategory);
    
    console.log('Updated visitor categories:', visitorCustomCategoriesStore);
    return newCategory;
  } else {
    throw new Error('Unauthorized: Cannot add custom categories without logging in');
  }
};
