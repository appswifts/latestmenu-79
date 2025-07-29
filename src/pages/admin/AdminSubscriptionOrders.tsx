import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Check, X, Clock, Eye, Calendar } from "lucide-react";

interface SubscriptionOrder {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_email: string;
  package_id?: string;
  plan_type: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_method_id?: string;
  payment_reference?: string;
  notes?: string;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  packages?: {
    name: string;
    price: number;
    currency: string;
  };
}

const AdminSubscriptionOrders = () => {
  const [orders, setOrders] = useState<SubscriptionOrder[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<SubscriptionOrder | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load subscription orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('subscription_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders((ordersData || []) as SubscriptionOrder[]);

      // Load restaurants for reference
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id, name, email')
        .order('name');

      if (restaurantsError) throw restaurantsError;
      setRestaurants(restaurantsData || []);

      // Load packages for reference
      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (packagesError) throw packagesError;
      setPackages(packagesData || []);

    } catch (error: any) {
      console.error('Load data error:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'approved' | 'rejected', packageId?: string) => {
    try {
      const updateData: any = { status };
      
      // Update the subscription order
      const { error: orderError } = await supabase
        .from('subscription_orders')
        .update(updateData)
        .eq('id', orderId);

      if (orderError) throw orderError;

      // If approved, update restaurant subscription
      if (status === 'approved') {
        const order = orders.find(o => o.id === orderId);
        if (order && packageId) {
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

          const { error: restaurantError } = await supabase
            .from('restaurants')
            .update({
              subscription_status: 'active',
              package_id: packageId,
              subscription_start_date: startDate.toISOString(),
              subscription_end_date: endDate.toISOString()
            })
            .eq('id', order.restaurant_id);

          if (restaurantError) throw restaurantError;
        }
      }

      toast({
        title: "Success",
        description: `Order ${status} successfully`
      });

      loadData(); // Refresh data
    } catch (error: any) {
      console.error('Update order error:', error);
      toast({
        title: "Error",
        description: `Failed to ${status} order`,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
                <p className="mt-2 text-muted-foreground">Loading subscription orders...</p>
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
              <h1 className="text-xl font-semibold">Subscription Orders</h1>
              <p className="text-sm text-muted-foreground">Manage restaurant subscription orders and approvals</p>
            </div>
          </header>

          <div className="flex-1 space-y-4 p-4 pt-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'pending').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <Check className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'approved').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                  <X className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'rejected').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Subscription Orders ({orders.length})
                </CardTitle>
                <CardDescription>Review and manage subscription order requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                      <p className="text-muted-foreground">
                        Subscription orders will appear here when restaurants submit requests.
                      </p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{order.restaurant_name}</h3>
                                <Badge variant={getStatusColor(order.status)}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                  </div>
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{order.restaurant_email}</p>
                              <div className="flex gap-4 text-sm">
                                <span><strong>Plan:</strong> {order.plan_type}</span>
                                <span><strong>Amount:</strong> {order.amount.toLocaleString()} {order.currency}</span>
                                <span><strong>Payment:</strong> {order.payment_method}</span>
                              </div>
                              {order.package_id && (
                                <p className="text-sm">
                                  <strong>Package ID:</strong> {order.package_id}
                                </p>
                              )}
                              {order.notes && (
                                <p className="text-sm text-muted-foreground">
                                  <strong>Notes:</strong> {order.notes}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                Created: {new Date(order.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Order Details</DialogTitle>
                                    <DialogDescription>Review and approve/reject subscription order</DialogDescription>
                                  </DialogHeader>
                                  {selectedOrder && (
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-semibold mb-2">Restaurant Information</h4>
                                        <p><strong>Name:</strong> {selectedOrder.restaurant_name}</p>
                                        <p><strong>Email:</strong> {selectedOrder.restaurant_email}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold mb-2">Order Details</h4>
                                        <p><strong>Plan Type:</strong> {selectedOrder.plan_type}</p>
                                        <p><strong>Amount:</strong> {selectedOrder.amount.toLocaleString()} {selectedOrder.currency}</p>
                                        <p><strong>Payment Method:</strong> {selectedOrder.payment_method}</p>
                                        {selectedOrder.payment_reference && (
                                          <p><strong>Payment Reference:</strong> {selectedOrder.payment_reference}</p>
                                        )}
                                        <p><strong>Status:</strong> {selectedOrder.status}</p>
                                      </div>
                                      {selectedOrder.notes && (
                                        <div>
                                          <h4 className="font-semibold mb-2">Notes</h4>
                                          <p className="bg-muted p-2 rounded">{selectedOrder.notes}</p>
                                        </div>
                                      )}
                                      {selectedOrder.status === 'pending' && (
                                        <div className="space-y-4">
                                          <div>
                                            <label className="text-sm font-medium">Assign Package</label>
                                            <Select defaultValue={selectedOrder.package_id}>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select package for approval" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {packages.map((pkg) => (
                                                  <SelectItem key={pkg.id} value={pkg.id}>
                                                    {pkg.name} - {pkg.price.toLocaleString()} {pkg.currency}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              onClick={() => {
                                                const packageSelect = document.querySelector('[data-radix-collection-item]') as HTMLElement;
                                                const packageId = packageSelect?.getAttribute('data-value') || packages[0]?.id;
                                                updateOrderStatus(selectedOrder.id, 'approved', packageId);
                                              }}
                                              className="flex-1"
                                            >
                                              <Check className="h-4 w-4 mr-2" />
                                              Approve Order
                                            </Button>
                                            <Button
                                              variant="destructive"
                                              onClick={() => updateOrderStatus(selectedOrder.id, 'rejected')}
                                              className="flex-1"
                                            >
                                              <X className="h-4 w-4 mr-2" />
                                              Reject Order
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              {order.status === 'pending' && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    onClick={() => updateOrderStatus(order.id, 'approved', packages[0]?.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateOrderStatus(order.id, 'rejected')}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminSubscriptionOrders;