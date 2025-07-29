import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Edit, Trash2 } from "lucide-react";

interface HonorarySubscription {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  start_date: string;
  end_date: string;
  reason: string;
  is_active: boolean;
  granted_by: string;
  created_at: string;
}

const AdminHonorarySubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<HonorarySubscription[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<HonorarySubscription | null>(null);
  const [newSubscription, setNewSubscription] = useState({
    restaurant_id: "",
    start_date: "",
    end_date: "",
    reason: "",
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load restaurants for selection
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id, name, email')
        .order('name');

      if (restaurantsError) throw restaurantsError;
      setRestaurants(restaurantsData || []);

      // Since honorary_subscriptions table doesn't exist in current schema,
      // we'll show empty list for now - this would be implemented with proper table migration
      setSubscriptions([]);
    } catch (error: any) {
      console.error('Load data error:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const createSubscription = async () => {
    try {
      // Directly update restaurant subscription status for honorary subscription
      const { error } = await supabase
        .from('restaurants')
        .update({
          subscription_status: 'active',
          subscription_start_date: newSubscription.start_date,
          subscription_end_date: newSubscription.end_date,
          plan: 'honorary' // Mark as honorary
        })
        .eq('id', newSubscription.restaurant_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Honorary subscription granted successfully - Restaurant subscription status updated"
      });

      setNewSubscription({
        restaurant_id: "",
        start_date: "",
        end_date: "",
        reason: "",
        is_active: true
      });
      setShowCreateDialog(false);
      loadData();
    } catch (error: any) {
      console.error('Create subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to grant honorary subscription",
        variant: "destructive"
      });
    }
  };

  const updateSubscription = async () => {
    if (!editingSubscription) return;

    try {
      // This feature requires proper honorary_subscriptions table
      toast({
        title: "Info",
        description: "Honorary subscription management requires database table setup",
        variant: "default"
      });

      setEditingSubscription(null);
    } catch (error: any) {
      console.error('Update subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to update honorary subscription",
        variant: "destructive"
      });
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      // This feature requires proper honorary_subscriptions table
      toast({
        title: "Info",
        description: "Honorary subscription management requires database table setup",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Delete subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to delete honorary subscription",
        variant: "destructive"
      });
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
                <p className="mt-2 text-muted-foreground">Loading honorary subscriptions...</p>
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
              <h1 className="text-xl font-semibold">Honorary Subscriptions</h1>
              <p className="text-sm text-muted-foreground">Manage honorary subscriptions for restaurants</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Honorary Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Honorary Subscription</DialogTitle>
                  <DialogDescription>Grant honorary subscription to a restaurant</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="restaurant">Restaurant</Label>
                    <Select value={newSubscription.restaurant_id} onValueChange={(value) => setNewSubscription({ ...newSubscription, restaurant_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select restaurant" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurants.map((restaurant) => (
                          <SelectItem key={restaurant.id} value={restaurant.id}>
                            {restaurant.name} ({restaurant.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={newSubscription.start_date}
                        onChange={(e) => setNewSubscription({ ...newSubscription, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={newSubscription.end_date}
                        onChange={(e) => setNewSubscription({ ...newSubscription, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      value={newSubscription.reason}
                      onChange={(e) => setNewSubscription({ ...newSubscription, reason: e.target.value })}
                      placeholder="Reason for honorary subscription"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={newSubscription.is_active}
                      onCheckedChange={(checked) => setNewSubscription({ ...newSubscription, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <Button onClick={createSubscription} className="w-full">
                    Create Honorary Subscription
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </header>

          <div className="flex-1 space-y-4 p-4 pt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Honorary Subscriptions ({subscriptions.length})
                </CardTitle>
                <CardDescription>Manage honorary subscriptions for restaurants</CardDescription>
              </CardHeader>
              <CardContent>
                 {subscriptions.length === 0 ? (
                   <div className="text-center py-8">
                     <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                     <p className="text-muted-foreground">No honorary subscriptions found</p>
                     <p className="text-xs text-muted-foreground mt-2">
                       Honorary subscriptions can be granted to restaurants by updating their status directly
                     </p>
                   </div>
                 ) : (
                  <div className="grid gap-4">
                    {subscriptions.map((subscription) => (
                      <Card key={subscription.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="font-semibold">{subscription.restaurant_name}</h3>
                              <p className="text-sm text-muted-foreground">{subscription.reason}</p>
                              <div className="flex gap-2 text-sm">
                                <span>From: {subscription.start_date}</span>
                                <span>To: {subscription.end_date}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <Badge variant={subscription.is_active ? "default" : "secondary"}>
                                {subscription.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingSubscription(subscription)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteSubscription(subscription.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingSubscription} onOpenChange={() => setEditingSubscription(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Honorary Subscription</DialogTitle>
            <DialogDescription>Update honorary subscription details</DialogDescription>
          </DialogHeader>
          {editingSubscription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={editingSubscription.start_date}
                    onChange={(e) => setEditingSubscription({ ...editingSubscription, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={editingSubscription.end_date}
                    onChange={(e) => setEditingSubscription({ ...editingSubscription, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <Textarea
                  value={editingSubscription.reason}
                  onChange={(e) => setEditingSubscription({ ...editingSubscription, reason: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingSubscription.is_active}
                  onCheckedChange={(checked) => setEditingSubscription({ ...editingSubscription, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <Button onClick={updateSubscription} className="w-full">
                Update Honorary Subscription
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AdminHonorarySubscriptions;