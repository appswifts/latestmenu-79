import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRBAC } from '@/contexts/RBACContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  adminOnly = false,
  redirectTo 
}) => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: rbacLoading } = useRBAC();
  const navigate = useNavigate();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!loading && !rbacLoading) {
        // Check if user session is still valid
        if (requireAuth && user) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              // Session expired, redirect to login
            navigate(redirectTo || '/signin');
              return;
            }
          } catch (error) {
            console.error('Auth check failed:', error);
            navigate(redirectTo || '/signin');
            return;
          }
        }

        if (requireAuth && !user) {
          // Store the attempted URL for redirect after login
          const returnUrl = location.pathname + location.search;
          
          // Determine correct login page based on route
          const loginPath = location.pathname.startsWith('/admin') ? '/admin' : '/signin';
          navigate(`${redirectTo || loginPath}?returnUrl=${encodeURIComponent(returnUrl)}`);
        } else if (!requireAuth && user) {
          // Redirect authenticated users away from auth pages
          navigate('/dashboard');
        } else if (adminOnly) {
          // For admin routes, check if user has admin permissions
          if (!user || !isAdmin()) {
            navigate('/admin'); // Redirect to admin login if not admin or not logged in
            return;
          }
          
          // Admin users should only access admin pages
          if (user && isAdmin() && !location.pathname.startsWith('/admin')) {
            navigate('/admin/dashboard'); // Redirect admin users to admin dashboard
            return;
          }
        } else if (user && isAdmin() && !location.pathname.startsWith('/admin')) {
          // If admin user tries to access restaurant pages, redirect to admin dashboard
          navigate('/admin/dashboard');
          return;
        }
        
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [user, loading, rbacLoading, requireAuth, adminOnly, redirectTo, navigate, location, isAdmin]);

  if (loading || rbacLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Handle admin-only routes
  if (adminOnly) {
    if (!user || !isAdmin()) {
      return null; // Will redirect in useEffect
    }
    return <>{children}</>;
  }

  // Handle restaurant auth routes
  if (requireAuth && !user) {
    return null; // Will redirect in useEffect
  }

  // Handle public routes that should redirect authenticated users
  if (!requireAuth && user) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};

// Legacy component for backward compatibility - now uses RBAC
export const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute adminOnly={true}>
      {children}
    </ProtectedRoute>
  );
};