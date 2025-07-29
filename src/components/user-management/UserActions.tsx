import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RBACGuard } from '@/components/RBACGuard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRBAC } from '@/contexts/RBACContext';
import { 
  MoreHorizontal, 
  UserPlus, 
  Shield, 
  UserMinus, 
  Trash2, 
  Settings, 
  Lock,
  Unlock
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  roles: Array<{
    role: string;
    is_active: boolean;
  }>;
}

interface UserActionsProps {
  user: User;
  onUpdate: () => void;
}

export const UserActions = ({ user, onUpdate }: UserActionsProps) => {
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const { isSuperAdmin } = useRBAC();

  const promoteUser = async (role: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.rpc('promote_user_to_admin', {
        target_user_id: user.id,
        admin_role: role
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User promoted to ${role} successfully`
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to promote user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const revokeRole = async (role: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('role_id', role);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${role} role revoked successfully`
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke role",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    try {
      setLoading(true);
      
      // First revoke all roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      if (roleError) throw roleError;

      // Then delete the restaurant record
      const { error: restaurantError } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', user.id);

      if (restaurantError) throw restaurantError;

      toast({
        title: "Success",
        description: "User deleted successfully"
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const suspendUser = async () => {
    // Implementation for suspending user
    toast({
      title: "Feature Coming Soon",
      description: "User suspension feature will be available soon"
    });
  };

  const unsuspendUser = async () => {
    // Implementation for unsuspending user
    toast({
      title: "Feature Coming Soon", 
      description: "User unsuspension feature will be available soon"
    });
  };

  const hasRole = (role: string) => user.roles.some(r => r.role === role && r.is_active);
  const hasAdminRole = hasRole('admin');
  const hasSuperAdminRole = hasRole('super_admin');

  return (
    <>
      <RBACGuard permission="system_admin">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0"
              disabled={loading}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Role Management */}
            {!hasAdminRole && (
              <DropdownMenuItem onClick={() => promoteUser('admin')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Make Admin
              </DropdownMenuItem>
            )}
            
            {isSuperAdmin() && !hasSuperAdminRole && (
              <DropdownMenuItem onClick={() => promoteUser('super_admin')}>
                <Shield className="h-4 w-4 mr-2" />
                Make Super Admin
              </DropdownMenuItem>
            )}
            
            {/* Revoke Admin Roles */}
            {user.roles.filter(r => r.is_active && r.role !== 'restaurant').map((roleData) => (
              <DropdownMenuItem 
                key={`revoke-${roleData.role}`}
                onClick={() => revokeRole(roleData.role)}
                className="text-orange-600 focus:text-orange-700"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Revoke {roleData.role.replace('_', ' ')}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            
            {/* User Management */}
            <DropdownMenuItem onClick={suspendUser}>
              <Lock className="h-4 w-4 mr-2" />
              Suspend User
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={unsuspendUser}>
              <Unlock className="h-4 w-4 mr-2" />
              Unsuspend User
            </DropdownMenuItem>
            
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Danger Zone */}
            {isSuperAdmin() && (
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </RBACGuard>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {user.name}? This action cannot be undone.
              All user data, including their restaurant profile and menu items, will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};