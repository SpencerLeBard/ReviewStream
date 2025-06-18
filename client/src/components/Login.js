import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

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
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      providers={[]}                       
    />
  );
}
