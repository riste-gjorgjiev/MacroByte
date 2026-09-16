'use client';

import { toast } from 'sonner';
import { useLogEntries, useDeleteLogEntry } from '@/hooks/use-log-entries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2 } from 'lucide-react';
import { formatNutrient } from '@/lib/utils/conversions';

interface DailyLogProps {
  date: string;
}

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

  const mealLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
  };

  const entriesByMeal = logEntries?.reduce((acc, entry) => {
    const meal = entry.meal || 'snack';
    if (!acc[meal]) {
      acc[meal] = [];
    }
    acc[meal].push(entry);
    return acc;
  }, {} as Record<string, typeof logEntries>);

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

  if (!logEntries || logEntries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            No foods logged for this day
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {entriesByMeal &&
        Object.entries(entriesByMeal).map(([meal, entries]) => (
          <Card key={meal}>
            <CardHeader>
              <CardTitle className="text-lg">
                {mealLabels[meal as keyof typeof mealLabels]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <div className="font-medium">{entry.foods?.name}</div>
                    <div className="text-sm text-muted-foreground">
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
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
