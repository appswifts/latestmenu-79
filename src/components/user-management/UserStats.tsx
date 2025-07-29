import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, UserCheck, UserX } from 'lucide-react';

interface User {
  id: string;
  roles: Array<{
    role: string;
    is_active: boolean;
  }>;
}

interface UserStatsProps {
  users: User[];
}

export const UserStats = ({ users }: UserStatsProps) => {
  const totalUsers = users.length;
  
  const adminUsers = users.filter(u => 
    u.roles.some(r => r.is_active && ['admin', 'super_admin'].includes(r.role))
  ).length;
  
  const restaurantUsers = users.filter(u => 
    u.roles.some(r => r.is_active && r.role === 'restaurant')
  ).length;
  
  const usersWithoutRoles = users.filter(u => 
    !u.roles.some(r => r.is_active)
  ).length;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      description: "All registered users",
      color: "text-blue-600"
    },
    {
      title: "Administrators",
      value: adminUsers,
      icon: Shield,
      description: "Admin & Super Admin users",
      color: "text-red-600"
    },
    {
      title: "Restaurant Owners",
      value: restaurantUsers,
      icon: UserCheck,
      description: "Restaurant account users",
      color: "text-green-600"
    },
    {
      title: "No Active Roles",
      value: usersWithoutRoles,
      icon: UserX,
      description: "Users without active roles",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              
              {/* Progress indicator */}
              {stat.title !== "Total Users" && totalUsers > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.round((stat.value / totalUsers) * 100)}% of total</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1 mt-1">
                    <div 
                      className={`h-1 rounded-full bg-current ${stat.color}`}
                      style={{ width: `${(stat.value / totalUsers) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};