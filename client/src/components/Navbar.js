import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const user = useUser();
  const navigate = useNavigate();

  const logAuthEvent = (event, user, error = null) => {
    fetch('/api/log-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, user, error })
    });
  };

  const handleLogout = async () => {
    if (user) {
      logAuthEvent('logout', user.email);
    }
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="nav-container">
      <Link to="/" className="logo-link">
        ReviewStream
      </Link>
      <button className="menu-button" onClick={() => setOpen(!open)}>
        {open ? '✕' : '☰'}
      </button>
      <div className="left-nav-links">
        <div className="main-nav-links-container">
          <NavLink to="/" end className="nav-item">Home</NavLink>
          <NavLink to="/reviews" className="nav-item">Reviews</NavLink>
          <NavLink to="/about" className="nav-item">About</NavLink>
          {user && (
            <React.Fragment>
              <NavLink to="/dashboard" className="nav-item">Dashboard</NavLink>
              <NavLink to="/console" className="nav-item">Console</NavLink>
              <NavLink to="/settings" className="nav-item">Settings</NavLink>
            </React.Fragment>
          )}
        </div>
      </div>
      <div className="right-nav-links">
        {user ? (
          <button className="login-button login-button-as-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/login" className="login-button">Login</Link>
        )}
      </div>
    </nav>
  );
}
