import "./signin.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Navigate to home after sign in
        navigate("/home");
      } else {
        alert(data.message || "Sign in failed");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      alert("Error signing in. Please try again.");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2 className="signin-title">lumina</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="name or email address"
            className="signin-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="password"
            className="signin-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <a className="forgot-password" href="#">
            forgot password
          </a>

          <button type="submit" className="signin-btn">sign in</button>
        </form>

        <p className="signup-text">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}




