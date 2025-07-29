import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CustomerMenu from "./CustomerMenu";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const DynamicRestaurantMenu = () => {
  const { restaurantName, tableName } = useParams();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [tableId, setTableId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveRestaurantAndTable = async () => {
      if (!restaurantName || !tableName) {
        setError("Invalid URL format");
        setLoading(false);
        return;
      }

      try {
        // First, find the restaurant by name (case insensitive)
        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id')
          .ilike('name', restaurantName.replace(/-/g, ' '))
          .eq('subscription_status', 'active')
          .maybeSingle();

        if (restaurantError) throw restaurantError;

        if (!restaurant) {
          setError("Restaurant not found or not active");
          setLoading(false);
          return;
        }

        setRestaurantId(restaurant.id);

        // Then find the table by name for this restaurant
        const { data: table, error: tableError } = await supabase
          .from('restaurant_tables')
          .select('id')
          .eq('restaurant_id', restaurant.id)
          .or(`table_name.ilike.%${tableName.replace(/-/g, ' ')}%,table_number.ilike.%${tableName}%`)
          .eq('is_active', true)
          .maybeSingle();

        if (tableError) throw tableError;

        if (!table) {
          setError("Table not found");
          setLoading(false);
          return;
        }

        setTableId(table.id);
      } catch (error: any) {
        console.error('Error resolving restaurant/table:', error);
        setError(error.message || 'Failed to load restaurant menu');
      } finally {
        setLoading(false);
      }
    };

    resolveRestaurantAndTable();
  }, [restaurantName, tableName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading restaurant menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Menu</h3>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!restaurantId || !tableId) {
    return null;
  }

  // Render CustomerMenu with resolved IDs
  return <CustomerMenu restaurantId={restaurantId} tableId={tableId} />;
};

export default DynamicRestaurantMenu;