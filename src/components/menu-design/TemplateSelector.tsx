import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (template: string) => void;
  restaurant: {
    name: string;
    brand_primary_color: string;
    brand_secondary_color: string;
  };
}

const templates = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional Linktree-style layout with gradient background",
    preview: "gradient-classic",
    recommended: false
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with sleek cards and animations",
    preview: "sleek-cards",
    recommended: true
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean white background with simple button layouts",
    preview: "minimal-white",
    recommended: false
  },
  {
    id: "bold",
    name: "Bold",
    description: "High contrast design with vibrant colors and large text",
    preview: "bold-contrast",
    recommended: false
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Sophisticated dark theme with refined typography",
    preview: "elegant-dark",
    recommended: false
  }
];

export const TemplateSelector = ({ selectedTemplate, onTemplateSelect, restaurant }: TemplateSelectorProps) => {
  const getPreviewStyle = (templateId: string) => {
    const primary = restaurant.brand_primary_color;
    const secondary = restaurant.brand_secondary_color;
    
    switch (templateId) {
      case "classic":
        return {
          background: `linear-gradient(135deg, ${primary}20, ${secondary}30, #1e293b)`,
          color: 'white'
        };
      case "modern":
        return {
          background: `linear-gradient(135deg, ${primary}15, ${secondary}15)`,
          backgroundColor: '#0f172a',
          color: 'white'
        };
      case "minimal":
        return {
          backgroundColor: '#ffffff',
          color: '#1f2937'
        };
      case "bold":
        return {
          backgroundColor: primary,
          color: 'white'
        };
      case "elegant":
        return {
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          color: 'white'
        };
      default:
        return {
          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
          color: 'white'
        };
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Template Style</h3>
        <p className="text-sm text-muted-foreground">
          Select how your menu preview page will look to customers
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={cn(
              "relative cursor-pointer transition-all hover:shadow-lg border-2",
              selectedTemplate === template.id 
                ? "border-primary shadow-lg ring-2 ring-primary/20" 
                : "border-muted hover:border-muted-foreground/30"
            )}
            onClick={() => onTemplateSelect(template.id)}
          >
            {template.recommended && (
              <Badge className="absolute -top-2 left-2 z-10 bg-primary text-primary-foreground">
                Recommended
              </Badge>
            )}
            
            {selectedTemplate === template.id && (
              <div className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            
            <CardContent className="p-0">
              {/* Template Preview */}
              <div 
                className="h-32 rounded-t-lg flex items-center justify-center relative overflow-hidden"
                style={getPreviewStyle(template.id)}
              >
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm">🍽️</span>
                  </div>
                  <div className="text-xs font-semibold opacity-90">{restaurant.name}</div>
                  <div className="text-[10px] opacity-70 mt-1">Table 1</div>
                  
                  {/* Mini buttons preview */}
                  <div className="space-y-1 mt-3">
                    <div 
                      className="w-20 h-2 rounded mx-auto"
                      style={{ 
                        backgroundColor: template.id === 'minimal' ? restaurant.brand_primary_color : 'rgba(255,255,255,0.8)'
                      }}
                    />
                    <div 
                      className="w-16 h-2 rounded mx-auto"
                      style={{ 
                        backgroundColor: template.id === 'minimal' ? '#16a34a' : 'rgba(255,255,255,0.6)'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Template Info */}
              <div className="p-4">
                <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {template.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            // This would open a live preview
            const previewUrl = `/preview/${restaurant.name.toLowerCase().replace(/\s+/g, '-')}/table1?template=${selectedTemplate}`;
            window.open(previewUrl, '_blank');
          }}
        >
          Preview Selected Template
        </Button>
      </div>
    </div>
  );
};