import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Crown, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const Subscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleRequestSubscription = () => {
    toast.success('Subscription request submitted! We will contact you soon.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your restaurant and start growing your business
          </p>
        </div>

        {/* Sample Packages */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="relative">
            <CardHeader>
              <CardTitle>Basic Plan</CardTitle>
              <CardDescription>Perfect for small restaurants</CardDescription>
              <div className="text-3xl font-bold">
                25,000 RWF
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Max Tables</span>
                  <span className="font-medium">10</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Menu Items</span>
                  <span className="font-medium">50</span>
                </div>
              </div>
              
              <Button 
                onClick={handleRequestSubscription}
                className="w-full"
              >
                Request Subscription
              </Button>
            </CardContent>
          </Card>

          <Card className="relative border-primary">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <Badge variant="default">Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle>Premium Plan</CardTitle>
              <CardDescription>Best for growing restaurants</CardDescription>
              <div className="text-3xl font-bold">
                50,000 RWF
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Max Tables</span>
                  <span className="font-medium">25</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Menu Items</span>
                  <span className="font-medium">100</span>
                </div>
              </div>
              
              <Button 
                onClick={handleRequestSubscription}
                className="w-full"
              >
                Request Subscription
              </Button>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For large restaurant chains</CardDescription>
              <div className="text-3xl font-bold">
                100,000 RWF
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Max Tables</span>
                  <span className="font-medium">Unlimited</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Menu Items</span>
                  <span className="font-medium">Unlimited</span>
                </div>
              </div>
              
              <Button 
                onClick={handleRequestSubscription}
                className="w-full"
              >
                Request Subscription
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Subscription;