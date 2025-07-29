import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-primary hover:text-primary/80 transition-colors">
          QR Dine
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/pricing" className="text-foreground hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/signin">Login</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/signup">Start Free Trial</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;