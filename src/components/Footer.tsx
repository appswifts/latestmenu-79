const Footer = () => {
  return (
    <footer className="py-12 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold text-xl text-primary mb-4">QR Dine</div>
            <p className="text-muted-foreground">
              Revolutionizing restaurant ordering with QR codes and WhatsApp integration.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Features</li>
              <li>Pricing</li>
              <li>Demo</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Help Center</li>
              <li>Contact</li>
              <li>Setup Guide</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>About</li>
              <li>Privacy</li>
              <li>Terms</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 QR Dine. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;