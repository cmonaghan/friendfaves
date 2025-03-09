
import { useLocation, Link } from "react-router-dom";
import { Book, Home, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const NavBar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/recommendations", label: "Recommendations", icon: Book }
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
            <Link to="/" className="text-xl font-semibold flex items-center gap-2">
              <span className="bg-primary text-primary-foreground p-1 rounded">
                <Book size={16} />
              </span>
              <span>Recommends</span>
            </Link>
          </div>
          
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
          
          <div className="flex">
            <Button asChild size="sm" className="gap-1 rounded-full shadow-sm">
              <Link to="/add">
                <Plus size={16} />
                <span>Add</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
