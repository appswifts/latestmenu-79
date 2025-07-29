import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RBACGuard } from '@/components/RBACGuard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Lock, 
  Unlock,
  Settings,
  AlertTriangle
} from 'lucide-react';

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
  is_system_role: boolean;
  is_active: boolean;
  hierarchy_level: number;
  created_at: string;
  permissions: Permission[];
  user_count: number;
}

export const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hierarchy_level: 10,
    selectedPermissions: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data: rolesData, error } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions (
            permissions:permission_id (
              id,
              name,
              description,
              resource,
              action
            )
          )
        `)
        .order('hierarchy_level', { ascending: false });

      if (error) throw error;

      // Get user counts for each role
      const rolesWithCounts = await Promise.all(
        (rolesData || []).map(async (role) => {
          const { count } = await supabase
            .from('user_roles')
            .select('*', { count: 'exact', head: true })
            .eq('role_id', role.id)
            .eq('is_active', true);

          return {
            ...role,
            permissions: role.role_permissions?.map((rp: any) => rp.permissions).filter(Boolean) || [],
            user_count: count || 0
          };
        })
      );

      setRoles(rolesWithCounts);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('resource', { ascending: true });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleCreateRole = async () => {
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .insert({
          name: formData.name,
          description: formData.description,
          hierarchy_level: formData.hierarchy_level,
          is_system_role: false
        })
        .select()
        .single();

      if (roleError) throw roleError;

      // Add permissions to role
      if (formData.selectedPermissions.length > 0) {
        const { error: permissionsError } = await supabase
          .from('role_permissions')
          .insert(
            formData.selectedPermissions.map(permissionId => ({
              role_id: roleData.id,
              permission_id: permissionId
            }))
          );

        if (permissionsError) throw permissionsError;
      }

      toast({
        title: "Success",
        description: "Role created successfully"
      });

      resetForm();
      fetchRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role deleted successfully"
      });

      fetchRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive"
      });
    }
  };

  const toggleRoleStatus = async (roleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('roles')
        .update({ is_active: !isActive })
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role ${!isActive ? 'activated' : 'deactivated'} successfully`
      });

      fetchRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role status",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      hierarchy_level: 10,
      selectedPermissions: []
    });
    setIsCreating(false);
    setSelectedRole(null);
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <RBACGuard permission="manage_roles" fallback={
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You need role management permissions to access this feature.
        </AlertDescription>
      </Alert>
    }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Role Management</h2>
            <p className="text-muted-foreground">Create and manage user roles and permissions</p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Roles List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Roles
              </CardTitle>
              <CardDescription>
                Manage roles and their hierarchy levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading roles...</p>
                </div>
              ) : (
                roles.map((role) => (
                  <div
                    key={role.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRole?.id === role.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedRole(role)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{role.name}</h4>
                          {role.is_system_role && (
                            <Badge variant="secondary" className="text-xs">
                              System
                            </Badge>
                          )}
                          {!role.is_active && (
                            <Badge variant="destructive" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {role.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {role.user_count} users
                          </span>
                          <span className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            {role.permissions.length} permissions
                          </span>
                          <span>Level {role.hierarchy_level}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRoleStatus(role.id, role.is_active);
                          }}
                        >
                          {role.is_active ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </Button>
                        {!role.is_system_role && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRole(role.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Role Details/Create Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {isCreating ? 'Create New Role' : selectedRole ? 'Role Details' : 'Select a Role'}
              </CardTitle>
              <CardDescription>
                {isCreating 
                  ? 'Define a new role with specific permissions'
                  : selectedRole 
                    ? 'View and manage role permissions'
                    : 'Select a role from the list to view details'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCreating ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                      id="roleName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter role name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roleDescription">Description</Label>
                    <Textarea
                      id="roleDescription"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the role's purpose"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hierarchyLevel">Hierarchy Level</Label>
                    <Input
                      id="hierarchyLevel"
                      type="number"
                      value={formData.hierarchy_level}
                      onChange={(e) => setFormData({ ...formData, hierarchy_level: parseInt(e.target.value) })}
                      min="1"
                      max="100"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>Permissions</Label>
                    {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                      <div key={resource} className="space-y-2">
                        <h4 className="font-medium capitalize">{resource}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {resourcePermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Switch
                                id={permission.id}
                                checked={formData.selectedPermissions.includes(permission.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData({
                                      ...formData,
                                      selectedPermissions: [...formData.selectedPermissions, permission.id]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      selectedPermissions: formData.selectedPermissions.filter(id => id !== permission.id)
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor={permission.id} className="text-sm">
                                {permission.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateRole} className="flex-1">
                      Create Role
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : selectedRole ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{selectedRole.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Users:</span>
                      <span className="ml-2 font-medium">{selectedRole.user_count}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Level:</span>
                      <span className="ml-2 font-medium">{selectedRole.hierarchy_level}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium">
                        {selectedRole.is_system_role ? 'System' : 'Custom'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-2 font-medium">
                        {selectedRole.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Permissions ({selectedRole.permissions.length})</h4>
                    <div className="space-y-3">
                      {Object.entries(
                        selectedRole.permissions.reduce((acc, permission) => {
                          if (!acc[permission.resource]) {
                            acc[permission.resource] = [];
                          }
                          acc[permission.resource].push(permission);
                          return acc;
                        }, {} as Record<string, Permission[]>)
                      ).map(([resource, resourcePermissions]) => (
                        <div key={resource}>
                          <h5 className="text-sm font-medium capitalize mb-2">{resource}</h5>
                          <div className="flex flex-wrap gap-1">
                            {resourcePermissions.map((permission) => (
                              <Badge key={permission.id} variant="secondary" className="text-xs">
                                {permission.action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a role from the list to view its details and permissions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RBACGuard>
  );
};