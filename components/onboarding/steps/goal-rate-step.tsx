'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

export function GoalRateStep() {
  const router = useRouter();
  const [goalRate, setGoalRate] = useState(0);

  const profile = JSON.parse(localStorage.getItem('onboarding_profile') || '{}');
  const currentWeight = profile.weight_kg || 0;
  const weightGoal = profile.weight_goal_kg || currentWeight;

  const getGoalLabel = () => {
    if (goalRate === 0) return 'Maintain Weight';
    if (goalRate > 0) return 'Gain Weight';
    return 'Lose Weight';
  };

  const getRateLabel = () => {
    const absRate = Math.abs(goalRate);
    if (goalRate === 0) return '0 kg / week';
    if (goalRate > 0) return `${absRate} kg gained / week`;
    return `${absRate} kg lost / week`;
  };

  const handleNext = () => {
    const profile = JSON.parse(localStorage.getItem('onboarding_profile') || '{}');
    localStorage.setItem('onboarding_profile', JSON.stringify({
      ...profile,
      goal_rate_kg_per_week: goalRate,
    }));

    router.push('/onboarding?step=overview');
  };

  return (
    <OnboardingLayout
      currentStep={6}
      totalSteps={7}
      title="Set a Goal Rate"
      subtitle="We will calculate your daily calorie budget based on your goals."
      onNext={handleNext}
      onSkip={() => router.push('/onboarding?step=overview')}
      showSkip
    >
      <div className="max-w-md mx-auto">
        <div className="bg-card border rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">{getGoalLabel()}</h3>
          <p className="text-muted-foreground mb-6">{weightGoal} kg</p>

          <div className="flex items-center justify-center gap-4 bg-muted/50 rounded-lg p-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setGoalRate(Math.max(-1, goalRate - 0.25))}
            >
              <Minus className="h-6 w-6" />
            </Button>

            <div className="text-xl font-semibold min-w-[200px]">
              {getRateLabel()}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setGoalRate(Math.min(1, goalRate + 0.25))}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
