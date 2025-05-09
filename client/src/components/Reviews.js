import React, { useState, useEffect } from 'react';
import './Reviews.css';

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
    return <div className="loading-message">Loading reviews...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h1 className="reviews-title">Customer Reviews</h1>
        <p className="reviews-subtitle">
          See what our customers have to say about their experience with us.
        </p>
      </div>

      <div className="reviews-list">
        {reviews.map((review) => (
          <div className="review-card" key={review.id}>
            <div className="review-header">
              <div className="reviewer-initial">{getInitial(review.customerName)}</div>
              <div>
                <h3 className="reviewer-name">{review.customerName}</h3>
                <span className="review-date">{formatDate(review.date)}</span>
              </div>
            </div>
            <p className="review-content">{review.reviewText}</p>
            <div className="review-rating">{renderStars(review.rating)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews; 