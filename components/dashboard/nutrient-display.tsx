'use client';

import { useDailySummary } from '@/hooks/use-daily-summary';
import { useUserTargets } from '@/hooks/use-user-targets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNutrient, calculatePercentage } from '@/lib/utils/conversions';
import { DEFAULT_TARGETS } from '@/lib/constants';

interface NutrientDisplayProps {
  date: string;
}

const MACRO_COLORS = {
  protein: 'bg-blue-500',
  carbs: 'bg-emerald-500',
  fat: 'bg-amber-500',
  fiber: 'bg-violet-500',
};

export function NutrientDisplay({ date }: NutrientDisplayProps) {
  const { data: summaries, isLoading: summariesLoading } = useDailySummary(date);
  const { data: userTargets, isLoading: targetsLoading } = useUserTargets();

  if (summariesLoading || targetsLoading) {
    return (
      <div className="space-y-4">
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
          <div className="text-center text-sm text-gray-500">
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
      current: parseFloat(summary.total_amount.toString()),
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

  const categoryLabels = {
    macronutrient: 'Macronutrients',
    vitamin: 'Vitamins',
    mineral: 'Minerals',
    other: 'Other',
  };

  return (
    <div className="space-y-6">
      {/* Calories Card */}
      {calories && (
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-gray-900">
              {formatNutrient(calories.current, 0)}
              <span className="text-xl text-gray-500 ml-2 font-normal">kcal</span>
            </div>
            {calories.target_max && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Target: {calories.target_max} kcal</span>
                  <span className="font-medium">{calculatePercentage(calories.current, calories.target_max).toFixed(0)}%</span>
                </div>
                <Progress value={calculatePercentage(calories.current, calories.target_max)} className="h-3" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Macro Breakdown with Horizontal Bars */}
      {(protein || carbs || fat || fiber) && (
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Macro Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {protein && protein.target_max && (
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${MACRO_COLORS.protein}`} />
                    <span className="font-medium text-gray-900">Protein</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900">{formatNutrient(protein.current)}</span>
                    <span className="text-gray-500"> / {formatNutrient(protein.target_max)} g</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({calculatePercentage(protein.current, protein.target_max).toFixed(0)}%)
                    </span>
                  </div>
                </div>
                <Progress 
                  value={calculatePercentage(protein.current, protein.target_max)} 
                  className="h-2"
                  indicatorClassName={MACRO_COLORS.protein}
                />
              </div>
            )}

            {carbs && carbs.target_max && (
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${MACRO_COLORS.carbs}`} />
                    <span className="font-medium text-gray-900">Carbohydrates</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900">{formatNutrient(carbs.current)}</span>
                    <span className="text-gray-500"> / {formatNutrient(carbs.target_max)} g</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({calculatePercentage(carbs.current, carbs.target_max).toFixed(0)}%)
                    </span>
                  </div>
                </div>
                <Progress 
                  value={calculatePercentage(carbs.current, carbs.target_max)} 
                  className="h-2"
                  indicatorClassName={MACRO_COLORS.carbs}
                />
              </div>
            )}

            {fat && fat.target_max && (
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${MACRO_COLORS.fat}`} />
                    <span className="font-medium text-gray-900">Fat</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900">{formatNutrient(fat.current)}</span>
                    <span className="text-gray-500"> / {formatNutrient(fat.target_max)} g</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({calculatePercentage(fat.current, fat.target_max).toFixed(0)}%)
                    </span>
                  </div>
                </div>
                <Progress 
                  value={calculatePercentage(fat.current, fat.target_max)} 
                  className="h-2"
                  indicatorClassName={MACRO_COLORS.fat}
                />
              </div>
            )}

            {fiber && fiber.target_max && (
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${MACRO_COLORS.fiber}`} />
                    <span className="font-medium text-gray-900">Fiber</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900">{formatNutrient(fiber.current)}</span>
                    <span className="text-gray-500"> / {formatNutrient(fiber.target_max)} g</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({calculatePercentage(fiber.current, fiber.target_max).toFixed(0)}%)
                    </span>
                  </div>
                </div>
                <Progress 
                  value={calculatePercentage(fiber.current, fiber.target_max)} 
                  className="h-2"
                  indicatorClassName={MACRO_COLORS.fiber}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Other Nutrients */}
      {Object.entries(nutrientsByCategory)
        .filter(([category]) => category !== 'macronutrient')
        .map(([category, nutrients]) => (
          <Card key={category} className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">
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
                      <span className="font-medium text-gray-900">{nutrient.name}</span>
                      <div className="text-sm">
                        <span className="font-semibold text-gray-900">{formatNutrient(nutrient.current)}</span>
                        <span className="text-gray-500"> / {target ? formatNutrient(target) : '—'} {nutrient.unit_name}</span>
                        {target && (
                          <span className={`ml-2 text-xs ${isOver ? 'text-red-500' : 'text-gray-500'}`}>
                            ({percentage.toFixed(0)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    {target && (
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${isOver ? '[&>div]:bg-red-500' : ''}`}
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
