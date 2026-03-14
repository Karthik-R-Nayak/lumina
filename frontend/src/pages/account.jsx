import { useState, useEffect } from "react";
import "./account.css";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";

const API_URL = "http://localhost:5000/api";
const resolveProfilePic = (src) => {
  if (!src) {
    return "https://i.pravatar.cc/150?img=5";
  }
  return src.startsWith("http") ? src : `http://localhost:5000${src}`;
};

export default function Account() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    fetchUserProfile();

  
    const handleLogout = () => {
      setUser(null);
      setPosts([]);
      navigate("/signin");
    };

    window.addEventListener("logout", handleLogout);
    return () => {
      window.removeEventListener("logout", handleLogout);
    };
  }, [navigate]);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/me/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setPosts(data.posts);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/signin");
      } else {
        console.error("Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove the post from the list
        setPosts(posts.filter((post) => post.id !== postId));
        // Update post count
        setUser({ ...user, postsCount: user.postsCount - 1 });
        alert("Post deleted successfully!");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error deleting post. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="account-container">
        <Navigation />
        <div className="account-shell">
          <div style={{ textAlign: "center", padding: "60px" }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="account-container">
        <Navigation />
        <div className="account-shell">
          <div style={{ textAlign: "center", padding: "60px" }}>
            Failed to load profile
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-container">
      <Navigation />
      <div className="account-shell">
        {/* Profile Header */}
        <div className="profile-header">
          <img
            src={resolveProfilePic(user.profilePic)}
            alt="profile"
            className="profile-pic"
            onError={(e) => {
              e.target.src = "https://i.pravatar.cc/150?img=5";
            }}
          />

          <h2 className="profile-username">{user.name || `@${user.username}`}</h2>
          <p className="profile-bio">{user.bio || "No bio yet"}</p>

          {/* Stats */}
          <div className="profile-stats">
            <div>
              <strong>{user.postsCount || posts.length}</strong>
              <span>Posts</span>
            </div>
            <div>
              <strong>{user.followersCount || 0}</strong>
              <span>Followers</span>
            </div>
            <div>
              <strong>{user.followingCount || 0}</strong>
              <span>Following</span>
            </div>
          </div>

          {/* Edit Profile Button */}
          <Link
            to="/edit-profile"
            style={{ marginTop: "20px", display: "inline-block", textDecoration: "none" }}
          >
            <button className="edit-profile-btn">Edit Profile</button>
          </Link>
        </div>

        {/* Posts Grid */}
        <div className="profile-grid">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="profile-grid-item">
                <Link to={`/post/${post.id}`} style={{ display: "block" }}>
                  <img
                    src={`http://localhost:5000${post.image}`}
                    alt={post.caption || "post"}
                    className="profile-grid-img"
                  />
                </Link>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeletePost(post.id);
                  }}
                  title="Delete post"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "50px", width: "100%" }}>
              No posts yet. <Link to="/upload">Upload your first post!</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

