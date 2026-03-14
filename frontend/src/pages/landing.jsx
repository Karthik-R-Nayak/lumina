import { Link } from "react-router-dom";
import "./landing.css";

const heroImages = [
  {
    id: 1,
    title: "Soft Morning Light",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 2,
    title: "Chromatic City",
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 3,
    title: "Wild Botanics",
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 4,
    title: "Future Objects",
    src: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 5,
    title: "Desert Bloom",
    src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 6,
    title: "Digital Noir",
    src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80",
  },
];

function Landing() {
  return (
    <div className="landing-page">
      <header className="hero">
        <nav className="hero__nav">
          <div className="logo">Lumina</div>
          <div className="nav__links">
            <a href="#collections">Collections</a>
            <a href="#features">Features</a>
           
          </div>
          <div className="nav__actions">
            <Link to="/signin" className="ghost-btn">
              Sign in
            </Link>
            <Link to="/signup" className="primary-btn">
              Join 
            </Link>
          </div>
        </nav>
        <div className="hero__content">
          <div className="hero__text">
            <p className="pill">photo sharing app</p>
            <h1>Visual moodboards for every spark of curiosity.</h1>
            <p className="intro">
              Capture ideas, curate references, and share immersive stories with
              a canvas designed to feel as fluid as your imagination.
            </p>
            <div className="hero__actions hero__actions--main">
              <Link to="/signup" className="primary-btn large">
                Start creating
              </Link>
              <Link to="/explore" className="ghost-btn large">
                Browse explore feed
              </Link>
            </div>
          </div>
          <div className="hero__gallery">
            {heroImages.map((image, index) => (
              <figure
                key={image.id}
                className={`hero-pin hero-pin--${(index % 3) + 1}`}
              >
                <img 
                  src={image.src} 
                  alt={image.title} 
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.target.src = "https://via.placeholder.com/500x500/cccccc/666666?text=" + encodeURIComponent(image.title);
                  }}
                />
                <figcaption>
                  <h3>{image.title}</h3>
                  <p>{image.description}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </header>



      <section className="cta">
        <div className="cta__content">
          <p className="pill">Ready when you are</p>
          <h2>Give your ideas a tactile home.</h2>
          <p>
            Lumina is the visual workspace where concept artists, stylists, and
            founders map the mood of what comes next.
          </p>
          <div className="hero__actions hero__actions--main">
            <Link to="/signup" className="primary-btn large">
              Join Lumina
            </Link>
            <Link to="/explore" className="ghost-btn large">
              Continue as guest
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div>Lumina © {new Date().getFullYear()}</div>
        <div className="footer__links">
          <a href="#features">Features</a>
          <Link to="/explore">Explore</Link>
          <Link to="/signup">Join</Link>
        </div>
      </footer>
    </div>
  );
}

export default Landing;

