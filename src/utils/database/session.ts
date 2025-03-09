
import { supabase } from '@/integrations/supabase/client';

/**
 * Gets the current session information
 */
export const getCurrentSession = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData?.session;
};

/**
 * Checks if the user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return !!session;
};

/**
 * Gets the current user ID
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const session = await getCurrentSession();
  return session?.user?.id || null;
};
