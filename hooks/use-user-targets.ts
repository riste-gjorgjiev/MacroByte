import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserTarget } from '@/types';

export function useUserTargets() {
  return useQuery({
    queryKey: ['userTargets'],
    queryFn: async () => {
      const response = await fetch('/api/user-targets');
      if (!response.ok) throw new Error('Failed to fetch user targets');
      const data = await response.json();
      return data.targets as UserTarget[];
    },
  });
}

export function useUpsertUserTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { nutrient_id: number; min_amount: number | null; max_amount: number | null; unit_name: string }) => {
      const response = await fetch('/api/user-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Failed to update target');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTargets'] });
    },
  });
}

export function useDeleteUserTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nutrientId: number) => {
      const response = await fetch(`/api/user-targets?nutrient_id=${nutrientId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete target');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTargets'] });
    },
  });
}
