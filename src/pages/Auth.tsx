
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/useRecommendationQueries";
import { resetDatabaseInitialization } from "@/utils/database/initialization";
import { getRecommendations, addRecommendation } from "@/utils/storage";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // Get the tab from the URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get("tab") === "register" ? "register" : "login";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Explicitly reset database initialization state
      resetDatabaseInitialization();
      
      // Force all data to be refetched
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
      queryClient.invalidateQueries({ queryKey: queryKeys.people });
      queryClient.invalidateQueries({ queryKey: queryKeys.customCategories });
      
      toast.success("Signed in successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Error signing in");
      console.error("Error signing in:", error);
    } finally {
      setLoading(false);
    }
  };

  // Transfer visitor recommendations to the user's account
  const transferVisitorRecommendations = async (userId: string) => {
    try {
      // Get all visitor recommendations from storage
      const recommendations = await getRecommendations();
      
      // Filter out visitor recommendations (those not starting with mock- or demo-)
      const visitorRecs = recommendations.filter(rec => 
        !rec.id.startsWith('mock-') && !rec.id.startsWith('demo-') && 
        isNaN(Number(rec.id))
      );
      
      if (visitorRecs.length === 0) {
        console.log("No visitor recommendations to transfer");
        return;
      }
      
      console.log(`Transferring ${visitorRecs.length} recommendations to user account`);
      
      // Add each recommendation to the user's account
      const transferPromises = visitorRecs.map(async (rec) => {
        try {
          // Create a new recommendation with the same data but let the system generate a new ID
          const newRec = {
            ...rec,
            id: crypto.randomUUID(), // Generate a new ID for the recommendation
          };
          
          await addRecommendation(newRec);
          return true;
        } catch (error) {
          console.error("Error transferring recommendation:", error);
          return false;
        }
      });
      
      await Promise.all(transferPromises);
      
      // Invalidate recommendations query to refresh the data
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
      
      toast.success(`Transferred ${visitorRecs.length} recommendations to your account!`);
    } catch (error) {
      console.error("Error transferring visitor recommendations:", error);
      toast.error("Failed to transfer your recommendations");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setLoading(true);
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

      if (error) throw error;
      
      // If we have a session, it means the user was automatically signed in
      if (data.session) {
        // Transfer visitor recommendations to the new user account
        await transferVisitorRecommendations(data.session.user.id);
        
        // Reset database initialization and refresh data
        resetDatabaseInitialization();
        queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
        queryClient.invalidateQueries({ queryKey: queryKeys.people });
        queryClient.invalidateQueries({ queryKey: queryKeys.customCategories });
        
        navigate("/");
      }
      
      toast.success("Account created! Check your email for confirmation.");
    } catch (error: any) {
      toast.error(error.message || "Error creating account");
      console.error("Error signing up:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>RecTrackr</CardTitle>
          <CardDescription>Manage your recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input
                    id="email-login"
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                  <Input
                    id="password-login"
                    type="password"
                    placeholder="Your password"
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
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4">
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
