import { Auth } from '@supabase/auth-ui-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './StylingUtility.css';

const logAuthEvent = (event, user, error = null) => {
  fetch('/api/log-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, user, error })
  });
};

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        logAuthEvent('login', session.user.email);
        navigate('/console', { replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="home-container">
      <header className="hero">
        <div className="hero-content">
          <h1 className="heading">Sign In to Your Account</h1>
          <p className="subheading">
            Access your dashboard and manage your reviews.
          </p>
          <div className="about-card" style={{ maxWidth: '400px', margin: '2rem auto', background: 'rgba(255,255,255,0.95)' }}>
            <Auth
              supabaseClient={supabase}
              appearance={{}}
              providers={[]}
            />
          </div>
        </div>
      </header>
    </div>
  );
}
