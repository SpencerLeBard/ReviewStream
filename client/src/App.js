import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from './supabaseClient';
import Navbar   from './components/Navbar';
import Home     from './components/Home';
import Reviews  from './components/Reviews';
import About    from './components/About';
import Login    from './components/Login';
import Profile  from './components/Profile';
import Dashboard from './components/Dashboard';
import Console from './components/Console';
import Settings from './components/Settings';
import { Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <SpeedInsights />
      <Navbar />
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/about"   element={<About />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/console" element={<Console />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </SessionContextProvider>
  );
}
