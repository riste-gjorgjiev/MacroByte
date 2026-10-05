import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WaterEntry {
  id: string;
  amount_ml: number;
  logged_date: string;
  logged_at: string;
}

interface WaterData {
  entries: WaterEntry[];
  total_ml: number;
}

export function useWaterIntake(date: string) {
  return useQuery({
    queryKey: ['waterIntake', date],
    queryFn: async () => {
      const response = await fetch(`/api/water-intake?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch water intake');
      return response.json() as Promise<WaterData>;
    },
  });
}

export function useAddWater() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount_ml, logged_date }: { amount_ml: number; logged_date: string }) => {
      const response = await fetch('/api/water-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_ml, logged_date }),
      });
      if (!response.ok) throw new Error('Failed to add water');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['waterIntake', variables.logged_date] });
    },
  });
}

export function useDeleteWater() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const response = await fetch(`/api/water-intake?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete water entry');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['waterIntake', variables.date] });
    },
  });
}
