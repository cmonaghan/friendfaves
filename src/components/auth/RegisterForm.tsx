
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/useRecommendationQueries";
import { resetDatabaseInitialization } from "@/utils/database/initialization";
import { transferVisitorRecommendations } from "./VisitorRecommendationTransfer";
import { AlertCircle } from "lucide-react";

interface RegisterFormProps {
  defaultEmail?: string;
  defaultPassword?: string;
  defaultName?: string;
}

const RegisterForm = ({ 
  defaultEmail = "", 
  defaultPassword = "", 
  defaultName = "" 
}: RegisterFormProps) => {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [name, setName] = useState(defaultName);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setErrorMessage(null);
    
    if (!email || !password || !name) {
      setErrorMessage("Please fill in all fields");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Starting registration process...");
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        // Handle rate limiting errors specifically
        if (error.status === 429) {
          setErrorMessage(`Rate limit exceeded: ${error.message}`);
          console.log("Rate limit error:", error);
        } else {
          setErrorMessage(error.message || "Error creating account");
          console.error("Error signing up:", error);
        }
        return;
      }
      
      // If we have a session, it means the user was automatically signed in
      if (data.session) {
        console.log("User automatically signed in with id:", data.session.user.id);
        console.log("Starting visitor recommendation transfer process...");
        
        try {
          // Transfer visitor recommendations to the new user account
          await transferVisitorRecommendations(data.session.user.id, queryClient);
          
          // Reset database initialization and refresh data
          console.log("Resetting database initialization...");
          resetDatabaseInitialization();
          
          console.log("Invalidating queries...");
          await queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
          await queryClient.invalidateQueries({ queryKey: queryKeys.people });
          await queryClient.invalidateQueries({ queryKey: queryKeys.customCategories });
          
          console.log("Registration and transfer process complete, redirecting to recommendations page...");
          
          // Add a longer delay to allow the database to update and queries to complete
          setTimeout(() => {
            navigate("/recommendations");
            toast.success("Account created successfully! Your recommendations have been transferred.");
          }, 2000);
        } catch (transferError) {
          console.error("Error transferring recommendations:", transferError);
          toast.error("Account created, but there was an issue transferring your recommendations.");
          setTimeout(() => navigate("/"), 1000);
        }
      } else {
        // Handle case where confirmation email was sent
        toast.success("Account created! Check your email for confirmation.");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Error creating account");
      console.error("Error in registration process:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-800 text-sm flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name-register">Name</Label>
        <Input
          id="name-register"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email-register">Email</Label>
        <Input
          id="email-register"
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password-register">Password</Label>
        <Input
          id="password-register"
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
};

export default RegisterForm;
