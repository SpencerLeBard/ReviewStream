import React from 'react';
import { Link } from 'react-router-dom';
import './StylingUtility.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="hero">
        <div className="hero-content">
          <h1 className="heading">Welcome to ReviewStream</h1>
          <p className="subheading">
            The simplest way to collect customer reviews via text message and showcase them on your website.
          </p>
          <Link className="cta-button" to="/reviews">Get Started for Free</Link>
          <p className="hero-subtext">No credit card required.</p>
        </div>
      </header>

      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">📱</div>
          <h3 className="feature-title">Text-Based Reviews</h3>
          <p className="feature-description">
            Collect reviews effortlessly via text messages. Higher response rates compared to emails or forms.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3 className="feature-title">Real-Time Updates</h3>
          <p className="feature-description">
            See reviews as they come in. Our system processes responses instantly.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3 className="feature-title">Showcase Excellence</h3>
          <p className="feature-description">
            Display your best reviews on your website to build trust with potential customers.
          </p>
        </div>
      </section>

      <section className="how-it-works-section">
        <h2 className="section-heading">How It Works</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3 className="step-title">Sign Up</h3>
            <p className="step-description">Create your ReviewStream account in minutes.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3 className="step-title">Send Requests</h3>
            <p className="step-description">Send review requests to your customers via SMS.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3 className="step-title">Collect Reviews</h3>
            <p className="step-description">Watch the positive reviews roll in.</p>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2 className="section-heading">Loved by businesses worldwide</h2>
        <div className="testimonial-card">
          <p className="testimonial-text">"ReviewStream has transformed how we collect customer feedback. Our response rates have tripled!"</p>
          <p className="testimonial-author">- Karl, Owner of a local pump supply company</p>
        </div>
        <div className="testimonial-card">
          <p className="testimonial-text">"The easiest and most effective review tool we've ever used. Highly recommended."</p>
          <p className="testimonial-author">- Mark, Manager of Tank Repair Shop</p>
        </div>
      </section>

      <section className="cta-section">
        <h2 className="cta-heading">Ready to boost your online reputation?</h2>
        <p className="cta-subheading">Join ReviewStream today and start collecting authentic customer reviews.</p>
        <Link className="cta-button" to="/reviews">Sign Up Now</Link>
      </section>

      <footer className="footer">
        <p>&copy; 2024 ReviewStream. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home; 