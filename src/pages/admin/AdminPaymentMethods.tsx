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
import { CreditCard, Plus, Edit, Trash2, Settings } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  config: any;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const AdminPaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [newMethod, setNewMethod] = useState({
    name: "",
    type: "manual",
    config: {},
    is_active: true,
    is_default: false,
    configFields: {
      account_number: "",
      account_name: "",
      bank_name: "",
      instructions: "",
      phone_number: "",
      provider: ""
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const createPaymentMethod = async () => {
    try {
      const methodData = {
        name: newMethod.name,
        type: newMethod.type,
        config: newMethod.configFields,
        is_active: newMethod.is_active,
        is_default: newMethod.is_default
      };

      const { error } = await supabase
        .from('payment_methods')
        .insert(methodData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment method created successfully"
      });

      setNewMethod({
        name: "",
        type: "manual",
        config: {},
        is_active: true,
        is_default: false,
        configFields: {
          account_number: "",
          account_name: "",
          bank_name: "",
          instructions: "",
          phone_number: "",
          provider: ""
        }
      });
      setShowCreateDialog(false);
      loadPaymentMethods();
    } catch (error: any) {
      console.error('Create payment method error:', error);
      toast({
        title: "Error",
        description: "Failed to create payment method",
        variant: "destructive"
      });
    }
  };

  const updatePaymentMethod = async () => {
    if (!editingMethod) return;

    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({
          name: editingMethod.name,
          type: editingMethod.type,
          config: editingMethod.config,
          is_active: editingMethod.is_active,
          is_default: editingMethod.is_default
        })
        .eq('id', editingMethod.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment method updated successfully"
      });

      setEditingMethod(null);
      loadPaymentMethods();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update payment method",
        variant: "destructive"
      });
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment method deleted successfully"
      });

      loadPaymentMethods();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive"
      });
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      // First, remove default from all methods
      await supabase
        .from('payment_methods')
        .update({ is_default: false });

      // Then set the selected one as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Default payment method updated"
      });

      loadPaymentMethods();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to set default payment method",
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
                <p className="mt-2 text-muted-foreground">Loading payment methods...</p>
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
              <h1 className="text-xl font-semibold">Payment Methods</h1>
              <p className="text-sm text-muted-foreground">Configure payment methods for the system</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Payment Method</DialogTitle>
                  <DialogDescription>Add a new payment method to the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Method Name</Label>
                      <Input
                        id="name"
                        value={newMethod.name}
                        onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                        placeholder="Mobile Money"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={newMethod.type} onValueChange={(value) => setNewMethod({ ...newMethod, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Configuration Fields */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-medium">Payment Method Configuration</h4>
                    {newMethod.type === 'manual' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="account_number">Account Number</Label>
                            <Input
                              id="account_number"
                              value={newMethod.configFields.account_number}
                              onChange={(e) => setNewMethod({ 
                                ...newMethod, 
                                configFields: { 
                                  ...newMethod.configFields, 
                                  account_number: e.target.value 
                                }
                              })}
                              placeholder="123456789"
                            />
                          </div>
                          <div>
                            <Label htmlFor="account_name">Account Name</Label>
                            <Input
                              id="account_name"
                              value={newMethod.configFields.account_name}
                              onChange={(e) => setNewMethod({ 
                                ...newMethod, 
                                configFields: { 
                                  ...newMethod.configFields, 
                                  account_name: e.target.value 
                                }
                              })}
                              placeholder="Restaurant Business Account"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="bank_name">Bank Name</Label>
                          <Input
                            id="bank_name"
                            value={newMethod.configFields.bank_name}
                            onChange={(e) => setNewMethod({ 
                              ...newMethod, 
                              configFields: { 
                                ...newMethod.configFields, 
                                bank_name: e.target.value 
                              }
                            })}
                            placeholder="Bank of Kigali"
                          />
                        </div>
                        <div>
                          <Label htmlFor="instructions">Payment Instructions</Label>
                          <Textarea
                            id="instructions"
                            value={newMethod.configFields.instructions}
                            onChange={(e) => setNewMethod({ 
                              ...newMethod, 
                              configFields: { 
                                ...newMethod.configFields, 
                                instructions: e.target.value 
                              }
                            })}
                            placeholder="Please transfer to the account above and send proof of payment..."
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                    {newMethod.type === 'mobile_money' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input
                              id="phone_number"
                              value={newMethod.configFields.phone_number || ""}
                              onChange={(e) => setNewMethod({ 
                                ...newMethod, 
                                configFields: { 
                                  ...newMethod.configFields, 
                                  phone_number: e.target.value 
                                }
                              })}
                              placeholder="+250788000000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="provider">Mobile Money Provider</Label>
                            <Select 
                              value={newMethod.configFields.provider || ""} 
                              onValueChange={(value) => setNewMethod({ 
                                ...newMethod, 
                                configFields: { 
                                  ...newMethod.configFields, 
                                  provider: value 
                                }
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="airtel">Airtel Money</SelectItem>
                                <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                                <SelectItem value="tigo">Tigo Cash</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={newMethod.is_active}
                        onCheckedChange={(checked) => setNewMethod({ ...newMethod, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_default"
                        checked={newMethod.is_default}
                        onCheckedChange={(checked) => setNewMethod({ ...newMethod, is_default: checked })}
                      />
                      <Label htmlFor="is_default">Set as Default</Label>
                    </div>
                  </div>
                  <Button onClick={createPaymentMethod} className="w-full">
                    Create Payment Method
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </header>

          <div className="flex-1 space-y-4 p-4 pt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods ({paymentMethods.length})
                </CardTitle>
                <CardDescription>Manage payment methods available in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {paymentMethods.map((method) => (
                    <Card key={method.id} className={!method.is_active ? "opacity-60" : ""}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold">{method.name}</h3>
                            <div className="flex gap-1">
                              {method.is_default && (
                                <Badge variant="default">Default</Badge>
                              )}
                              <Badge variant={method.is_active ? "default" : "secondary"}>
                                {method.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                           <div className="text-sm space-y-1">
                             <p><span className="font-medium">Type:</span> {method.type}</p>
                             {method.config && typeof method.config === 'object' && (
                               <div className="space-y-1">
                                 {method.config.account_number && (
                                   <p><span className="font-medium">Account:</span> {method.config.account_number}</p>
                                 )}
                                 {method.config.bank_name && (
                                   <p><span className="font-medium">Bank:</span> {method.config.bank_name}</p>
                                 )}
                                 {method.config.phone_number && (
                                   <p><span className="font-medium">Phone:</span> {method.config.phone_number}</p>
                                 )}
                                 {method.config.provider && (
                                   <p><span className="font-medium">Provider:</span> {method.config.provider}</p>
                                 )}
                               </div>
                             )}
                             <p className="text-muted-foreground">
                               Created: {new Date(method.created_at).toLocaleDateString()}
                             </p>
                           </div>
                          <div className="flex gap-2">
                            {!method.is_default && method.is_active && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setAsDefault(method.id)}
                              >
                                <Settings className="h-4 w-4 mr-1" />
                                Set Default
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingMethod(method)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deletePaymentMethod(method.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingMethod} onOpenChange={() => setEditingMethod(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>Update payment method details</DialogDescription>
          </DialogHeader>
          {editingMethod && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Method Name</Label>
                  <Input
                    value={editingMethod.name}
                    onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={editingMethod.type} onValueChange={(value) => setEditingMethod({ ...editingMethod, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingMethod.is_active}
                    onCheckedChange={(checked) => setEditingMethod({ ...editingMethod, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingMethod.is_default}
                    onCheckedChange={(checked) => setEditingMethod({ ...editingMethod, is_default: checked })}
                  />
                  <Label>Set as Default</Label>
                </div>
              </div>
              <Button onClick={updatePaymentMethod} className="w-full">
                Update Payment Method
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AdminPaymentMethods;