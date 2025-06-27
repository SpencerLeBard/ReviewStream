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

  const closeMenu = () => setOpen(false);

  const handleLogoutClick = () => {
    handleLogout();
    closeMenu();
  };

  return (
    <nav className="nav-container">
      <Link to="/" className="logo-link" onClick={closeMenu}>
        Review Streams
      </Link>
      <button className="menu-button" onClick={() => setOpen(!open)}>
        {open ? '✕' : '☰'}
      </button>
      <div className={`nav-links ${open ? 'open' : ''}`}>
        <div className="main-nav-links-container">
          <NavLink to="/" end className="nav-item" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/reviews" className="nav-item" onClick={closeMenu}>Reviews</NavLink>
          <NavLink to="/about" className="nav-item" onClick={closeMenu}>About</NavLink>
          {user && (
            <React.Fragment>
              <NavLink to="/dashboard" className="nav-item" onClick={closeMenu}>Dashboard</NavLink>
              <NavLink to="/console" className="nav-item" onClick={closeMenu}>Console</NavLink>
              <NavLink to="/settings" className="nav-item" onClick={closeMenu}>Settings</NavLink>
            </React.Fragment>
          )}
        </div>
        <div className="right-nav-links">
          {user ? (
            <button className="login-button login-button-as-button" onClick={handleLogoutClick}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="login-button" onClick={closeMenu}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
