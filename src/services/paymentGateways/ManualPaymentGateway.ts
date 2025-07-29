import { PaymentGateway, PaymentResult } from '@/types/payment';

export class ManualPaymentGateway implements PaymentGateway {
  id = 'manual';
  name = 'Manual Payment';
  type = 'manual' as const;

  async initialize(config: Record<string, any>): Promise<void> {
    // No initialization needed for manual payments
    return Promise.resolve();
  }

  async processPayment(
    amount: number, 
    currency: string, 
    metadata?: Record<string, any>
  ): Promise<PaymentResult> {
    // Manual payments are processed offline
    return {
      success: true,
      transactionId: `manual_${Date.now()}`,
      metadata: {
        amount,
        currency,
        processedAt: new Date().toISOString(),
        ...metadata
      }
    };
  }

  validateConfig(config: Record<string, any>): boolean {
    // Manual payments don't require specific configuration
    return true;
  }
}