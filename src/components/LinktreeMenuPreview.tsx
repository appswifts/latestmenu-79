import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  ClassicTemplate,
  ModernTemplate,
  MinimalTemplate,
  BoldTemplate,
  ElegantTemplate
} from "@/components/menu-design/LinktreeTemplates";
import { Loader2, AlertCircle, MessageCircle, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Restaurant {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  whatsapp_number: string;
  subscription_status: string;
  brand_primary_color?: string;
  brand_secondary_color?: string;
  logo_url?: string;
  template_style?: string;
  menu_background_type?: string;
  menu_background_color?: string;
  menu_background_image?: string;
  menu_background_video?: string;
}

interface LinktreeMenuPreviewProps {
  restaurantId: string;
  tableId: string;
}

export const LinktreeMenuPreview = ({ restaurantId, tableId }: LinktreeMenuPreviewProps) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRestaurantData();
  }, [restaurantId]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .maybeSingle();

      if (restaurantError) throw restaurantError;

      if (!restaurantData) {
        setError('Restaurant not found');
        return;
      }

      setRestaurant(restaurantData);

    } catch (error: any) {
      console.error('Error loading restaurant data:', error);
      setError(error.message || 'Failed to load restaurant');
    } finally {
      setLoading(false);
    }
  };

  const openFullMenu = () => {
    if (!restaurant?.name) return;
    const restaurantName = restaurant.name.toLowerCase().replace(/\s+/g, '-');
    const tableName = tableId?.toLowerCase().replace(/\s+/g, '-') || 'table1';
    const menuUrl = `${window.location.origin}/${restaurantName}/${tableName}`;
    window.open(menuUrl, '_blank');
  };

  const contactWhatsApp = () => {
    if (!restaurant?.whatsapp_number) return;
    
    const message = `Hello! I'm interested in placing an order from ${restaurant.name}. Table: ${tableId?.toUpperCase()}`;
    const whatsappUrl = `https://wa.me/${restaurant.whatsapp_number.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const callRestaurant = () => {
    if (!restaurant?.phone) return;
    window.open(`tel:${restaurant.phone}`, '_self');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Restaurant Not Found</h3>
            <p className="text-muted-foreground">{error || 'Unable to load restaurant information'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if restaurant subscription is not active - show limited info
  if (restaurant.subscription_status !== 'active') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                '🍽️'
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{restaurant.name}</h1>
            <Badge variant="secondary" className="mb-4 bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              Coming Soon
            </Badge>
            <p className="text-white/70 mb-6">
              This restaurant is currently setting up their digital menu. Please check back soon or contact us directly.
            </p>
            
            {restaurant.whatsapp_number && (
              <Button 
                onClick={contactWhatsApp}
                className="w-full mb-3 bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact on WhatsApp
              </Button>
            )}
            
            {restaurant.phone && (
              <Button 
                onClick={callRestaurant}
                variant="outline" 
                className="w-full border-white/30 text-white hover:bg-white/10"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Restaurant
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare restaurant data for templates
  const templateData = {
    name: restaurant.name,
    address: restaurant.address,
    phone: restaurant.phone,
    whatsapp_number: restaurant.whatsapp_number,
    logo_url: restaurant.logo_url,
    brand_primary_color: restaurant.brand_primary_color || '#16a34a',
    brand_secondary_color: restaurant.brand_secondary_color || '#15803d',
    menu_background_type: (restaurant.menu_background_type as "solid" | "gradient" | "image" | "video") || 'gradient',
    menu_background_color: restaurant.menu_background_color || '#16a34a',
    menu_background_image: restaurant.menu_background_image,
    menu_background_video: restaurant.menu_background_video,
    template_style: (restaurant.template_style as "classic" | "modern" | "minimal" | "bold" | "elegant") || 'classic'
  };

  // Template actions
  const templateProps = {
    restaurant: templateData,
    tableId,
    onViewMenu: openFullMenu,
    onContactWhatsApp: contactWhatsApp,
    onCallRestaurant: callRestaurant
  };

  // Render based on template style
  switch (templateData.template_style) {
    case 'modern':
      return <ModernTemplate {...templateProps} />;
    case 'minimal':
      return <MinimalTemplate {...templateProps} />;
    case 'bold':
      return <BoldTemplate {...templateProps} />;
    case 'elegant':
      return <ElegantTemplate {...templateProps} />;
    default:
      return <ClassicTemplate {...templateProps} />;
  }
};