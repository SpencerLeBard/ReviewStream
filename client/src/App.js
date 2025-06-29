import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from './supabaseClient';
import { ToastProvider } from './components/ToastProvider';
import Navbar   from './components/Navbar';
import Home     from './components/Home';
import Reviews  from './components/Reviews';
import About    from './components/About';
import Login    from './components/Login';
import Dashboard from './components/Dashboard';
import Console from './components/Console';
import Settings from './components/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <ToastProvider>
        <SpeedInsights />
        <Analytics />
        <Navbar />
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/about"   element={<About />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/console" element={<ProtectedRoute><Console /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </ToastProvider>
    </SessionContextProvider>
  );
}
