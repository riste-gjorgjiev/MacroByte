'use client';

import { useSearchParams } from 'next/navigation';
import { WelcomeStep } from '@/components/onboarding/steps/welcome-step';
import { AccountStep } from '@/components/onboarding/steps/account-step';
import { ProfileStep } from '@/components/onboarding/steps/profile-step';
import { ActivityStep } from '@/components/onboarding/steps/activity-step';
import { WeightGoalStep } from '@/components/onboarding/steps/weight-goal-step';
import { GoalRateStep } from '@/components/onboarding/steps/goal-rate-step';
import { OverviewStep } from '@/components/onboarding/steps/overview-step';

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const step = searchParams.get('step') || 'welcome';

  switch (step) {
    case 'account':
      return <AccountStep />;
    case 'profile':
      return <ProfileStep />;
    case 'activity':
      return <ActivityStep />;
    case 'weight-goal':
      return <WeightGoalStep />;
    case 'goal-rate':
      return <GoalRateStep />;
    case 'overview':
      return <OverviewStep />;
    default:
      return <WelcomeStep />;
  }
}
