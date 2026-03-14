import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const API_URL = "http://localhost:5000/api";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    const validateToken = async () => {
      if (!isMountedRef.current) return;
      
      setIsChecking(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        // Clear any stale data
        localStorage.removeItem("user");
        if (isMountedRef.current) {
          setIsAuthenticated(false);
          setIsChecking(false);
        }
        return;
      }

      // Validate token with backend
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isMountedRef.current) return;

        if (response.ok) {
          const data = await response.json();
          // Update user data if available
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear it
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Network error or invalid token
        if (isMountedRef.current) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
        }
      } finally {
        if (isMountedRef.current) {
          setIsChecking(false);
        }
      }
    };

    validateToken();

    // Listen for storage changes (logout from another tab/window)
    const handleStorageChange = (e) => {
      if (e.key === "token" && !e.newValue && isMountedRef.current) {
        // Token was removed, re-validate
        validateToken();
      }
    };

    // Listen for custom logout event
    const handleLogout = () => {
      if (isMountedRef.current) {
        setIsAuthenticated(false);
        setIsChecking(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("logout", handleLogout);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("logout", handleLogout);
    };
  }, [location.pathname]);

  // Show nothing while checking
  if (isChecking) {
    return null;
  }

  // Redirect to signin if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
}

