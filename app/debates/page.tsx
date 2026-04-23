"use client";

import { useEffect, useState } from "react";
import { DebateCard } from "@/components/DebateCard";

interface DebateSummary {
  id: string; topic: string; createdAt: string;
  voteCounts: { FOR: number; AGAINST: number };
}

export default function BrowsePage() {
  const [debates, setDebates] = useState<DebateSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<"recent" | "margin">("recent");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/debates?page=" + page + "&sort=" + sort)
      .then((r) => r.json())
      .then((data) => { setDebates(data.debates ?? []); setTotalPages(data.totalPages ?? 1); })
      .catch(() => setDebates([]))
      .finally(() => setLoading(false));
  }, [page, sort]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Debates</h1>
        <div className="flex gap-2">
          <button onClick={() => { setSort("recent"); setPage(1); }} className={"px-3 py-1.5 text-sm rounded-lg transition-colors " + (sort === "recent" ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium" : "text-zinc-500 hover:text-zinc-700")}>Recent</button>
          <button onClick={() => { setSort("margin"); setPage(1); }} className={"px-3 py-1.5 text-sm rounded-lg transition-colors " + (sort === "margin" ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium" : "text-zinc-500 hover:text-zinc-700")}>Most Contested</button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-5 animate-pulse">
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-3" />
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded mb-2" />
              <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : debates.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">No debates yet. Be the first to start one!</p>
          <a href="/" className="inline-block mt-4 text-indigo-600 dark:text-indigo-400 hover:underline">Submit a topic</a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {debates.map((d) => <DebateCard key={d.id} id={d.id} topic={d.topic} createdAt={d.createdAt} voteCounts={d.voteCounts} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm">Previous</button>
              <span className="px-4 py-2 text-sm text-zinc-500">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
