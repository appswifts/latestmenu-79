import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, ExternalLink, Clock, MapPin, Star } from "lucide-react";

interface Restaurant {
  name: string;
  address?: string;
  phone?: string;
  whatsapp_number?: string;
  logo_url?: string;
  brand_primary_color: string;
  brand_secondary_color: string;
  menu_background_type: "solid" | "gradient" | "image" | "video";
  menu_background_color: string;
  menu_background_image?: string;
  menu_background_video?: string;
  template_style: "classic" | "modern" | "minimal" | "bold" | "elegant";
}

interface LinktreeTemplateProps {
  restaurant: Restaurant;
  tableId: string;
  onViewMenu?: () => void;
  onContactWhatsApp?: () => void;
  onCallRestaurant?: () => void;
}

// Classic Template - Similar to current design
export const ClassicTemplate = ({ restaurant, tableId, onViewMenu, onContactWhatsApp, onCallRestaurant }: LinktreeTemplateProps) => {
  const getBackgroundStyle = () => {
    switch (restaurant.menu_background_type) {
      case 'solid':
        return { backgroundColor: restaurant.menu_background_color };
      case 'image':
        return restaurant.menu_background_image ? {
          backgroundImage: `url(${restaurant.menu_background_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : { background: `linear-gradient(135deg, ${restaurant.menu_background_color}, ${restaurant.brand_secondary_color})` };
      case 'video':
        return { backgroundColor: restaurant.menu_background_color };
      default:
        return { background: `linear-gradient(135deg, ${restaurant.menu_background_color}, ${restaurant.brand_secondary_color})` };
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={getBackgroundStyle()}>
      {restaurant.menu_background_type === 'video' && restaurant.menu_background_video && (
        <video 
          autoPlay 
          loop 
          muted 
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={restaurant.menu_background_video}
        />
      )}
      
      <div className="w-full max-w-sm relative z-10">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-center mb-6">
          <CardContent className="p-8">
            <div 
              className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${restaurant.brand_primary_color}, ${restaurant.brand_secondary_color})` }}
            >
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                '🍽️'
              )}
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">{restaurant.name}</h1>
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Table {tableId?.toUpperCase()}
            </Badge>

            <div className="space-y-2 text-sm text-white/80 mb-6">
              {restaurant.address && (
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.address}</span>
                </div>
              )}
              <div className="flex items-center justify-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>Digital Menu Available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button 
            onClick={onViewMenu}
            className="w-full h-14 text-lg font-semibold shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${restaurant.brand_primary_color}, ${restaurant.brand_secondary_color})`,
              color: 'white' 
            }}
          >
            <ExternalLink className="h-5 w-5 mr-3" />
            View Full Menu & Order
          </Button>

          <Button 
            onClick={onContactWhatsApp}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white shadow-lg"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Order via WhatsApp
          </Button>

          {restaurant.phone && (
            <Button 
              onClick={onCallRestaurant}
              variant="outline" 
              className="w-full h-12 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Restaurant
            </Button>
          )}
        </div>

        <div className="text-center mt-8 text-white/60 text-sm">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Available 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern Template - Sleek and contemporary
