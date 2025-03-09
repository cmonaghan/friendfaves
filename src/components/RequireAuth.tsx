
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";

interface RequireAuthProps {
  children: React.ReactNode;
  redirectToLogin?: boolean; // Make redirection optional
}

const RequireAuth = ({ children, redirectToLogin = true }: RequireAuthProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user && redirectToLogin) {
        // Redirect to login if not authenticated and redirectToLogin is true
        navigate("/auth", { state: { from: location.pathname } });
      }
      setIsChecking(false);
    }
  }, [user, isLoading, navigate, location, redirectToLogin]);

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
