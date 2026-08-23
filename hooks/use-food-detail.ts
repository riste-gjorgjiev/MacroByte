import { useQuery } from '@tanstack/react-query';
import { FoodWithNutrients } from '@/types';

export function useFoodDetail(foodId: number | null) {
  return useQuery({
    queryKey: ['foodDetail', foodId],
    queryFn: async () => {
      if (!foodId) {
        throw new Error('Food ID is required');
      }

      const response = await fetch(`/api/foods/${foodId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch food details');
      }

      const data = await response.json();
      return data.food as FoodWithNutrients;
    },
    enabled: foodId !== null,
  });
}
