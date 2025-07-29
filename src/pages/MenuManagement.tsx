import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { RestaurantSidebar } from "@/components/RestaurantSidebar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Edit2, Trash2, UtensilsCrossed, Eye, EyeOff, AlertCircle, ChefHat, Layers, Coffee, Settings } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { formatCurrency } from "@/lib/utils";

type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

type MenuCategory = Tables<"menu_categories">;
type MenuItemVariation = Tables<"menu_item_variations">;
type MenuItemAccompaniment = Tables<"menu_item_accompaniments">;
type Accompaniment = Tables<"accompaniments">;

type MenuItem = Tables<"menu_items"> & {
  menu_item_variations?: MenuItemVariation[];
  menu_item_accompaniments?: MenuItemAccompaniment[];
  accompaniments?: Accompaniment[];
};

const MenuManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [accompaniments, setAccompaniments] = useState<Accompaniment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showAccompanimentDialog, setShowAccompanimentDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingAccompaniment, setEditingAccompaniment] = useState<Accompaniment | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();

  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image_url: "",
    is_available: true,
    is_accompaniment: false,
    variations: [] as { name: string; description: string; price_adjustment: string; is_available: boolean }[],
    selectedAccompaniments: [] as string[]
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    is_active: true,
    display_order: 0
  });

  const [accompanimentForm, setAccompanimentForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "side",
    is_available: true
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      ensureRestaurantExists();
    }
  }, [isAuthenticated, user]);

  const ensureRestaurantExists = async () => {
    try {
      if (!user) return;
      
      console.log("Ensuring restaurant record exists for user:", user.id);
      
      // First check if restaurant already exists
      const { data: existingRestaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("id", user.id)
        .single();
      
      if (!existingRestaurant) {
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
          });
        
        if (error) {
          console.error("Error creating restaurant record:", error);
        } else {
          console.log("Restaurant record created for user:", user.id);
        }
      } else {
        console.log("Restaurant record already exists for user:", user.id);
      }
      
      // Now fetch data
      fetchCategories();
      fetchItems();
      fetchAccompaniments();
    } catch (error) {
      console.error("Error in ensureRestaurantExists:", error);
      // Still try to fetch data even if this fails
      fetchCategories();
      fetchItems();
      fetchAccompaniments();
    }
  };

  const fetchCategories = async () => {
    try {
      if (!user) {
        console.error("No authenticated user found");
        return;
      }

      console.log("Fetching categories for user:", user.id);
      
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", user.id)
        .order("display_order");

      if (error) {
        console.error("Category fetch error:", error);
        throw error;
      }
      
      console.log("Categories fetched:", data);
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error fetching categories",
        description: error.message || "Failed to load menu categories",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      if (!user) {
        console.error("No authenticated user found");
        return;
      }

      let query = supabase
        .from("menu_items")
        .select(`
          *,
          menu_item_variations(*),
          menu_item_accompaniments(id, menu_item_id, accompaniment_id, is_default, created_at)
        `)
        .eq("restaurant_id", user.id)
        .order("display_order");

      if (selectedCategory && selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Menu items fetch error:", error);
        throw error;
      }
      
      console.log("Menu items fetched:", data);
      setItems(data || []);
    } catch (error: any) {
      console.error("Error fetching menu items:", error);
      toast({
        title: "Error fetching menu items",
        description: error.message || "Failed to load menu items",
        variant: "destructive",
      });
    }
  };

  const fetchAccompaniments = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from("accompaniments")
        .select("*")
        .eq("restaurant_id", user.id)
        .order("category, display_order");

      if (error) throw error;
      setAccompaniments(data || []);
    } catch (error: any) {
      console.error("Error fetching accompaniments:", error);
      toast({
        title: "Error fetching accompaniments",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [selectedCategory, user]);

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) throw new Error("User not authenticated");

      // Prepare menu item data (excluding fields that don't belong in menu_items table)
      const itemData = {
        name: itemForm.name,
        description: itemForm.description,
        price: parseInt(itemForm.price),
        category_id: itemForm.category_id || null,
        image_url: itemForm.image_url || null,
        is_available: itemForm.is_available,
        is_accompaniment: itemForm.is_accompaniment,
        restaurant_id: user.id,
        currency: "RWF",
        display_order: editingItem?.display_order || items.length
      };

      let itemId = editingItem?.id;

      if (editingItem) {
        const { error } = await supabase
          .from("menu_items")
          .update(itemData)
          .eq("id", editingItem.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("menu_items")
          .insert(itemData)
          .select()
          .single();
        
        if (error) throw error;
        itemId = data.id;
      }

      // Handle variations
      if (itemId) {
        // Delete existing variations
        await supabase
          .from("menu_item_variations")
          .delete()
          .eq("menu_item_id", itemId);

        // Insert new variations
        if (itemForm.variations.length > 0) {
          const variationsData = itemForm.variations.map((variation, index) => ({
            menu_item_id: itemId,
            name: variation.name,
            description: variation.description,
            price_adjustment: parseInt(variation.price_adjustment),
            is_available: variation.is_available,
            display_order: index
          }));

          const { error: variationsError } = await supabase
            .from("menu_item_variations")
            .insert(variationsData);

          if (variationsError) throw variationsError;
        }

        // Handle accompaniments
        await supabase
          .from("menu_item_accompaniments")
          .delete()
          .eq("menu_item_id", itemId);

        if (itemForm.selectedAccompaniments.length > 0) {
          const accompanimentData = itemForm.selectedAccompaniments.map(accId => ({
            menu_item_id: itemId,
            accompaniment_id: accId
          }));

          const { error: accompanimentsError } = await supabase
            .from("menu_item_accompaniments")
            .insert(accompanimentData);

          if (accompanimentsError) throw accompanimentsError;
        }

        // If marked as accompaniment, also create it in the accompaniments table
        if (itemForm.is_accompaniment) {
          const accompanimentData = {
            restaurant_id: user.id,
            name: itemForm.name,
            description: itemForm.description,
            price: parseInt(itemForm.price),
            category: 'side',
            currency: 'RWF',
            is_available: itemForm.is_available,
            display_order: accompaniments.length
          };

          const { error: accompanimentError } = await supabase
            .from("accompaniments")
            .insert(accompanimentData);

          if (accompanimentError) {
            console.warn("Failed to create accompaniment:", accompanimentError);
            // Don't throw error here, menu item creation was successful
          }
        }
      }

      toast({ title: editingItem ? "Menu item updated successfully!" : "Menu item created successfully!" });
      setShowItemDialog(false);
      setItemForm({
        name: "",
        description: "",
        price: "",
        category_id: "",
        image_url: "",
        is_available: true,
        is_accompaniment: false,
        variations: [],
        selectedAccompaniments: []
      });
      setEditingItem(null);
      fetchItems();
    } catch (error: any) {
      toast({
        title: "Error saving menu item",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions - use centralized currency formatting
  const formatPrice = (price: number) => {
    return formatCurrency(price);
  };

  const addVariation = () => {
    setItemForm({
      ...itemForm,
      variations: [
        ...itemForm.variations,
        { name: "", description: "", price_adjustment: "0", is_available: true }
      ]
    });
  };

  const updateVariation = (index: number, field: string, value: any) => {
    const newVariations = [...itemForm.variations];
    newVariations[index] = { ...newVariations[index], [field]: value };
    setItemForm({ ...itemForm, variations: newVariations });
  };

  const removeVariation = (index: number) => {
    setItemForm({
      ...itemForm,
      variations: itemForm.variations.filter((_, i) => i !== index)
    });
  };

  const toggleAccompaniment = (accompanimentId: string) => {
    setItemForm({
      ...itemForm,
      selectedAccompaniments: itemForm.selectedAccompaniments.includes(accompanimentId)
        ? itemForm.selectedAccompaniments.filter(id => id !== accompanimentId)
        : [...itemForm.selectedAccompaniments, accompanimentId]
    });
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Menu item deleted successfully!" });
      fetchItems();
    } catch (error: any) {
      toast({ title: "Error deleting menu item", description: error.message, variant: "destructive" });
    }
  };

  const editItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      category_id: item.category_id || "",
      image_url: item.image_url || "",
      is_available: item.is_available,
      is_accompaniment: false,
      variations: item.menu_item_variations?.map(v => ({
        name: v.name,
        description: v.description || "",
        price_adjustment: v.price_adjustment.toString(),
        is_available: v.is_available
      })) || [],
      selectedAccompaniments: item.menu_item_accompaniments?.map(a => a.accompaniment_id) || []
    });
    setShowItemDialog(true);
  };

  // Category management functions
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) throw new Error("User not authenticated");

      const categoryData = {
        ...categoryForm,
        restaurant_id: user.id,
        display_order: editingCategory?.display_order || categories.length
      };

      if (editingCategory) {
        const { error } = await supabase
          .from("menu_categories")
          .update(categoryData)
          .eq("id", editingCategory.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("menu_categories")
          .insert(categoryData);
        
        if (error) throw error;
      }

      toast({ title: editingCategory ? "Category updated successfully!" : "Category created successfully!" });
      setShowCategoryDialog(false);
      setCategoryForm({
        name: "",
        description: "",
        is_active: true,
        display_order: 0
      });
      setEditingCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error saving category",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Accompaniment management functions
  const handleAccompanimentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) throw new Error("User not authenticated");

      const accompanimentData = {
        ...accompanimentForm,
        price: parseInt(accompanimentForm.price),
        restaurant_id: user.id,
        currency: "RWF",
        display_order: editingAccompaniment?.display_order || accompaniments.length
      };

      if (editingAccompaniment) {
        const { error } = await supabase
          .from("accompaniments")
          .update(accompanimentData)
          .eq("id", editingAccompaniment.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("accompaniments")
          .insert(accompanimentData);
        
        if (error) throw error;
      }

      toast({ title: editingAccompaniment ? "Accompaniment updated successfully!" : "Accompaniment created successfully!" });
      setShowAccompanimentDialog(false);
      setAccompanimentForm({
        name: "",
        description: "",
        price: "",
        category: "side",
        is_available: true
      });
      setEditingAccompaniment(null);
      fetchAccompaniments();
    } catch (error: any) {
      toast({
        title: "Error saving accompaniment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from("menu_categories").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Category deleted successfully!" });
      fetchCategories();
    } catch (error: any) {
      toast({ title: "Error deleting category", description: error.message, variant: "destructive" });
    }
  };

  const deleteAccompaniment = async (id: string) => {
    try {
      const { error } = await supabase.from("accompaniments").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Accompaniment deleted successfully!" });
      fetchAccompaniments();
    } catch (error: any) {
      toast({ title: "Error deleting accompaniment", description: error.message, variant: "destructive" });
    }
  };

  const editCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      is_active: category.is_active,
      display_order: category.display_order || 0
    });
    setShowCategoryDialog(true);
  };

  const editAccompaniment = (accompaniment: Accompaniment) => {
    setEditingAccompaniment(accompaniment);
    setAccompanimentForm({
      name: accompaniment.name,
      description: accompaniment.description || "",
      price: accompaniment.price.toString(),
      category: accompaniment.category || "side",
      is_available: accompaniment.is_available
    });
    setShowAccompanimentDialog(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Please log in to manage your menu</p>
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
              <h1 className="text-xl font-semibold">Menu Management</h1>
              <p className="text-sm text-muted-foreground">Manage your restaurant menu</p>
            </div>
          </header>

          <div className="flex-1 space-y-6 p-6">
            {dataLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading menu data...</p>
              </div>
            ) : (
              <>
                {/* Categories Management */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        Categories
                      </CardTitle>
                      <CardDescription>Organize your menu items into categories</CardDescription>
                    </div>
                    <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                      <DialogTrigger asChild>
                        <Button onClick={() => {
                          setEditingCategory(null);
                          setCategoryForm({
                            name: "",
                            description: "",
                            is_active: true,
                            display_order: 0
                          });
                        }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Category
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                          <DialogDescription>Create a category to organize your menu items</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCategorySubmit}>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="category-name">Category Name</Label>
                              <Input
                                id="category-name"
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                placeholder="e.g., Appetizers, Main Courses"
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="category-description">Description (Optional)</Label>
                              <Textarea
                                id="category-description"
                                value={categoryForm.description}
                                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                placeholder="Describe this category"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="category-active"
                                checked={categoryForm.is_active}
                                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, is_active: checked })}
                              />
                              <Label htmlFor="category-active">Active</Label>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={loading}>
                              {loading ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {categories.map((category) => (
                        <Card key={category.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{category.name}</h4>
                              {category.description && (
                                <p className="text-sm text-muted-foreground">{category.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={category.is_active ? "default" : "secondary"}>
                                {category.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => editCategory(category)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {categories.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No categories found. Add your first category to organize your menu.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Accompaniments Management */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Coffee className="h-5 w-5" />
                        Accompaniments
                      </CardTitle>
                      <CardDescription>Manage side dishes, sauces, and extras</CardDescription>
                    </div>
                    <Dialog open={showAccompanimentDialog} onOpenChange={setShowAccompanimentDialog}>
                      <DialogTrigger asChild>
                        <Button onClick={() => {
                          setEditingAccompaniment(null);
                          setAccompanimentForm({
                            name: "",
                            description: "",
                            price: "",
                            category: "side",
                            is_available: true
                          });
                        }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Accompaniment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingAccompaniment ? "Edit Accompaniment" : "Add New Accompaniment"}</DialogTitle>
                          <DialogDescription>Create accompaniments like sides, sauces, and extras</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAccompanimentSubmit}>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="accompaniment-name">Name</Label>
                              <Input
                                id="accompaniment-name"
                                value={accompanimentForm.name}
                                onChange={(e) => setAccompanimentForm({ ...accompanimentForm, name: e.target.value })}
                                placeholder="e.g., French Fries, Ketchup"
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="accompaniment-category">Category</Label>
                              <Select value={accompanimentForm.category} onValueChange={(value) => setAccompanimentForm({ ...accompanimentForm, category: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="side">Side</SelectItem>
                                  <SelectItem value="sauce">Sauce</SelectItem>
                                  <SelectItem value="drink">Drink</SelectItem>
                                  <SelectItem value="dessert">Dessert</SelectItem>
                                  <SelectItem value="extra">Extra</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="accompaniment-price">Price (RWF)</Label>
                              <Input
                                id="accompaniment-price"
                                type="number"
                                value={accompanimentForm.price}
                                onChange={(e) => setAccompanimentForm({ ...accompanimentForm, price: e.target.value })}
                                placeholder="e.g., 500"
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="accompaniment-description">Description (Optional)</Label>
                              <Textarea
                                id="accompaniment-description"
                                value={accompanimentForm.description}
                                onChange={(e) => setAccompanimentForm({ ...accompanimentForm, description: e.target.value })}
                                placeholder="Describe this accompaniment"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="accompaniment-available"
                                checked={accompanimentForm.is_available}
                                onCheckedChange={(checked) => setAccompanimentForm({ ...accompanimentForm, is_available: checked })}
                              />
                              <Label htmlFor="accompaniment-available">Available</Label>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={loading}>
                              {loading ? "Saving..." : editingAccompaniment ? "Update Accompaniment" : "Create Accompaniment"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['side', 'sauce', 'drink', 'dessert', 'extra'].map((category) => {
                        const categoryAccompaniments = accompaniments.filter(acc => acc.category === category);
                        if (categoryAccompaniments.length === 0) return null;

                        return (
                          <div key={category} className="space-y-2">
                            <h4 className="font-medium capitalize">{category}s</h4>
                            <div className="grid gap-2">
                              {categoryAccompaniments.map((accompaniment) => (
                                <Card key={accompaniment.id} className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="font-medium">{accompaniment.name}</h5>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-primary">{formatPrice(accompaniment.price)}</p>
                                        <Badge variant={accompaniment.is_available ? "default" : "secondary"}>
                                          {accompaniment.is_available ? "Available" : "Unavailable"}
                                        </Badge>
                                      </div>
                                      {accompaniment.description && (
                                        <p className="text-sm text-muted-foreground">{accompaniment.description}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => editAccompaniment(accompaniment)}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => deleteAccompaniment(accompaniment.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {accompaniments.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No accompaniments found. Add your first accompaniment to offer extras with your menu items.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Menu Items */}
                <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="h-5 w-5" />
                      Menu Items
                    </CardTitle>
                    <CardDescription>Add and manage your menu items</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
                      <DialogTrigger asChild>
                        <Button onClick={() => {
                          setEditingItem(null);
                          setItemForm({
                            name: "",
                            description: "",
                            price: "",
                            category_id: "",
                            image_url: "",
                            is_available: true,
                            is_accompaniment: false,
                            variations: [],
                            selectedAccompaniments: []
                          });
                        }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                         <DialogHeader>
                           <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
                           <DialogDescription>Add details for your menu item including variations and accompaniments</DialogDescription>
                         </DialogHeader>
                         <form onSubmit={handleItemSubmit} className="space-y-6">
                           <div className="space-y-6">
                             {/* Basic Information */}
                             <div className="space-y-4">
                               <h3 className="text-lg font-medium">Basic Information</h3>
                               <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="item-name">Item Name</Label>
                                  <Input
                                    id="item-name"
                                    value={itemForm.name}
                                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                                    placeholder="e.g., Grilled Chicken"
                                    required
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="item-category">Category</Label>
                                  <Select value={itemForm.category_id} onValueChange={(value) => setItemForm({ ...itemForm, category_id: value })}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="item-price">Base Price (RWF)</Label>
                                  <Input
                                    id="item-price"
                                    type="number"
                                    value={itemForm.price}
                                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                                    placeholder="e.g., 2500"
                                    required
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="item-description">Description (Optional)</Label>
                                  <Textarea
                                    id="item-description"
                                    value={itemForm.description}
                                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                                    placeholder="Describe the dish"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="item-image">Image URL (Optional)</Label>
                                  <Input
                                    id="item-image"
                                    value={itemForm.image_url}
                                    onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                                    placeholder="e.g., https://example.com/image.jpg"
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="item-available"
                                    checked={itemForm.is_available}
                                    onCheckedChange={(checked) => setItemForm({ ...itemForm, is_available: checked })}
                                  />
                                  <Label htmlFor="item-available">Available</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="item-accompaniment"
                                    checked={itemForm.is_accompaniment}
                                    onCheckedChange={(checked) => setItemForm({ ...itemForm, is_accompaniment: checked })}
                                  />
                                  <Label htmlFor="item-accompaniment">Mark as Accompaniment</Label>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            {/* Variations Section */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">Variations</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addVariation}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Variation
                                </Button>
                              </div>
                              <div className="space-y-4">
                                {itemForm.variations.map((variation, index) => (
                                  <Card key={index} className="p-4">
                                    <div className="grid gap-4">
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Variation {index + 1}</h4>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeVariation(index)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <div className="grid gap-4">
                                        <div className="grid gap-2">
                                          <Label>Name</Label>
                                          <Input
                                            value={variation.name}
                                            onChange={(e) => updateVariation(index, "name", e.target.value)}
                                            placeholder="e.g., Large, Spicy"
                                          />
                                        </div>
                                        <div className="grid gap-2">
                                          <Label>Price Adjustment (RWF)</Label>
                                          <Input
                                            type="number"
                                            value={variation.price_adjustment}
                                            onChange={(e) => updateVariation(index, "price_adjustment", e.target.value)}
                                            placeholder="0"
                                          />
                                        </div>
                                        <div className="grid gap-2">
                                          <Label>Description</Label>
                                          <Input
                                            value={variation.description}
                                            onChange={(e) => updateVariation(index, "description", e.target.value)}
                                            placeholder="Optional description"
                                          />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Switch
                                            checked={variation.is_available}
                                            onCheckedChange={(checked) => updateVariation(index, "is_available", checked)}
                                          />
                                          <Label>Available</Label>
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>

                            <Separator />

                            {/* Accompaniments Section */}
                            <div className="space-y-4">
                              <h3 className="font-medium">Accompaniments</h3>
                              <div className="space-y-6">
                                {['side', 'sauce', 'drink', 'dessert', 'extra'].map((category) => {
                                  const categoryAccompaniments = accompaniments.filter(acc => acc.category === category);
                                  if (categoryAccompaniments.length === 0) return null;

                                  return (
                                    <div key={category} className="space-y-2">
                                      <h4 className="text-sm font-medium capitalize">{category}s</h4>
                                      <div className="grid grid-cols-2 gap-2">
                                        {categoryAccompaniments.map((accompaniment) => (
                                          <div key={accompaniment.id} className="flex items-center space-x-2">
                                            <Checkbox
                                              checked={itemForm.selectedAccompaniments.includes(accompaniment.id)}
                                              onCheckedChange={() => toggleAccompaniment(accompaniment.id)}
                                            />
                                            <Label className="text-sm">
                                              {accompaniment.name}
                                              <span className="ml-1 text-xs text-muted-foreground">
                                                ({formatPrice(accompaniment.price)})
                                              </span>
                                            </Label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={loading}>
                              {loading ? "Saving..." : editingItem ? "Update Item" : "Create Item"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {items.map((item) => (
                      <Card key={item.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          {/* Image Section */}
                          <div className="flex-shrink-0">
                            {item.image_url ? (
                              <img 
                                src={item.image_url} 
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg border"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop';
                                }}
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-100 rounded-lg border flex items-center justify-center">
                                <UtensilsCrossed className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Content Section */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{item.name}</h3>
                              <Badge variant={item.is_available ? "default" : "secondary"}>
                                {item.is_available ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                                {item.is_available ? "Available" : "Unavailable"}
                              </Badge>
                              {item.menu_item_variations && item.menu_item_variations.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {item.menu_item_variations.length} variation{item.menu_item_variations.length !== 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                            {item.description && <p className="text-sm text-muted-foreground mb-2">{item.description}</p>}
                            <p className="text-lg font-semibold text-primary">{formatPrice(item.price)}</p>
                            {item.menu_item_variations && item.menu_item_variations.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {item.menu_item_variations.map((variation) => (
                                  <Badge key={variation.id} variant="outline" className="text-xs">
                                    {variation.name} ({variation.price_adjustment >= 0 ? '+' : ''}{formatPrice(variation.price_adjustment)})
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Actions Section */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => editItem(item)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {items.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No menu items found. {selectedCategory !== "all" ? "Try selecting a different category or " : ""}Add your first menu item to get started.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              </>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MenuManagement;