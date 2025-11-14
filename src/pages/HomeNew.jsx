import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./HomePageNew.css";
import { API_BASE_URL, graceApiFetch } from "../utils/constants";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Fetch featured products for carousel
    const fetchProducts = async () => {
      try {
        // Use graceApiFetch and POST (server expects POST for catalog)
        const res = await graceApiFetch("/shopify/catalog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        setProducts(data.products?.slice(0, 6) || []); // Get first 6 products
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    // safety: if there are no products, don't start the interval
    if (!products.length) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [products]);

  return (
    <div className="home-page">
      {/* — Hero Section — */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-sparkle sparkle-1"></div>
          <div className="hero-sparkle sparkle-2"></div>
          <div className="hero-sparkle sparkle-3"></div>
          
          <h1 className="hero-title">Meet Grace by Atuche Woman</h1>
          <div className="hero-text">
            <p>Welcome to <strong>Atuchewoman</strong>, where fashion meets tradition and sustainability.</p>
            <p>Born from a passion for creating stylish, high-quality clothing for the modern woman, Atuchewoman beautifully blends contemporary trends with timeless cultural influences.</p>

            <p>To make your experience even more personal, we created <strong>Grace</strong> your friendly shopping assistant. She brings warmth and ease to every conversation, helping you explore our collections, discover the perfect outfit, and get answers instantly.</p>

            <p>Since her debut, Grace has helped countless Atuchewomen find outfits that make them feel confident, elegant, and authentically themselves. Every day, she learns and grows, striving to make your experience smoother and more personal.</p>

            <p className="hero-closing">So, take a moment to relax and explore — Grace will take care of the rest. Your perfect look is just a chat away</p>
          </div>
          
          <div className="hero-buttons">
            <NavLink to="/chat" className="btn btn-primary hero-btn">
              <span className="btn-icon"></span>
              Chat with Grace
            </NavLink>
            <Link to="/catalog" className="btn btn-secondary hero-btn">
              <span className="btn-icon"></span>
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* — Product Carousel — */}
      {products.length > 0 && (
        <section className="carousel-section">
          <h2 className="section-title">Featured Collections</h2>
          <div className="product-carousel">
            <div className="carousel-container">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                >
                  <img src={product.image_url} alt={product.title} />
                  <div className="slide-info">
                    <h4>{product.title}</h4>
                    <p>₦{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="carousel-dots">
              {products.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* — What Grace Can Do Section — */}
      <section className="features-section">
        <h2 className="section-title">What Grace Can Do</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3>Personal Styling</h3>
            <p>Get personalized outfit recommendations based on your style, occasion, and preferences. Grace knows what looks good on you.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3>Perfect Fit Guidance</h3>
            <p>Never worry about sizing again. Grace helps you find the perfect fit with detailed size guides and personalized recommendations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3>Instant Fashion Expertise</h3>
            <p>Ask Grace anything about our collections, styling tips, or fashion advice. She's here 24/7 to help you look and feel amazing.</p>
          </div>
        </div>
      </section>

      {/* — Fynko Credit Section — */}
      <section className="credit-section">
        <div className="credit-content">
          <img src={`${import.meta.env.BASE_URL}fynko.png`} alt="Fynko" className="fynko-logo" />
          <div className="credit-text">
            <p>Want a fashion assistant like Grace for your own brand?</p>
            <p>Contact Fynko to build your personalized shopping experience.</p>
          </div>
          <div className="credit-links">
            <a href="mailto:fynko@gmail.com" className="credit-link">Email us</a>
            <span className="divider">|</span>
            <a href="#" className="credit-link">Visit Fynko.space</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;