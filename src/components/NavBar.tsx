
import { useLocation, Link } from "react-router-dom";
import { Book, Home, LogOut, Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import LoadingSpinner from "./LoadingSpinner";

const NavBar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    try {
      setIsSigningOut(true);
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  // Define navigation links based on authentication status
  const navLinks = user ? [
    // For authenticated users, only show Recommendations
    { path: "/recommendations", label: "Recommendations", icon: Book }
  ] : [
    // For unauthenticated users, show both Home and Demo
    { path: "/", label: "Home", icon: Home },
    { path: "/recommendations", label: "Demo", icon: Book }
  ];

  return (
    <header 
      className={`sticky top-0 z-10 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link to={user ? "/recommendations" : "/"} className="text-xl font-semibold flex items-center gap-2">
              <span className="bg-primary text-primary-foreground p-1 rounded">
                <Book size={16} />
              </span>
              <span>FriendFaves</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path 
                    ? "bg-secondary text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <link.icon size={16} />
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-2">
            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="cursor-pointer"
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? (
                      <LoadingSpinner size={16} className="mr-2" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 px-2 bg-white/95 backdrop-blur-sm shadow-md rounded-md mt-2 animate-in fade-in slide-in-from-top-5 duration-200">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path 
                      ? "bg-secondary text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <link.icon size={16} />
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;
