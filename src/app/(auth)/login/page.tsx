'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { getFirebaseAuth, signInWithGoogle } from '@/lib/firebase/client';
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

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const { setLoading, setAuthenticated, setError } = useAuthStore();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setLocalError] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);

  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recaptchaWidgetRef = useRef<number | null>(null);

  // Clean up on unmount
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
    // Reuse existing verifier if it hasn't been consumed
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    const auth = getFirebaseAuth();

    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
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
        // ignore — might already be cleared
      }
      recaptchaVerifierRef.current = null;
    }
    // Clear the container so a fresh widget can be rendered
    const container = document.getElementById('recaptcha-container');
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
      // Always reset before creating a new verifier
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
      // After successful use, the verifier is consumed — null it out
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
    setLoading();

    try {
      const credential = await confirmationResultRef.current.confirm(otp);
      const idToken = await credential.user.getIdToken();

      // Exchange Firebase token for a session cookie
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Authentication failed');
      }

      const data = await response.json();
      setAuthenticated(data.user);
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
      setError(message);
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

  const handleGoogleSignIn = async () => {
    setLocalError('');
    setGoogleLoading(true);
    setLoading();

    try {
      const idToken = await signInWithGoogle();

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Authentication failed');
      }

      const data = await response.json();
      setAuthenticated(data.user);
      // If Google user has no phone, prompt to link
      if (!data.user.phone) {
        router.push('/link-phone');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      let message = 'Google sign-in failed';

      if (firebaseErr.code === 'auth/popup-closed-by-user') {
        message = '';
      } else if (firebaseErr.code === 'auth/cancelled-popup-request') {
        message = '';
      } else if (firebaseErr.message) {
        message = firebaseErr.message;
      }

      if (message) {
        setLocalError(message);
        setError(message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold text-foreground">
            {step === 'phone' ? 'Sign in' : 'Verify OTP'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {step === 'phone'
              ? 'Enter your phone number to get started'
              : `OTP sent to +91 ${phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendOtp();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-foreground/80"
                >
                  Phone number
                </label>
                <div className="flex gap-2">
                  <div className="flex h-10 items-center rounded-md border border-border bg-background px-3 text-sm text-muted-foreground">
                    +91
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      // Strip country code prefixes from autofill
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

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={googleLoading}
                onClick={handleGoogleSignIn}
                className="w-full border-border bg-background text-foreground/80 hover:bg-accent hover:text-foreground disabled:opacity-50"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
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
                  htmlFor="otp"
                  className="text-sm font-medium text-foreground/80"
                >
                  Verification code
                </label>
                <Input
                  id="otp"
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
                {verifying ? 'Verifying...' : 'Verify'}
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
            </form>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground/60">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" />
    </>
  );
}
