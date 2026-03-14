import { useState } from "react";
import "./setting.css";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      // Clear all auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Dispatch logout event to notify all components
      window.dispatchEvent(new Event("logout"));
      
      // Force a page reload to clear all component state
      window.location.href = "/signin";
    }
  };

  return (
    <div className="settings-container">
      <Navigation />
      <div className="settings-shell">
        <h2 className="settings-title">Settings</h2>

        {/* Options */}
        <div className="settings-card">
          <div className="settings-row">
            <p>Dark Mode</p>
            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-row">
            <p>Notifications</p>
            <label className="switch">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-row">
            <p>Privacy</p>
            <span className="arrow">›</span>
          </div>

          <div className="settings-row">
            <p>About Lumina</p>
            <span className="arrow">›</span>
          </div>
        </div>

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
}
