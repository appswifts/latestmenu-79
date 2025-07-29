import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  permissions: Permission[];
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPermissions();
    } else {
      setUserRoles([]);
      setPermissions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchUserPermissions = async () => {
    if (!user) return;

    try {
      // Get user roles with role details and permissions
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          id,
          is_active,
          expires_at,
          roles:role_id (
            id,
            name,
            description,
            is_active,
            role_permissions (
              permissions:permission_id (
                id,
                name,
                description,
                resource,
                action
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (userRolesError) throw userRolesError;

      if (!userRolesData || userRolesData.length === 0) {
        setUserRoles([]);
        setPermissions([]);
        return;
      }

      // Transform the data
      const allPermissions: Permission[] = [];
      const roles: Role[] = [];

      userRolesData.forEach((userRole: any) => {
        if (userRole.roles && userRole.roles.is_active) {
          const rolePermissions: Permission[] = [];
          
          userRole.roles.role_permissions?.forEach((rp: any) => {
            if (rp.permissions) {
              rolePermissions.push(rp.permissions);
              
              // Add to all permissions if not already there
              if (!allPermissions.find(p => p.id === rp.permissions.id)) {
                allPermissions.push(rp.permissions);
              }
            }
          });

          roles.push({
            id: userRole.roles.id,
            name: userRole.roles.name,
            description: userRole.roles.description,
            is_active: userRole.roles.is_active,
            permissions: rolePermissions
          });
        }
      });

      setUserRoles(roles);
      setPermissions(allPermissions);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permissionName: string): boolean => {
    return permissions.some(p => p.name === permissionName);
  };

  const hasRole = (roleName: string): boolean => {
    return userRoles.some(r => r.name === roleName && r.is_active);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.some(role => hasRole(role));
  };

  const hasResourcePermission = (resource: string, action: string): boolean => {
    return permissions.some(p => p.resource === resource && p.action === action);
  };

  const isAdmin = (): boolean => {
    return hasAnyRole(['admin', 'super_admin']) || hasPermission('system_admin');
  };

  const isSuperAdmin = (): boolean => {
    return hasRole('super_admin') || hasPermission('system_admin');
  };

  return {
    userRoles,
    permissions,
    loading,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasResourcePermission,
    isAdmin,
    isSuperAdmin,
    refetchPermissions: fetchUserPermissions
  };
};