import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const navigate = useNavigate();

  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (!user) {
        setIsApproved(false);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const response = await fetch('/api/secure/users/company', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (response.ok) {
          const companyData = await response.json();
          setIsApproved(companyData.is_approved);
        } else {
          setIsApproved(false);
        }
      } catch (error) {
        setIsApproved(false);
        console.error('Error checking approval status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkApprovalStatus();
  }, [user, supabaseClient]);

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
          {user && isApproved && !isLoading && (
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
