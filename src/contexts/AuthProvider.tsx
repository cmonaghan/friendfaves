
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/useRecommendationQueries";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state change:", event, newSession);
        
        // Clear all queries when auth state changes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          // Invalidate all queries to force refetch with correct auth state
          queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
          queryClient.invalidateQueries({ queryKey: queryKeys.people });
          queryClient.invalidateQueries({ queryKey: queryKeys.customCategories });
        }
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const signOut = async () => {
    try {
      // First check if session exists before trying to sign out
      if (!session) {
        // If no session exists, just update local state and redirect
        setSession(null);
        setUser(null);
        navigate("/");
        return;
      }
      
      // Attempt to sign out
      const { error } = await supabase.auth.signOut();
      
      // Always clear session state regardless of error
      setSession(null);
      setUser(null);
      
      // Log and handle error if it occurred
      if (error) {
        console.error("Supabase signOut error:", error);
        // Don't throw the error - just log it and continue
      }
      
      // Redirect to home page after sign out
      navigate("/");
    } catch (error) {
      console.error("Error in signOut function:", error);
      // Don't throw the error - just log it to prevent the promise rejection
      // that would trigger the error toast in NavBar
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
