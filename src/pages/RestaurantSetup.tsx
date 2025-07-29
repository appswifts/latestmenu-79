import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Store, Plus, Edit3, Phone, Mail, MapPin, MessageSquare } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  whatsapp_number: string;
  subscription_status: string;
  created_at: string;
}

const RestaurantSetup = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    whatsapp_number: ""
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadRestaurant();
    }
  }, [user]);

  const loadRestaurant = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // Ignore "not found" error
        throw error;
      }

      if (data) {
        setRestaurant(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          whatsapp_number: data.whatsapp_number || ""
        });
      } else {
        // Pre-populate email from user auth
        setFormData(prev => ({
          ...prev,
          email: user.email || ""
        }));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load restaurant data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name || !formData.email || !formData.whatsapp_number) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      if (restaurant) {
        // Update existing restaurant
        const { error } = await supabase
          .from('restaurants')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            whatsapp_number: formData.whatsapp_number
          })
          .eq('id', user.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Restaurant information updated successfully"
        });
      } else {
        // Create new restaurant
        const { error } = await supabase
          .from('restaurants')
          .insert({
            id: user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            whatsapp_number: formData.whatsapp_number,
            password_hash: "handled_by_auth",
            subscription_status: "pending"
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Restaurant created successfully! You can now set up your menu and subscription."
        });
      }

      // Reload restaurant data
      loadRestaurant();
      
      // Navigate to dashboard after successful creation/update
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save restaurant information",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading restaurant information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-elegant">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            {restaurant ? "Update Restaurant" : "Set Up Your Restaurant"}
          </CardTitle>
          <CardDescription className="text-lg">
            {restaurant 
              ? "Update your restaurant information below"
              : "Complete your restaurant setup to start accepting orders via QR codes"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Restaurant Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Restaurant Name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="restaurant@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+250788000000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp Number *
                </Label>
                <Input
                  id="whatsapp_number"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                  placeholder="+250788000000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Restaurant Address
              </Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street, City, State, ZIP"
                className="min-h-[80px]"
              />
            </div>

            {!restaurant && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-center text-muted-foreground">
                  After setting up your restaurant, you'll be able to create your menu, generate QR codes, and choose a subscription plan.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="flex-1"
              >
                Back to Dashboard
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Edit3 className="mr-2 h-4 w-4 animate-spin" />
                    {restaurant ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {restaurant ? (
                      <>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Update Restaurant
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Restaurant
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantSetup;