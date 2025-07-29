import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { UserManagement } from "@/components/UserManagement";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Building2, CreditCard, Package, TrendingUp, Activity } from "lucide-react";

interface DashboardStats {
  totalRestaurants: number;
  activeRestaurants: number;
  pendingOrders: number;
  totalRevenue: number;
  totalUsers: number;
  adminUsers: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRestaurants: 0,
    activeRestaurants: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    adminUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // Get restaurant stats
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('subscription_status');

      const totalRestaurants = restaurants?.length || 0;
      const activeRestaurants = restaurants?.filter(r => r.subscription_status === 'active').length || 0;

      // Get pending orders
      const { data: orders } = await supabase
        .from('subscription_orders')
        .select('amount, status')
        .eq('status', 'pending');

      const pendingOrders = orders?.length || 0;

      // Get total revenue from approved orders
      const { data: approvedOrders } = await supabase
        .from('subscription_orders')
        .select('amount')
        .eq('status', 'approved');

      const totalRevenue = approvedOrders?.reduce((sum, order) => sum + order.amount, 0) || 0;

      // Get user stats
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select(`
          is_active,
          roles:role_id (
            name
          )
        `)
        .eq('is_active', true);

      const totalUsers = userRoles?.length || 0;
      const adminUsers = userRoles?.filter(ur => 
        ur.is_active && 
        ur.roles && 
        ['admin', 'super_admin'].includes(ur.roles.name)
      ).length || 0;

      setStats({
        totalRestaurants,
        activeRestaurants,
        pendingOrders,
        totalRevenue,
        totalUsers,
        adminUsers
      });

    } catch (error: any) {
      console.error('Load dashboard stats error:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <SidebarInset>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Overview of system statistics and user management</p>
            </div>
          </header>

          <div className="flex-1 space-y-6 p-4 pt-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeRestaurants} active subscriptions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Package className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting approval
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} RWF</div>
                  <p className="text-xs text-muted-foreground">
                    From approved orders
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.adminUsers} admin users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
                  <Activity className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalRestaurants > 0 
                      ? Math.round((stats.activeRestaurants / stats.totalRestaurants) * 100)
                      : 0
                    }%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Restaurant activation rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                  <CreditCard className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Manage</div>
                  <p className="text-xs text-muted-foreground">
                    Users, orders & settings
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* User Management Section */}
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage system users and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;