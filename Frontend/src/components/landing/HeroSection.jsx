import "../../styles/landing/landingpage.css";
import { Link } from "react-router-dom";

function HeroSection() {
  const handleScrollToCategories = () => {
    const section = document.getElementById("categories");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero">
      <div className="hero-pattern"></div>

      <div className="hero-content">
        {/* Hero Text */}
        <div className="hero-text">
          <div className="hero-badge">Authentic Filipino Crafts</div>
          <h1 className="hero-title">
            Discover the <span className="highlight">Beauty</span> of Filipino Craftsmanship
          </h1>
          <p className="hero-subtitle">
            Explore handcrafted treasures from across the Philippines. Each piece tells a story of tradition, artistry, and cultural heritage.
          </p>

          {/* Hero Buttons */}
          <div className="hero-buttons">
            <Link to="/catalog" className="button btn-primary-landing">
              <span>Shop Now →</span>
            </Link>
            <button className="button btn-secondary-landing" onClick={handleScrollToCategories}>
              <span>Explore Collections</span>
            </button>
          </div>

          {/* Hero Stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">5000+</span>
              <span className="stat-label">Unique Products</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Local Artisans</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Provinces</span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="hero-image">
          <div className="hero-image-main"></div>

          {/* Floating Cards */}
          <div className="floating-card floating-card-1">
            <div className="card-icon">⭐</div>
            <div className="card-text">Premium Quality</div>
          </div>

          <div className="floating-card floating-card-2">
            <div className="card-icon">🇵🇭</div>
            <div className="card-text">Authentic Crafts</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
