import { useAuth } from './AuthProvider';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { isAdminEmail } from '@/lib/admin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'moderator';
  fallback?: React.ReactNode;
}

const ProtectedRoute = ({ 
  children, 
  requireRole, 
  fallback = <div className="text-center p-8">Access denied. You don't have permission to view this page.</div> 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRole, setHasRole] = useState<boolean | null>(null);
  const [roleCheckDone, setRoleCheckDone] = useState(false);

  // Redirect to auth if not logged in - preserve current path
  useEffect(() => {
    if (!loading && !user) {
      const currentPath = location.pathname + location.search;
      navigate(`/auth?redirect=${encodeURIComponent(currentPath)}`, { replace: true });
    }
  }, [loading, user, navigate, location]);

  // Check role after user is confirmed
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user || !requireRole) {
        setHasRole(true);
        setRoleCheckDone(true);
        return;
      }

      try {
        // Explicitly allow the requested admin email
        if (isAdminEmail(user.email)) {
          setHasRole(true);
          setRoleCheckDone(true);
          return;
        }

        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', requireRole)
          .single();

        setHasRole(!error && !!roles);
      } catch (error) {
        console.error('Error checking user role:', error);
        setHasRole(false);
      } finally {
        setRoleCheckDone(true);
      }
    };

    if (user) {
      checkUserRole();
    }
  }, [user?.id, requireRole]);

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // User not logged in - will redirect via useEffect
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Waiting for role check
  if (requireRole && !roleCheckDone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Role check failed
  if (requireRole && !hasRole) {
    return fallback;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
