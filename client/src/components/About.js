import React from 'react';
import './StylingUtility.css';

const About = () => {
  return (
    <div className="home-container">
      <header className="hero">
        <div className="hero-content">
          <h1 className="heading">About ReviewStream</h1>
          <p className="subheading">
            We're simplifying how businesses gather and display customer feedback.
          </p>
        </div>
      </header>

      <section className="about-details-section">
        <div className="about-card">
          <h2 className="section-heading">Our Mission</h2>
          <p>
            At ReviewStream, we're transforming how businesses collect and showcase customer reviews. We believe that the 
            feedback process should be simple and accessible for everyone, which is why we've created a text message-based 
            system that makes it easy for customers to share their experiences.
          </p>
        </div>
        <div className="about-card">
          <h2 className="section-heading">How It Works</h2>
          <p>
            Our platform allows businesses to send personalized text messages to customers asking for their feedback. 
            Customers can respond directly via text with their ratings and reviews. These reviews are then automatically 
            collected and can be displayed on your website through our customizable widgets.
          </p>
          <p>
            The simplicity of texting leads to significantly higher response rates compared to traditional email or web form 
            methods, giving you more authentic feedback to showcase to potential customers.
          </p>
        </div>
      </section>

      <section className="team-section">
        <h2 className="section-heading">Our Team</h2>
        <p className="team-intro">
          ReviewStream was founded by 2 friends who saw the need for a more streamlined approach 
          to customer reviews.  Just text back!
        </p>
        
        <div className="team-grid">
          <div className="team-member-card">
            <div className="team-member-image">👨‍💻</div>
            <h3 className="team-member-name">Spencer LeBard</h3>
            <p className="team-member-role">Chief Technology Officer</p>
          </div>
          
          <div className="team-member-card">
            <div className="team-member-image">👨‍💼</div>
            <h3 className="team-member-name">D</h3>
            <p className="team-member-role">Chief Marketing Officer</p>
          </div>
        </div>
      </section>
      
      <footer className="footer">
        <p>&copy; 2024 ReviewStream. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default About; 