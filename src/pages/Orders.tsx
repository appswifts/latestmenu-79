import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { RestaurantSidebar } from "@/components/RestaurantSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Package, Eye, Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SubscriptionOrder {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_email: string;
  restaurant_phone?: string;
  plan_type: string;
  amount: number;
  currency: string;
  payment_method?: string;
  payment_reference?: string;
  status: string;
  notes?: string;
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<SubscriptionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<SubscriptionOrder | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('subscription_orders')
        .select('*')
        .eq('restaurant_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    }
    setLoading(false);
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

  const exportOrders = () => {
    const csv = [
      ['ID', 'Plan', 'Amount', 'Currency', 'Status', 'Created', 'Payment Method', 'Reference'].join(','),
      ...orders.map(order => [
        order.id,
        order.plan_type,
        order.amount,
        order.currency,
        order.status,
        new Date(order.created_at).toLocaleDateString(),
        order.payment_method || '',
        order.payment_reference || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscription-orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <RestaurantSidebar />
          <SidebarInset>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading orders...</p>
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
        <RestaurantSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Subscription Orders</h1>
              <p className="text-sm text-muted-foreground">View your subscription order history</p>
            </div>
            <Button onClick={exportOrders} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </header>

          <div className="flex-1 space-y-4 p-4 pt-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <Package className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'approved').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Package className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'pending').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <Package className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'approved').reduce((sum, o) => sum + o.amount, 0).toLocaleString()} RWF
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Your Orders ({orders.length})
                </CardTitle>
                <CardDescription>View your subscription order history</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className={order.status === 'pending' ? "border-orange-200 bg-orange-50" : ""}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                              <p className="text-sm text-muted-foreground">Plan: {order.plan_type}</p>
                              <p className="text-lg font-medium">
                                {order.amount.toLocaleString()} {order.currency}
                              </p>
                              <div className="flex gap-2 items-center">
                                <Badge variant={getStatusColor(order.status)}>
                                  {order.status}
                                </Badge>
                              </div>
                              {order.payment_method && (
                                <p className="text-sm">Payment: {order.payment_method}</p>
                              )}
                              {order.payment_reference && (
                                <p className="text-sm">Reference: {order.payment_reference}</p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                Created: {new Date(order.created_at).toLocaleDateString()}
                              </p>
                              {order.approved_at && (
                                <p className="text-sm text-muted-foreground">
                                  Approved: {new Date(order.approved_at).toLocaleDateString()}
                                </p>
                              )}
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
                                    <DialogDescription>View order information</DialogDescription>
                                  </DialogHeader>
                                  {selectedOrder && (
                                    <div className="space-y-4">
                                      <div>
                                        <p className="font-semibold">Order ID: {selectedOrder.id}</p>
                                        <p className="text-sm text-muted-foreground">Plan: {selectedOrder.plan_type}</p>
                                      </div>
                                      <div>
                                        <p className="font-semibold">Amount</p>
                                        <p className="text-sm">{selectedOrder.amount.toLocaleString()} {selectedOrder.currency}</p>
                                      </div>
                                      <div>
                                        <p className="font-semibold">Status</p>
                                        <Badge variant={getStatusColor(selectedOrder.status)}>
                                          {selectedOrder.status}
                                        </Badge>
                                      </div>
                                      {selectedOrder.payment_method && (
                                        <div>
                                          <p className="font-semibold">Payment Information</p>
                                          <p className="text-sm">Method: {selectedOrder.payment_method}</p>
                                          <p className="text-sm">Reference: {selectedOrder.payment_reference || 'N/A'}</p>
                                        </div>
                                      )}
                                      {selectedOrder.notes && (
                                        <div>
                                          <p className="font-semibold">Notes</p>
                                          <p className="text-sm">{selectedOrder.notes}</p>
                                        </div>
                                      )}
                                      {selectedOrder.rejection_reason && (
                                        <div>
                                          <p className="font-semibold">Rejection Reason</p>
                                          <p className="text-sm">{selectedOrder.rejection_reason}</p>
                                        </div>
                                      )}
                                      <div>
                                        <p className="font-semibold">Dates</p>
                                        <p className="text-sm">Created: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                                        {selectedOrder.approved_at && (
                                          <p className="text-sm">Approved: {new Date(selectedOrder.approved_at).toLocaleDateString()}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Orders;