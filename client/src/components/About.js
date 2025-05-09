import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About Txtify</h1>
      
      <div className="about-section">
        <h2 className="section-title">Our Mission</h2>
        <p className="section-content">
          At Txtify, we're transforming how businesses collect and showcase customer reviews. We believe that the 
          feedback process should be simple and accessible for everyone, which is why we've created a text message-based 
          system that makes it easy for customers to share their experiences.
        </p>
      </div>
      
      <div className="about-section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-content">
          Our platform allows businesses to send personalized text messages to customers asking for their feedback. 
          Customers can respond directly via text with their ratings and reviews. These reviews are then automatically 
          collected and can be displayed on your website through our customizable widgets.
        </p>
        <p className="section-content">
          The simplicity of texting leads to significantly higher response rates compared to traditional email or web form 
          methods, giving you more authentic feedback to showcase to potential customers.
        </p>
      </div>
      
      <div className="team-section">
        <h2 className="section-title">Our Team</h2>
        <p className="section-content">
          Txtify was founded by a small team of developers and marketers who saw the need for a more streamlined approach 
          to customer reviews.
        </p>
        
        <div className="team-grid">
          <div className="team-member">
            <div className="member-image">👨‍💻</div>
            <h3 className="member-name">Spencer LeBard</h3>
            <p className="member-role">CTO</p>
          </div>
          
          <div className="team-member">
            <div className="member-image">👨‍💼</div>
            <h3 className="member-name">D</h3>
            <p className="member-role">Marketing Director</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 