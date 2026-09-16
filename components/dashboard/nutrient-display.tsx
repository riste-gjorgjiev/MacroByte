'use client';

import { useDailySummary } from '@/hooks/use-daily-summary';
import { useUserTargets } from '@/hooks/use-user-targets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNutrient, calculatePercentage } from '@/lib/utils/conversions';
import { DEFAULT_TARGETS } from '@/lib/constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface NutrientDisplayProps {
  date: string;
}

const COLORS = {
  protein: '#3b82f6',
  carbs: '#10b981',
  fat: '#f59e0b',
  fiber: '#8b5cf6',
};

export function NutrientDisplay({ date }: NutrientDisplayProps) {
  const { data: summaries, isLoading: summariesLoading } = useDailySummary(date);
  const { data: userTargets, isLoading: targetsLoading } = useUserTargets();

  if (summariesLoading || targetsLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-32 mb-3" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summaries || summaries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            No nutrients tracked yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const targetMap = new Map(
    userTargets?.map(t => [t.nutrient_id, { min: t.min_amount, max: t.max_amount }]) || []
  );

  const nutrientsByCategory = summaries.reduce((acc, summary) => {
    const nutrient = summary.nutrients;
    if (!nutrient) return acc;

    const category = nutrient.category;
    if (!acc[category]) {
      acc[category] = [];
    }

    const userTarget = targetMap.get(nutrient.id);
    let targetMin: number | null = null;
    let targetMax: number | null = null;

    if (userTarget) {
      targetMin = userTarget.min;
      targetMax = userTarget.max;
    } else {
      const targetKey = nutrient.name.toUpperCase().replace(' ', '_') as keyof typeof DEFAULT_TARGETS;
      const defaultTarget = DEFAULT_TARGETS[targetKey];
      if (defaultTarget) {
        targetMin = defaultTarget.min;
        targetMax = defaultTarget.max;
      }
    }

    acc[category].push({
      ...nutrient,
      current: parseFloat(summary.total_amount),
      target_min: targetMin,
      target_max: targetMax,
    });

    return acc;
  }, {} as Record<string, Array<{ id: number; name: string; unit_name: string; current: number; target_min: number | null; target_max: number | null }>>);

  const macros = nutrientsByCategory.macronutrient || [];
  const protein = macros.find(n => n.name === 'Protein');
  const carbs = macros.find(n => n.name === 'Carbohydrate');
  const fat = macros.find(n => n.name === 'Fat');
  const fiber = macros.find(n => n.name === 'Fiber');
  const calories = macros.find(n => n.name === 'Calories');

  const macroData = [
    protein && { name: 'Protein', value: protein.current, color: COLORS.protein },
    carbs && { name: 'Carbs', value: carbs.current, color: COLORS.carbs },
    fat && { name: 'Fat', value: fat.current, color: COLORS.fat },
    fiber && { name: 'Fiber', value: fiber.current, color: COLORS.fiber },
  ].filter(Boolean);

  const categoryLabels = {
    macronutrient: 'Macronutrients',
    vitamin: 'Vitamins',
    mineral: 'Minerals',
    other: 'Other',
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {calories && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {formatNutrient(calories.current, 0)}
                <span className="text-lg text-muted-foreground ml-2">kcal</span>
              </div>
              {calories.target_max && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Target: {calories.target_max} kcal</span>
                    <span>{calculatePercentage(calories.current, calories.target_max).toFixed(0)}%</span>
                  </div>
                  <Progress value={calculatePercentage(calories.current, calories.target_max)} className="h-3" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {macroData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Macro Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `${formatNutrient(value)}g`}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {macroData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {Object.entries(nutrientsByCategory).map(([category, nutrients]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nutrients.map((nutrient) => {
              const target = nutrient.target_max || nutrient.target_min;
              const percentage = target ? calculatePercentage(nutrient.current, target) : 0;
              const isOver = nutrient.target_max && nutrient.current > nutrient.target_max;

              return (
                <div key={nutrient.id}>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-medium">{nutrient.name}</span>
                    <div className="text-sm">
                      <span className="font-semibold">{formatNutrient(nutrient.current)}</span>
                      <span className="text-muted-foreground"> / {target ? formatNutrient(target) : '—'} {nutrient.unit_name}</span>
                      {target && (
                        <span className={`ml-2 text-xs ${isOver ? 'text-destructive' : 'text-muted-foreground'}`}>
                          ({percentage.toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  {target && (
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${isOver ? '[&>div]:bg-destructive' : ''}`}
                    />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
