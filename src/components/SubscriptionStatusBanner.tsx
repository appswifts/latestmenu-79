import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, Check, CreditCard, ExternalLink } from "lucide-react";
import { SubscriptionActivationDialog } from "@/components/dashboard/SubscriptionActivationDialog";

interface SubscriptionStatusBannerProps {
  restaurant: any;
  onSubscriptionUpdate?: () => void;
  showActionButton?: boolean;
}

export const SubscriptionStatusBanner = ({ 
  restaurant, 
  onSubscriptionUpdate, 
  showActionButton = true 
}: SubscriptionStatusBannerProps) => {
  if (!restaurant) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: <Check className="h-4 w-4" />,
          variant: 'default' as const,
          title: 'Active Subscription',
          description: `Your subscription is active until ${restaurant.subscription_end_date ? new Date(restaurant.subscription_end_date).toLocaleDateString() : 'unknown date'}`,
          actionText: 'Manage Subscription',
          showAlert: false
        };
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          variant: 'default' as const,
          title: 'Subscription Pending',
          description: 'Your subscription request is awaiting admin approval. You will receive payment instructions soon.',
          actionText: 'Contact Support',
          showAlert: true
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          variant: 'destructive' as const,
          title: 'No Active Subscription',
          description: 'Your restaurant menu is currently not visible to customers. Please activate a subscription to start receiving orders.',
          actionText: 'Activate Subscription',
          showAlert: true
        };
    }
  };

  const config = getStatusConfig(restaurant.subscription_status || 'inactive');

  const previewMenu = () => {
    const baseUrl = window.location.origin;
    const previewUrl = `${baseUrl}/menu/preview/${restaurant.id}/preview`;
    window.open(previewUrl, '_blank');
  };

  if (!config.showAlert && restaurant.subscription_status === 'active') {
    return (
      <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-success">
            {config.icon}
            <span className="font-medium">{config.title}</span>
          </div>
          <Badge variant="outline" className="border-success/30 text-success">
            Active
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={previewMenu}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview Menu
          </Button>
          {showActionButton && onSubscriptionUpdate && (
            <SubscriptionActivationDialog 
              restaurant={restaurant} 
              onSubscriptionUpdate={onSubscriptionUpdate}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <Alert variant={config.variant}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {config.icon}
          <div className="flex-1">
            <h4 className="font-medium">{config.title}</h4>
            <AlertDescription className="mt-1">
              {config.description}
            </AlertDescription>
          </div>
        </div>
        {showActionButton && onSubscriptionUpdate && (
          <div className="ml-4 flex-shrink-0">
            <SubscriptionActivationDialog 
              restaurant={restaurant} 
              onSubscriptionUpdate={onSubscriptionUpdate}
            />
          </div>
        )}
      </div>
    </Alert>
  );
};