import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-accent">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            Join hundreds of restaurants already using QR Dine to streamline their ordering process and delight customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg" 
              className="text-lg px-8 py-4 bg-white hover:bg-white/90 text-primary shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              asChild
            >
              <Link to="/signup">Start Free Trial</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              asChild
            >
              <Link to="/pricing">Contact Sales</Link>
            </Button>
          </div>
          <p className="text-primary-foreground/70 mt-6 text-sm">
            No credit card required • Setup in minutes • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;