import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

const ProtectedRoute = ({ children }) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkApproval = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
          const response = await fetch('/api/secure/users/company', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          setIsApproved(response.ok && (await response.json()).is_approved);
        } else {
          setIsApproved(false);
        }
      } catch (error) {
        console.error("Failed to check approval status", error);
        setIsApproved(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkApproval();
  }, [user, supabaseClient]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!user || !isApproved) {
    // If not logged in or not approved, redirect to a safe page.
    // We redirect to /reviews for logged-in but unapproved users.
    // We could redirect to /login if there's no user at all.
    return <Navigate to={user ? "/reviews" : "/login"} replace />;
  }

  // If we get here, user is logged in and approved.
  return children;
};

export default ProtectedRoute; 