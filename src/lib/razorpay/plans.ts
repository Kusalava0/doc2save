export interface Plan {
  id: string;
  name: string;
  amount: number; // paise
  amountDisplay: number; // rupees
  currency: string;
  period: 'monthly' | 'yearly';
  interval: number;
  features: string[];
  popular?: boolean;
}

// Plans are defined by RAZORPAY_PLAN_ID (monthly) and RAZORPAY_YEARLY_PLAN_ID (yearly)
// Create both plans in your Razorpay dashboard first.

export const MONTHLY_PLAN: Plan = {
  id: process.env.RAZORPAY_PLAN_ID!,
  name: 'Monthly',
  amount: 50000,
  amountDisplay: 500,
  currency: 'INR',
  period: 'monthly',
  interval: 1,
  features: [
    'Unlimited document uploads',
    'Up to 50 MB per file',
    'PDF, JPEG, PNG, HEIC, DOCX support',
    'Organize with folders',
    'Favorite and search documents',
    'Secure cloud storage',
  ],
};

export const YEARLY_PLAN: Plan = {
  id: process.env.RAZORPAY_YEARLY_PLAN_ID!,
  name: 'Daily (Test)',
  amount: 100,
  amountDisplay: 1,
  currency: 'INR',
  period: 'monthly',
  interval: 1,
  popular: true,
  features: [
    'Everything in Monthly',
    'Test plan — ₹1 every 3 weeks',
    'Up to 50 MB per file',
    'Priority support',
    'Organize with folders',
    'Secure cloud storage',
  ],
};

export const PLANS: Plan[] = [MONTHLY_PLAN, YEARLY_PLAN];

// Backward compat
export const PLAN = MONTHLY_PLAN;

export function getPlanById(planId: string): Plan | undefined {
  return PLANS.find((p) => p.id === planId);
}
