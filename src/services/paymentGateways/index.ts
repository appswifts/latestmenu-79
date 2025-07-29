import { PaymentGateway, PaymentMethod } from '@/types/payment';
import { ManualPaymentGateway } from './ManualPaymentGateway';

// Registry of available payment gateways
const paymentGateways: Record<string, PaymentGateway> = {
  manual: new ManualPaymentGateway(),
  // Future gateways can be added here:
  // stripe: new StripePaymentGateway(),
  // paypal: new PayPalPaymentGateway(),
  // mobile_money: new MobileMoneyGateway(),
};

export const getPaymentGateway = (type: PaymentMethod['type']): PaymentGateway | null => {
  return paymentGateways[type] || null;
};

export const getAllPaymentGateways = (): PaymentGateway[] => {
  return Object.values(paymentGateways);
};

export const registerPaymentGateway = (gateway: PaymentGateway): void => {
  paymentGateways[gateway.type] = gateway;
};

export { ManualPaymentGateway };