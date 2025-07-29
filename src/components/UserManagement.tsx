import { useState, useEffect, useMemo } from 'react';
import { RBACGuard } from '@/components/RBACGuard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRBAC } from '@/contexts/RBACContext';
import { UserTable } from './user-management/UserTable';
import { UserFilters } from './user-management/UserFilters';
import { UserStats } from './user-management/UserStats';
import { Shield, Users } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  roles: Array<{
    role: string;
    is_active: boolean;
    assigned_at?: string;
  }>;
  created_at?: string;
  last_login?: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const { refetchPermissions } = useRBAC();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch user profiles with their roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          username,
          status,
          created_at,
          last_login_at
        `);

      if (profilesError) throw profilesError;

      // Fetch user roles for each user
      const usersWithRoles = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select(`
              is_active,
              assigned_at,
              roles:role_id (
                name
              )
            `)
            .eq('user_id', profile.id)
            .eq('is_active', true)
            .order('assigned_at', { ascending: false });

          return {
            id: profile.id,
            email: profile.email,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || profile.email,
            created_at: profile.created_at,
            roles: (rolesData || []).map(r => ({
              role: r.roles?.name || 'unknown',
              is_active: r.is_active,
              assigned_at: r.assigned_at
            })),
            last_login: profile.last_login_at
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term, role, and status
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const matchesSearch = !searchTerm || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === 'all' || 
        (roleFilter === 'no_roles' && !user.roles.some(r => r.is_active)) ||
        user.roles.some(r => r.is_active && r.role === roleFilter);

      // Status filter (placeholder for future implementation)
      const matchesStatus = statusFilter === 'all'; // TODO: Implement status filtering

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleUserUpdate = async () => {
    await Promise.all([fetchUsers(), refetchPermissions()]);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  return (
    <RBACGuard permission="manage_users" fallback={
      <div className="p-8 text-center">
        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
        <p className="text-muted-foreground">You need user management permissions to access this page.</p>
      </div>
    }>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-bold">User Management</h1>
          </div>
        </div>

        {/* User Statistics */}
        <UserStats users={users} />

        {/* Filters */}
        <UserFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          totalUsers={users.length}
          filteredUsers={filteredUsers.length}
          onClearFilters={clearFilters}
        />

        {/* Users Table */}
        <UserTable
          users={filteredUsers}
          loading={loading}
          onUserUpdate={handleUserUpdate}
        />
      </div>
    </RBACGuard>
  );
};