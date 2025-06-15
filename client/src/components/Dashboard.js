import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import './StylingUtility.css';

// Helper functions for formatting data
const renderStars = (rating) =>
  rating
    ? '★★★★★'.slice(0, rating) + '☆☆☆☆☆'.slice(0, 5 - rating)
    : 'No rating';

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'No date';

const formatPhoneNumber = (p) => p || 'Unknown';

/**
 * Displays a single statistic card with a title and a value.
 */
const StatCard = React.memo(({ title, value }) => (
  <div className="stat-card">
    <h3>{title}</h3>
    <p className="stat-number">{value}</p>
  </div>
));

/**
 * Displays aggregate statistics for the reviews, like total reviews and average rating.
 */
const DashboardStats = React.memo(({ reviews }) => {
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : 'N/A';

  return (
    <div className="dashboard-stats">
      <StatCard title="Total Reviews" value={totalReviews} />
      <StatCard title="Average Rating" value={averageRating} />
    </div>
  );
});

/**
 * Renders the bar chart for review ratings using the recharts library.
 */
const ReviewChart = React.memo(({ data }) => (
  <div className="chart-wrapper">
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
));

/**
 * Displays the filter controls for star rating and date range.
 */
const ReviewFilters = React.memo(({
  activeStarFilter,
  onStarFilterChange,
  dateRange,
  onDateChange,
  onClearFilters,
}) => (
  <div className="filters-container">
    <div className="filter-section">
      <h3>Filter by Rating</h3>
      <div className="star-filters">
        {[1, 2, 3, 4, 5].map(stars => (
          <button
            key={stars}
            className={`star-filter-btn ${activeStarFilter === stars ? 'active' : ''}`}
            onClick={() => onStarFilterChange(stars)}
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
            onChange={onDateChange}
          />
        </div>
        <div className="date-filter">
          <label>To:</label>
          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={onDateChange}
          />
        </div>
      </div>
    </div>
    <button className="clear-filters-btn" onClick={onClearFilters}>
      Clear Filters
    </button>
  </div>
));

/**
 * Displays a single review card.
 */
const ReviewCard = React.memo(({ review }) => (
  <div className="review-card">
    <div className="review-card-header">
      <h3 className="reviewer-name">{formatPhoneNumber(review.phone_from)}</h3>
      <div className="review-rating">{renderStars(review.rating)}</div>
    </div>
    <p className="review-content">{review.body || 'No review text provided.'}</p>
    <span className="review-date">{formatDate(review.created_at)}</span>
  </div>
));

/**
 * Renders the list of review cards.
 * Shows a message if no reviews match the current filters.
 */
const ReviewsList = React.memo(({ reviews }) => (
  <div className="reviews-grid">
    {reviews.length === 0 ? (
      <div className="no-reviews-message">
        No reviews match your current filters.
      </div>
    ) : (
      reviews.map((review) => <ReviewCard key={review.id} review={review} />)
    )}
  </div>
));

/**
 * The main Dashboard component.
 * It fetches data, manages state, and composes the UI from smaller components.
 */
const Dashboard = () => {
  // State for storing raw reviews, company info, loading/error states, and filter values
  const [reviews, setReviews] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStarFilter, setActiveStarFilter] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const session = useSession();

  // Effect hook to fetch initial data (company and reviews) when the session is available
  useEffect(() => {
    const fetchData = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        // Fetch company data associated with the logged-in user
        const r = await fetch('/api/secure/users/company', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!r.ok) throw new Error(`Failed to fetch company: ${r.status}`);
        const companyData = await r.json();
        setCompany(companyData);

        // Fetch reviews for the company
        const revRes = await fetch(`/api/reviews/company/${companyData.id}`);
        if (!revRes.ok) throw new Error(`Failed to fetch reviews: ${revRes.status}`);
        const revData = await revRes.json();
        setReviews(revData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  // Filters the reviews based on the selected star rating and date range.
  // This calculation only re-runs when the reviews or filters change, which improves performance.
  const filteredReviews = useMemo(() => {
    if (reviews.length === 0) return [];

    let result = [...reviews];

    // Apply star rating filter
    if (activeStarFilter !== null) {
      result = result.filter(review => review.rating === activeStarFilter);
    }

    // Apply start date filter
    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter(review => new Date(review.created_at) >= startDate);
    }

    // Apply end date filter
    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(review => new Date(review.created_at) <= endDate);
    }

    return result;
  }, [reviews, activeStarFilter, dateRange]);

  // Prepares the data needed for the bar chart.
  // This calculation only re-runs when the filtered reviews change.
  const chartData = useMemo(() => {
    const base = Array.from({ length: 5 }, (_, i) => ({ rating: i + 1, count: 0 }));
    filteredReviews.forEach(({ rating }) => {
      if (rating >= 1 && rating <= 5) base[rating - 1].count += 1;
    });
    return base;
  }, [filteredReviews]);

  // These functions handle user interactions, like filtering.
  // useCallback helps improve performance by preventing them from being recreated on every render.
  const handleStarFilter = useCallback((stars) => {
    setActiveStarFilter(prev => prev === stars ? null : stars);
  }, []);

  const handleDateChange = useCallback((e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setActiveStarFilter(null);
    setDateRange({ startDate: '', endDate: '' });
  }, []);

  // Conditional rendering for loading, error, and session states
  if (loading) return <div className="loading-message">Loading your dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!session) return <div className="error-message">Please log in to view your dashboard</div>;
  if (!company) return <div className="error-message">No company associated with your account</div>;

  // Render the main dashboard UI
  return (
    <div className="home-container">
      <header className="hero">
        <div className="hero-content">
          <h1 className="heading">Dashboard for {company.name}</h1>
          <p className="subheading">Here are all the reviews for your company</p>
        </div>
      </header>

      <section className="features-section">
        <div className="about-card">
          <h2 className="section-heading">Aggregate Statistics</h2>
          <DashboardStats reviews={filteredReviews} />
        </div>
      </section>
      
      <section className="features-section dashboard-row">
        <div className="about-card">
          <h2 className="section-heading">Filter & Search Reviews</h2>
          <ReviewFilters
            activeStarFilter={activeStarFilter}
            onStarFilterChange={handleStarFilter}
            dateRange={dateRange}
            onDateChange={handleDateChange}
            onClearFilters={clearFilters}
          />
        </div>
        <div className="about-card">
          <h2 className="section-heading">Ratings Distribution</h2>
          <ReviewChart data={chartData} />
        </div>
      </section>

      <section className="testimonials-section">
        <h2 className="section-heading">Filtered Reviews</h2>
        <ReviewsList reviews={filteredReviews} />
      </section>

      <footer className="footer">
        <p>&copy; 2024 ReviewStream. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
