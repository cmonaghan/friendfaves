
import { CustomCategory } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { isAuthenticated } from './session';
import { visitorCustomCategoriesStore, addVisitorCustomCategory } from './initialization';
import { ALLOW_VISITOR_RECOMMENDATIONS } from '../storageConfig';

/**
 * Gets all custom categories
 */
export const getCustomCategories = async (): Promise<CustomCategory[]> => {
  const userAuthenticated = await isAuthenticated();
  
  if (userAuthenticated) {
    // Fetch categories from database
    const { data, error } = await supabase
      .from('custom_categories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching custom categories:', error);
      return [];
    }
    
    // Map database results to CustomCategory type, ensuring icon property is handled
    const categories: CustomCategory[] = data.map(category => ({
      id: category.id,
      type: category.type,
      label: category.label,
      color: category.color || 'bg-gray-50',
      // Add a default icon if not present in the database
      icon: 'HelpCircle'
    }));
    
    return categories;
  } else {
    // For unauthenticated visitors, return the in-memory categories
    return visitorCustomCategoriesStore;
  }
};

/**
 * Adds a new custom category
 */
export const addCustomCategory = async (category: CustomCategory): Promise<CustomCategory | null> => {
  const userAuthenticated = await isAuthenticated();
  
  if (userAuthenticated) {
    // Add to database for authenticated users
    const { data, error } = await supabase
      .from('custom_categories')
      .insert({
        type: category.type,
        label: category.label,
        color: category.color || 'bg-gray-50',
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding custom category:', error);
      return null;
    }
    
    // Map database result to CustomCategory type
    const addedCategory: CustomCategory = {
      id: data.id,
      type: data.type,
      label: data.label,
      color: data.color || 'bg-gray-50',
      // Add a default icon if not present in the database
      icon: 'HelpCircle'
    };
    
    return addedCategory;
  } else if (ALLOW_VISITOR_RECOMMENDATIONS) {
    // For unauthenticated visitors, store in memory
    const newCategoryWithId = {
      ...category,
      id: crypto.randomUUID() // Generate a temporary ID
    };
    
    // Add to the in-memory store
    addVisitorCustomCategory(newCategoryWithId);
    
    return newCategoryWithId;
  } else {
    console.log('Unauthorized: Cannot add categories without logging in');
    return null;
  }
};
