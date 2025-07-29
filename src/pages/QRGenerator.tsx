import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { RestaurantSidebar } from "@/components/RestaurantSidebar";
import { supabase } from "@/integrations/supabase/client";
import { 
  QrCode, 
  Download, 
  Eye, 
  Plus,
  Copy,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDynamicDomain } from "@/hooks/useDynamicDomain";
import { downloadQRCode } from "@/utils/qrCodeGenerator";

interface RestaurantTable {
  id: string;
  tableNumber: string;
  tableName: string | null;
  qrCodeData: string;
  qrCodeUrl: string | null;
  isActive: boolean;
}

const QRGenerator = () => {
  const [newTable, setNewTable] = useState({ number: "", name: "" });
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const { toast } = useToast();

  const { domain } = useDynamicDomain();

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to manage your tables",
          variant: "destructive"
        });
        return;
      }

      setRestaurantId(user.id);

      const { data, error } = await supabase
        .from("restaurant_tables")
        .select(`
          id,
          tableNumber:table_number,
          tableName:table_name,
          qrCodeData:qr_code_data,
          qrCodeUrl:qr_code_url,
          isActive:is_active
        `)
        .eq("restaurant_id", user.id)
        .order("table_number");

      if (error) throw error;
      setTables(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load tables",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurantId) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive"
      });
      return;
    }

    try {
      const qrCodeData = `${domain}/m/${restaurantId}/${newTable.number}`;
      
      const { data, error } = await supabase
        .from("restaurant_tables")
        .insert({
          restaurant_id: restaurantId,
          table_number: newTable.number,
          table_name: newTable.name || null,
          qr_code_data: qrCodeData,
          is_active: true
        })
        .select(`
          id,
          tableNumber:table_number,
          tableName:table_name,
          qrCodeData:qr_code_data,
          qrCodeUrl:qr_code_url,
          isActive:is_active
        `)
        .single();

      if (error) throw error;

      setTables([...tables, data]);
      setNewTable({ number: "", name: "" });
      
      toast({
        title: "Table Added",
        description: `QR code generated for ${data.tableName || `Table ${data.tableNumber}`}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add table",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (url: string, tableName: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: `${tableName} URL copied to clipboard`,
    });
  };

  const toggleTableStatus = async (tableId: string) => {
    try {
      const table = tables.find(t => t.id === tableId);
      if (!table) return;

      const { error } = await supabase
        .from("restaurant_tables")
        .update({ is_active: !table.isActive })
        .eq("id", tableId);

      if (error) throw error;

      setTables(tables.map(t => 
        t.id === tableId ? { ...t, isActive: !t.isActive } : t
      ));

      toast({
        title: "Table Updated",
        description: `Table ${table.tableNumber} ${!table.isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update table status",
        variant: "destructive"
      });
    }
  };

  const downloadQR = async (tableName: string, qrCodeData: string) => {
    try {
      const filename = `table-${tableName.toLowerCase().replace(/\s+/g, '-')}`;
      await downloadQRCode(qrCodeData, filename);
      toast({
        title: "QR Code Downloaded",
        description: `QR code for ${tableName} has been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download QR code",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <RestaurantSidebar />
          <SidebarInset>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">Loading tables...</div>
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
              <h1 className="text-xl font-semibold">QR Code Generator</h1>
              <p className="text-sm text-muted-foreground">Create and manage QR codes for your tables</p>
            </div>
          </header>

          <div className="flex-1 space-y-6 p-4 pt-6">

        {/* Add New Table */}
        <Card className="mb-8 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Table
            </CardTitle>
            <CardDescription>Generate a QR code for a new table</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTable} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="tableNumber">Table Number</Label>
                <Input
                  id="tableNumber"
                  value={newTable.number}
                  onChange={(e) => setNewTable({...newTable, number: e.target.value})}
                  placeholder="e.g., 5"
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="tableName">Table Name (Optional)</Label>
                <Input
                  id="tableName"
                  value={newTable.name}
                  onChange={(e) => setNewTable({...newTable, name: e.target.value})}
                  placeholder="e.g., VIP Table, Window Table"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="hero">
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tables Grid */}
        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Your Tables</h2>
            <Badge variant="outline">{tables.length} tables</Badge>
          </div>

          {tables.map((table) => (
            <Card key={table.id} className="shadow-elegant hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">{table.tableName || `Table ${table.tableNumber}`}</h3>
                      <Badge variant={table.isActive ? "default" : "secondary"}>
                        {table.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">Table #{table.tableNumber}</p>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Customer URL:</p>
                      <p className="font-mono text-sm break-all">{table.qrCodeData}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(table.qrCodeData, table.tableName || `Table ${table.tableNumber}`)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy URL
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => downloadQR(table.tableName || `Table ${table.tableNumber}`, table.qrCodeData)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download QR
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/m/${restaurantId}/${table.tableNumber}`} target="_blank">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleTableStatus(table.id)}
                    >
                      {table.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tables.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-4">No tables created yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Add your first table to generate QR codes for customer ordering
              </p>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">How to Use QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Generate QR codes for each table in your restaurant</li>
              <li>Download and print the QR codes</li>
              <li>Place them on tables or tent cards</li>
              <li>Customers scan the code to access your menu</li>
              <li>Orders are sent directly to your WhatsApp</li>
            </ol>
          </CardContent>
          </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default QRGenerator;