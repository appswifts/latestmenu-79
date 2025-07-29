import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, QrCode, BarChart3, Settings, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const quickActions = [
  {
    title: "Add Table",
    description: "Create new table",
    icon: Plus,
    href: "/tables",
    color: "bg-primary/10 hover:bg-primary/20",
    iconColor: "text-primary"
  },
  {
    title: "QR Codes",
    description: "Manage codes",
    icon: QrCode,
    href: "/tables",
    color: "bg-accent/10 hover:bg-accent/20",
    iconColor: "text-accent"
  },
  {
    title: "Analytics",
    description: "View reports",
    icon: BarChart3,
    href: "/settings",
    color: "bg-success/10 hover:bg-success/20",
    iconColor: "text-success"
  },
  {
    title: "Settings",
    description: "Configure app",
    icon: Settings,
    href: "/settings",
    color: "bg-muted/40 hover:bg-muted/60",
    iconColor: "text-muted-foreground"
  }
];

export const QuickActions = () => {
  return (
    <Card className="shadow-elegant hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-muted/10">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="outline"
                className="h-20 flex flex-col gap-2 border-border/50 hover:border-border hover:scale-[1.02] transition-all duration-200 animate-scale-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
                asChild
              >
                <Link to={action.href}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${action.color}`}>
                    <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${action.iconColor}`} />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-foreground">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};