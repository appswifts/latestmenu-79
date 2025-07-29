import { supabase } from "@/integrations/supabase/client";

export const createBasicPackages = async () => {
  try {
    // Check if packages already exist
    const { data: existingPackages } = await supabase
      .from('packages')
      .select('id')
      .limit(1);

    if (existingPackages && existingPackages.length > 0) {
      console.log('Packages already exist');
      return;
    }

    const packages = [
      {
        name: "Basic",
        description: "Perfect for small restaurants getting started",
        price: 2999900, // 29,999 RWF
        currency: "RWF",
        max_tables: 10,
        max_menu_items: 50,
        features: ["QR Code Generation", "WhatsApp Integration", "Basic Analytics"],
        is_active: true,
        display_order: 1
      },
      {
        name: "Professional",
        description: "Ideal for growing restaurants with multiple locations",
        price: 4999900, // 49,999 RWF
        currency: "RWF",
        max_tables: 25,
        max_menu_items: 100,
        features: ["QR Code Generation", "WhatsApp Integration", "Advanced Analytics", "Priority Support"],
        is_active: true,
        display_order: 2
      },
      {
        name: "Enterprise",
        description: "Full-featured solution for restaurant chains",
        price: 9999900, // 99,999 RWF
        currency: "RWF",
        max_tables: null, // Unlimited
        max_menu_items: null, // Unlimited
        features: ["QR Code Generation", "WhatsApp Integration", "Advanced Analytics", "Priority Support", "Custom Branding", "API Access"],
        is_active: true,
        display_order: 3
      }
    ];

    const { data, error } = await supabase
      .from('packages')
      .insert(packages)
      .select();

    if (error) throw error;

    console.log('Packages created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating packages:', error);
    throw error;
  }
};

export const createDefaultPaymentMethods = async () => {
  try {
    // Check if payment methods already exist
    const { data: existingMethods } = await supabase
      .from('payment_methods')
      .select('id')
      .limit(1);

    if (existingMethods && existingMethods.length > 0) {
      console.log('Payment methods already exist');
      return;
    }

    const paymentMethods = [
      {
        name: "Manual Bank Transfer",
        type: "manual",
        is_active: true,
        is_default: true,
        config: {
          bank_name: "Bank of Kigali",
          account_number: "1234567890",
          account_name: "QR Restaurant Solutions Ltd",
          swift_code: "BKRWRWRW",
          instructions: "Please include your restaurant name and order reference in the transfer description"
        }
      },
      {
        name: "Mobile Money (MTN)",
        type: "mobile_money",
        is_active: true,
        is_default: false,
        config: {
          provider: "MTN Rwanda",
          number: "+250788123456",
          instructions: "Send payment to MTN Mobile Money and share transaction reference"
        }
      },
      {
        name: "Cash Payment",
        type: "manual",
        is_active: true,
        is_default: false,
        config: {
          instructions: "Contact our office to arrange cash payment collection"
        }
      }
    ];

    const { data, error } = await supabase
      .from('payment_methods')
      .insert(paymentMethods)
      .select();

    if (error) throw error;

    console.log('Payment methods created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating payment methods:', error);
    throw error;
  }
};

export const initializeSystemData = async () => {
  try {
    await createBasicPackages();
    await createDefaultPaymentMethods();
    console.log('System data initialized successfully');
  } catch (error) {
    console.error('Error initializing system data:', error);
  }
};