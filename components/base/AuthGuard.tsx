"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/authService";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const session = loadSession();
    if (!session) {
      router.replace("/auth");
    }
  }, [router]);

  // Render children optimistically — the redirect fires fast enough
  // that unauthenticated users won't see protected content.
  // Swap for a loading spinner here if you prefer a hard gate.
  return <>{children}</>;
}