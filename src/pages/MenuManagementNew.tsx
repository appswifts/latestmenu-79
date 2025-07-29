import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Utensils, FolderPlus, Edit, Trash2, DollarSign } from 'lucide-react';

interface MenuGroup {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  restaurant_id: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  group_id?: string;
  restaurant_id: string;
  is_available: boolean;
  image_url?: string;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

const MenuManagementNew = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedRestaurantId = searchParams.get('restaurant');
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: ''
  });
  
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    group_id: '',
    currency: 'RWF'
  });

  useEffect(() => {
    if (user) {
      fetchRestaurants();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRestaurantId) {
      setSelectedRestaurant(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchMenuData();
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, slug')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setRestaurants(data || []);
      
      if (data && data.length > 0 && !selectedRestaurant) {
        setSelectedRestaurant(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
    }
  };

  const fetchMenuData = async () => {
    if (!selectedRestaurant) return;
    
    setLoading(true);
    try {
      // Fetch menu groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('menu_groups')
        .select('*')
        .eq('restaurant_id', selectedRestaurant)
        .order('display_order');

      if (groupsError) throw groupsError;

      // Fetch menu items
      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', selectedRestaurant)
        .order('display_order');

      if (itemsError) throw itemsError;

      setMenuGroups(groupsData || []);
      setMenuItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching menu data:', error);
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;

    try {
      const { data, error } = await supabase
        .from('menu_groups')
        .insert({
          restaurant_id: selectedRestaurant,
          name: groupForm.name,
          description: groupForm.description,
          display_order: menuGroups.length
        })
        .select()
        .single();

      if (error) throw error;

      setMenuGroups(prev => [...prev, data]);
      setGroupForm({ name: '', description: '' });
      setIsGroupDialogOpen(false);
      toast.success('Menu group created successfully!');
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast.error(error.message || 'Failed to create menu group');
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          restaurant_id: selectedRestaurant,
          name: itemForm.name,
          description: itemForm.description,
          price: parseInt(itemForm.price),
          currency: itemForm.currency,
          group_id: itemForm.group_id || null,
          display_order: menuItems.length
        })
        .select()
        .single();

      if (error) throw error;

      setMenuItems(prev => [...prev, data]);
      setItemForm({ name: '', description: '', price: '', group_id: '', currency: 'RWF' });
      setIsItemDialogOpen(false);
      toast.success('Menu item created successfully!');
    } catch (error: any) {
      console.error('Error creating item:', error);
      toast.error(error.message || 'Failed to create menu item');
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const getItemsByGroup = (groupId?: string) => {
    return menuItems.filter(item => item.group_id === groupId);
  };

  const ungroupedItems = getItemsByGroup(undefined);

  if (loading && selectedRestaurant) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Organize your menu items with groups</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={!selectedRestaurant}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Menu Group</DialogTitle>
                <DialogDescription>
                  Organize your menu items into categories
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Group Name *</Label>
                  <Input
                    id="groupName"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Appetizers, Main Dishes, Beverages..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="groupDescription">Description</Label>
                  <Textarea
                    id="groupDescription"
                    value={groupForm.description}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this menu section"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Group</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedRestaurant}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Menu Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your menu
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateItem} className="space-y-4">
                <div>
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    value={itemForm.name}
                    onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Delicious Pasta"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="itemDescription">Description</Label>
                  <Textarea
                    id="itemDescription"
                    value={itemForm.description}
                    onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Fresh pasta with homemade sauce"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itemPrice">Price *</Label>
                    <Input
                      id="itemPrice"
                      type="number"
                      value={itemForm.price}
                      onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="5000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemCurrency">Currency</Label>
                    <Select 
                      value={itemForm.currency} 
                      onValueChange={(value) => setItemForm(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RWF">RWF</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="itemGroup">Menu Group</Label>
                  <Select 
                    value={itemForm.group_id} 
                    onValueChange={(value) => setItemForm(prev => ({ ...prev, group_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Group</SelectItem>
                      {menuGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Item</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Restaurant Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Restaurant</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a restaurant to manage its menu" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedRestaurant && (
        <div className="space-y-6">
          {/* Menu Groups */}
          {menuGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Utensils className="h-5 w-5" />
                      {group.name}
                    </CardTitle>
                    {group.description && (
                      <CardDescription>{group.description}</CardDescription>
                    )}
                  </div>
                  <Badge variant="outline">
                    {getItemsByGroup(group.id).length} items
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getItemsByGroup(group.id).map((item) => (
                    <Card key={item.id} className="border-dashed">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-primary">
                              {formatPrice(item.price, item.currency)}
                            </span>
                            <Badge variant={item.is_available ? "default" : "secondary"}>
                              {item.is_available ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Ungrouped Items */}
          {ungroupedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Ungrouped Items
                </CardTitle>
                <CardDescription>Items not assigned to any group</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ungroupedItems.map((item) => (
                    <Card key={item.id} className="border-dashed">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-primary">
                              {formatPrice(item.price, item.currency)}
                            </span>
                            <Badge variant={item.is_available ? "default" : "secondary"}>
                              {item.is_available ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {menuGroups.length === 0 && menuItems.length === 0 && (
            <Card className="text-center p-8">
              <CardContent>
                <Utensils className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No menu items yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your menu by creating groups and adding items
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={() => setIsGroupDialogOpen(true)}>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                  <Button onClick={() => setIsItemDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuManagementNew;