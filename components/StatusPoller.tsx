"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function StatusPoller({ debateId, initialStatus }: { debateId: string; initialStatus: string }) {
  const router = useRouter();
  const [dots, setDots] = useState(0);

  useEffect(() => {
    if (["COMPLETE", "FAILED", "REJECTED"].includes(initialStatus)) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/debates/" + debateId);
        const data = await res.json();
        if (data.status === "COMPLETE" || data.status === "FAILED") {
          clearInterval(pollInterval);
          router.refresh();
        }
      } catch { /* retry */ }
    }, 3000);

    const dotInterval = setInterval(() => setDots((d) => (d + 1) % 4), 500);

    return () => { clearInterval(pollInterval); clearInterval(dotInterval); };
  }, [debateId, initialStatus, router]);

  if (["COMPLETE", "FAILED", "REJECTED"].includes(initialStatus)) return null;

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border-2 border-green-200 dark:border-green-900 p-6">
          <div className="h-6 w-24 bg-green-100 dark:bg-green-900/50 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" style={{width: `${60+i*8}%`}} />)}
          </div>
        </div>
        <div className="rounded-xl border-2 border-red-200 dark:border-red-900 p-6">
          <div className="h-6 w-24 bg-red-100 dark:bg-red-900/50 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" style={{width: `${70-i*5}%`}} />)}
          </div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
          AI agents are crafting their arguments{".".repeat(dots)}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">This typically takes 15-40 seconds</p>
      </div>
    </div>
  );
}
