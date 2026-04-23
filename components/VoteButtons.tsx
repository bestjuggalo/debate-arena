"use client";

import { useState } from "react";

export function VoteButtons({ debateId, initialCounts }: { debateId: string; initialCounts: { FOR: number; AGAINST: number } }) {
  const [counts, setCounts] = useState(initialCounts);
  const [voted, setVoted] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");

  const total = counts.FOR + counts.AGAINST;
  const forPct = total > 0 ? Math.round((counts.FOR / total) * 100) : 50;
  const againstPct = total > 0 ? 100 - forPct : 50;

  async function castVote(side: "FOR" | "AGAINST") {
    if (voted || voting) return;
    setVoting(true);
    setError("");
    try {
      const res = await fetch("/api/debates/" + debateId + "/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ side }),
      });
      if (res.status === 409) { setVoted(side); setVoting(false); return; }
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to vote."); setVoting(false); return; }
      const data = await res.json();
      setCounts(data.voteCounts);
      setVoted(side);
    } catch { setError("Network error."); }
    setVoting(false);
  }

  if (voted) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-3">
          You voted <span className={voted === "FOR" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{voted}</span> &middot; {total} total vote{total !== 1 ? "s" : ""}
        </p>
        <div className="relative h-10 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex">
          <div className="bg-green-500 dark:bg-green-600 flex items-center justify-center text-white text-sm font-bold transition-all duration-700" style={{ width: forPct + "%", minWidth: total > 0 ? "2.5rem" : "0" }}>
            {total > 0 ? forPct + "%" : ""}
          </div>
          <div className="bg-red-500 dark:bg-red-600 flex items-center justify-center text-white text-sm font-bold transition-all duration-700" style={{ width: againstPct + "%", minWidth: total > 0 ? "2.5rem" : "0" }}>
            {total > 0 ? againstPct + "%" : ""}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-zinc-500">
          <span>FOR: {counts.FOR}</span>
          <span>AGAINST: {counts.AGAINST}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <p className="text-center text-zinc-600 dark:text-zinc-400 mb-4 font-medium">Who made the stronger case?</p>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => castVote("FOR")} disabled={voting} className="py-4 px-6 rounded-xl border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 font-semibold text-lg transition-colors disabled:opacity-50">
          {voting ? "Voting..." : "FOR wins"}
        </button>
        <button onClick={() => castVote("AGAINST")} disabled={voting} className="py-4 px-6 rounded-xl border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold text-lg transition-colors disabled:opacity-50">
          {voting ? "Voting..." : "AGAINST wins"}
        </button>
      </div>
      {error && <p className="text-center text-red-500 text-sm mt-3">{error}</p>}
    </div>
  );
}
