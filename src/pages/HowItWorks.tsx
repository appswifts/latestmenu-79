import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { QrCode, MessageSquare, CreditCard, ArrowLeft } from "lucide-react";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto space-y-6 pt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">How It Works</h1>
          <p className="text-xl text-muted-foreground">Simple QR code ordering in 3 easy steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>1. Generate QR Codes</CardTitle>
              <CardDescription>Create unique QR codes for each table in your restaurant</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>• Sign up and add your restaurant details</li>
                <li>• Create tables with custom names</li>
                <li>• Download and print QR codes</li>
                <li>• Place codes on each table</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>2. Customers Scan & Order</CardTitle>
              <CardDescription>Customers scan the QR code and order via WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>• Customer scans QR code with phone</li>
                <li>• Sees restaurant name and table number</li>
                <li>• Clicks "Order via WhatsApp"</li>
                <li>• WhatsApp opens with your restaurant number</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>3. Manage & Track</CardTitle>
              <CardDescription>Track orders and manage your subscription easily</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>• Receive orders on your WhatsApp</li>
                <li>• Know exactly which table ordered</li>
                <li>• Track QR code scans and analytics</li>
                <li>• Manage subscription payments</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button asChild size="lg">
            <Link to="/signup">Get Started - Only $29.99/month</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;