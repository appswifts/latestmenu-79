import React from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface RBACGuardProps {
  children: React.ReactNode;
  permission?: string;
  role?: string;
  roles?: string[];
  resource?: string;
  action?: string;
  requireAll?: boolean; // If true, requires ALL conditions to be met
  fallback?: React.ReactNode;
  showError?: boolean;
}

export const RBACGuard: React.FC<RBACGuardProps> = ({
  children,
  permission,
  role,
  roles,
  resource,
  action,
  requireAll = false,
  fallback,
  showError = true
}) => {
  const { hasPermission, hasRole, hasAnyRole, hasResourcePermission, loading } = useRBAC();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  const checkConditions = (): boolean => {
    const conditions: boolean[] = [];

    if (permission) {
      conditions.push(hasPermission(permission));
    }

    if (role) {
      conditions.push(hasRole(role));
    }

    if (roles && roles.length > 0) {
      conditions.push(hasAnyRole(roles));
    }

    if (resource && action) {
      conditions.push(hasResourcePermission(resource, action));
    }

    if (conditions.length === 0) {
      return true; // No conditions specified, allow access
    }

    return requireAll 
      ? conditions.every(condition => condition)
      : conditions.some(condition => condition);
  };

  const hasAccess = checkConditions();

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showError) {
      return (
        <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this resource.
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
};

// Higher-order component version
export const withRBAC = <P extends object>(
  Component: React.ComponentType<P>,
  rbacProps: Omit<RBACGuardProps, 'children'>
) => {
  return (props: P) => (
    <RBACGuard {...rbacProps}>
      <Component {...props} />
    </RBACGuard>
  );
};