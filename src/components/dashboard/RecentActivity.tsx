import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface QRScan {
  id: string;
  scan_timestamp: string;
  restaurant_tables?: {
    table_number: string;
  };
}

interface RecentActivityProps {
  qrScans: QRScan[];
  loading?: boolean;
}

export const RecentActivity = ({ qrScans, loading }: RecentActivityProps) => {
  const [showAll, setShowAll] = useState(false);
  const displayScans = showAll ? qrScans : qrScans.slice(0, 5);

  const ActivitySkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-muted/40 rounded-lg" />
            <div className="space-y-1">
              <div className="h-4 w-24 bg-muted/40 rounded" />
              <div className="h-3 w-32 bg-muted/40 rounded" />
            </div>
          </div>
          <div className="h-6 w-16 bg-muted/40 rounded-full" />
        </div>
      ))}
    </div>
  );

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const scanTime = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - scanTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  return (
    <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-muted/10">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Eye className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest QR code scans from customers</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {loading ? (
          <ActivitySkeleton />
        ) : (
          <div className="space-y-3">
            {displayScans.map((scan, index) => (
              <div 
                key={scan.id} 
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors duration-200 animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      Table {scan.restaurant_tables?.table_number || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(scan.scan_timestamp)}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant="default" 
                  className="bg-success/10 text-success border-success/20 hover:bg-success/20 transition-colors"
                >
                  Viewed
                </Badge>
              </div>
            ))}
            
            {qrScans.length === 0 && !loading && (
              <div className="text-center py-8 space-y-3">
                <div className="h-12 w-12 bg-muted/20 rounded-lg flex items-center justify-center mx-auto">
                  <Eye className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">No activity yet</p>
                  <p className="text-xs text-muted-foreground">Create tables and share QR codes with customers!</p>
                </div>
              </div>
            )}
            
            {qrScans.length > 5 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2 text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Show Less' : `Show All (${qrScans.length})`}
              </Button>
            )}
          </div>
        )}
        
        <Button variant="outline" className="w-full mt-4 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors" asChild>
          <Link to="/tables">
            <MapPin className="h-4 w-4 mr-2" />
            Manage Tables
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};