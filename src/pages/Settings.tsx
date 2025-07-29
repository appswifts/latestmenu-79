import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { RestaurantSidebar } from "@/components/RestaurantSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Save, Palette, Eye, Upload, Smartphone, MessageCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Restaurant = Tables<"restaurants">;

const Settings = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    whatsapp_number: ""
  });

  const [customization, setCustomization] = useState({
    menu_background_type: "gradient" as "solid" | "gradient" | "image",
    menu_background_color: "#22c55e",
    menu_background_image: "",
    brand_primary_color: "#22c55e",
    brand_secondary_color: "#15803d"
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadRestaurantData();
    }
  }, [isAuthenticated, user]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setRestaurant(data);
        setBasicInfo({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          whatsapp_number: data.whatsapp_number || ""
        });
        setCustomization({
          menu_background_type: (data.menu_background_type as "solid" | "gradient" | "image") || "gradient",
          menu_background_color: data.menu_background_color || "#22c55e",
          menu_background_image: data.menu_background_image || "",
          brand_primary_color: data.brand_primary_color || "#22c55e",
          brand_secondary_color: data.brand_secondary_color || "#15803d"
        });
      }
    } catch (error: any) {
      console.error("Error loading restaurant data:", error);
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("restaurants")
        .update({
          name: basicInfo.name,
          email: basicInfo.email,
          phone: basicInfo.phone,
          address: basicInfo.address,
          whatsapp_number: basicInfo.whatsapp_number,
          updated_at: new Date().toISOString()
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Your restaurant information has been saved successfully.",
      });

      await loadRestaurantData();
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCustomizationSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("restaurants")
        .update({
          menu_background_type: customization.menu_background_type,
          menu_background_color: customization.menu_background_color,
          menu_background_image: customization.menu_background_image,
          brand_primary_color: customization.brand_primary_color,
          brand_secondary_color: customization.brand_secondary_color,
          updated_at: new Date().toISOString()
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Menu design updated",
        description: "Your menu appearance has been saved successfully.",
      });

      await loadRestaurantData();
    } catch (error: any) {
      console.error("Error saving customization:", error);
      toast({
        title: "Error saving design",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getPreviewStyle = () => {
    switch (customization.menu_background_type) {
      case 'solid':
        return { backgroundColor: customization.menu_background_color };
      case 'image':
        return customization.menu_background_image 
          ? { 
              backgroundImage: `url(${customization.menu_background_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }
          : { background: `linear-gradient(135deg, ${customization.menu_background_color}, ${customization.brand_secondary_color})` };
      default: // gradient
        return { background: `linear-gradient(135deg, ${customization.menu_background_color}, ${customization.brand_secondary_color})` };
    }
  };

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center h-screen">Please log in to access settings.</div>;
  }

  if (loading) {
    return (
      <SidebarProvider>
        <RestaurantSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <RestaurantSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Restaurant Settings</h1>
        </header>

        <div className="p-6 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="customization">Menu Design</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Information</CardTitle>
                  <CardDescription>
                    Update your restaurant's basic information that will be displayed to customers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Restaurant Name</Label>
                      <Input
                        id="name"
                        value={basicInfo.name}
                        onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                        placeholder="Enter restaurant name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={basicInfo.email}
                        onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                        placeholder="restaurant@example.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={basicInfo.phone}
                        onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                        placeholder="+250 XXX XXX XXX"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp Number</Label>
                      <Input
                        id="whatsapp"
                        value={basicInfo.whatsapp_number}
                        onChange={(e) => setBasicInfo({ ...basicInfo, whatsapp_number: e.target.value })}
                        placeholder="+250 XXX XXX XXX"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={basicInfo.address}
                      onChange={(e) => setBasicInfo({ ...basicInfo, address: e.target.value })}
                      placeholder="Enter restaurant address"
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleBasicInfoSave} disabled={saving} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Information"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Menu Customization Tab */}
            <TabsContent value="customization" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customization Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Menu Design
                    </CardTitle>
                    <CardDescription>
                      Customize how your menu appears to customers when they scan QR codes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Background Type */}
                    <div className="space-y-2">
                      <Label>Background Type</Label>
                      <Select
                        value={customization.menu_background_type}
                        onValueChange={(value: "solid" | "gradient" | "image") => 
                          setCustomization({ ...customization, menu_background_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gradient">Gradient</SelectItem>
                          <SelectItem value="solid">Solid Color</SelectItem>
                          <SelectItem value="image">Background Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Primary Background Color */}
                    <div className="space-y-2">
                      <Label htmlFor="bg-color">
                        {customization.menu_background_type === 'gradient' ? 'Primary Color' : 'Background Color'}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="bg-color"
                          type="color"
                          value={customization.menu_background_color}
                          onChange={(e) => setCustomization({ ...customization, menu_background_color: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={customization.menu_background_color}
                          onChange={(e) => setCustomization({ ...customization, menu_background_color: e.target.value })}
                          placeholder="#22c55e"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Secondary Color for Gradient */}
                    {customization.menu_background_type === 'gradient' && (
                      <div className="space-y-2">
                        <Label htmlFor="secondary-color">Secondary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="secondary-color"
                            type="color"
                            value={customization.brand_secondary_color}
                            onChange={(e) => setCustomization({ ...customization, brand_secondary_color: e.target.value })}
                            className="w-16 h-10"
                          />
                          <Input
                            value={customization.brand_secondary_color}
                            onChange={(e) => setCustomization({ ...customization, brand_secondary_color: e.target.value })}
                            placeholder="#15803d"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    )}

                    {/* Background Image for Image Type */}
                    {customization.menu_background_type === 'image' && (
                      <div className="space-y-2">
                        <Label htmlFor="bg-image">Background Image URL</Label>
                        <Input
                          id="bg-image"
                          value={customization.menu_background_image}
                          onChange={(e) => setCustomization({ ...customization, menu_background_image: e.target.value })}
                          placeholder="https://example.com/background.jpg"
                        />
                        <p className="text-sm text-muted-foreground">
                          Upload your image to a hosting service and paste the URL here.
                        </p>
                      </div>
                    )}

                    {/* Brand Primary Color */}
                    <div className="space-y-2">
                      <Label htmlFor="brand-primary">Brand Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="brand-primary"
                          type="color"
                          value={customization.brand_primary_color}
                          onChange={(e) => setCustomization({ ...customization, brand_primary_color: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={customization.brand_primary_color}
                          onChange={(e) => setCustomization({ ...customization, brand_primary_color: e.target.value })}
                          placeholder="#22c55e"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Used for buttons, prices, and accent elements.
                      </p>
                    </div>

                     <div className="flex gap-2">
                       <Button onClick={handleCustomizationSave} disabled={saving} className="flex-1">
                         <Save className="h-4 w-4 mr-2" />
                         {saving ? "Saving..." : "Save Design"}
                       </Button>
                       <Button 
                         variant="outline" 
                         onClick={() => {
                           const baseUrl = window.location.origin;
                           const previewUrl = `${baseUrl}/menu/preview/${user?.id || 'demo'}/table1`;
                           window.open(previewUrl, '_blank');
                         }}
                         disabled={!user?.id}
                         className="flex-1"
                       >
                         <Eye className="h-4 w-4 mr-2" />
                         Preview
                       </Button>
                     </div>
                  </CardContent>
                </Card>

                {/* Mobile Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      Mobile Preview
                    </CardTitle>
                    <CardDescription>
                      See how your menu will look to customers on mobile devices.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mx-auto max-w-[280px] h-[500px] bg-black rounded-[2rem] p-2">
                      <div className="w-full h-full rounded-[1.5rem] overflow-hidden" style={getPreviewStyle()}>
                        {/* Mock Header */}
                        <div className="bg-white/90 backdrop-blur-md p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                                style={{ backgroundColor: customization.brand_primary_color }}
                              >
                                {basicInfo.name.charAt(0) || 'R'}
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-gray-900 leading-tight">
                                  {basicInfo.name || 'Restaurant Name'}
                                </h3>
                                <p className="text-xs text-gray-500">Table 1</p>
                              </div>
                            </div>
                            <Badge 
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${customization.brand_primary_color}20`, 
                                color: customization.brand_primary_color 
                              }}
                            >
                              Online
                            </Badge>
                          </div>
                        </div>

                        {/* Mock Menu Item */}
                        <div className="p-3">
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-900">Sample Menu Item</h4>
                                <p className="text-xs text-gray-500 mt-1">Delicious sample description</p>
                                <span className="text-sm font-bold mt-2 block" style={{ color: customization.brand_primary_color }}>
                                  5,000 RWF
                                </span>
                              </div>
                              <button 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                style={{ 
                                  backgroundColor: `${customization.brand_primary_color}10`,
                                  color: customization.brand_primary_color,
                                  border: `1px solid ${customization.brand_primary_color}40`
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Mock WhatsApp Button */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                          <button
                            className="text-white px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2"
                            style={{ backgroundColor: customization.brand_primary_color }}
                          >
                            <MessageCircle className="h-3 w-3" />
                            Order via WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Settings;