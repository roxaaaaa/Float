"use client";

import { useEffect } from "react";
import useSWR, { mutate } from "swr";
import { createClient } from "./client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useSupabaseQuery<T>(key: string, table: string, accountId: string, filters?: (query: any) => any) {
  const supabase = createClient();
  const fetcher = async () => {
    let query = supabase.from(table).select("*").eq("account_id", accountId);
    if (filters) {
      query = filters(query);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as T[];
  };
  return useSWR<T[]>(key, fetcher, { revalidateOnFocus: false });
}

export function useRealtimeTable<T extends Record<string, unknown>>({
  channel,
  table,
  accountId,
  onChange,
}: {
  channel: string;
  table: string;
  accountId: string;
  onChange: (payload: RealtimePostgresChangesPayload<T>) => void;
}) {
  const supabase = createClient();

  useEffect(() => {
    const realtimeChannel = supabase
      .channel(channel)
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table, filter: `account_id=eq.${accountId}` } as any,
        onChange as any,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [accountId, channel, onChange, supabase, table]);
}

export function invalidateKeys(keys: string[]) {
  keys.forEach((key) => mutate(key));
}
