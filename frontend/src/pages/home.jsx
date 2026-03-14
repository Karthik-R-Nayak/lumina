import "./home.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";

const API_URL = "http://localhost:5000/api";

const resolveProfilePic = (src) => {
  if (!src) {
    return "https://i.pravatar.cc/150?img=5";
  }
  return src.startsWith("http") ? src : `http://localhost:5000${src}`;
};

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    fetchPosts();

    // Listen for logout event to clear state
    const handleLogout = () => {
      setPosts([]);
      navigate("/signin");
    };

    window.addEventListener("logout", handleLogout);
    return () => {
      window.removeEventListener("logout", handleLogout);
    };
  }, [navigate]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let endpoint = `${API_URL}/posts/explore`; // Show all posts by default
      
      // If user is authenticated, use feed endpoint to show posts from followed users + own posts
      if (token) {
        endpoint = `${API_URL}/posts/feed`;
      }

      const headers = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else if (response.status === 401) {
        // If feed fails due to auth, fall back to explore
        if (token && endpoint.includes("/feed")) {
          const exploreResponse = await fetch(`${API_URL}/posts/explore`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          if (exploreResponse.ok) {
            const exploreData = await exploreResponse.json();
            setPosts(exploreData.posts || []);
          }
        }
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to like posts");
      navigate("/signin");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update the post's like status in the list
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, isLiked: data.isLiked, likesCount: data.likesCount }
            : post
        ));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (loading) {
    return (
      <div className="home-container">
        <Navigation />
        <div style={{ textAlign: "center", padding: "50px" }}>Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Navigation />

      {/* Posts */}
      <div className="posts-wrapper">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div className="post-card" key={post.id}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <img 
                  src={resolveProfilePic(post.user?.profilePic)} 
                  alt={post.user?.username || "user"}
                  style={{ 
                    width: "32px", 
                    height: "32px", 
                    borderRadius: "50%",
                    objectFit: "cover"
                  }}
                  onError={(e) => {
                    e.target.src = "https://i.pravatar.cc/150?img=5";
                  }}
                />
                <p className="post-username">@{post.user?.username || "unknown"}</p>
              </div>

              <img 
                src={`http://localhost:5000${post.image}`} 
                alt={post.caption || "post"} 
                className="post-image"
                onClick={() => handlePostClick(post.id)}
                style={{ cursor: "pointer" }}
              />

              <div style={{ padding: "10px 0" }}>
                <p className="post-caption">
                  <strong>@{post.user?.username || "unknown"}</strong> {post.caption || ""}
                </p>
                {post.likesCount > 0 && (
                  <p style={{ marginTop: "5px", color: "#666", fontSize: "0.9rem" }}>
                    {post.likesCount} {post.likesCount === 1 ? "like" : "likes"}
                  </p>
                )}
                {post.commentsCount > 0 && (
                  <p 
                    style={{ 
                      marginTop: "5px", 
                      color: "#666", 
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                    onClick={() => handlePostClick(post.id)}
                  >
                    View all {post.commentsCount} {post.commentsCount === 1 ? "comment" : "comments"}
                  </p>
                )}
              </div>

              <div className="post-actions">
                <button 
                  className="action-btn"
                  onClick={() => handleLike(post.id)}
                >
                  {post.isLiked ? "❤️ Liked" : "🤍 Like"}
                </button>
                <button 
                  className="action-btn"
                  onClick={() => handlePostClick(post.id)}
                >
                  💬 Comment
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <p>No posts available yet.</p>
            <p style={{ marginTop: "10px" }}>
              <button 
                onClick={() => navigate("/upload")}
                style={{
                  padding: "10px 20px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                Upload Your First Post
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
