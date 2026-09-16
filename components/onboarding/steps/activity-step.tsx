'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';

const ACTIVITY_LEVELS = [
  {
    id: 'sedentary',
    title: 'Sedentary',
    description: 'Little or no physical activity, typically a desk job or minimal movement throughout the day.',
    example: 'Office work, watching TV, and minimal walking.',
    icon: '🪑',
  },
  {
    id: 'lightly_active',
    title: 'Lightly Active',
    description: 'A job that involves some physical activity or light intensity exercise 1-3 days per week.',
    example: 'Light walking, casual biking, or household chores.',
    icon: '🚶',
  },
  {
    id: 'moderately_active',
    title: 'Moderately Active',
    description: 'Jobs that keep you on your feet most of the day, or moderate intensity exercise 3-5 days per week.',
    example: 'Gym sessions, running, or active jobs like retail.',
    icon: '🏃',
  },
  {
    id: 'very_active',
    title: 'Very Active',
    description: 'A very physical job, very hard exercise, or physical training.',
    example: 'Pro athletes, military training, or jobs with continuous high physical activity.',
    icon: '🏋️',
  },
  {
    id: 'custom',
    title: 'Custom',
    description: 'Set your own fixed daily value for calories burned due to exercise.',
    example: '',
    icon: '⚙️',
  },
];

export function ActivityStep() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState('');

  const handleNext = () => {
    if (!selectedLevel) return;

    const profile = JSON.parse(localStorage.getItem('onboarding_profile') || '{}');
    localStorage.setItem('onboarding_profile', JSON.stringify({
      ...profile,
      activity_level: selectedLevel,
    }));

    router.push('/onboarding?step=weight-goal');
  };

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={7}
      title="Set an Activity Level"
      subtitle="We recommend selecting a baseline level that best describes your day-to-day life."
      onNext={handleNext}
      onSkip={() => router.push('/onboarding?step=weight-goal')}
      showSkip
      nextDisabled={!selectedLevel}
    >
      <div className="max-w-md mx-auto space-y-3">
        {ACTIVITY_LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => setSelectedLevel(level.id)}
            className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
              selectedLevel === level.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{level.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{level.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{level.description}</p>
                {level.example && (
                  <p className="text-sm">
                    <span className="font-medium">Example:</span> {level.example}
                  </p>
                )}
              </div>
              {selectedLevel === level.id && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-4 h-4 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </OnboardingLayout>
  );
}
