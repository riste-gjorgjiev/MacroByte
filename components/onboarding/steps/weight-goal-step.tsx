'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { Input } from '@/components/ui/input';

export function WeightGoalStep() {
  const router = useRouter();
  const [weightGoal, setWeightGoal] = useState('');

  const isValid = weightGoal && parseFloat(weightGoal) > 0;

  const handleNext = () => {
    if (!isValid) return;

    const profile = JSON.parse(localStorage.getItem('onboarding_profile') || '{}');
    localStorage.setItem('onboarding_profile', JSON.stringify({
      ...profile,
      weight_goal_kg: parseFloat(weightGoal),
    }));

    router.push('/onboarding?step=goal-rate');
  };

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={7}
      title="Set a Weight Goal"
      subtitle="We will calculate your daily calorie budget based on your goals."
      onNext={handleNext}
      onSkip={() => router.push('/onboarding?step=goal-rate')}
      showSkip
      nextDisabled={!isValid}
    >
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-3xl"></span>
          </div>
          <h3 className="text-xl font-semibold mb-6 text-gray-900">What is your weight goal?</h3>
          <Input
            type="number"
            placeholder="--"
            value={weightGoal}
            onChange={(e) => setWeightGoal(e.target.value)}
            className="h-16 text-2xl text-center max-w-xs mx-auto border-gray-200"
          />
          <p className="text-gray-500 mt-2">kg</p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
