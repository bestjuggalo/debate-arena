import { SubmitForm } from "@/components/SubmitForm";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  let recentDebates: { id: string; topic: string; createdAt: Date }[] = [];
  try {
    recentDebates = await prisma.debate.findMany({
      where: { status: "COMPLETE" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, topic: true, createdAt: true },
    }) as { id: string; topic: string; createdAt: Date }[];
  } catch {
    // DB might not be initialized yet
  }

  return (
    <div className="flex flex-col items-center gap-12 py-12">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          AI vs AI Debate Arena
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Submit any topic. Two AI agents will craft the strongest possible
          arguments &mdash; one FOR, one AGAINST. Then you decide who wins.
        </p>
      </div>

      <SubmitForm />

      {recentDebates.length > 0 && (
        <div className="w-full max-w-2xl">
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
            Recent Debates
          </h2>
          <div className="space-y-2">
            {recentDebates.map((d) => (
              <Link
                key={d.id}
                href={`/debates/${d.id}`}
                className="block p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-sm"
              >
                {d.topic}
              </Link>
            ))}
          </div>
          <Link
            href="/debates"
            className="inline-block mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View all debates &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
