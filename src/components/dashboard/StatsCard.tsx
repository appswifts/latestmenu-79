import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  loading?: boolean;
}

export const StatsCard = ({ label, value, change, icon: Icon, trend = "stable", loading }: StatsCardProps) => {
  if (loading) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-elegant hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted/40 rounded animate-pulse" />
              <div className="h-8 w-16 bg-muted/40 rounded animate-pulse" />
              <div className="h-3 w-14 bg-muted/40 rounded animate-pulse" />
            </div>
            <div className="h-12 w-12 bg-muted/40 rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendColor = () => {
    switch (trend) {
      case "up": return "text-success";
      case "down": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getTrendIndicator = () => {
    switch (trend) {
      case "up": return "↗";
      case "down": return "↘";
      default: return "→";
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-elegant hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
            <div className="flex items-center gap-1">
              <span className={`text-xs font-medium ${getTrendColor()}`}>
                {getTrendIndicator()}
              </span>
              <p className="text-xs text-muted-foreground">{change}</p>
            </div>
          </div>
          <div className="relative">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
              <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            {/* Pulse effect for active stats */}
            {trend === "up" && (
              <div className="absolute inset-0 rounded-lg bg-success/20 animate-pulse" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};