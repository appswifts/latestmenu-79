import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  max_tables: number | null;
  max_menu_items: number | null;
  features: any; // JSON from database
  is_active: boolean;
  display_order: number;
}

const Pricing = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load pricing packages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    // Packages store prices in cents for USD, but whole numbers for RWF
    const fromCents = currency !== 'RWF';
    return formatCurrency(price, currency, fromCents);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">Loading pricing plans...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your restaurant. Start your digital menu journey today.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => {
            const isPopular = pkg.name.toLowerCase() === 'premium';
            const features = Array.isArray(pkg.features) ? pkg.features : [];
            
            return (
              <Card 
                key={pkg.id} 
                className={`relative ${isPopular ? 'border-primary shadow-restaurant scale-105' : 'shadow-elegant'} transition-all duration-300 hover:shadow-lg`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      {formatPrice(pkg.price, pkg.currency)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {features.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant={isPopular ? "hero" : "outline"} 
                    className="w-full" 
                    size="lg"
                    asChild
                  >
                    <Link to={`/signup`}>
                      Select Plan
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Affordable pricing for restaurants of all sizes • No setup fees • Cancel anytime
          </p>
          <Button variant="ghost" asChild>
            <Link to="/">← Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;