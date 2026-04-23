import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { moderateTopic } from "@/lib/moderation";
import { generateDebate } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const topic = body.topic?.trim();

    if (!topic || topic.length < 10 || topic.length > 500) {
      return NextResponse.json(
        { error: "Topic must be between 10 and 500 characters." },
        { status: 400 }
      );
    }

    const modResult = await moderateTopic(topic);
    if (!modResult.approved) {
      const debate = await prisma.debate.create({
        data: { topic, status: "REJECTED", errorMessage: modResult.reason ?? "Rejected." },
      });
      return NextResponse.json(
        { id: debate.id, status: "REJECTED", reason: modResult.reason },
        { status: 422 }
      );
    }

    const debate = await prisma.debate.create({ data: { topic, status: "PENDING" } });

    // Fire-and-forget async generation
    generateDebateAsync(debate.id, topic);

    return NextResponse.json({ id: debate.id, status: "PENDING" }, { status: 201 });
  } catch (error) {
    console.error("Error creating debate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const sort = searchParams.get("sort") ?? "recent";
  const perPage = 20;

  const debates = await prisma.debate.findMany({
    where: { status: "COMPLETE" },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
    include: { votes: true },
  });

  const total = await prisma.debate.count({ where: { status: "COMPLETE" } });

  const results = debates.map((d) => {
    const forVotes = d.votes.filter((v) => v.side === "FOR").length;
    const againstVotes = d.votes.filter((v) => v.side === "AGAINST").length;
    return {
      id: d.id, topic: d.topic, status: d.status,
      createdAt: d.createdAt, completedAt: d.completedAt,
      voteCounts: { FOR: forVotes, AGAINST: againstVotes },
    };
  });

  if (sort === "margin") {
    results.sort((a, b) =>
      Math.abs(b.voteCounts.FOR - b.voteCounts.AGAINST) -
      Math.abs(a.voteCounts.FOR - a.voteCounts.AGAINST)
    );
  }

  return NextResponse.json({ debates: results, page, totalPages: Math.ceil(total / perPage), total });
}

async function generateDebateAsync(debateId: string, topic: string) {
  try {
    await prisma.debate.update({ where: { id: debateId }, data: { status: "GENERATING" } });
    const result = await generateDebate(topic);
    await prisma.debate.update({
      where: { id: debateId },
      data: {
        status: "COMPLETE",
        forArgument: result.forArgument,
        againstArgument: result.againstArgument,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Generation failed:", error);
    await prisma.debate.update({
      where: { id: debateId },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}
