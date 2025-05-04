import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  padding: 3rem 0;
  text-align: center;
`;

const Hero = styled.div`
  margin-bottom: 4rem;
`;

const Heading = styled.h1`
  font-size: 3.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
`;

const Subheading = styled.p`
  font-size: 1.3rem;
  color: #7f8c8d;
  max-width: 700px;
  margin: 0 auto 2rem;
  line-height: 1.6;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background-color: #3498db;
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-weight: 600;
  margin-top: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2980b9;
  }
`;

const FeaturesSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
`;

const FeatureCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #3498db;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
`;

const FeatureDescription = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
`;

const Home = () => {
  return (
    <HomeContainer>
      <Hero>
        <Heading>Welcome to Txtify</Heading>
        <Subheading>
          The simplest way to collect customer reviews via text message and showcase them on your website.
        </Subheading>
        <CTAButton to="/reviews">View Reviews</CTAButton>
      </Hero>

      <FeaturesSection>
        <FeatureCard>
          <FeatureIcon>📱</FeatureIcon>
          <FeatureTitle>Text-Based Reviews</FeatureTitle>
          <FeatureDescription>
            Collect reviews effortlessly via text messages. Higher response rates compared to emails or forms.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>⚡</FeatureIcon>
          <FeatureTitle>Real-Time Updates</FeatureTitle>
          <FeatureDescription>
            See reviews as they come in. Our system processes responses instantly.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🔍</FeatureIcon>
          <FeatureTitle>Showcase Excellence</FeatureTitle>
          <FeatureDescription>
            Display your best reviews on your website to build trust with potential customers.
          </FeatureDescription>
        </FeatureCard>
      </FeaturesSection>
    </HomeContainer>
  );
};

export default Home; 