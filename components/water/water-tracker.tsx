'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useWaterIntake, useAddWater, useDeleteWater } from '@/hooks/use-water-intake';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Droplets } from 'lucide-react';
import { formatNutrient } from '@/lib/utils/conversions';

interface WaterTrackerProps {
  date: string;
  goalMl?: number;
}

const CUP_SIZE_ML = 250; // 1 cup = 250ml (approximately 8 fl oz)
const MAX_CUPS = 8;

export function WaterTracker({ date, goalMl = 2000 }: WaterTrackerProps) {
  const { data: waterData, isLoading } = useWaterIntake(date);
  const addWater = useAddWater();
  const deleteWater = useDeleteWater();
  const [customAmount, setCustomAmount] = useState('');

  const totalMl = waterData?.total_ml || 0;
  const filledCups = Math.floor(totalMl / CUP_SIZE_ML);
  const percentage = Math.min((totalMl / goalMl) * 100, 100);

  const handleAddCup = async () => {
    try {
      await addWater.mutateAsync({ amount_ml: CUP_SIZE_ML, logged_date: date });
      toast.success(`Added ${CUP_SIZE_ML}ml of water`);
    } catch (err) {
      toast.error('Failed to add water');
    }
  };

  const handleAddCustom = async () => {
    const amount = parseInt(customAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await addWater.mutateAsync({ amount_ml: amount, logged_date: date });
      toast.success(`Added ${amount}ml of water`);
      setCustomAmount('');
    } catch (err) {
      toast.error('Failed to add water');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWater.mutateAsync({ id, date });
      toast.success('Water entry deleted');
    } catch (err) {
      toast.error('Failed to delete entry');
    }
  };

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Water Intake
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Water
          </CardTitle>
          <span className="text-sm text-gray-500">
            {formatNutrient(totalMl, 0)} / {goalMl} ml
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <Progress value={percentage} className="h-2" indicatorClassName="bg-blue-500" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{percentage.toFixed(0)}% of daily goal</span>
            <span>{Math.max(0, goalMl - totalMl)}ml remaining</span>
          </div>
        </div>

        {/* Cup Visualization */}
        <div className="space-y-2">
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: MAX_CUPS }).map((_, index) => (
              <button
                key={index}
                onClick={handleAddCup}
                disabled={addWater.isPending}
                className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${
                  index < filledCups
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : index === filledCups
                    ? 'border-blue-500 text-blue-500 hover:bg-blue-50'
                    : 'border-gray-200 text-gray-300'
                }`}
                title={`Add ${CUP_SIZE_ML}ml`}
              >
                {index === filledCups && <Plus className="h-4 w-4" />}
                {index < filledCups && <Droplets className="h-4 w-4" />}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center">
            Click a cup to add {CUP_SIZE_ML}ml
          </p>
        </div>

        {/* Custom Amount */}
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Custom amount (ml)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="flex-1 border-gray-200"
          />
          <Button
            onClick={handleAddCustom}
            disabled={addWater.isPending || !customAmount}
            size="sm"
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            Add
          </Button>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex gap-2 flex-wrap">
          {[250, 500, 750, 1000].map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await addWater.mutateAsync({ amount_ml: amount, logged_date: date });
                  toast.success(`Added ${amount}ml of water`);
                } catch (err) {
                  toast.error('Failed to add water');
                }
              }}
              disabled={addWater.isPending}
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              +{amount}ml
            </Button>
          ))}
        </div>

        {/* Recent Entries */}
        {waterData?.entries && waterData.entries.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900">Today's Entries</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {waterData.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-sm p-2 rounded bg-gray-50"
                >
                  <span className="text-gray-700">{entry.amount_ml}ml</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-red-500"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleteWater.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
