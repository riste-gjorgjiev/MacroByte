'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateLogEntry } from '@/hooks/use-log-entries';
import { calculateGramEquivalent } from '@/lib/utils/conversions';
import type { ServingSize } from '@/types';

interface LogFormProps {
  foodId: number;
  servingSizes: ServingSize[];
  onSuccess?: () => void;
}

export function LogForm({ foodId, servingSizes, onSuccess }: LogFormProps) {
  const [amount, setAmount] = useState('');
  const [servingSizeId, setServingSizeId] = useState<string>('');
  const [meal, setMeal] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const createLogEntry = useCreateLogEntry();

  const defaultServing = servingSizes.find(s => s.is_default) || servingSizes[0];
  const selectedServing = servingSizes.find(s => s.id.toString() === servingSizeId);

  const formatServingText = (serving: ServingSize) =>
      `${serving.amount} ${serving.unit_name} (${serving.gram_weight}g)${serving.is_default ? ' (default)' : ''}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!servingSizeId) {
      setError('Please select a serving size');
      return;
    }

    if (!meal) {
      setError('Please select a meal');
      return;
    }

    if (!selectedServing) {
      setError('Invalid serving size selected');
      return;
    }

    const gramEquivalent = calculateGramEquivalent(
        parseFloat(amount),
        selectedServing.amount,
        selectedServing.gram_weight
    );

    try {
      await createLogEntry.mutateAsync({
        food_id: foodId,
        serving_size_id: parseInt(servingSizeId),
        logged_amount: parseFloat(amount),
        logged_unit: selectedServing.unit_name,
        gram_equivalent: gramEquivalent,
        meal: meal as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        logged_date: date,
      });

      toast.success('Food logged successfully!');

      setAmount('');
      setServingSizeId('');
      setMeal('');
      setDate(new Date().toISOString().split('T')[0]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to log food');
      setError(err instanceof Error ? err.message : 'Failed to log food');
    }
  };

  return (
      <Card>
        <CardHeader>
          <CardTitle>Log This Food</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="serving">Serving Size</Label>
              <Select value={servingSizeId} onValueChange={setServingSizeId}>
                <SelectTrigger id="serving">
                  <SelectValue
                      placeholder={
                        defaultServing
                            ? `Select serving (default: ${defaultServing.amount} ${defaultServing.unit_name})`
                            : 'Select serving size'
                      }
                  >
                    {selectedServing ? formatServingText(selectedServing) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {servingSizes.map(serving => (
                      <SelectItem key={serving.id} value={serving.id.toString()}>
                        {formatServingText(serving)}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meal">Meal</Label>
              <Select value={meal} onValueChange={setMeal}>
                <SelectTrigger id="meal" className="capitalize">
                  <SelectValue placeholder="Select meal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={createLogEntry.isPending}>
              {createLogEntry.isPending ? 'Logging...' : 'Log Food'}
            </Button>
          </form>
        </CardContent>
      </Card>
  );
}