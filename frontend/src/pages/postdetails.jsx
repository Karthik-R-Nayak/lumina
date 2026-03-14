import "./postdetails.css";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";

const API_URL = "http://localhost:5000/api";

const resolveProfilePic = (src) => {
  if (!src) {
    return "https://i.pravatar.cc/150?img=5";
  }
  return src.startsWith("http") ? src : `http://localhost:5000${src}`;
};

export default function Postdetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Get current user ID from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUserId(user.id);
    }
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: "GET",
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        const postData = data.post;
        setPost(postData);
        setLiked(postData.isLiked || false);
        setLikesCount(postData.likesCount || 0);
        setComments(postData.comments || []);
        
        // Check if current user is the owner
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (postData.user?.id === user.id || postData.user?._id === user.id) {
            setIsOwner(true);
          }
        }
      } else {
        alert("Post not found");
        navigate("/home");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      alert("Error loading post");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to like posts");
      navigate("/signin");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.isLiked);
        setLikesCount(data.likesCount);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to comment");
      navigate("/signin");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${id}/comment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: comment }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data.comment]);
        setComment("");
      } else {
        alert("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Error adding comment");
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Post deleted successfully!");
        navigate("/account");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error deleting post. Please try again.");
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="postdetails-container">
      <Navigation />
      <div className="postdetails-shell">
        {loading ? (
          <div className="pd-card">
            <div className="pd-placeholder">Loading...</div>
          </div>
        ) : !post ? (
          <div className="pd-card">
            <div className="pd-placeholder">Post not found</div>
          </div>
        ) : (
          <div className="pd-card">
            <div className="pd-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img 
                  src={resolveProfilePic(post.user?.profilePic)} 
                  alt={post.user?.username || "user"}
                  style={{ 
                    width: "40px", 
                    height: "40px", 
                    borderRadius: "50%",
                    objectFit: "cover"
                  }}
                  onError={(e) => {
                    e.target.src = "https://i.pravatar.cc/150?img=5";
                  }}
                />
                <div>@{post.user?.username || "unknown"}</div>
              </div>
              {isOwner && (
                <button className="pd-delete" onClick={handleDeletePost}>
                  Delete Post
                </button>
              )}
            </div>

            <img
              src={`http://localhost:5000${post.image}`}
              alt={post.caption || "post"}
              className="pd-image"
            />

            <div className="pd-caption">
              <strong>@{post.user?.username || "unknown"}</strong> {post.caption || ""}
            </div>

            <div className="pd-time">{formatTime(post.createdAt)}</div>

            <div className="pd-likes">
              <button className="pd-like-btn" onClick={handleLike}>
                {liked ? "❤️" : "🤍"}
              </button>
              {likesCount} {likesCount === 1 ? "like" : "likes"}
            </div>

            <div className="pd-comments">
              {comments.length > 0 ? (
                comments.map((c, i) => (
                  <p key={i}>
                    <strong>@{c.user?.username || "unknown"}</strong> {c.text}
                  </p>
                ))
              ) : (
                <p className="pd-empty">No comments yet. Be the first to comment!</p>
              )}
            </div>

            <form className="pd-add-comment" onSubmit={handleCommentSubmit}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button type="submit">Post</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
