"use client";

import { useEffect } from "react";
import { setupMockApi } from "@/lib/mockApi";

export function MockApiProvider({ children }: { children: React.ReactNode }) {
  // Setup the mock API before rendering any children
  setupMockApi();

  useEffect(() => {
    // Re-verify setup just in case
    setupMockApi();
  }, []);

  return <>{children}</>;
}
