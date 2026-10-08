'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ProfileStep() {
  const router = useRouter();
  const [sex, setSex] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const isValid = sex && age && height && weight;

  const handleNext = () => {
    if (!isValid) return;

    const profile = JSON.parse(localStorage.getItem('onboarding_profile') || '{}');
    localStorage.setItem('onboarding_profile', JSON.stringify({
      ...profile,
      sex,
      age: parseInt(age),
      height_cm: parseFloat(height),
      weight_kg: parseFloat(weight),
    }));

    router.push('/onboarding?step=activity');
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={7}
      title="Set Your Profile"
      subtitle="We can customise your nutrition targets with this information."
      onNext={handleNext}
      onSkip={() => router.push('/onboarding?step=activity')}
      showSkip
      showBack={false}
      nextDisabled={!isValid}
    >
      <div className="max-w-md mx-auto space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Your sex</label>
          <Select value={sex} onValueChange={(val) => setSex(val ?? '')}>
            <SelectTrigger className="h-14 border-gray-200">
              <SelectValue placeholder="Select your sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Your age</label>
          <Input
            type="number"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="h-14 text-lg border-gray-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Your height (cm)</label>
          <Input
            type="number"
            placeholder="Enter your height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="h-14 text-lg border-gray-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Your weight (kg)</label>
          <Input
            type="number"
            placeholder="Enter your weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="h-14 text-lg border-gray-200"
          />
        </div>

        <p className="text-sm text-gray-500 text-center mt-6">
          We use this information to calculate and provide you with daily personalised recommendations.
        </p>
      </div>
    </OnboardingLayout>
  );
}
