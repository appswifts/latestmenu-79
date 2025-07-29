import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MessageSquare, Mail, Phone, ArrowLeft } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="max-w-2xl mx-auto space-y-6 pt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Contact & Support</h1>
          <p className="text-xl text-muted-foreground">We're here to help you succeed</p>
        </div>

        <div className="grid gap-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                WhatsApp Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Get instant help via WhatsApp - our preferred support method</p>
              <Button className="bg-[#25D366] hover:bg-[#128C7E]">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat on WhatsApp: +1234567890
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Send us detailed questions or feedback</p>
              <p className="text-muted-foreground">support@qrmenu.com</p>
              <p className="text-sm text-muted-foreground mt-2">We respond within 24 hours</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Phone Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Call us for urgent technical issues</p>
              <p className="text-muted-foreground">+1234567890</p>
              <p className="text-sm text-muted-foreground mt-2">Available: Mon-Fri 9AM-6PM</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;