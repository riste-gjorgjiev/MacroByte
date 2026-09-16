'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { toast } from 'sonner';

function calculateCalorieTarget(profile: any): number {
  const { sex, age, height_cm, weight_kg, activity_level, weight_goal_kg, goal_rate_kg_per_week } = profile;

  if (!sex || !age || !height_cm || !weight_kg) return 2000;

  // Mifflin-St Jeor Equation
  let bmr: number;
  if (sex === 'male') {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }

  // Activity multiplier
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    custom: 1.2,
  };

  const multiplier = activityMultipliers[activity_level] || 1.2;
  let tdee = bmr * multiplier;

  // Adjust for weight goal
  if (weight_goal_kg && goal_rate_kg_per_week) {
    const weightDiff = weight_goal_kg - weight_kg;
    // 7700 kcal per kg of body weight
    const dailyAdjustment = (goal_rate_kg_per_week * 7700) / 7;
    tdee += dailyAdjustment;
  }

  return Math.round(tdee);
}

export function OverviewStep() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [calorieTarget, setCalorieTarget] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedProfile = JSON.parse(localStorage.getItem('onboarding_profile') || '{}');
    setProfile(storedProfile);
    setCalorieTarget(calculateCalorieTarget(storedProfile));
  }, []);

  const handleFinish = async () => {
    if (!profile) return;

    setLoading(true);
    const supabase = createClient();

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please complete account creation first');
        router.push('/onboarding/account');
        return;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          age: profile.age,
          sex: profile.sex,
          height_cm: profile.height_cm,
          weight_kg: profile.weight_kg,
          activity_level: profile.activity_level,
          weight_goal_kg: profile.weight_goal_kg,
          goal_rate_kg_per_week: profile.goal_rate_kg_per_week,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create calorie target
      const { error: targetError } = await supabase
        .from('user_targets')
        .upsert({
          user_id: user.id,
          nutrient_id: 1, // Calories
          min_amount: calorieTarget * 0.9,
          max_amount: calorieTarget * 1.1,
          unit_name: 'kcal',
        }, {
          onConflict: 'user_id,nutrient_id',
        });

      if (targetError) throw targetError;

      // Clear onboarding data
      localStorage.removeItem('onboarding_profile');

      toast.success('Onboarding complete!');
      router.push('/');
    } catch (error) {
      toast.error('Failed to complete onboarding');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return null;
  }

  const getGoalLabel = () => {
    const { weight_kg, weight_goal_kg, goal_rate_kg_per_week } = profile;
    if (!weight_goal_kg || weight_goal_kg === weight_kg) return 'Maintain';
    if (weight_goal_kg > weight_kg) return 'Gain';
    return 'Lose';
  };

  return (
    <OnboardingLayout
      currentStep={7}
      totalSteps={7}
      title="Goal Overview"
      subtitle="Here is your plan and goal forecast based on the information provided."
      onNext={handleFinish}
      nextDisabled={loading}
      nextLabel={loading ? 'FINISHING...' : 'FINISH'}
      showSkip={false}
    >
      <div className="max-w-md mx-auto">
        <div className="bg-card border rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-3xl"></span>
          </div>
          <h3 className="text-xl font-semibold mb-2">{getGoalLabel()}</h3>
          <p className="text-muted-foreground mb-6">
            {profile.weight_goal_kg} kg
            {Number.isFinite(profile.goal_rate_kg_per_week) && profile.goal_rate_kg_per_week !== 0 && (
                ` • ${Math.abs(Number(profile.goal_rate_kg_per_week))} kg/week`
            )}
          </p>

          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground mb-2">ENERGY TARGET</p>
            <p className="text-3xl font-bold">{calorieTarget} kcal</p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Based on your profile:</p>
          <p className="mt-1">
            {profile.sex ? profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1) : ''}, {profile.age} years, {profile.height_cm}cm, {profile.weight_kg}kg
          </p>
          <p className="mt-1">
            Activity: {profile.activity_level ? profile.activity_level.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''}
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
