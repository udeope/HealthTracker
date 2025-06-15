import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export const stripe = loadStripe(stripePublishableKey);

export const PRICING_PLANS = {
  FREE: {
    name: 'Basic',
    price: 0,
    features: [
      'Basic health metrics tracking',
      'Medication reminders',
      'Simple data visualization',
      'Basic reports',
      'Mobile app access'
    ],
    limits: {
      metrics: 100,
      medications: 5,
      reports: 1
    }
  },
  PREMIUM: {
    name: 'Premium',
    price: 9.99,
    priceId: 'price_premium', // Will be set from Stripe
    features: [
      'Unlimited health metrics tracking',
      'Advanced analytics and insights',
      'Custom reports and data export',
      'Telehealth consultations',
      'Priority support',
      'Wearable device integration',
      'HIPAA-compliant data storage',
      'Family sharing (up to 4 members)',
      'Medication interaction checker',
      'Appointment scheduling'
    ],
    limits: {
      metrics: -1, // Unlimited
      medications: -1,
      reports: -1
    }
  }
};

export async function createCheckoutSession(priceId: string, customerId?: string) {
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      customerId
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
}

export async function createPortalSession(customerId: string) {
  const response = await fetch('/api/stripe/create-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerId
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create portal session');
  }

  return response.json();
}