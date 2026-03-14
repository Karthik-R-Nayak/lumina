import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navigation.css";

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;
  const token = localStorage.getItem("token");

  const handleProtectedLinkClick = (e, path) => {
    if (!token) {
      e.preventDefault();
      navigate("/signin");
    }
  };

  return (
    <nav className="app-nav">
      <div className="nav-brand">lumina</div>
      <div className="nav-links">
        <Link 
          to="/home" 
          className={`nav-link ${isActive("/home") ? "active" : ""}`}
          onClick={(e) => handleProtectedLinkClick(e, "/home")}
        >
           Home
        </Link>
        <Link to="/explore" className={`nav-link ${isActive("/explore") ? "active" : ""}`}>
           Explore
        </Link>
        <Link 
          to="/search" 
          className={`nav-link ${isActive("/search") ? "active" : ""}`}
          onClick={(e) => handleProtectedLinkClick(e, "/search")}
        >
           Search
        </Link>
        <Link 
          to="/upload" 
          className={`nav-link ${isActive("/upload") ? "active" : ""}`}
          onClick={(e) => handleProtectedLinkClick(e, "/upload")}
        >
           Upload
        </Link>
        <Link 
          to="/account" 
          className={`nav-link ${isActive("/account") ? "active" : ""}`}
          onClick={(e) => handleProtectedLinkClick(e, "/account")}
        >
           Account
        </Link>
        <Link 
          to="/settings" 
          className={`nav-link ${isActive("/settings") ? "active" : ""}`}
          onClick={(e) => handleProtectedLinkClick(e, "/settings")}
        >
           Settings
        </Link>
      </div>
    </nav>
  );
}

