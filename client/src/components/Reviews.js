import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const ReviewsContainer = styled.div`
  padding: 2rem 0;
`;

const ReviewsHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const ReviewsTitle = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const ReviewsSubtitle = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ReviewsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ReviewCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const ReviewerInitial = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 1rem;
`;

const ReviewerName = styled.h3`
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0;
`;

const ReviewDate = styled.span`
  font-size: 0.8rem;
  color: #95a5a6;
  margin-top: 0.2rem;
  display: block;
`;

const ReviewContent = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const ReviewRating = styled.div`
  color: #f39c12;
  font-size: 1.2rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #7f8c8d;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #e74c3c;
  background-color: #fadbd8;
  border-radius: 8px;
  margin: 2rem 0;
`;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // In a real app, we would fetch from the API
        // const response = await axios.get('/api/reviews');
        // setReviews(response.data);
        
        // Using mock data for now
        setTimeout(() => {
          setReviews([
            { 
              id: '1', 
              customerName: 'John Doe', 
              phoneNumber: '+15551234567',
              rating: 5, 
              reviewText: 'Fantastic service! Would definitely recommend to others. The team was very professional and responsive to all my questions.',
              date: new Date('2023-07-15')
            },
            { 
              id: '2', 
              customerName: 'Jane Smith', 
              phoneNumber: '+15557654321',
              rating: 4, 
              reviewText: 'Great experience overall. Just a minor issue with delivery time, but the product quality is excellent.',
              date: new Date('2023-07-20')
            },
            { 
              id: '3', 
              customerName: 'Michael Brown', 
              phoneNumber: '+15551112222',
              rating: 5, 
              reviewText: 'Absolutely loved the product and the customer service was excellent! Will be ordering again soon.',
              date: new Date('2023-08-05')
            },
            { 
              id: '4', 
              customerName: 'Emily Wilson', 
              phoneNumber: '+15553334444',
              rating: 4, 
              reviewText: 'Quality product and fast shipping. Very satisfied with my purchase.',
              date: new Date('2023-08-10')
            },
            { 
              id: '5', 
              customerName: 'David Johnson', 
              phoneNumber: '+15555556666',
              rating: 5, 
              reviewText: 'Best customer support I\'ve ever experienced. They went above and beyond to help me.',
              date: new Date('2023-08-15')
            }
          ]);
          setLoading(false);
        }, 1000); // Simulate loading delay
      } catch (err) {
        setError('Failed to load reviews. Please try again later.');
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    let stars = '';
    for (let i = 0; i < rating; i++) {
      stars += '★';
    }
    for (let i = rating; i < 5; i++) {
      stars += '☆';
    }
    return stars;
  };

  const getInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <LoadingMessage>Loading reviews...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <ReviewsContainer>
      <ReviewsHeader>
        <ReviewsTitle>Customer Reviews</ReviewsTitle>
        <ReviewsSubtitle>
          See what our customers have to say about their experience with us.
        </ReviewsSubtitle>
      </ReviewsHeader>

      <ReviewsList>
        {reviews.map((review) => (
          <ReviewCard key={review.id}>
            <ReviewHeader>
              <ReviewerInitial>{getInitial(review.customerName)}</ReviewerInitial>
              <div>
                <ReviewerName>{review.customerName}</ReviewerName>
                <ReviewDate>{formatDate(review.date)}</ReviewDate>
              </div>
            </ReviewHeader>
            <ReviewContent>{review.reviewText}</ReviewContent>
            <ReviewRating>{renderStars(review.rating)}</ReviewRating>
          </ReviewCard>
        ))}
      </ReviewsList>
    </ReviewsContainer>
  );
};

export default Reviews; 