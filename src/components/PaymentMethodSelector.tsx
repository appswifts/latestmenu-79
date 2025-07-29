import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethod } from "@/types/payment";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Settings } from "lucide-react";

interface PaymentMethodSelectorProps {
  selectedPaymentMethodId?: string;
  onSelect?: (paymentMethod: PaymentMethod) => void;
  showManagement?: boolean;
}

export const PaymentMethodSelector = ({ 
  selectedPaymentMethodId, 
  onSelect,
  showManagement = false 
}: PaymentMethodSelectorProps) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setPaymentMethods((data || []) as PaymentMethod[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'manual':
        return '📋';
      case 'stripe':
        return '💳';
      case 'paypal':
        return '🅿️';
      case 'mobile_money':
        return '📱';
      default:
        return '💰';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading payment methods...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Methods
        </CardTitle>
        <CardDescription>
          Select how customers will pay for their subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedPaymentMethodId === method.id 
                ? 'ring-2 ring-primary' 
                : ''
            }`}
            onClick={() => onSelect?.(method)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getPaymentMethodIcon(method.type)}</span>
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {method.type.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.is_default && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                  {selectedPaymentMethodId === method.id && (
                    <Badge>Selected</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {showManagement && (
          <Button variant="outline" className="w-full mt-4">
            <Settings className="h-4 w-4 mr-2" />
            Manage Payment Methods
          </Button>
        )}
      </CardContent>
    </Card>
  );
};