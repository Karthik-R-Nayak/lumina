import "./explore.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";

const API_URL = "http://localhost:5000/api";

const getImageSrc = (image) =>
  image?.startsWith("http") ? image : `http://localhost:5000${image}`;

export default function Explore() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExplorePosts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/posts/explore`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        });

        if (!response.ok) {
          throw new Error("Failed to load explore feed");
        }

        const data = await response.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Explore fetch error", err);
        setError(err.message || "Failed to load explore feed");
      } finally {
        setLoading(false);
      }
    };

    fetchExplorePosts();
  }, []);

  const filteredPosts = useMemo(() => {
    if (!query.trim()) return posts;
    const q = query.toLowerCase();
    return posts.filter((post) => {
      const username = post.user?.username || "";
      const caption = post.caption || "";
      return (
        username.toLowerCase().includes(q) ||
        caption.toLowerCase().includes(q)
      );
    });
  }, [posts, query]);

  const handleCardClick = (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    navigate(`/post/${id}`);
  };

  return (
    <div className="explore-page">
      <Navigation />
      <header className="explore-hero">
        <div>
          <p className="pill pill--soft">Explore</p>
          <h1>See what the Lumina community is pinning today.</h1>
          <p>
            Follow fresh palettes, references, and visual stories curated by
            artists, designers, and founders around the globe.
          </p>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search moods, creators, colors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      <section className="explore-pins">
        {loading ? (
          <p className="empty-state">Loading community posts…</p>
        ) : error ? (
          <p className="empty-state">{error}</p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post, index) => (
            <article
              key={post.id}
              className={`pin-card pin-card--${(index % 4) + 1}`}
              onClick={() => handleCardClick(post.id)}
            >
              <img
                src={getImageSrc(post.image)}
                alt={post.caption || "explore post"}
                loading="lazy"
              />
              <div className="pin-meta">
                <h3>{post.caption || "Untitled mood"}</h3>
                <p>{post.user?.username ? `@${post.user.username}` : "Unknown"}</p>
                <div className="pin-tags">
                  <span>{post.likesCount || 0} likes</span>
                  <span>{post.commentsCount || 0} comments</span>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="empty-state">No posts found for that search.</p>
        )}
      </section>
    </div>
  );
}
