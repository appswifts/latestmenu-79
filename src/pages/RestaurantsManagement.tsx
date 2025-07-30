import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Store, Settings, QrCode, Menu, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  subscription_status: string;
  is_active: boolean;
  created_at: string;
  package_id?: string;
  whatsapp_number: string;
  address?: string;
  logo_url?: string;
}

const RestaurantsManagement = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp_number: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      fetchRestaurants();
    }
  }, [user]);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const slug = generateSlug(formData.name);
      
      const { data, error } = await supabase
        .from('restaurants')
        .insert({
          user_id: user.id,
          name: formData.name,
          slug,
          whatsapp_number: formData.whatsapp_number,
          address: formData.address,
          email: `${slug}@${formData.name.toLowerCase().replace(/\s+/g, '')}.restaurant`,
          password_hash: null,
          subscription_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setRestaurants(prev => [data, ...prev]);
      setFormData({ name: '', whatsapp_number: '', address: '' });
      setIsCreateDialogOpen(false);
      toast.success('Restaurant created successfully!');
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      toast.error(error.message || 'Failed to create restaurant');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold">My Restaurants</h1>
          <p className="text-muted-foreground">Manage your restaurant locations</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Restaurant</DialogTitle>
              <DialogDescription>
                Add a new restaurant location to your account
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRestaurant} className="space-y-4">
              <div>
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Amazing Restaurant"
                  required
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                  placeholder="+250781234567"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Restaurant Street, Kigali"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Restaurant</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {restaurants.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No restaurants yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first restaurant to get started with QR code ordering
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Restaurant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {restaurant.address || 'No address provided'}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(restaurant.subscription_status)} text-white border-transparent`}
                  >
                    {restaurant.subscription_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <strong>WhatsApp:</strong> {restaurant.whatsapp_number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>URL:</strong> {window.location.origin}/{restaurant.slug}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`/${restaurant.slug}/preview`, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    
                    <Link to={`/menu?restaurant=${restaurant.id}`}>
                      <Button size="sm" variant="outline">
                        <Menu className="h-4 w-4 mr-1" />
                        Menu
                      </Button>
                    </Link>
                    
                    <Link to={`/tables?restaurant=${restaurant.id}`}>
                      <Button size="sm" variant="outline">
                        <QrCode className="h-4 w-4 mr-1" />
                        QR Codes
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantsManagement;