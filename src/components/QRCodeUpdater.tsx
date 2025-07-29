import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDynamicDomain } from "@/hooks/useDynamicDomain";
import { RefreshCw } from "lucide-react";

export const QRCodeUpdater = () => {
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<any[]>([]);
  const { toast } = useToast();
  const { domain } = useDynamicDomain();

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("restaurant_tables")
        .select("*")
        .eq("restaurant_id", user.id);

      if (error) throw error;
      setTables(data || []);
    } catch (error: any) {
      console.error("Error loading tables:", error);
    }
  };

  const updateAllQRCodes = async () => {
    if (!domain) {
      toast({
        title: "Error",
        description: "Domain not configured. Please set domain in admin settings.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const updates = tables.map(table => ({
        id: table.id,
        qr_code_data: `${domain}/public-menu/${user.id}/${table.table_number}`
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("restaurant_tables")
          .update({ qr_code_data: update.qr_code_data })
          .eq("id", update.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Updated ${updates.length} QR codes with new domain`,
      });

      loadTables();
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to update QR codes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const hasLocalhost = tables.some(table => 
    table.qr_code_data?.includes('localhost') || 
    table.qr_code_data?.includes('127.0.0.1')
  );

  if (!hasLocalhost || !domain) {
    return null;
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">Update QR Codes</CardTitle>
        <CardDescription className="text-orange-700">
          Your QR codes are using localhost URLs. Update them to use your production domain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-orange-700">
            Current domain: <code className="bg-orange-100 px-2 py-1 rounded">{domain}</code>
          </p>
          <p className="text-sm text-orange-700">
            Found {tables.filter(t => t.qr_code_data?.includes('localhost')).length} tables with localhost URLs
          </p>
          <Button 
            onClick={updateAllQRCodes} 
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Update All QR Codes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};