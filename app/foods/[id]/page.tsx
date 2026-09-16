'use client';

import { use } from 'react';
import { toast } from 'sonner';
import { useFoodDetail } from '@/hooks/use-food-detail';
import { useCreateLogEntry } from '@/hooks/use-log-entries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNutrient, calculateGramEquivalent } from '@/lib/utils/conversions';
import { LogForm } from '@/components/log-form/log-form';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

export default function FoodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const foodId = parseInt(id, 10);
  const { data: food, isLoading, error } = useFoodDetail(foodId);
  const createLogEntry = useCreateLogEntry();

  const handleQuickAdd = async () => {
    if (!food || !food.serving_sizes || food.serving_sizes.length === 0) return;

    const defaultServing = food.serving_sizes.find(s => s.is_default) || food.serving_sizes[0];
    const gramEquivalent = calculateGramEquivalent(
      defaultServing.amount,
      defaultServing.amount,
      defaultServing.gram_weight
    );

    try {
      await createLogEntry.mutateAsync({
        food_id: foodId,
        serving_size_id: defaultServing.id,
        logged_amount: defaultServing.amount,
        logged_unit: defaultServing.unit_name,
        gram_equivalent: gramEquivalent,
        meal: 'snack',
        logged_date: new Date().toISOString().split('T')[0],
      });
      toast.success(`Added ${food.name} to today's log`);
    } catch (err) {
      toast.error('Failed to add food');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl p-4">
        <Link
          href="/foods"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to search
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Skeleton className="h-5 w-32" />
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="container mx-auto max-w-2xl p-4">
        <div className="text-center text-destructive">Food not found</div>
      </div>
    );
  }

  const nutrientsByCategory = food.food_nutrients?.reduce((acc, fn) => {
    const nutrient = fn.nutrients;
    if (!nutrient) return acc;

    const category = nutrient.category;
    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push({
      ...nutrient,
      amount: fn.amount,
    });

    return acc;
  }, {} as Record<string, Array<{ id: number; name: string; unit_name: string; amount: number }>>);

  const categoryLabels = {
    macronutrient: 'Macronutrients',
    vitamin: 'Vitamins',
    mineral: 'Minerals',
    other: 'Other',
  };

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Link
        href="/foods"
        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to search
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{food.name}</CardTitle>
              {food.category && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {food.category}
                </div>
              )}
            </div>
            <Badge variant="secondary">{food.data_type}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-2 font-semibold">Serving Sizes</h3>
            <div className="space-y-1 text-sm">
              {food.serving_sizes?.map((serving) => (
                <div key={serving.id} className="flex justify-between">
                  <span>
                    {serving.amount} {serving.unit_name}
                    {serving.is_default && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        default
                      </Badge>
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    {serving.gram_weight}g
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Nutrients per 100g</h3>
            <div className="space-y-4">
              {nutrientsByCategory &&
                Object.entries(nutrientsByCategory).map(([category, nutrients]) => (
                  <div key={category}>
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </h4>
                    <div className="space-y-1 text-sm">
                      {nutrients.map((nutrient) => (
                        <div
                          key={nutrient.id}
                          className="flex justify-between"
                        >
                          <span>{nutrient.name}</span>
                          <span>
                            {formatNutrient(nutrient.amount)} {nutrient.unit_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {food.serving_sizes && food.serving_sizes.length > 0 && (
        <div className="mt-6 space-y-4">
          <Button
            onClick={handleQuickAdd}
            disabled={createLogEntry.isPending}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            {createLogEntry.isPending ? 'Adding...' : 'Quick Add Default Serving'}
          </Button>
          <LogForm foodId={foodId} servingSizes={food.serving_sizes} />
        </div>
      )}
    </div>
  );
}
