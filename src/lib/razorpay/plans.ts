export interface Plan {
  id: string;
  name: string;
  amount: number; // paise
  amountDisplay: number; // rupees
  currency: string;
  period: 'monthly';
  interval: number;
  billingLabel: string; // e.g. "6 months"
  features: string[];
}

export const HALF_YEARLY_PLAN: Plan = {
  id: process.env.RAZORPAY_PLAN_ID!,
  name: 'Half-Yearly',
  amount: 100000,
  amountDisplay: 1000,
  currency: 'INR',
  period: 'monthly',
  interval: 6,
  billingLabel: '6 months',
  features: [
    'Unlimited work uploads',
    'Up to 50 MB per file',
    'PDF, JPEG, PNG, HEIC, DOCX support',
    'Organize with projects',
    'Favorite and search works',
    'Secure cloud storage',
  ],
};

// Single plan export
export const PLAN = HALF_YEARLY_PLAN;
export const PLANS: Plan[] = [HALF_YEARLY_PLAN];

export function getPlanById(planId: string): Plan | undefined {
  return PLANS.find((p) => p.id === planId);
}
