import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingClient } from '@/components/onboarding/onboarding-client';

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const params = await searchParams;
  const step = params.step || 'welcome';

  // If user is logged in and no step is specified (or welcome/account step),
  // redirect to profile step since they're already authenticated
  if (!params.step || step === 'welcome' || step === 'account') {
    redirect('/onboarding?step=profile');
  }

  return <OnboardingClient step={step} />;
}
