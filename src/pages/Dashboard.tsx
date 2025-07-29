import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { RestaurantSidebar } from "@/components/RestaurantSidebar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SubscriptionStatusBanner } from "@/components/SubscriptionStatusBanner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  QrCode, 
  Eye,
  MessageSquare,
  Sparkles 
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [qrScans, setQrScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load restaurant data
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', user.id)
        .single();

      // Load tables count
      const { data: tablesData } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('restaurant_id', user.id);

      // Load recent QR scans for analytics
      const { data: scansData } = await supabase
        .from('qr_scans')
        .select('*, restaurant_tables(table_number)')
        .eq('restaurant_id', user.id)
        .order('scan_timestamp', { ascending: false })
        .limit(10);

      setRestaurant(restaurantData);
      setTables(tablesData || []);
      setQrScans(scansData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayScans = qrScans.filter(scan => 
    new Date(scan.scan_timestamp).toDateString() === new Date().toDateString()
  ).length;

  const yesterdayScans = qrScans.filter(scan => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return new Date(scan.scan_timestamp).toDateString() === yesterday.toDateString();
  }).length;

  const scanTrend: "up" | "down" | "stable" = todayScans > yesterdayScans ? "up" : todayScans < yesterdayScans ? "down" : "stable";

  const stats = [
    { 
      label: "Today's Scans", 
      value: todayScans.toString(), 
      change: `${todayScans > yesterdayScans ? '+' : ''}${todayScans - yesterdayScans} vs yesterday`, 
      icon: MessageSquare,
      trend: scanTrend
    },
    { 
      label: "Total Tables", 
      value: tables.length.toString(), 
      change: `${tables.filter(t => t.is_active).length} active`, 
      icon: QrCode,
      trend: "stable" as const
    },
    { 
      label: "Total Scans", 
      value: qrScans.length.toString(), 
      change: "All time activity", 
      icon: Eye,
      trend: qrScans.length > 0 ? "up" as const : "stable" as const
    },
    { 
      label: "Subscription", 
      value: restaurant?.subscription_status === 'active' ? 'Active' : 'Pending', 
      change: restaurant?.plan || "Basic plan", 
      icon: BarChart3,
      trend: restaurant?.subscription_status === 'active' ? "up" as const : "stable" as const
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RestaurantSidebar />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-gradient-to-r from-background to-muted/20">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Restaurant Dashboard
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Welcome back, {restaurant?.name || 'Loading...'}! ✨
              </p>
            </div>
            <Button variant="outline" size="sm" className="hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors" asChild>
              <Link to="/">← Back to Home</Link>
            </Button>
          </header>

          <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-muted/5 to-background">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-lg p-6 border border-border/50">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}! 👋
              </h2>
              <p className="text-muted-foreground">
                Here's what's happening with your restaurant today.
              </p>
            </div>

            {/* Subscription Status Banner */}
            <SubscriptionStatusBanner 
              restaurant={restaurant} 
              onSubscriptionUpdate={loadDashboardData}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <StatsCard
                    label={stat.label}
                    value={stat.value}
                    change={stat.change}
                    icon={stat.icon}
                    trend={stat.trend}
                    loading={loading}
                  />
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="animate-fade-up" style={{ animationDelay: '0.5s' }}>
                <RecentActivity qrScans={qrScans} loading={loading} />
              </div>
              
              <div className="animate-fade-up" style={{ animationDelay: '0.6s' }}>
                <QuickActions />
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;