import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const debate = await prisma.debate.findUnique({
    where: { id },
    include: { votes: true },
  });

  if (!debate) {
    return NextResponse.json({ error: "Debate not found" }, { status: 404 });
  }

  const forVotes = debate.votes.filter((v) => v.side === "FOR").length;
  const againstVotes = debate.votes.filter((v) => v.side === "AGAINST").length;

  return NextResponse.json({
    id: debate.id, topic: debate.topic, status: debate.status,
    forArgument: debate.forArgument, againstArgument: debate.againstArgument,
    errorMessage: debate.errorMessage, createdAt: debate.createdAt,
    completedAt: debate.completedAt,
    voteCounts: { FOR: forVotes, AGAINST: againstVotes },
  });
}
