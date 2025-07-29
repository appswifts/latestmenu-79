export interface PaymentMethod {
  id: string;
  name: string;
  type: 'manual' | 'stripe' | 'paypal' | 'mobile_money' | 'bank_transfer';
  config: Record<string, any>;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: PaymentMethod['type'];
  initialize: (config: Record<string, any>) => Promise<void>;
  processPayment: (amount: number, currency: string, metadata?: Record<string, any>) => Promise<PaymentResult>;
  validateConfig: (config: Record<string, any>) => boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  redirectUrl?: string;
  metadata?: Record<string, any>;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: any;
  description?: string;
  updated_at: string;
  updated_by?: string;
}