import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6 pt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="prose max-w-none">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>Acceptance of Terms</h2>
          <p>By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h2>Service Description</h2>
          <p>Our service provides QR code generation and management for restaurant ordering systems via WhatsApp integration.</p>
          
          <h2>Subscription and Payment</h2>
          <p>Our service requires a monthly subscription fee of $29.99. Payment must be made in advance for each billing period.</p>
          
          <h2>User Responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
          
          <h2>Termination</h2>
          <p>We may terminate or suspend your account immediately, without prior notice, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          
          <h2>Contact Information</h2>
          <p>Questions about the Terms of Service should be sent to us at legal@qrmenu.com.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;