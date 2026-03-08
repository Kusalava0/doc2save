export interface Plan {
  id: string;
  name: string;
  amount: number; // paise
  amountDisplay: number; // rupees
  currency: string;
  period: 'monthly';
  interval: number;
  features: string[];
}

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

// Single plan export
export const PLAN = MONTHLY_PLAN;
export const PLANS: Plan[] = [MONTHLY_PLAN];

export function getPlanById(planId: string): Plan | undefined {
  return PLANS.find((p) => p.id === planId);
}
