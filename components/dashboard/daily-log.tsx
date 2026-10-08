'use client';

import { toast } from 'sonner';
import { useLogEntries, useDeleteLogEntry } from '@/hooks/use-log-entries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Plus } from 'lucide-react';
import { formatNutrient } from '@/lib/utils/conversions';
import Link from 'next/link';

interface DailyLogProps {
  date: string;
}

const mealLabels = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'];

export function DailyLog({ date }: DailyLogProps) {
  const { data: logEntries, isLoading } = useLogEntries(date);
  const deleteLogEntry = useDeleteLogEntry();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteLogEntry.mutateAsync({ id, date });
        toast.success('Entry deleted');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete entry');
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const entriesByMeal = logEntries?.reduce((acc, entry) => {
    const meal = entry.meal || 'snack';
    if (!acc[meal]) {
      acc[meal] = [];
    }
    acc[meal].push(entry);
    return acc;
  }, {} as Record<string, typeof logEntries>);

  return (
    <div className="space-y-4">
      {mealOrder.map((meal) => {
        const entries = entriesByMeal?.[meal] || [];

        return (
          <Card key={meal} className="border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {mealLabels[meal as keyof typeof mealLabels]}
                </CardTitle>
                {entries.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {entries.length} {entries.length === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {entries.length === 0 ? (
                <Link href="/foods">
                  <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-gray-300 hover:bg-gray-50">
                    <Plus className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">Add food to {mealLabels[meal as keyof typeof mealLabels]}</span>
                  </div>
                </Link>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{(entry as any).foods?.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatNutrient(entry.logged_amount, 2)} {entry.logged_unit}
                        {' • '}
                        {formatNutrient(entry.gram_equivalent, 1)}g
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleteLogEntry.isPending}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
