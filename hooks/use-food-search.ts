import { useQuery } from '@tanstack/react-query';
import { Food } from '@/types';

export function useFoodSearch(query: string) {
  return useQuery({
    queryKey: ['foods', query],
    queryFn: async () => {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const response = await fetch(`/api/foods?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search foods');
      }

      const data = await response.json();
      return data.foods as Food[];
    },
    enabled: query.length > 0,
  });
}
