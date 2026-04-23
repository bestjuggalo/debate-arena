import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DebateView } from "@/components/DebateView";
import { VoteButtons } from "@/components/VoteButtons";
import { StatusPoller } from "@/components/StatusPoller";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DebatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const debate = await prisma.debate.findUnique({
    where: { id },
    include: { votes: true },
  });

  if (!debate) notFound();

  const forVotes = debate.votes.filter((v) => v.side === "FOR").length;
  const againstVotes = debate.votes.filter((v) => v.side === "AGAINST").length;

  return (
    <div>
      <div className="mb-8">
        <Link href="/debates" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
          &larr; All Debates
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">{debate.topic}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {debate.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {(debate.status === "PENDING" || debate.status === "GENERATING") && (
        <StatusPoller debateId={debate.id} initialStatus={debate.status} />
      )}

      {debate.status === "COMPLETE" && debate.forArgument && debate.againstArgument && (
        <>
          <DebateView forArgument={debate.forArgument} againstArgument={debate.againstArgument} />
          <VoteButtons debateId={debate.id} initialCounts={{ FOR: forVotes, AGAINST: againstVotes }} />
        </>
      )}

      {debate.status === "FAILED" && (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Generation Failed</h2>
          <p className="text-zinc-500 mb-4">{debate.errorMessage ?? "Something went wrong."}</p>
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">Try again</Link>
        </div>
      )}

      {debate.status === "REJECTED" && (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Topic Rejected</h2>
          <p className="text-zinc-500 mb-4">{debate.errorMessage ?? "This topic did not pass moderation."}</p>
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">Submit a different topic</Link>
        </div>
      )}
    </div>
  );
}
