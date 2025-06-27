import React, { useState, useEffect } from 'react';
import './StylingUtility.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredReviews = reviews.filter((review) => {
    const body = review.body || '';
    const phone = review.phone_from || '';
    return (
      body.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const renderStars = (rating) => {
    if (rating === null || rating === undefined) return 'No rating';
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += i < rating ? '★' : '☆';
    }
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="home-container">
      <header className="hero">
        <div className="hero-content">
          <h1 className="heading">Customer Reviews</h1>
          <p className="subheading">
            See what our customers have to say about their experience with us.
          </p>
        </div>
      </header>

      <section className="reviews-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by review content or phone number..."
            className="search-bar"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {loading && <div className="loading-message">Loading reviews...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="reviews-grid">
            {filteredReviews.length === 0 ? (
              <div className="no-reviews-message">
                {searchTerm ? 'No reviews match your search.' : 'No reviews available yet.'}
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div className="review-card" key={review.id}>
                  <div className="review-card-header">
                    <h3 className="reviewer-name">{review.phone_from || 'Anonymous'}</h3>
                    <div className="review-rating">{renderStars(review.rating)}</div>
                  </div>
                  <p className="review-content">{review.body || 'No review text provided.'}</p>
                  <span className="review-date">{formatDate(review.created_at)}</span>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      <footer className="footer">
        <p>&copy; 2024 Review Streams. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Reviews; 