import { useState, useEffect } from "react";
import "./search.css";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";

const API_URL = "http://localhost:5000/api";

export default function Search() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("all"); // 'all', 'posts', 'users'

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.trim() !== "") {
        performSearch();
      } else {
        setPosts([]);
        setUsers([]);
      }
    }, 300); 

    return () => clearTimeout(searchTimeout);
    
  }, [query, searchType]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(query)}&type=${searchType}`,
        {
          method: "GET",
          headers: headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
        setUsers(data.users || []);
      } else {
        console.error("Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="search-page">
      <Navigation />
      <div className="search-shell">
        <h2 className="search-title">Search</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search posts by caption or users..."
        value={query}
        onChange={handleSearch}
        className="search-input"
      />

      {/* Search Type Tabs */}
      <div style={{ display: "flex", gap: "10px", margin: "20px 0", justifyContent: "center" }}>
        <button
          onClick={() => setSearchType("all")}
          style={{
            padding: "8px 16px",
            border: "1px solid #ccc",
            background: searchType === "all" ? "#007bff" : "white",
            color: searchType === "all" ? "white" : "black",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          All
        </button>
        <button
          onClick={() => setSearchType("posts")}
          style={{
            padding: "8px 16px",
            border: "1px solid #ccc",
            background: searchType === "posts" ? "#007bff" : "white",
            color: searchType === "posts" ? "white" : "black",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Posts
        </button>
        <button
          onClick={() => setSearchType("users")}
          style={{
            padding: "8px 16px",
            border: "1px solid #ccc",
            background: searchType === "users" ? "#007bff" : "white",
            color: searchType === "users" ? "white" : "black",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Users
        </button>
      </div>

      {loading && <div style={{ textAlign: "center", padding: "20px" }}>Searching...</div>}

      {/* Posts Results */}
      {(searchType === "all" || searchType === "posts") && posts.length > 0 && (
        <div>
          <h3 style={{ margin: "20px 0 10px 0" }}>Posts</h3>
          <div className="search-grid">
            {posts.map((post) => (
              <Link key={post.id} to={`/post/${post.id}`} className="search-card">
                <img
                  src={`http://localhost:5000${post.image}`}
                  alt={post.caption || "post"}
                  className="search-image"
                />
                <p className="search-label">
                  {post.caption || "No caption"}
                </p>
                <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "5px" }}>
                  by @{post.user?.username || "unknown"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Users Results */}
      {(searchType === "all" || searchType === "users") && users.length > 0 && (
        <div>
          <h3 style={{ margin: "20px 0 10px 0" }}>Users</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {users.map((user) => (
              <Link
                key={user.id}
                to={`/account`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <img
                  src={user.profilePic || "https://i.pravatar.cc/150?img=5"}
                  alt={user.username}
                  style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                />
                <div>
                  <strong>{user.name || user.username}</strong>
                  <p style={{ margin: "5px 0 0 0", color: "#666" }}>@{user.username}</p>
                  {user.bio && <p style={{ margin: "5px 0 0 0", fontSize: "0.9rem" }}>{user.bio}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!loading && query.trim() !== "" && posts.length === 0 && users.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          No results found for "{query}"
        </div>
      )}

        {query.trim() === "" && (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            Start typing to search posts by caption or users...
          </div>
        )}
      </div>
    </div>
  );
}
