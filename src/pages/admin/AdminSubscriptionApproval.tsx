import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Eye, Calendar } from 'lucide-react';

interface SubscriptionOrder {
  id: string;
  restaurant_name: string;
  restaurant_email: string;
  restaurant_phone?: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  restaurant_id: string;
  rejection_reason?: string;
}

const AdminSubscriptionApproval = () => {
  const [orders, setOrders] = useState<SubscriptionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<SubscriptionOrder | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscription_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load subscription orders');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedOrder) return;

    try {
      // Update the subscription order status
      const { error: orderError } = await supabase
        .from('subscription_orders')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id);

      if (orderError) throw orderError;

      // Update the restaurant's subscription status
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // 1 month subscription

      const { error: restaurantError } = await supabase
        .from('restaurants')
        .update({
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString().split('T')[0],
          subscription_end_date: subscriptionEndDate.toISOString().split('T')[0]
        })
        .eq('id', selectedOrder.restaurant_id);

      if (restaurantError) throw restaurantError;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: 'approved' }
          : order
      ));

      setIsApprovalDialogOpen(false);
      setSelectedOrder(null);
      toast.success('Subscription approved successfully!');
    } catch (error: any) {
      console.error('Error approving subscription:', error);
      toast.error(error.message || 'Failed to approve subscription');
    }
  };

  const handleReject = async () => {
    if (!selectedOrder || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const { error } = await supabase
        .from('subscription_orders')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: 'rejected', rejection_reason: rejectionReason }
          : order
      ));

      setIsRejectionDialogOpen(false);
      setSelectedOrder(null);
      setRejectionReason('');
      toast.success('Subscription rejected');
    } catch (error: any) {
      console.error('Error rejecting subscription:', error);
      toast.error(error.message || 'Failed to reject subscription');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const processedOrders = orders.filter(order => order.status !== 'pending');

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Approval</h1>
          <p className="text-muted-foreground">Review and approve subscription requests</p>
        </div>
        <Button variant="outline" onClick={fetchOrders}>
          Refresh
        </Button>
      </div>

      {/* Pending Orders */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Pending Requests ({pendingOrders.length})
        </h2>
        
        {pendingOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center p-8">
              <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No pending requests</h3>
              <p className="text-muted-foreground">All subscription requests have been processed</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{order.restaurant_name}</CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </Badge>
                  </div>
                  <CardDescription>{order.restaurant_email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">
                        {order.amount.toLocaleString()} {order.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="font-medium">{order.payment_method}</span>
                    </div>
                    {order.payment_reference && (
                      <div className="flex justify-between">
                        <span>Reference:</span>
                        <span className="font-medium text-sm">{order.payment_reference}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Requested:</span>
                      <span className="font-medium">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {order.notes && (
                    <div>
                      <span className="text-sm font-medium">Notes:</span>
                      <p className="text-sm text-muted-foreground mt-1">{order.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Dialog open={isApprovalDialogOpen && selectedOrder?.id === order.id} onOpenChange={(open) => {
                      setIsApprovalDialogOpen(open);
                      if (!open) setSelectedOrder(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          className="flex-1" 
                          onClick={() => setSelectedOrder(order)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Subscription</DialogTitle>
                          <DialogDescription>
                            This will activate the subscription for {order.restaurant_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-muted p-4 rounded">
                            <h4 className="font-medium mb-2">Subscription Details:</h4>
                            <p><strong>Restaurant:</strong> {order.restaurant_name}</p>
                            <p><strong>Email:</strong> {order.restaurant_email}</p>
                            <p><strong>Amount:</strong> {order.amount.toLocaleString()} {order.currency}</p>
                            <p><strong>Payment Reference:</strong> {order.payment_reference || 'N/A'}</p>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleApprove}>
                              Confirm Approval
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isRejectionDialogOpen && selectedOrder?.id === order.id} onOpenChange={(open) => {
                      setIsRejectionDialogOpen(open);
                      if (!open) {
                        setSelectedOrder(null);
                        setRejectionReason('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Subscription</DialogTitle>
                          <DialogDescription>
                            Please provide a reason for rejecting this subscription request
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                            <Textarea
                              id="rejectionReason"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Please explain why this request is being rejected..."
                              required
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsRejectionDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleReject}>
                              Confirm Rejection
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Processed Orders */}
      {processedOrders.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Processed Requests ({processedOrders.length})
          </h2>
          <div className="space-y-4">
            {processedOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.restaurant_name}</span>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.restaurant_email} • 
                        {order.amount.toLocaleString()} {order.currency} • 
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      {order.rejection_reason && (
                        <p className="text-sm text-red-600">
                          <strong>Rejection Reason:</strong> {order.rejection_reason}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionApproval;