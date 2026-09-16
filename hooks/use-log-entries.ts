import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { LogEntry, LogEntryInput } from '@/types';

export function useLogEntries(date: string) {
  return useQuery({
    queryKey: ['logEntries', date],
    queryFn: async () => {
      const response = await fetch(`/api/log-entries?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch log entries');
      const data = await response.json();
      return data.logEntries as LogEntry[];
    },
  });
}

export function useCreateLogEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LogEntryInput) => {
      const response = await fetch('/api/log-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Failed to create log entry');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['logEntries', variables.logged_date] });
      queryClient.invalidateQueries({ queryKey: ['dailySummary', variables.logged_date] });
    },
  });
}

export function useUpdateLogEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: LogEntryInput & { id: string }) => {
      const response = await fetch(`/api/log-entries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Failed to update log entry');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['logEntries'] });
      queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
    },
  });
}

export function useDeleteLogEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const response = await fetch(`/api/log-entries/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete log entry');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['logEntries', variables.date] });
      queryClient.invalidateQueries({ queryKey: ['dailySummary', variables.date] });
    },
  });
}
