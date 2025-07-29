import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import restaurantHero from "@/assets/restaurant-hero.jpg";
import { initializeSystemData } from "@/utils/seedData";

const HeroSection = () => {
  useEffect(() => {
    // Initialize system data when the app loads
    initializeSystemData().catch(console.error);
  }, []);

  return (
    <section className="pt-20 pb-16 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Transform Your Restaurant with{" "}
              <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
                QR Ordering
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Simple setup. Instant orders. Happy customers. No apps needed - just scan, order via WhatsApp, and enjoy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="text-lg px-8 py-4" asChild>
                <Link to="/signup">Start Your Restaurant Today</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4" asChild>
                <Link to="/signin">Restaurant Login</Link>
              </Button>
            </div>
          </div>
          <div className="animate-scale-in">
            <img
              src={restaurantHero}
              alt="Modern restaurant with QR code ordering"
              className="w-full h-auto rounded-2xl shadow-restaurant"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;