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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Save, Palette, Eye, Upload, Video, Image, Smartphone, Globe } from "lucide-react";
import { TemplateSelector } from "@/components/menu-design/TemplateSelector";
import type { Tables } from "@/integrations/supabase/types";

type Restaurant = Tables<"restaurants">;

const MenuDesign = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [designSettings, setDesignSettings] = useState({
    template_style: "modern" as "classic" | "modern" | "minimal" | "bold" | "elegant",
    menu_background_type: "gradient" as "solid" | "gradient" | "image" | "video",
    menu_background_color: "#22c55e",
    menu_background_image: "",
    menu_background_video: "",
    brand_primary_color: "#22c55e",
    brand_secondary_color: "#15803d",
    logo_url: "",
    show_address: true,
    show_phone: true,
    show_hours: true,
    custom_welcome_message: "",
    button_style: "rounded" as "rounded" | "square" | "pill",
    show_restaurant_stats: true,
    enable_animations: true
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
        setDesignSettings({
          template_style: "modern",
          menu_background_type: (data.menu_background_type as "solid" | "gradient" | "image" | "video") || "gradient",
          menu_background_color: data.menu_background_color || "#22c55e",
          menu_background_image: data.menu_background_image || "",
          menu_background_video: "",
          brand_primary_color: data.brand_primary_color || "#22c55e",
          brand_secondary_color: data.brand_secondary_color || "#15803d",
          logo_url: data.logo_url || "",
          show_address: true,
          show_phone: true,
          show_hours: true,
          custom_welcome_message: "",
          button_style: "rounded",
          show_restaurant_stats: true,
          enable_animations: true
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

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("restaurants")
        .update({
          template_style: designSettings.template_style,
          menu_background_type: designSettings.menu_background_type,
          menu_background_color: designSettings.menu_background_color,
          menu_background_image: designSettings.menu_background_image,
          menu_background_video: designSettings.menu_background_video,
          brand_primary_color: designSettings.brand_primary_color,
          brand_secondary_color: designSettings.brand_secondary_color,
          logo_url: designSettings.logo_url,
          show_address: designSettings.show_address,
          show_phone: designSettings.show_phone,
          show_hours: designSettings.show_hours,
          custom_welcome_message: designSettings.custom_welcome_message,
          button_style: designSettings.button_style,
          show_restaurant_stats: designSettings.show_restaurant_stats,
          enable_animations: designSettings.enable_animations,
          updated_at: new Date().toISOString()
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Design updated",
        description: "Your menu design has been saved successfully.",
      });

      await loadRestaurantData();
    } catch (error: any) {
      console.error("Error saving design:", error);
      toast({
        title: "Error saving design",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getPreviewUrl = () => {
    if (!restaurant?.name) return '#';
    const restaurantName = restaurant.name.toLowerCase().replace(/\s+/g, '-');
    return `${window.location.origin}/${restaurantName}/table1`;
  };

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center h-screen">Please log in to access menu design.</div>;
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
          <h1 className="text-lg font-semibold">Menu Design</h1>
        </header>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Customize Your Menu Preview</h2>
              <p className="text-muted-foreground">Design how customers see your restaurant when they scan QR codes</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.open(getPreviewUrl(), '_blank')}
                disabled={!restaurant?.name}
              >
                <Eye className="h-4 w-4 mr-2" />
                Live Preview
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Design"}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="template" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="colors">Colors & Media</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Template Selection */}
            <TabsContent value="template" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Template Style
                  </CardTitle>
                  <CardDescription>
                    Choose the overall look and feel of your menu preview page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TemplateSelector
                    selectedTemplate={designSettings.template_style}
                    onTemplateSelect={(template) => 
                      setDesignSettings({ ...designSettings, template_style: template as any })
                    }
                    restaurant={{
                      name: restaurant?.name || "Your Restaurant",
                      brand_primary_color: designSettings.brand_primary_color,
                      brand_secondary_color: designSettings.brand_secondary_color
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Colors & Media */}
            <TabsContent value="colors" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Colors</CardTitle>
                    <CardDescription>Customize your brand colors</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primary Brand Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary-color"
                          type="color"
                          value={designSettings.brand_primary_color}
                          onChange={(e) => setDesignSettings({ ...designSettings, brand_primary_color: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={designSettings.brand_primary_color}
                          onChange={(e) => setDesignSettings({ ...designSettings, brand_primary_color: e.target.value })}
                          placeholder="#22c55e"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Secondary Brand Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={designSettings.brand_secondary_color}
                          onChange={(e) => setDesignSettings({ ...designSettings, brand_secondary_color: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={designSettings.brand_secondary_color}
                          onChange={(e) => setDesignSettings({ ...designSettings, brand_secondary_color: e.target.value })}
                          placeholder="#15803d"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Background</CardTitle>
                    <CardDescription>Set your background style</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Background Type</Label>
                      <Select
                        value={designSettings.menu_background_type}
                        onValueChange={(value: "solid" | "gradient" | "image" | "video") => 
                          setDesignSettings({ ...designSettings, menu_background_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gradient">Gradient</SelectItem>
                          <SelectItem value="solid">Solid Color</SelectItem>
                          <SelectItem value="image">Background Image</SelectItem>
                          <SelectItem value="video">Background Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {designSettings.menu_background_type === 'image' && (
                      <div className="space-y-2">
                        <Label htmlFor="bg-image">Background Image URL</Label>
                        <Input
                          id="bg-image"
                          value={designSettings.menu_background_image}
                          onChange={(e) => setDesignSettings({ ...designSettings, menu_background_image: e.target.value })}
                          placeholder="https://example.com/background.jpg"
                        />
                      </div>
                    )}

                    {designSettings.menu_background_type === 'video' && (
                      <div className="space-y-2">
                        <Label htmlFor="bg-video">Background Video URL</Label>
                        <Input
                          id="bg-video"
                          value={designSettings.menu_background_video}
                          onChange={(e) => setDesignSettings({ ...designSettings, menu_background_video: e.target.value })}
                          placeholder="https://example.com/background.mp4"
                        />
                        <p className="text-sm text-muted-foreground">
                          Video will auto-play, loop, and be muted for best performance
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Content Settings */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Display</CardTitle>
                  <CardDescription>Control what information is shown to customers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="logo-url">Restaurant Logo URL</Label>
                    <Input
                      id="logo-url"
                      value={designSettings.logo_url}
                      onChange={(e) => setDesignSettings({ ...designSettings, logo_url: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="welcome-message">Custom Welcome Message</Label>
                    <Textarea
                      id="welcome-message"
                      value={designSettings.custom_welcome_message}
                      onChange={(e) => setDesignSettings({ ...designSettings, custom_welcome_message: e.target.value })}
                      placeholder="Welcome to our restaurant! Scan to view our menu..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Display Options</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-address">Show Restaurant Address</Label>
                        <p className="text-sm text-muted-foreground">Display your address on the preview page</p>
                      </div>
                      <Switch
                        id="show-address"
                        checked={designSettings.show_address}
                        onCheckedChange={(checked) => setDesignSettings({ ...designSettings, show_address: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-phone">Show Phone Number</Label>
                        <p className="text-sm text-muted-foreground">Display your phone number on the preview page</p>
                      </div>
                      <Switch
                        id="show-phone"
                        checked={designSettings.show_phone}
                        onCheckedChange={(checked) => setDesignSettings({ ...designSettings, show_phone: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-stats">Show Restaurant Stats</Label>
                        <p className="text-sm text-muted-foreground">Show "Digital Menu Available" and other stats</p>
                      </div>
                      <Switch
                        id="show-stats"
                        checked={designSettings.show_restaurant_stats}
                        onCheckedChange={(checked) => setDesignSettings({ ...designSettings, show_restaurant_stats: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Styling</CardTitle>
                  <CardDescription>Fine-tune the appearance and behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Button Style</Label>
                    <Select
                      value={designSettings.button_style}
                      onValueChange={(value: "rounded" | "square" | "pill") => 
                        setDesignSettings({ ...designSettings, button_style: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rounded">Rounded Corners</SelectItem>
                        <SelectItem value="square">Square Corners</SelectItem>
                        <SelectItem value="pill">Pill Shape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-animations">Enable Animations</Label>
                      <p className="text-sm text-muted-foreground">Add smooth transitions and hover effects</p>
                    </div>
                    <Switch
                      id="enable-animations"
                      checked={designSettings.enable_animations}
                      onCheckedChange={(checked) => setDesignSettings({ ...designSettings, enable_animations: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MenuDesign;