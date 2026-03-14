import "./signup.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  // Clear any existing auth data when visiting signup page
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!name || !email || !username || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, username, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Navigate to home after sign up
        navigate("/home");
      } else {
        alert(data.message || "Sign up failed");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      alert("Error signing up. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">

        <h2 className="logo-text">lumina</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="name"
            className="input-box"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="email address"
            className="input-box"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="username"
            className="input-box"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="password"
            className="input-box"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="confirm password"
            className="input-box"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="signup-btn">sign up</button>
        </form>

        <p className="signin-text">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
