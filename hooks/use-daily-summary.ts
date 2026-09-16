import { useQuery } from '@tanstack/react-query';
import type { DailySummaryWithNutrient } from '@/types';

export function useDailySummary(date: string) {
  return useQuery({
    queryKey: ['dailySummary', date],
    queryFn: async () => {
      const response = await fetch(`/api/daily-summary?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch daily summary');
      const data = await response.json();
      return data.summaries as DailySummaryWithNutrient[];
    },
  });
}
