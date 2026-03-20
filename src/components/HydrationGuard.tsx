"use client";

import { useState, useEffect } from "react";

/**
 * HydrationGuard: wraps client-only content to prevent Next.js hydration mismatches.
 * Zustand persist loads from localStorage on mount, which differs from SSR output.
 * This component renders children only after the first client-side mount.
 */
export function HydrationGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
