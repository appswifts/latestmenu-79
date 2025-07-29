import { Card, CardContent } from "@/components/ui/card";
import qrIcon from "@/assets/qr-icon.jpg";
import menuPhone from "@/assets/menu-phone.jpg";
import whatsappFood from "@/assets/whatsapp-food.jpg";

const ProcessSteps = () => {
  const steps = [
    {
      number: "01",
      title: "Restaurant Signs Up",
      description: "Quick signup and pay subscription manually. Setup takes less than 10 minutes.",
      image: qrIcon,
      color: "from-primary to-primary/80"
    },
    {
      number: "02",
      title: "Add Menu & QR Codes",
      description: "Upload your menu items and generate unique QR codes for each table.",
      image: qrIcon,
      color: "from-accent to-accent/80"
    },
    {
      number: "03",
      title: "Customer Scans & Views",
      description: "Customers scan QR code and instantly see your beautiful digital menu.",
      image: menuPhone,
      color: "from-success to-success/80"
    },
    {
      number: "04",
      title: "Order via WhatsApp",
      description: "One-click ordering directly to your WhatsApp. No apps required.",
      image: whatsappFood,
      color: "from-primary to-accent"
    }
  ];

  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to revolutionize your restaurant ordering experience
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-elegant transition-all duration-300 animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color}`} />
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary/20 mb-4">
                  {step.number}
                </div>
                <div className="w-16 h-16 mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;