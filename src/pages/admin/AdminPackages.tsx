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
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Edit, Trash2 } from "lucide-react";

interface PackageData {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  max_tables?: number;
  max_menu_items?: number;
  features: any;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const AdminPackages = () => {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    price: "",
    currency: "RWF",
    max_tables: "",
    max_menu_items: "",
    features: [] as string[],
    is_active: true,
    display_order: "0"
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load packages",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const createPackage = async () => {
    try {
      const { error } = await supabase
        .from('packages')
        .insert({
          name: newPackage.name,
          description: newPackage.description,
          price: parseInt(newPackage.price),
          currency: newPackage.currency,
          max_tables: newPackage.max_tables ? parseInt(newPackage.max_tables) : null,
          max_menu_items: newPackage.max_menu_items ? parseInt(newPackage.max_menu_items) : null,
          features: newPackage.features,
          is_active: newPackage.is_active,
          display_order: parseInt(newPackage.display_order)
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package created successfully"
      });

      setNewPackage({
        name: "",
        description: "",
        price: "",
        currency: "RWF",
        max_tables: "",
        max_menu_items: "",
        features: [],
        is_active: true,
        display_order: "0"
      });
      setShowCreateDialog(false);
      loadPackages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create package",
        variant: "destructive"
      });
    }
  };

  const updatePackage = async () => {
    if (!editingPackage) return;

    try {
      const { error } = await supabase
        .from('packages')
        .update({
          name: editingPackage.name,
          description: editingPackage.description,
          price: editingPackage.price,
          currency: editingPackage.currency,
          max_tables: editingPackage.max_tables,
          max_menu_items: editingPackage.max_menu_items,
          features: editingPackage.features,
          is_active: editingPackage.is_active,
          display_order: editingPackage.display_order
        })
        .eq('id', editingPackage.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package updated successfully"
      });

      setEditingPackage(null);
      loadPackages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update package",
        variant: "destructive"
      });
    }
  };

  const deletePackage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package deleted successfully"
      });

      loadPackages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete package",
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
                <p className="mt-2 text-muted-foreground">Loading packages...</p>
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
              <h1 className="text-xl font-semibold">Package Management</h1>
              <p className="text-sm text-muted-foreground">Manage subscription packages</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Package
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Package</DialogTitle>
                  <DialogDescription>Add a new subscription package</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Package Name</Label>
                      <Input
                        id="name"
                        value={newPackage.name}
                        onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                        placeholder="Basic Plan"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newPackage.price}
                        onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                        placeholder="29999"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newPackage.description}
                      onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                      placeholder="Package description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={newPackage.currency} onValueChange={(value) => setNewPackage({ ...newPackage, currency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RWF">RWF</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="display_order">Display Order</Label>
                      <Input
                        id="display_order"
                        type="number"
                        value={newPackage.display_order}
                        onChange={(e) => setNewPackage({ ...newPackage, display_order: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max_tables">Max Tables</Label>
                      <Input
                        id="max_tables"
                        type="number"
                        value={newPackage.max_tables}
                        onChange={(e) => setNewPackage({ ...newPackage, max_tables: e.target.value })}
                        placeholder="Unlimited (leave empty)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_menu_items">Max Menu Items</Label>
                      <Input
                        id="max_menu_items"
                        type="number"
                        value={newPackage.max_menu_items}
                        onChange={(e) => setNewPackage({ ...newPackage, max_menu_items: e.target.value })}
                        placeholder="Unlimited (leave empty)"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={newPackage.is_active}
                      onCheckedChange={(checked) => setNewPackage({ ...newPackage, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active Package</Label>
                  </div>
                  <Button onClick={createPackage} className="w-full">
                    Create Package
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </header>

          <div className="flex-1 space-y-4 p-4 pt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Packages ({packages.length})
                </CardTitle>
                <CardDescription>Manage subscription packages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {packages.map((pkg) => (
                    <Card key={pkg.id} className={!pkg.is_active ? "opacity-60" : ""}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold">{pkg.name}</h3>
                            <div className="flex gap-1">
                              <Badge variant={pkg.is_active ? "default" : "secondary"}>
                                {pkg.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{pkg.description}</p>
                          <div className="text-lg font-bold">
                            {formatCurrency(pkg.price, pkg.currency)}
                          </div>
                          <div className="text-sm space-y-1">
                            {pkg.max_tables && (
                              <p>Max Tables: {pkg.max_tables}</p>
                            )}
                            {pkg.max_menu_items && (
                              <p>Max Menu Items: {pkg.max_menu_items}</p>
                            )}
                            <p className="text-muted-foreground">
                              Order: {pkg.display_order}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingPackage(pkg)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deletePackage(pkg.id)}
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
      <Dialog open={!!editingPackage} onOpenChange={() => setEditingPackage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>Update package details</DialogDescription>
          </DialogHeader>
          {editingPackage && (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Package Name</Label>
                  <Input
                    value={editingPackage.name}
                    onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={editingPackage.price}
                    onChange={(e) => setEditingPackage({ ...editingPackage, price: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingPackage.description || ""}
                  onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Tables</Label>
                  <Input
                    type="number"
                    value={editingPackage.max_tables || ""}
                    onChange={(e) => setEditingPackage({ ...editingPackage, max_tables: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
                <div>
                  <Label>Max Menu Items</Label>
                  <Input
                    type="number"
                    value={editingPackage.max_menu_items || ""}
                    onChange={(e) => setEditingPackage({ ...editingPackage, max_menu_items: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingPackage.is_active}
                  onCheckedChange={(checked) => setEditingPackage({ ...editingPackage, is_active: checked })}
                />
                <Label>Active Package</Label>
              </div>
              <Button onClick={updatePackage} className="w-full">
                Update Package
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AdminPackages;