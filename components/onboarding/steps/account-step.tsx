'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function AccountStep() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = firstName.trim() && email.trim() && password && password === confirmPassword && password.length >= 6;

  const handleNext = async () => {
    if (!isValid) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Store profile data in localStorage for next steps
    localStorage.setItem('onboarding_profile', JSON.stringify({
      first_name: firstName,
      email,
    }));

    router.push('/onboarding?step=profile');
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={7}
      title="Account Details"
      subtitle="Enter your email and create a password for your MacroByte account."
      onNext={handleNext}
      onSkip={() => router.push('/onboarding?step=profile')}
      showSkip
      nextDisabled={!isValid || loading}
      nextLabel={loading ? 'CREATING...' : 'NEXT'}
    >
      <div className="max-w-md mx-auto space-y-4">
        <Input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="h-14 text-lg"
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-14 text-lg"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-14 text-lg"
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-14 text-lg"
        />
        {password && confirmPassword && password !== confirmPassword && (
          <p className="text-sm text-destructive">Passwords do not match</p>
        )}
        {password && password.length < 6 && (
          <p className="text-sm text-destructive">Password must be at least 6 characters</p>
        )}
      </div>
    </OnboardingLayout>
  );
}
