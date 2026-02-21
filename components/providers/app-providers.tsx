"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        dedupingInterval: 1500,
      }}
    >
      {children}
    </SWRConfig>
  );
}
