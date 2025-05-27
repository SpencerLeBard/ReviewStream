import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero">
        <h1 className="heading">Welcome to ReviewStreams</h1>
        <p className="subheading">
          The simplest way to collect customer reviews via text message and showcase them on your website.
        </p>
        <Link className="cta-button" to="/reviews">View Reviews</Link>
      </div>

      <div className="features-section">
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
      </div>
    </div>
  );
};

export default Home; 