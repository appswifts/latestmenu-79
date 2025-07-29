import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Check, X, AlertCircle, Package, Clock, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  max_tables: number | null;
  max_menu_items: number | null;
  features: any;
  is_active: boolean;
  display_order: number;
}

interface SubscriptionActivationDialogProps {
  restaurant: any;
  onSubscriptionUpdate: () => void;
}

export const SubscriptionActivationDialog = ({ restaurant, onSubscriptionUpdate }: SubscriptionActivationDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadPackages();
    }
  }, [open]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load packages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitSubscriptionRequest = async (packageId: string) => {
    try {
      setSubmitting(true);
      const selectedPackage = packages.find(p => p.id === packageId);
      if (!selectedPackage || !restaurant) return;

      const { error } = await supabase
        .from('subscription_orders')
        .insert({
          restaurant_id: user?.id,
          restaurant_name: restaurant.name,
          restaurant_email: user?.email,
          restaurant_phone: restaurant.phone || null,
          plan_type: 'monthly',
          amount: selectedPackage.price,
          currency: selectedPackage.currency,
          status: 'pending',
          payment_method: 'pending',
          notes: `Subscription request for ${selectedPackage.name} package`
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your subscription request has been submitted for admin approval. You'll receive payment instructions soon."
      });

      setOpen(false);
      onSubscriptionUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit subscription request",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'expired': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const contactAdmin = () => {
    const message = `Hello Admin,

I need assistance with my restaurant subscription for "${restaurant?.name}".

Restaurant ID: ${user?.id}
Email: ${user?.email}
Current Status: ${restaurant?.subscription_status || 'Unknown'}

Please help me with my subscription activation.

Thank you!`;

    // For now, we'll copy to clipboard - you can replace this with actual admin contact method
    navigator.clipboard.writeText(message);
    toast({
      title: "Message Copied",
      description: "Admin contact message copied to clipboard. Please send this to your admin via WhatsApp or email."
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={restaurant?.subscription_status === 'active' ? "outline" : "default"} 
          className="w-full"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {restaurant?.subscription_status === 'active' ? 'Manage Subscription' : 'Activate Subscription'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Subscription Management
          </DialogTitle>
          <DialogDescription>
            Choose a subscription plan to activate your restaurant menu and start accepting orders
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {restaurant?.subscription_status === 'active' ? (
                    <Check className="h-6 w-6 text-success" />
                  ) : restaurant?.subscription_status === 'pending' ? (
                    <Clock className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  )}
                  <div>
                    <p className="font-medium">
                      {restaurant?.subscription_status === 'active' ? 'Active Subscription' :
                       restaurant?.subscription_status === 'pending' ? 'Subscription Pending' :
                       'No Active Subscription'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {restaurant?.subscription_status === 'active' ? 
                        `Valid until ${restaurant.subscription_end_date ? new Date(restaurant.subscription_end_date).toLocaleDateString() : 'N/A'}` :
                        restaurant?.subscription_status === 'pending' ? 
                        'Awaiting admin approval and payment verification' :
                        'Your menu is currently not visible to customers'
                      }
                    </p>
                  </div>
                </div>
                <Badge className={getSubscriptionStatusColor(restaurant?.subscription_status || 'inactive')}>
                  {restaurant?.subscription_status || 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact Admin */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Have questions about your subscription or need assistance with payment verification?
              </p>
              <Button variant="outline" onClick={contactAdmin} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Admin for Support
              </Button>
            </CardContent>
          </Card>

          {/* Available Plans */}
          {restaurant?.subscription_status !== 'active' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Available Subscription Plans</h3>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading packages...</p>
                </div>
              ) : packages.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.map((pkg) => {
                    const features = Array.isArray(pkg.features) ? pkg.features : [];
                    
                    return (
                      <Card key={pkg.id} className="relative hover:shadow-lg transition-all duration-300">
                        <CardHeader className="text-center">
                          <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                          <CardDescription>{pkg.description}</CardDescription>
                          <div className="mt-4">
                            <span className="text-3xl font-bold text-foreground">
                              {(pkg.price / 100).toLocaleString()} {pkg.currency}
                            </span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <ul className="space-y-2 mb-6">
                            {pkg.max_tables && (
                              <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-success" />
                                <span className="text-sm">Up to {pkg.max_tables} tables</span>
                              </li>
                            )}
                            {pkg.max_menu_items && (
                              <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-success" />
                                <span className="text-sm">Up to {pkg.max_menu_items} menu items</span>
                              </li>
                            )}
                            {features.map((feature: string, index: number) => (
                              <li key={index} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-success" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <Button 
                            className="w-full" 
                            disabled={submitting}
                            onClick={() => submitSubscriptionRequest(pkg.id)}
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              'Request This Plan'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Plans Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Subscription plans will be available here once configured by the admin.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};