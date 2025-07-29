import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Store, Plus, Edit, Trash2, Eye, MoreHorizontal, Search, Filter, Calendar, MapPin, Phone, Mail, Globe, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { formatDistance } from 'date-fns';

interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  whatsapp_number: string;
  plan: string;
  subscription_status: 'pending' | 'active' | 'expired' | 'cancelled';
  subscription_start_date?: string;
  subscription_end_date?: string;
  created_at: string;
  packages?: {
    name: string;
    price: number;
    currency: string;
  };
}

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [deleteRestaurant, setDeleteRestaurant] = useState<Restaurant | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    whatsapp_number: "",
    plan: "paid"
  });
  const { toast } = useToast();

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          packages(name, price, currency)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load restaurants",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  // Filter restaurants based on search and filters
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      const matchesSearch = !searchTerm || 
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || restaurant.subscription_status === statusFilter;
      const matchesPlan = planFilter === "all" || restaurant.plan === planFilter;
      
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [restaurants, searchTerm, statusFilter, planFilter]);

  const createRestaurant = async () => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .insert({
          name: newRestaurant.name,
          email: newRestaurant.email,
          phone: newRestaurant.phone,
          address: newRestaurant.address,
          whatsapp_number: newRestaurant.whatsapp_number,
          plan: newRestaurant.plan,
          password_hash: 'admin_created_account',
          subscription_status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Restaurant created successfully"
      });

      setNewRestaurant({
        name: "",
        email: "",
        phone: "",
        address: "",
        whatsapp_number: "",
        plan: "paid"
      });
      setShowCreateDialog(false);
      loadRestaurants();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create restaurant",
        variant: "destructive"
      });
    }
  };

  const updateRestaurant = async () => {
    if (!editingRestaurant) return;

    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: editingRestaurant.name,
          email: editingRestaurant.email,
          phone: editingRestaurant.phone,
          address: editingRestaurant.address,
          whatsapp_number: editingRestaurant.whatsapp_number,
          plan: editingRestaurant.plan,
          subscription_status: editingRestaurant.subscription_status
        })
        .eq('id', editingRestaurant.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Restaurant updated successfully"
      });

      setEditingRestaurant(null);
      loadRestaurants();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update restaurant",
        variant: "destructive"
      });
    }
  };

  const confirmDeleteRestaurant = async () => {
    if (!deleteRestaurant) return;
    
    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', deleteRestaurant.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Restaurant deleted successfully"
      });

      setDeleteRestaurant(null);
      loadRestaurants();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete restaurant",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: Restaurant['subscription_status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'active' | 'expired' | 'cancelled') => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const stats = {
    total: restaurants.length,
    active: restaurants.filter(r => r.subscription_status === 'active').length,
    pending: restaurants.filter(r => r.subscription_status === 'pending').length,
    expired: restaurants.filter(r => r.subscription_status === 'expired').length,
    free: restaurants.filter(r => r.plan === 'free').length,
    paid: restaurants.filter(r => r.plan === 'paid').length
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <SidebarInset>
            <div className="flex items-center justify-center h-full">
              <div className="text-center animate-fade-in">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading restaurants...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">Restaurant Management</h1>
              <p className="text-sm text-muted-foreground">Manage restaurant accounts and subscriptions</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="hover-scale">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Restaurant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Restaurant</DialogTitle>
                  <DialogDescription>Add a new restaurant account to the system</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Restaurant Name *</Label>
                      <Input
                        id="name"
                        value={newRestaurant.name}
                        onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                        placeholder="Restaurant Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newRestaurant.email}
                        onChange={(e) => setNewRestaurant({ ...newRestaurant, email: e.target.value })}
                        placeholder="restaurant@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newRestaurant.phone}
                        onChange={(e) => setNewRestaurant({ ...newRestaurant, phone: e.target.value })}
                        placeholder="+250788000000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                      <Input
                        id="whatsapp"
                        value={newRestaurant.whatsapp_number}
                        onChange={(e) => setNewRestaurant({ ...newRestaurant, whatsapp_number: e.target.value })}
                        placeholder="+250788000000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newRestaurant.address}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
                      placeholder="Restaurant Address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan">Plan</Label>
                    <Select value={newRestaurant.plan} onValueChange={(value) => setNewRestaurant({ ...newRestaurant, plan: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free Plan</SelectItem>
                        <SelectItem value="paid">Paid Plan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createRestaurant} disabled={!newRestaurant.name || !newRestaurant.email}>
                    Create Restaurant
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </header>

          <div className="flex-1 space-y-6 p-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <Card className="hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Restaurants</p>
                </CardContent>
              </Card>
              
              <Card className="hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">Awaiting activation</p>
                </CardContent>
              </Card>

              <Card className="hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expired</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
                  <p className="text-xs text-muted-foreground">Need renewal</p>
                </CardContent>
              </Card>

              <Card className="hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Free Plan</CardTitle>
                  <Globe className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.free}</div>
                  <p className="text-xs text-muted-foreground">Free tier users</p>
                </CardContent>
              </Card>

              <Card className="hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paid Plan</CardTitle>
                  <Store className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.paid}</div>
                  <p className="text-xs text-muted-foreground">Premium users</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search restaurants by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Plans</SelectItem>
                      <SelectItem value="free">Free Plan</SelectItem>
                      <SelectItem value="paid">Paid Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredRestaurants.length} of {restaurants.length} restaurants
                  </p>
                  {(searchTerm || statusFilter !== "all" || planFilter !== "all") && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setPlanFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Restaurants Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRestaurants.map((restaurant, index) => (
                <Card key={restaurant.id} className="hover-scale transition-all duration-200 hover:shadow-lg group animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {restaurant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg leading-none">{restaurant.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{restaurant.email}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedRestaurant(restaurant)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingRestaurant(restaurant)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Restaurant
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeleteRestaurant(restaurant)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Restaurant
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(restaurant.subscription_status)}
                      <Badge variant={getStatusColor(restaurant.subscription_status)}>
                        {restaurant.subscription_status}
                      </Badge>
                      <Badge variant="outline">{restaurant.plan} plan</Badge>
                    </div>
                    
                    {restaurant.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {restaurant.phone}
                      </div>
                    )}
                    
                    {restaurant.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {restaurant.address}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Created {formatDistance(new Date(restaurant.created_at), new Date(), { addSuffix: true })}
                    </div>
                    
                    {restaurant.subscription_end_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Expires {formatDistance(new Date(restaurant.subscription_end_date), new Date(), { addSuffix: true })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRestaurants.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No restaurants found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== "all" || planFilter !== "all" 
                      ? "Try adjusting your filters or search terms"
                      : "Get started by adding your first restaurant"
                    }
                  </p>
                  {!searchTerm && statusFilter === "all" && planFilter === "all" && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Restaurant
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </SidebarInset>
      </div>

      {/* View Restaurant Dialog */}
      <Dialog open={!!selectedRestaurant} onOpenChange={() => setSelectedRestaurant(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Restaurant Details
            </DialogTitle>
            <DialogDescription>Complete information about this restaurant</DialogDescription>
          </DialogHeader>
          {selectedRestaurant && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {selectedRestaurant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedRestaurant.name}</h3>
                  <p className="text-muted-foreground">{selectedRestaurant.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={getStatusColor(selectedRestaurant.subscription_status)}>
                      {selectedRestaurant.subscription_status}
                    </Badge>
                    <Badge variant="outline">{selectedRestaurant.plan} plan</Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedRestaurant.email}</span>
                    </div>
                    {selectedRestaurant.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedRestaurant.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedRestaurant.whatsapp_number} (WhatsApp)</span>
                    </div>
                    {selectedRestaurant.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedRestaurant.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Subscription Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedRestaurant.plan} plan</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(selectedRestaurant.subscription_status)}
                      <span className="text-sm capitalize">{selectedRestaurant.subscription_status}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Created {formatDistance(new Date(selectedRestaurant.created_at), new Date(), { addSuffix: true })}
                      </span>
                    </div>
                    {selectedRestaurant.subscription_start_date && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Started {new Date(selectedRestaurant.subscription_start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedRestaurant.subscription_end_date && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Expires {new Date(selectedRestaurant.subscription_end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Restaurant Dialog */}
      <Dialog open={!!editingRestaurant} onOpenChange={() => setEditingRestaurant(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Restaurant</DialogTitle>
            <DialogDescription>Update restaurant information and settings</DialogDescription>
          </DialogHeader>
          {editingRestaurant && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Restaurant Name</Label>
                  <Input
                    id="edit-name"
                    value={editingRestaurant.name}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingRestaurant.email}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingRestaurant.phone || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-whatsapp">WhatsApp Number</Label>
                  <Input
                    id="edit-whatsapp"
                    value={editingRestaurant.whatsapp_number}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, whatsapp_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editingRestaurant.address || ''}
                  onChange={(e) => setEditingRestaurant({ ...editingRestaurant, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-plan">Plan</Label>
                  <Select value={editingRestaurant.plan} onValueChange={(value) => setEditingRestaurant({ ...editingRestaurant, plan: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free Plan</SelectItem>
                      <SelectItem value="paid">Paid Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Subscription Status</Label>
                  <Select value={editingRestaurant.subscription_status} onValueChange={(value) => setEditingRestaurant({ ...editingRestaurant, subscription_status: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingRestaurant(null)}>
                  Cancel
                </Button>
                <Button onClick={updateRestaurant}>
                  Update Restaurant
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRestaurant} onOpenChange={() => setDeleteRestaurant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Restaurant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteRestaurant?.name}"? This action cannot be undone and will permanently remove all restaurant data including menus, tables, and orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRestaurant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Restaurant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default AdminRestaurants;