import React, { useState, useEffect } from 'react';
import './Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch reviews from our backend API
        const response = await fetch('/api/reviews');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setReviews(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    if (!rating) return 'No rating';
    
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
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatPhoneNumber = (phoneNumber) => {
    return phoneNumber || 'Unknown';
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
        {reviews.length === 0 ? (
          <div className="no-reviews-message">No reviews available yet.</div>
        ) : (
          reviews.map((review) => (
            <div className="review-card" key={review.id}>
              <div className="review-header">
                <div className="reviewer-initial">{getInitial(review.phone_from)}</div>
                <div>
                  <h3 className="reviewer-name">{formatPhoneNumber(review.phone_from)}</h3>
                  <span className="review-date">{formatDate(review.created_at)}</span>
                </div>
              </div>
              <p className="review-content">{review.body || 'No review text provided.'}</p>
              <div className="review-rating">{renderStars(review.rating)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews; 