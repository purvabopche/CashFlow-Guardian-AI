import { PaymentRecord } from '../types/financial';

export interface ProviderProcessResult {
  success: boolean;
  status: 'paid' | 'failed' | 'unconfigured';
  referenceId: string | null;
  message: string;
  provider: string;
}

export interface ClientPaymentProvider {
  providerId: string;
  displayName: string;
  isConfigured: () => boolean;
  processPayment: (payment: PaymentRecord, simulateFailure?: boolean) => Promise<ProviderProcessResult>;
}

export class DemoClientPaymentProvider implements ClientPaymentProvider {
  public providerId = 'demo';
  public displayName = 'Demo Payment Simulator (Test Mode)';

  public isConfigured(): boolean {
    return true;
  }

  public async processPayment(payment: PaymentRecord, simulateFailure: boolean = false): Promise<ProviderProcessResult> {
    // Realistic simulation latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const refSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();

    if (simulateFailure) {
      return {
        success: false,
        status: 'failed',
        referenceId: `DEMO-FAIL-${refSuffix}`,
        message: 'Simulated payment failure (declined by test counterparty bank).',
        provider: this.providerId
      };
    }

    return {
      success: true,
      status: 'paid',
      referenceId: `DEMO-TXN-${refSuffix}`,
      message: 'Demo test payment processed successfully.',
      provider: this.providerId
    };
  }
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

/**
 * Dynamically loads the official Razorpay Checkout SDK script only when needed.
 */
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout.js script.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export class RazorpayClientPaymentProvider implements ClientPaymentProvider {
  public providerId = 'razorpay';
  public displayName = 'Razorpay Test Mode';
  private keyId: string | null = null;
  private configured: boolean = false;

  constructor(keyId?: string | null, configured?: boolean) {
    this.keyId = keyId || null;
    this.configured = configured ?? Boolean(keyId);
  }

  public isConfigured(): boolean {
    return this.configured;
  }

  public setConfig(keyId: string | null, configured: boolean) {
    this.keyId = keyId;
    this.configured = configured;
  }

  public async processPayment(payment: PaymentRecord, simulateFailure: boolean = false): Promise<ProviderProcessResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        status: 'unconfigured',
        referenceId: null,
        message: 'Payment gateway unavailable. Demo mode is still available.',
        provider: this.providerId
      };
    }

    return {
      success: false,
      status: 'unconfigured',
      referenceId: null,
      message: 'Razorpay requires opening checkout modal with verified order signature.',
      provider: this.providerId
    };
  }
}

export function getClientPaymentProvider(providerName: string = 'demo'): ClientPaymentProvider {
  if (providerName.toLowerCase() === 'razorpay') {
    return new RazorpayClientPaymentProvider();
  }
  return new DemoClientPaymentProvider();
}
