import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, UserPlus } from 'lucide-react';

export const AdminUserCreator = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'appswifts@gmail.com',
    password: '#Ivantiga213'
  });
  const { toast } = useToast();

  const createAdminUser = async () => {
    setLoading(true);
    try {
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/dashboard`,
          data: {
            role: 'super_admin'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            first_name: 'Admin',
            last_name: 'User',
            username: 'admin'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Get the super_admin role ID
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'super_admin')
          .single();

        if (roleError) throw roleError;

        // Assign super_admin role to the user
        const { error: roleAssignError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role_id: roleData.id,
            is_active: true,
            assigned_by: authData.user.id,
            assigned_at: new Date().toISOString()
          });

        if (roleAssignError) throw roleAssignError;

        toast({
          title: "Admin User Created!",
          description: `Admin user ${formData.email} has been created successfully.`,
        });

        // Clear form
        setFormData({ email: '', password: '' });
      }
    } catch (error: any) {
      console.error('Admin creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Create Admin User
        </CardTitle>
        <CardDescription>
          Set up the initial admin account for the system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="admin@example.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Enter secure password"
          />
        </div>

        <Button 
          onClick={createAdminUser} 
          disabled={loading || !formData.email || !formData.password}
          className="w-full"
        >
          {loading ? (
            "Creating Admin..."
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Admin User
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};