export const ModernTemplate = ({ restaurant, tableId, onViewMenu, onContactWhatsApp, onCallRestaurant }: LinktreeTemplateProps) => {
  return (
    <div 
      className="min-h-screen p-4 flex items-center justify-center"
      style={{ 
        background: `linear-gradient(135deg, ${restaurant.brand_primary_color}15, ${restaurant.brand_secondary_color}15)`,
        backgroundColor: '#0f172a'
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div 
            className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20"
            style={{ background: `linear-gradient(135deg, ${restaurant.brand_primary_color}, ${restaurant.brand_secondary_color})` }}
          >
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span className="text-2xl">🍽️</span>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{restaurant.name}</h1>
          <p className="text-white/70 mb-4">Table {tableId?.toUpperCase()}</p>
          
          {restaurant.address && (
            <p className="text-white/60 text-sm flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              {restaurant.address}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div 
            className="p-4 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            style={{ background: `${restaurant.brand_primary_color}20` }}
            onClick={onViewMenu}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: restaurant.brand_primary_color }}
                >
                  <ExternalLink className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">View Full Menu</p>
                  <p className="text-white/70 text-sm">Browse & order online</p>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="p-4 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all cursor-pointer bg-green-600/20"
            onClick={onContactWhatsApp}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">WhatsApp Order</p>
                <p className="text-white/70 text-sm">Direct contact</p>
              </div>
            </div>
          </div>

          {restaurant.phone && (
            <div 
              className="p-4 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all cursor-pointer bg-white/5"
              onClick={onCallRestaurant}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Call Restaurant</p>
                  <p className="text-white/70 text-sm">Speak directly</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Minimal Template - Clean and simple
export const MinimalTemplate = ({ restaurant, tableId, onViewMenu, onContactWhatsApp, onCallRestaurant }: LinktreeTemplateProps) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div 
            className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${restaurant.brand_primary_color}20`, border: `2px solid ${restaurant.brand_primary_color}40` }}
          >
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-xl">🍽️</span>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
          <p className="text-gray-600">Table {tableId?.toUpperCase()}</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={onViewMenu}
            className="w-full p-4 rounded-lg border-2 hover:shadow-md transition-all text-left"
            style={{ borderColor: restaurant.brand_primary_color, color: restaurant.brand_primary_color }}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">View Menu & Order</span>
              <ExternalLink className="h-5 w-5" />
            </div>
          </button>

          <button 
            onClick={onContactWhatsApp}
            className="w-full p-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Order via WhatsApp</span>
              <MessageCircle className="h-5 w-5" />
            </div>
          </button>

          {restaurant.phone && (
            <button 
              onClick={onCallRestaurant}
              className="w-full p-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">Call Restaurant</span>
                <Phone className="h-5 w-5" />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Bold Template - High contrast and vibrant
export const BoldTemplate = ({ restaurant, tableId, onViewMenu, onContactWhatsApp, onCallRestaurant }: LinktreeTemplateProps) => {
  return (
    <div 
      className="min-h-screen p-4 flex items-center justify-center"
      style={{ backgroundColor: restaurant.brand_primary_color }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-2xl">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="w-20 h-20 object-cover rounded-full" />
            ) : (
              <span className="text-4xl">🍽️</span>
            )}
          </div>
          
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-wider">{restaurant.name}</h1>
          <div className="inline-block bg-white text-black px-4 py-2 rounded-full font-bold">
            TABLE {tableId?.toUpperCase()}
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={onViewMenu}
            className="w-full bg-white text-black p-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-center gap-3">
              <ExternalLink className="h-6 w-6" />
              VIEW FULL MENU
            </div>
          </button>

          <button 
            onClick={onContactWhatsApp}
            className="w-full bg-green-600 text-white p-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-center gap-3">
              <MessageCircle className="h-6 w-6" />
              WHATSAPP ORDER
            </div>
          </button>

          {restaurant.phone && (
            <button 
              onClick={onCallRestaurant}
              className="w-full bg-black text-white p-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <div className="flex items-center justify-center gap-3">
                <Phone className="h-6 w-6" />
                CALL NOW
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Elegant Template - Sophisticated and refined
export const ElegantTemplate = ({ restaurant, tableId, onViewMenu, onContactWhatsApp, onCallRestaurant }: LinktreeTemplateProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div 
            className="w-20 h-20 mx-auto mb-8 rounded-full border-2 border-white/30 flex items-center justify-center backdrop-blur-sm"
            style={{ background: `linear-gradient(135deg, ${restaurant.brand_primary_color}40, ${restaurant.brand_secondary_color}40)` }}
          >
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="w-16 h-16 object-cover rounded-full" />
            ) : (
              <span className="text-2xl">🍽️</span>
            )}
          </div>
          
          <h1 className="text-3xl font-light text-white mb-3 tracking-wide">{restaurant.name}</h1>
          <div className="w-16 h-px bg-white/40 mx-auto mb-4"></div>
          <p className="text-white/70 font-light">Table {tableId?.toUpperCase()}</p>
        </div>

        <div className="space-y-6">
          <div 
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all cursor-pointer"
            onClick={onViewMenu}
          >
            <div className="text-center">
              <ExternalLink className="h-6 w-6 text-white mx-auto mb-2" />
              <p className="text-white font-light text-lg">View Menu & Order</p>
              <p className="text-white/60 text-sm mt-1">Browse our digital menu</p>
            </div>
          </div>

          <div 
            className="bg-green-600/80 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 hover:bg-green-600/90 transition-all cursor-pointer"
            onClick={onContactWhatsApp}
          >
            <div className="text-center">
              <MessageCircle className="h-6 w-6 text-white mx-auto mb-2" />
              <p className="text-white font-light text-lg">WhatsApp Service</p>
              <p className="text-white/80 text-sm mt-1">Direct ordering available</p>
            </div>
          </div>

          {restaurant.phone && (
            <div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
              onClick={onCallRestaurant}
            >
              <div className="text-center">
                <Phone className="h-6 w-6 text-white mx-auto mb-2" />
                <p className="text-white font-light text-lg">Call Restaurant</p>
                <p className="text-white/60 text-sm mt-1">Speak with our team</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};