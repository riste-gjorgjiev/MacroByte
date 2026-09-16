'use client';

import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';

export function WelcomeStep() {
  const router = useRouter();

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={7}
      title="Track Your Nutrition"
      subtitle="Gain valuable insights into your daily nutrition and reach your health goals."
      showBack={false}
      onNext={() => router.push('/onboarding?step=account')}
      nextLabel="GET STARTED"
    >
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-6xl mb-8"></div>
        <div className="text-center space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-card border">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium">Track Macros</div>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-medium">Set Goals</div>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-sm font-medium">View Progress</div>
            </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
