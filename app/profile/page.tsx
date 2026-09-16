'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useProfile, useUpdateProfile } from '@/hooks/use-profile';
import { useUserTargets, useUpsertUserTarget, useDeleteUserTarget } from '@/hooks/use-user-targets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { DEFAULT_TARGETS } from '@/lib/constants';
import { formatNutrient } from '@/lib/utils/conversions';

export default function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: targets, isLoading: targetsLoading } = useUserTargets();
  const updateProfile = useUpdateProfile();
  const upsertTarget = useUpsertUserTarget();
  const deleteTarget = useDeleteUserTarget();

  const [age, setAge] = useState('');
  const [sex, setSex] = useState<string>('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [weightGoal, setWeightGoal] = useState('');
  const [goalRate, setGoalRate] = useState('');
  const [dietType, setDietType] = useState('omnivore');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setAge(profile.age?.toString() || '');
      setSex(profile.sex || '');
      setWeight(profile.weight_kg?.toString() || '');
      setHeight(profile.height_cm?.toString() || '');
      setActivityLevel(profile.activity_level || '');
      setWeightGoal(profile.weight_goal_kg?.toString() || '');
      setGoalRate(profile.goal_rate_kg_per_week?.toString() || '0');
      setDietType(profile.diet_type || 'omnivore');
    }
  }, [profile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');

    try {
      await updateProfile.mutateAsync({
        age: age ? parseInt(age) : null,
        sex: sex as 'male' | 'female' | null,
        weight_kg: weight ? parseFloat(weight) : null,
        height_cm: height ? parseFloat(height) : null,
        activity_level: activityLevel || null,
        weight_goal_kg: weightGoal ? parseFloat(weightGoal) : null,
        goal_rate_kg_per_week: goalRate ? parseFloat(goalRate) : 0,
        diet_type: dietType,
      });
      toast.success('Profile updated successfully!');
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      toast.error('Failed to update profile');
      console.error('Failed to update profile:', err);
    }
  };

  const handleGenerateTargets = async () => {
    if (!profile?.age || !profile?.sex || !profile?.weight_kg) {
      toast.error('Please fill in your age, sex, and weight first');
      return;
    }

    const targetEntries = Object.entries(DEFAULT_TARGETS);
    
    try {
      for (const [key, target] of targetEntries) {
        const nutrientName = key.replace(/_/g, ' ').toLowerCase();
        const nutrientId = getNutrientIdFromName(nutrientName);
        
        if (nutrientId) {
          await upsertTarget.mutateAsync({
            nutrient_id: nutrientId,
            min_amount: target.min,
            max_amount: target.max,
            unit_name: target.unit,
          });
        }
      }
      toast.success('Default targets generated successfully!');
    } catch (err) {
      toast.error('Failed to generate targets');
    }
  };

  const getNutrientIdFromName = (name: string): number | null => {
    const nutrientMap: Record<string, number> = {
      'calories': 1,
      'protein': 2,
      'carbohydrate': 3,
      'fat': 4,
      'fiber': 5,
      'sugar': 6,
      'calcium': 7,
      'iron': 8,
      'magnesium': 9,
      'phosphorus': 10,
      'potassium': 11,
      'sodium': 12,
      'zinc': 13,
      'vitamin c': 14,
      'vitamin a': 15,
      'vitamin d': 16,
      'vitamin b6': 17,
      'vitamin b12': 18,
    };
    return nutrientMap[name] || null;
  };

  const formatActivityLevel = (level: string): string => {
    if (!level) return '';
    return level.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDietType = (diet: string): string => {
    if (!diet) return '';
    return diet.charAt(0).toUpperCase() + diet.slice(1);
  };

  if (profileLoading || targetsLoading) {
    return (
      <div className="container mx-auto max-w-2xl p-4 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {success && (
              <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger id="sex">
                  <SelectValue placeholder="Select your sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="Enter your weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="Enter your height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity">Activity Level</Label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger id="activity">
                  <SelectValue placeholder="Select activity level">
                    {activityLevel ? formatActivityLevel(activityLevel) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightGoal">Weight Goal (kg)</Label>
              <Input
                id="weightGoal"
                type="number"
                step="0.1"
                placeholder="Enter your weight goal"
                value={weightGoal}
                onChange={(e) => setWeightGoal(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalRate">Goal Rate (kg/week)</Label>
              <Input
                id="goalRate"
                type="number"
                step="0.25"
                placeholder="0 for maintain, negative for lose, positive for gain"
                value={goalRate}
                onChange={(e) => setGoalRate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use negative values to lose weight (e.g., -0.5), positive to gain (e.g., 0.25), or 0 to maintain
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diet">Diet Type</Label>
              <Select value={dietType} onValueChange={setDietType}>
                <SelectTrigger id="diet">
                  <SelectValue>
                    {dietType ? formatDietType(dietType) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="omnivore">Omnivore</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nutrient Targets</CardTitle>
          <CardDescription>
            {targets && targets.length > 0
              ? 'Your personalized nutrient targets'
              : 'Generate default targets based on your profile'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {targets && targets.length > 0 ? (
            <div className="space-y-2">
              {targets.map((target) => (
                <div
                  key={target.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">{target.nutrients?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {target.min_amount ? `${formatNutrient(target.min_amount)} - ` : ''}
                      {target.max_amount ? formatNutrient(target.max_amount) : '—'} {target.unit_name}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        await deleteTarget.mutateAsync(target.nutrient_id);
                        toast.success('Target removed');
                      } catch (err) {
                        toast.error('Failed to remove target');
                      }
                    }}
                    disabled={deleteTarget.isPending}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Button
              onClick={handleGenerateTargets}
              className="w-full"
              disabled={upsertTarget.isPending}
            >
              {upsertTarget.isPending ? 'Generating...' : 'Generate Default Targets'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
