import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Store, 
  CreditCard, 
  Package, 
  DollarSign,
  Settings,
  BarChart3,
  LogOut,
  Receipt,
  Home
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const adminMenuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: Home },
  { title: "Approve Subscriptions", url: "/admin/subscription-approval", icon: CreditCard },
  { title: "Subscription Orders", url: "/admin/subscription-orders", icon: Receipt },
  { title: "Restaurants", url: "/admin/restaurants", icon: Store },
  { title: "Payment Methods", url: "/admin/payment-methods", icon: CreditCard },
  { title: "Packages", url: "/admin/packages", icon: Package },
  { title: "Honorary Subscriptions", url: "/admin/honorary-subscriptions", icon: Users },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const currentPath = location.pathname + location.search;
  
  const isActive = (path: string) => currentPath === path || (path === "/admin" && currentPath === "/admin");
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  const handleLogout = async () => {
    try {
      // Sign out using the proper auth context
      await signOut();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out from admin panel."
      });
      
      navigate('/admin/login');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1">
          <Settings className="h-6 w-6 text-primary" />
          {state === "expanded" && (
            <span className="font-semibold text-sidebar-foreground">Admin Panel</span>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {state === "expanded" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {state === "expanded" && (
                <span className="ml-2">Admin Logout</span>
              )}
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}