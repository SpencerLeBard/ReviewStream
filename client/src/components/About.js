import React from 'react';
import styled from 'styled-components';

const AboutContainer = styled.div`
  padding: 3rem 0;
  max-width: 800px;
  margin: 0 auto;
`;

const AboutTitle = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
`;

const AboutSection = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: #3498db;
  margin-bottom: 1rem;
`;

const SectionContent = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  color: #7f8c8d;
  margin-bottom: 1.5rem;
`;

const TeamSection = styled.div`
  margin-top: 3rem;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const TeamMember = styled.div`
  text-align: center;
`;

const MemberImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin: 0 auto 1rem;
`;

const MemberName = styled.h3`
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const MemberRole = styled.p`
  font-size: 1rem;
  color: #7f8c8d;
`;

const About = () => {
  return (
    <AboutContainer>
      <AboutTitle>About Txtify</AboutTitle>
      
      <AboutSection>
        <SectionTitle>Our Mission</SectionTitle>
        <SectionContent>
          At Txtify, we're transforming how businesses collect and showcase customer reviews. We believe that the 
          feedback process should be simple and accessible for everyone, which is why we've created a text message-based 
          system that makes it easy for customers to share their experiences.
        </SectionContent>
      </AboutSection>
      
      <AboutSection>
        <SectionTitle>How It Works</SectionTitle>
        <SectionContent>
          Our platform allows businesses to send personalized text messages to customers asking for their feedback. 
          Customers can respond directly via text with their ratings and reviews. These reviews are then automatically 
          collected and can be displayed on your website through our customizable widgets.
        </SectionContent>
        <SectionContent>
          The simplicity of texting leads to significantly higher response rates compared to traditional email or web form 
          methods, giving you more authentic feedback to showcase to potential customers.
        </SectionContent>
      </AboutSection>
      
      <TeamSection>
        <SectionTitle>Our Team</SectionTitle>
        <SectionContent>
          Txtify was founded by a small team of developers and marketers who saw the need for a more streamlined approach 
          to customer reviews.
        </SectionContent>
        
        <TeamGrid>
          <TeamMember>
            <MemberImage>👨‍💻</MemberImage>
            <MemberName>Alex Johnson</MemberName>
            <MemberRole>Founder & CEO</MemberRole>
          </TeamMember>
          
          <TeamMember>
            <MemberImage>👩‍💻</MemberImage>
            <MemberName>Sarah Chen</MemberName>
            <MemberRole>CTO</MemberRole>
          </TeamMember>
          
          <TeamMember>
            <MemberImage>👨‍💼</MemberImage>
            <MemberName>Marcus Williams</MemberName>
            <MemberRole>Marketing Director</MemberRole>
          </TeamMember>
        </TeamGrid>
      </TeamSection>
    </AboutContainer>
  );
};

export default About; 