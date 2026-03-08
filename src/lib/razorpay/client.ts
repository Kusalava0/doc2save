import Razorpay from 'razorpay';

let _razorpay: Razorpay | undefined;

export function getRazorpay(): Razorpay {
  if (_razorpay) return _razorpay;
  _razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
  return _razorpay;
}

// Lazy proxy for backward compat
export const razorpay = new Proxy({} as Razorpay, {
  get(_, prop) {
    return (getRazorpay() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
