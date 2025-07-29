import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistance } from 'date-fns';
import { UserActions } from './UserActions';
import { UserCheck, Mail, Calendar } from 'lucide-react';

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

interface UserTableProps {
  users: User[];
  loading: boolean;
  onUserUpdate: () => void;
}

export const UserTable = ({ users, loading, onUserUpdate }: UserTableProps) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'secondary';
      case 'restaurant':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getHighestRole = (roles: User['roles']) => {
    const roleHierarchy = { 'super_admin': 3, 'admin': 2, 'restaurant': 1 };
    const activeRoles = roles.filter(r => r.is_active);
    
    if (activeRoles.length === 0) return null;
    
    return activeRoles.reduce((highest, current) => {
      const currentLevel = roleHierarchy[current.role as keyof typeof roleHierarchy] || 0;
      const highestLevel = roleHierarchy[highest.role as keyof typeof roleHierarchy] || 0;
      return currentLevel > highestLevel ? current : highest;
    });
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[300px]">User</TableHead>
            <TableHead>Primary Role</TableHead>
            <TableHead>All Roles</TableHead>
            <TableHead>Registration</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const highestRole = getHighestRole(user.roles);
            
            return (
              <TableRow key={user.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-medium">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{user.name}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {highestRole ? (
                    <Badge 
                      variant={getRoleBadgeVariant(highestRole.role)}
                      className="font-medium"
                    >
                      {highestRole.role.replace('_', ' ')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      No Active Role
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex gap-1 flex-wrap max-w-[200px]">
                    {user.roles.length > 0 ? (
                      user.roles.map((roleData, index) => (
                        <Badge 
                          key={index} 
                          variant={getRoleBadgeVariant(roleData.role)}
                          className={`text-xs ${!roleData.is_active ? 'opacity-50' : ''}`}
                        >
                          {roleData.role.replace('_', ' ')}
                          {!roleData.is_active && ' (inactive)'}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        No roles assigned
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  {user.created_at ? (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDistance(new Date(user.created_at), new Date(), { addSuffix: true })}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Unknown</span>
                  )}
                </TableCell>

                <TableCell>
                  {user.last_login ? (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <UserCheck className="h-3 w-3" />
                      {formatDistance(new Date(user.last_login), new Date(), { addSuffix: true })}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Never</span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <UserActions 
                    user={user} 
                    onUpdate={onUserUpdate} 
                  />
                </TableCell>
              </TableRow>
            );
          })}
          
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};