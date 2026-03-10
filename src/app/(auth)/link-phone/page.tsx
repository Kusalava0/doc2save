'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Smartphone, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'phone' | 'otp' | 'merge-confirm';

export default function LinkPhonePage() {
  const router = useRouter();
  const { auth, updateUser } = useAuthStore();
  const user = auth.status === 'authenticated' ? auth.user : null;

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setLocalError] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [merging, setMerging] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [lastIdToken, setLastIdToken] = useState<string | null>(null);

  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // If user already has phone, redirect to dashboard
  useEffect(() => {
    if (user?.phone) {
      router.replace('/dashboard');
    }
  }, [user?.phone, router]);

  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  const startCooldown = useCallback(() => {
    setResendCooldown(30);
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }
    cooldownIntervalRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const getRecaptchaVerifier = useCallback(() => {
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }
    const auth = getFirebaseAuth();
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container-link', {
      size: 'invisible',
    });
    recaptchaVerifierRef.current = verifier;
    return verifier;
  }, []);

  const resetRecaptcha = useCallback(() => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch {
        // ignore
      }
      recaptchaVerifierRef.current = null;
    }
    const container = document.getElementById('recaptcha-container-link');
    if (container) {
      container.innerHTML = '';
    }
  }, []);

  const handleSendOtp = async () => {
    setLocalError('');
    const cleaned = phone.replace(/\s/g, '');
    if (!/^\d{10}$/.test(cleaned)) {
      setLocalError('Please enter a valid 10-digit phone number');
      return;
    }

    setSending(true);
    try {
      resetRecaptcha();
      const verifier = getRecaptchaVerifier();
      const result = await signInWithPhoneNumber(
        getFirebaseAuth(),
        '+91' + cleaned,
        verifier
      );
      confirmationResultRef.current = result;
      setStep('otp');
      startCooldown();
      recaptchaVerifierRef.current = null;
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      let message = 'Failed to send OTP';
      if (firebaseErr.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please wait a few minutes and try again.';
      } else if (firebaseErr.code === 'auth/invalid-phone-number') {
        message = 'Invalid phone number. Please check and try again.';
      } else if (firebaseErr.code === 'auth/invalid-app-credential') {
        message = 'Verification failed. Please try again.';
      } else if (firebaseErr.message) {
        message = firebaseErr.message;
      }
      setLocalError(message);
      resetRecaptcha();
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLocalError('');
    if (!/^\d{6}$/.test(otp)) {
      setLocalError('Please enter a valid 6-digit OTP');
      return;
    }
    if (!confirmationResultRef.current) {
      setLocalError('Session expired. Please request a new OTP.');
      setStep('phone');
      return;
    }

    setVerifying(true);
    try {
      const credential = await confirmationResultRef.current.confirm(otp);
      const idToken = await credential.user.getIdToken();
      setLastIdToken(idToken);

      // Link phone to existing account
      const res = await fetch('/api/auth/link-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        // Phone belongs to another account — offer merge
        setStep('merge-confirm');
        setLocalError('');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to link phone number');
      }

      updateUser({ phone: data.user.phone });
      toast.success('Phone number linked successfully!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      let message = 'Verification failed';
      if (firebaseErr.code === 'auth/invalid-verification-code') {
        message = 'Invalid OTP. Please check and try again.';
      } else if (firebaseErr.code === 'auth/code-expired') {
        message = 'OTP expired. Please request a new one.';
      } else if (firebaseErr.message) {
        message = firebaseErr.message;
      }
      setLocalError(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtp('');
    setLocalError('');
    await handleSendOtp();
  };

  const handleEditPhone = () => {
    setStep('phone');
    setOtp('');
    setLocalError('');
    confirmationResultRef.current = null;
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const handleMerge = async () => {
    if (!lastIdToken) {
      setLocalError('Session expired. Please try again.');
      setStep('phone');
      return;
    }
    setMerging(true);
    setLocalError('');
    try {
      const res = await fetch('/api/auth/merge-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: lastIdToken }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to merge accounts');
      }
      const data = await res.json();
      updateUser({ phone: data.user.phone, email: data.user.email, name: data.user.name });
      toast.success('Accounts merged successfully!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Merge failed';
      setLocalError(message);
    } finally {
      setMerging(false);
    }
  };

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader className="space-y-1 text-center">
          <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${step === 'merge-confirm' ? 'bg-amber-500/10' : 'bg-blue-600/10'}`}>
            {step === 'merge-confirm' ? (
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            ) : (
              <Smartphone className="h-6 w-6 text-blue-500" />
            )}
          </div>
          <CardTitle className="text-lg font-semibold text-foreground">
            {step === 'phone' ? 'Link your phone number' : step === 'otp' ? 'Verify OTP' : 'Account found'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {step === 'phone'
              ? 'Add your phone number for an additional way to sign in and account recovery.'
              : step === 'otp'
                ? `OTP sent to +91 ${phone}`
                : `+91 ${phone} is already linked to another account. Would you like to merge both accounts?`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'merge-confirm' ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-foreground/80">
                Merging will combine all projects, works, and subscription from both accounts into one.
                The other account will be removed.
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                onClick={handleMerge}
                disabled={merging}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {merging && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {merging ? 'Merging accounts...' : 'Merge Accounts'}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setStep('phone'); setLocalError(''); }}
                disabled={merging}
                className="w-full border-border text-foreground/80 hover:bg-accent hover:text-foreground"
              >
                Use a different number
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={merging}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </Button>
            </div>
          ) : step === 'phone' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendOtp();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label
                  htmlFor="link-phone"
                  className="text-sm font-medium text-foreground/80"
                >
                  Phone number
                </label>
                <div className="flex gap-2">
                  <div className="flex h-10 items-center rounded-md border border-border bg-background px-3 text-sm text-muted-foreground">
                    +91
                  </div>
                  <Input
                    id="link-phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.startsWith('91') && val.length > 10) {
                        val = val.slice(2);
                      } else if (val.startsWith('091') && val.length > 10) {
                        val = val.slice(3);
                      }
                      setPhone(val.slice(0, 10));
                      setLocalError('');
                    }}
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                    autoFocus
                    autoComplete="tel-national"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              <Button
                type="submit"
                disabled={sending || phone.length !== 10}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {sending ? 'Sending OTP...' : 'Continue'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </Button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyOtp();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label
                  htmlFor="link-otp"
                  className="text-sm font-medium text-foreground/80"
                >
                  Verification code
                </label>
                <Input
                  id="link-otp"
                  type="tel"
                  inputMode="numeric"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(val);
                    setLocalError('');
                  }}
                  className="border-border bg-background text-center text-lg tracking-[0.5em] text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                  autoFocus
                  autoComplete="one-time-code"
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              <Button
                type="submit"
                disabled={verifying || otp.length !== 6}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Link Phone Number'}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={handleEditPhone}
                  className="text-blue-500 hover:text-blue-400"
                >
                  Edit phone number
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || sending}
                  className="text-muted-foreground hover:text-foreground/80 disabled:text-muted-foreground/50"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : sending
                      ? 'Sending...'
                      : 'Resend OTP'}
                </button>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <div id="recaptcha-container-link" />
    </>
  );
}
