import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { CreditCard, Clock, CheckCircle, AlertCircle, Copy } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  max_tables?: number;
  max_menu_items?: number;
  features: any;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  config: any;
}

interface Restaurant {
  id: string;
  name: string;
  subscription_status: string;
}

interface SubscriptionOrder {
  id: string;
  status: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_reference?: string;
  created_at: string;
  restaurant_name: string;
}

const SubscriptionManagement = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [subscriptionOrders, setSubscriptionOrders] = useState<SubscriptionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  
  const [requestForm, setRequestForm] = useState({
    restaurant_id: '',
    package_id: '',
    payment_method_id: '',
    payment_reference: '',
    notes: ''
  });

  const manualPaymentCode = "*182*1*1*0781965789#";

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (packagesError) throw packagesError;

      // Fetch payment methods
      const { data: paymentMethodsData, error: paymentMethodsError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (paymentMethodsError) throw paymentMethodsError;

      // Fetch user's restaurants
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id, name, subscription_status')
        .eq('user_id', user?.id)
        .order('name');

      if (restaurantsError) throw restaurantsError;

      // Fetch subscription orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('subscription_orders')
        .select('*')
        .eq('restaurant_id', restaurantsData?.[0]?.id || '')
        .order('created_at', { ascending: false });

      setPackages(packagesData || []);
      setPaymentMethods(paymentMethodsData || []);
      setRestaurants(restaurantsData || []);
      setSubscriptionOrders(ordersData || []);
      
      if (restaurantsData && restaurantsData.length > 0) {
        setRequestForm(prev => ({ ...prev, restaurant_id: restaurantsData[0].id }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    try {
      const { data, error } = await supabase
        .from('subscription_orders')
        .insert({
          restaurant_id: requestForm.restaurant_id,
          restaurant_name: restaurants.find(r => r.id === requestForm.restaurant_id)?.name || '',
          restaurant_email: user?.email || '',
          amount: selectedPackage.price,
          currency: selectedPackage.currency,
          payment_method_id: requestForm.payment_method_id,
          payment_reference: requestForm.payment_reference,
          notes: requestForm.notes,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setSubscriptionOrders(prev => [data, ...prev]);
      setRequestForm({ 
        restaurant_id: requestForm.restaurant_id, 
        package_id: '', 
        payment_method_id: '', 
        payment_reference: '', 
        notes: '' 
      });
      setSelectedPackage(null);
      setIsRequestDialogOpen(false);
      toast.success('Subscription request submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error(error.message || 'Failed to submit subscription request');
    }
  };

  const copyPaymentCode = () => {
    navigator.clipboard.writeText(manualPaymentCode);
    toast.success('Payment code copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const hasPendingRequest = subscriptionOrders.some(order => order.status === 'pending');
  const isActiveSubscription = restaurants.some(r => r.subscription_status === 'active');

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
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Manage your restaurant subscriptions</p>
        </div>
      </div>

      {/* Current Status Alert */}
      {!isActiveSubscription && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {hasPendingRequest 
              ? "Your subscription request is pending admin approval. You will be notified once processed."
              : "You don't have an active subscription. Choose a package below to get started."
            }
          </AlertDescription>
        </Alert>
      )}

      {isActiveSubscription && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your subscription is active! Your restaurant menu is live and accepting orders.
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Manual Payment Code:</h4>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-3 py-2 rounded font-mono text-lg">
                  {manualPaymentCode}
                </code>
                <Button size="sm" variant="outline" onClick={copyPaymentCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Use this USSD code to make payments. After payment, submit your subscription request below with the payment reference.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Available Packages */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Available Packages</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="relative">
              <CardHeader>
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
                <div className="text-3xl font-bold">
                  {pkg.price.toLocaleString()} {pkg.currency}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {pkg.max_tables && (
                    <div className="flex justify-between">
                      <span>Max Tables</span>
                      <span className="font-medium">{pkg.max_tables}</span>
                    </div>
                  )}
                  {pkg.max_menu_items && (
                    <div className="flex justify-between">
                      <span>Max Menu Items</span>
                      <span className="font-medium">{pkg.max_menu_items}</span>
                    </div>
                  )}
                </div>
                
                <Dialog open={isRequestDialogOpen && selectedPackage?.id === pkg.id} onOpenChange={(open) => {
                  setIsRequestDialogOpen(open);
                  if (!open) setSelectedPackage(null);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full"
                      disabled={hasPendingRequest || isActiveSubscription}
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setRequestForm(prev => ({ ...prev, package_id: pkg.id }));
                      }}
                    >
                      {hasPendingRequest ? 'Request Pending' : 
                       isActiveSubscription ? 'Already Active' : 'Request Subscription'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Subscription - {pkg.name}</DialogTitle>
                      <DialogDescription>
                        Submit a subscription request for admin approval
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRequestSubscription} className="space-y-4">
                      <div>
                        <Label htmlFor="restaurant">Restaurant *</Label>
                        <Select 
                          value={requestForm.restaurant_id} 
                          onValueChange={(value) => setRequestForm(prev => ({ ...prev, restaurant_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select restaurant" />
                          </SelectTrigger>
                          <SelectContent>
                            {restaurants.map((restaurant) => (
                              <SelectItem key={restaurant.id} value={restaurant.id}>
                                {restaurant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="paymentMethod">Payment Method *</Label>
                        <Select 
                          value={requestForm.payment_method_id} 
                          onValueChange={(value) => setRequestForm(prev => ({ ...prev, payment_method_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.id} value={method.id}>
                                {method.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="paymentRef">Payment Reference</Label>
                        <Input
                          id="paymentRef"
                          value={requestForm.payment_reference}
                          onChange={(e) => setRequestForm(prev => ({ ...prev, payment_reference: e.target.value }))}
                          placeholder="Transaction ID or reference number"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          value={requestForm.notes}
                          onChange={(e) => setRequestForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Any additional information"
                        />
                      </div>
                      
                      <div className="bg-muted p-4 rounded">
                        <h4 className="font-medium mb-2">Package Summary:</h4>
                        <p><strong>Package:</strong> {pkg.name}</p>
                        <p><strong>Price:</strong> {pkg.price.toLocaleString()} {pkg.currency}/month</p>
                        {pkg.max_tables && <p><strong>Max Tables:</strong> {pkg.max_tables}</p>}
                        {pkg.max_menu_items && <p><strong>Max Menu Items:</strong> {pkg.max_menu_items}</p>}
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Submit Request</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Subscription History */}
      {subscriptionOrders.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Subscription Requests</h2>
          <div className="space-y-4">
            {subscriptionOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.restaurant_name}</span>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.amount.toLocaleString()} {order.currency} • 
                        {order.payment_reference && ` Ref: ${order.payment_reference} • `}
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                      {order.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {order.status === 'rejected' && <AlertCircle className="h-4 w-4 text-red-600" />}
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

export default SubscriptionManagement;