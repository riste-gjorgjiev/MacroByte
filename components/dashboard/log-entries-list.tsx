'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLogEntries, useDeleteLogEntry } from '@/hooks/use-log-entries';
import { formatNutrient } from '@/lib/utils/conversions';
import { Trash2 } from 'lucide-react';

interface LogEntriesListProps {
  date: string;
}

const mealLabels = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export function LogEntriesList({ date }: LogEntriesListProps) {
  const { data: logEntries, isLoading } = useLogEntries(date);
  const deleteLogEntry = useDeleteLogEntry();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      await deleteLogEntry.mutateAsync({ id, date });
    }
  };

  if (isLoading) {
    return <div className="text-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (!logEntries || logEntries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            No foods logged for this date
          </div>
        </CardContent>
      </Card>
    );
  }

  const entriesByMeal = logEntries.reduce((acc, entry) => {
    const meal = entry.meal || 'snack';
    if (!acc[meal]) {
      acc[meal] = [];
    }
    acc[meal].push(entry);
    return acc;
  }, {} as Record<string, typeof logEntries>);

  return (
    <div className="space-y-4">
      {Object.entries(entriesByMeal).map(([meal, entries]) => (
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
                <div>
                  <div className="font-medium">
                    {entry.foods?.name || 'Unknown food'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatNutrient(entry.logged_amount)} {entry.logged_unit}
                    {entry.serving_sizes && (
                      <span className="ml-1">
                        ({formatNutrient(entry.gram_equivalent)}g)
                      </span>
                    )}
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
