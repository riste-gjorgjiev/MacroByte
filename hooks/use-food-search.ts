import { useQuery } from '@tanstack/react-query';
import { Food } from '@/types';

export function useFoodSearch(query: string, category?: string) {
  return useQuery({
    queryKey: ['foods', query, category],
    queryFn: async () => {
      if (!query || query.trim().length === 0) {
        return [];
      }

      let url = `/api/foods?q=${encodeURIComponent(query)}`;
      if (category && category !== 'all') {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to search foods');
      }

      const data = await response.json();
      return data.foods as Food[];
    },
    enabled: query.length > 0,
  });
}
