'use client';

import { ProfileStep } from '@/components/onboarding/steps/profile-step';
import { ActivityStep } from '@/components/onboarding/steps/activity-step';
import { WeightGoalStep } from '@/components/onboarding/steps/weight-goal-step';
import { GoalRateStep } from '@/components/onboarding/steps/goal-rate-step';
import { OverviewStep } from '@/components/onboarding/steps/overview-step';

interface OnboardingClientProps {
  step: string;
}

export function OnboardingClient({ step }: OnboardingClientProps) {
  switch (step) {
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
      return <ProfileStep />;
  }
}
