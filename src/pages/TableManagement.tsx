import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { RestaurantSidebar } from "@/components/RestaurantSidebar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, QrCode, Edit2, Trash2, Download, Eye, EyeOff, AlertCircle } from "lucide-react";
import QRCode from "qrcode";
import { useDynamicDomain } from "@/hooks/useDynamicDomain";
import { QRCodeUpdater } from "@/components/QRCodeUpdater";

interface RestaurantTable {
  id: string;
  table_number: string;
  table_name?: string;
  qr_code_data: string;
  is_active: boolean;
}

const TableManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [newTableOpen, setNewTableOpen] = useState(false);
  const [newTable, setNewTable] = useState({ table_number: "", table_name: "" });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();
  const { domain } = useDynamicDomain();

  useEffect(() => {
    if (isAuthenticated && user) {
      ensureRestaurantExists();
    }
  }, [isAuthenticated, user]);

  const ensureRestaurantExists = async () => {
    try {
      if (!user) return;
      
      console.log("Ensuring restaurant record exists for user:", user.id);
      
      // Get user data from auth
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      // Get basic package ID
      const { data: basicPackage } = await supabase
        .from("packages")
        .select("id")
        .eq("name", "Basic")
        .single();

      // Insert restaurant record if it doesn't exist
      const { error } = await supabase
        .from("restaurants")
        .insert({
          id: user.id,
          name: `Restaurant ${userData.user.email?.split('@')[0] || 'User'}`,
          email: userData.user.email || '',
          whatsapp_number: '+250788000000',
          password_hash: 'handled_by_auth',
          subscription_status: 'pending',
          package_id: basicPackage?.id || null,
          plan: 'paid',
          currency: 'RWF'
        })
        .select();
      
      if (error && error.code !== '23505') { // 23505 is unique constraint violation (already exists)
        console.error("Error ensuring restaurant record:", error);
      } else {
        console.log("Restaurant record ensured for user:", user.id);
      }
      
      // Now load tables
      loadTables();
    } catch (error) {
      console.error("Error in ensureRestaurantExists:", error);
      // Still try to load tables even if this fails
      loadTables();
    }
  };

  const loadTables = async () => {
    try {
      if (!user) {
        console.error("No authenticated user found");
        return;
      }

      console.log("Loading tables for user:", user.id);
      
      const { data, error } = await supabase
        .from("restaurant_tables")
        .select("*")
        .eq("restaurant_id", user.id)
        .order("table_number");

      if (error) {
        console.error("Tables fetch error:", error);
        throw error;
      }

      console.log("Tables loaded:", data);
      setTables(data || []);
    } catch (error: any) {
      console.error("Error loading tables:", error);
      toast({
        title: "Error loading tables",
        description: error.message || "Failed to load tables",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  };

  const generateQRCodeData = (restaurantId: string, tableNumber: string) => {
    // Use dynamic domain from system settings, fallback to current origin
    const baseUrl = domain || window.location.origin;
    return `${baseUrl}/order/${restaurantId}/${tableNumber}`;
  };

  const handleCreateTable = async () => {
    if (!newTable.table_number.trim()) {
      toast({
        title: "Error",
        description: "Table number is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log("Creating table for user:", user.id);
      console.log("New table data:", newTable);

      const qrCodeData = generateQRCodeData(user.id, newTable.table_number);
      
      const tableData = {
        restaurant_id: user.id,
        table_number: newTable.table_number.trim(),
        table_name: newTable.table_name.trim() || null,
        qr_code_data: qrCodeData,
        is_active: true
      };

      console.log("Table data to create:", tableData);

      const { data, error } = await supabase
        .from("restaurant_tables")
        .insert(tableData)
        .select();

      if (error) {
        console.error("Table creation error:", error);
        throw error;
      }

      console.log("Table created:", data);
      toast({
        title: "Success",
        description: "Table created successfully"
      });

      setNewTable({ table_number: "", table_name: "" });
      setNewTableOpen(false);
      loadTables();
    } catch (error: any) {
      console.error("Error creating table:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create table",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (table: RestaurantTable) => {
    try {
      const { error } = await supabase
        .from("restaurant_tables")
        .update({ is_active: !table.is_active })
        .eq("id", table.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Table ${table.is_active ? 'deactivated' : 'activated'}`
      });

      loadTables();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update table status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      const { error } = await supabase
        .from("restaurant_tables")
        .delete()
        .eq("id", tableId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Table deleted successfully"
      });

      loadTables();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete table",
        variant: "destructive"
      });
    }
  };

  const downloadQRCode = async (table: RestaurantTable) => {
    try {
      console.log("Generating QR code for:", table.qr_code_data);
      
      const qrCodeDataURL = await QRCode.toDataURL(table.qr_code_data, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create download link
      const link = document.createElement('a');
      link.href = qrCodeDataURL;
      link.download = `table-${table.table_number}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "QR code downloaded successfully"
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    }
  };

  const previewQRCode = async (table: RestaurantTable) => {
    try {
      console.log("Opening QR code preview for:", table.qr_code_data);
      window.open(table.qr_code_data, '_blank');
    } catch (error) {
      console.error("Error opening preview:", error);
      toast({
        title: "Error",
        description: "Failed to open preview",
        variant: "destructive"
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Please log in to manage your tables</p>
        </div>
      </div>
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
              <h1 className="text-xl font-semibold">Table Management</h1>
              <p className="text-sm text-muted-foreground">Manage your restaurant tables and QR codes</p>
            </div>
          </header>

          <div className="flex-1 space-y-6 p-6">
            <QRCodeUpdater />
            
            {dataLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading tables...</p>
              </div>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="h-5 w-5" />
                      Restaurant Tables
                    </CardTitle>
                    <CardDescription>Create and manage your restaurant tables with QR codes</CardDescription>
                  </div>
                  <Dialog open={newTableOpen} onOpenChange={setNewTableOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Table
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Table</DialogTitle>
                        <DialogDescription>
                          Create a new table with a unique number and optional name
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="table-number">Table Number</Label>
                          <Input
                            id="table-number"
                            placeholder="e.g., T1, Table-1, 001"
                            value={newTable.table_number}
                            onChange={(e) => setNewTable({ ...newTable, table_number: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="table-name">Table Name (Optional)</Label>
                          <Input
                            id="table-name"
                            placeholder="e.g., Main Hall Table 1, Patio Corner"
                            value={newTable.table_name}
                            onChange={(e) => setNewTable({ ...newTable, table_name: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreateTable} disabled={loading}>
                          {loading ? "Creating..." : "Create Table"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {tables.map((table) => (
                      <div key={table.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">Table {table.table_number}</h3>
                              <Badge variant={table.is_active ? "default" : "secondary"}>
                                {table.is_active ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                                {table.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            {table.table_name && <p className="text-sm text-muted-foreground">{table.table_name}</p>}
                            <p className="text-xs text-muted-foreground font-mono">{table.qr_code_data}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewQRCode(table)}
                            title="Preview menu"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadQRCode(table)}
                            title="Download QR code"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Switch
                            checked={table.is_active}
                            onCheckedChange={() => handleToggleActive(table)}
                            title={table.is_active ? "Deactivate table" : "Activate table"}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTable(table.id)}
                            title="Delete table"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {tables.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No tables created yet. Add your first table to get started.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default TableManagement;