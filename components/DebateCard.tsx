import Link from "next/link";

export function DebateCard({ id, topic, createdAt, voteCounts }: {
  id: string; topic: string; createdAt: string; voteCounts: { FOR: number; AGAINST: number };
}) {
  const total = voteCounts.FOR + voteCounts.AGAINST;
  const forPct = total > 0 ? Math.round((voteCounts.FOR / total) * 100) : 0;
  const againstPct = total > 0 ? 100 - forPct : 0;
  const seconds = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  const timeAgo = seconds < 60 ? "just now" : seconds < 3600 ? Math.floor(seconds/60) + "m ago" : seconds < 86400 ? Math.floor(seconds/3600) + "h ago" : Math.floor(seconds/86400) + "d ago";

  return (
    <Link href={"/debates/" + id} className="block rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base line-clamp-2 mb-3">{topic}</h3>
      {total > 0 ? (
        <>
          <div className="h-2 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex mb-2">
            <div className="bg-green-500" style={{ width: forPct + "%" }} />
            <div className="bg-red-500" style={{ width: againstPct + "%" }} />
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>FOR {voteCounts.FOR}</span>
            <span>AGAINST {voteCounts.AGAINST}</span>
          </div>
        </>
      ) : (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">No votes yet</p>
      )}
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">{timeAgo}</p>
    </Link>
  );
}
