import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useSession } from '@supabase/auth-helpers-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import './Reviews.css';
import './Dashboard.css';

const Dashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStarFilter, setActiveStarFilter] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const session = useSession();

  useEffect(() => {
    const fetchData = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const r = await fetch('/api/secure/users/company', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!r.ok) throw new Error(`Failed to fetch company: ${r.status}`);
        const companyData = await r.json();
        setCompany(companyData);

        const revRes = await fetch(`/api/reviews/company/${companyData.id}`);
        if (!revRes.ok) throw new Error(`Failed to fetch reviews: ${revRes.status}`);
        const revData = await revRes.json();
        setReviews(revData);
        setFilteredReviews(revData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  // Apply filters whenever filter states change
  useEffect(() => {
    if (reviews.length === 0) return;

    let result = [...reviews];

    // Apply star filter if active
    if (activeStarFilter !== null) {
      result = result.filter(review => review.rating === activeStarFilter);
    }

    // Apply date range filter if dates are set
    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter(review => new Date(review.created_at) >= startDate);
    }

    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(review => new Date(review.created_at) <= endDate);
    }

    setFilteredReviews(result);
  }, [reviews, activeStarFilter, dateRange]);

  const chartData = useMemo(() => {
    const base = Array.from({ length: 5 }, (_, i) => ({ rating: i + 1, count: 0 }));
    filteredReviews.forEach(({ rating }) => {
      if (rating >= 1 && rating <= 5) base[rating - 1].count += 1;
    });
    return base;
  }, [filteredReviews]);

  const handleStarFilter = (stars) => {
    if (activeStarFilter === stars) {
      // If clicking the active filter, clear it
      setActiveStarFilter(null);
    } else {
      // Set the new filter
      setActiveStarFilter(stars);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setActiveStarFilter(null);
    setDateRange({ startDate: '', endDate: '' });
  };

  const renderStars = (rating) =>
    rating
      ? '★★★★★'.slice(0, rating) + '☆☆☆☆☆'.slice(0, 5 - rating)
      : 'No rating';

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'No date';

  const formatPhoneNumber = (p) => p || 'Unknown';

  if (loading) return <div className="loading-message">Loading your dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!session) return <div className="error-message">Please log in to view your dashboard</div>;
  if (!company) return <div className="error-message">No company associated with your account</div>;

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h1 className="reviews-title">Dashboard for {company.name}</h1>
        <p className="reviews-subtitle">Here are all the reviews for your company</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Reviews</h3>
          <p className="stat-number">{filteredReviews.length}</p>
        </div>
        <div className="stat-card">
          <h3>Average Rating</h3>
          <p className="stat-number">
            {filteredReviews.length
              ? (
                  filteredReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / filteredReviews.length
                ).toFixed(1)
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" tickFormatter={(n) => `${n}★`} />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(v) => [`${v}`, 'Reviews']}
              labelFormatter={(l) => `${l} stars`}
            />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-section">
          <h3>Filter by Rating</h3>
          <div className="star-filters">
            {[1, 2, 3, 4, 5].map(stars => (
              <button
                key={stars}
                className={`star-filter-btn ${activeStarFilter === stars ? 'active' : ''}`}
                onClick={() => handleStarFilter(stars)}
              >
                {stars} ★
              </button>
            ))}
          </div>
        </div>
        
        <div className="filter-section">
          <h3>Filter by Date</h3>
          <div className="date-filters">
            <div className="date-filter">
              <label>From:</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
            </div>
            <div className="date-filter">
              <label>To:</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
              />
            </div>
          </div>
        </div>
        
        <button className="clear-filters-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {/* Reviews list */}
      <div className="reviews-list">
        {filteredReviews.length === 0 ? (
          <div className="no-reviews-message">
            No reviews match your current filters.
          </div>
        ) : (
          filteredReviews.map((review) => (
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

export default Dashboard;
