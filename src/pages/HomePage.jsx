import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="home-layout">
      {/* Navbar */}
      <nav className={`home-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="home-nav-container">
          <div className="home-nav-brand">RecipeMaster</div>
          
          <div className="home-nav-links desktop-only">
            <button onClick={() => scrollToSection('about')}>About</button>
            <button onClick={() => scrollToSection('features')}>Features</button>
            <button onClick={() => scrollToSection('how-it-works')}>How it works</button>
            <button onClick={() => scrollToSection('faq')}>FAQ</button>
          </div>
          
          <div className="home-nav-actions desktop-only">
            {user ? (
              <>
                <Link to="/dashboard" className="home-btn-outline">Go to Dashboard</Link>
                <button onClick={handleLogout} className="home-btn-text">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="home-btn-text">Login</Link>
                <Link to="/register" className="home-btn-outline">Sign up</Link>
              </>
            )}
          </div>
          
          <button className="hamburger mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            ☰
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <button onClick={() => scrollToSection('about')}>About</button>
            <button onClick={() => scrollToSection('features')}>Features</button>
            <button onClick={() => scrollToSection('how-it-works')}>How it works</button>
            <button onClick={() => scrollToSection('faq')}>FAQ</button>
            {user ? (
              <>
                <Link to="/dashboard">Go to Dashboard</Link>
                <button onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Sign up</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* 1. HERO */}
      <header className="home-hero">
        <img src="/images/hero.jpg" alt="Dark elegant food layout" className="hero-bg" loading="lazy" />
        <div className="hero-overlay"></div>
        <div className="hero-content reveal-on-scroll">
          <h1 className="hero-title">Know what you have.<br/>Cook what you can.<br/>Waste less.</h1>
          <p className="hero-subtitle">The intelligent culinary companion that helps you organize your kitchen, plan your meals, and turn what you already own into beautiful dinners.</p>
          {user ? (
            <Link to="/dashboard" className="home-btn-outline hero-btn">Go to Dashboard</Link>
          ) : (
            <Link to="/register" className="home-btn-outline hero-btn">Get started</Link>
          )}
        </div>
      </header>

      {/* 2. FEATURE SECTION */}
      <section id="about" className="home-section feature-split reveal-on-scroll">
        <div className="feature-split-img-container">
          <img src="/images/feature_split.jpg" alt="Fresh ingredients" className="feature-circular-img" loading="lazy" />
        </div>
        <div className="feature-split-text">
          <h2 className="section-title">Smart Pantry,<br/>Smarter Cooking</h2>
          <p className="section-body">Stop throwing away expired food. By logging your pantry items, RecipeMaster tracks what you have and alerts you before ingredients go bad. Our matching engine then suggests exactly what you can cook today using only the items already sitting on your shelves.</p>
        </div>
      </section>

      {/* 3. FEATURES ROW */}
      <section id="features" className="home-section full-width reveal-on-scroll">
        <div className="features-scroll-container">
          <div className="feature-card-tall">
            <img src="/images/feature_card.jpg" alt="Smart Pantry" loading="lazy" />
            <div className="card-caption">Smart pantry</div>
          </div>
          <div className="feature-card-tall">
            <img src="/images/feature_cook.jpg" alt="Cook with what I have" loading="lazy" />
            <div className="card-caption">Cook with what I have</div>
          </div>
          <div className="feature-card-tall">
            <img src="/images/feature_alerts.jpg" alt="Expiry alerts" loading="lazy" />
            <div className="card-caption">Expiry alerts</div>
          </div>
          <div className="feature-card-tall">
            <img src="/images/feature_planner.jpg" alt="Meal planner" loading="lazy" />
            <div className="card-caption">Meal planner</div>
          </div>
          <div className="feature-card-tall">
            <img src="/images/feature_shopping.jpg" alt="Shopping list" loading="lazy" />
            <div className="card-caption">Shopping list</div>
          </div>
          <div className="feature-card-tall">
            <img src="/images/feature_sharing.jpg" alt="Recipe sharing" loading="lazy" />
            <div className="card-caption">Recipe sharing</div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="home-section how-it-works reveal-on-scroll">
        <h2 className="section-title text-center">How it works</h2>
        <div className="steps-container">
          <div className="step-item">
            <span className="step-num">01</span>
            <h3 className="step-title">Log your groceries</h3>
            <p className="step-desc">Add your ingredients and their expiry dates into your digital pantry.</p>
          </div>
          <div className="step-item">
            <span className="step-num">02</span>
            <h3 className="step-title">Discover meals</h3>
            <p className="step-desc">Our engine finds recipes that perfectly match your current kitchen inventory.</p>
          </div>
          <div className="step-item">
            <span className="step-num">03</span>
            <h3 className="step-title">Waste less</h3>
            <p className="step-desc">Cook delicious food, save money, and dramatically reduce your food waste.</p>
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section id="faq" className="home-section faq-section reveal-on-scroll">
        <h2 className="section-title text-center">Frequently Asked Questions</h2>
        <div className="faq-list">
          {[
            { q: "Is RecipeMaster free to use?", a: "Yes, our core features including the pantry tracker and basic recipe matching are completely free forever." },
            { q: "How does pantry matching work?", a: "Our algorithm cross-references your logged ingredients against thousands of recipes, ranking them by how many matching ingredients you already have." },
            { q: "How are expiry dates handled?", a: "When you add an item to your pantry, you can set an expiry date. We automatically highlight recipes that use ingredients expiring within the next 3 days." },
            { q: "Can I share recipes with others?", a: "Absolutely. Any recipe you save or create can be shared via a unique link with your friends and family." },
            { q: "Is my data safe?", a: "Your privacy is our priority. Your pantry data and personal recipes are encrypted and securely stored in our cloud infrastructure." }
          ].map((faq, i) => (
            <div className={`faq-row ${activeFaq === i ? 'active' : ''}`} key={i} onClick={() => toggleFaq(i)}>
              <div className="faq-header">
                <h3 className="faq-q">{faq.q}</h3>
                <span className="faq-icon">↓</span>
              </div>
              <div className="faq-a"><p>{faq.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. COMMUNITY / CTA */}
      <section className="home-section community-section reveal-on-scroll">
        <div className="community-content">
          <h2 className="community-title">Join RecipeMaster</h2>
          <p className="community-desc">Start organizing your kitchen and discovering new flavors today.</p>
          <Link to="/register" className="home-btn-outline community-btn">Create your account</Link>
        </div>
        <div className="wordmark-container">
          <span className="huge-wordmark">RecipeMaster</span>
        </div>
      </section>

      {/* 7. FINAL CTA & FOOTER */}
      <footer className="home-footer-section">
        <div className="footer-cta">
          <img src="/images/hero.jpg" alt="Beautiful plated food" className="footer-bg" loading="lazy" />
          <div className="footer-overlay"></div>
          <div className="footer-cta-content reveal-on-scroll">
            <h2 className="footer-cta-title">Ready to cook?</h2>
            {user ? (
              <Link to="/dashboard" className="home-btn-outline footer-btn">Go to Dashboard</Link>
            ) : (
              <Link to="/register" className="home-btn-outline footer-btn">Get started</Link>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-links">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact Us</a>
          </div>
          <div className="footer-credits">
            <p>© {new Date().getFullYear()} RecipeMaster. All rights reserved.</p>
            <p className="small-credit">Recipe data powered by TheMealDB.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
