import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashIp, getClientIp } from "@/lib/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: debateId } = await params;

  try {
    const body = await request.json();
    const side = body.side;

    if (side !== "FOR" && side !== "AGAINST") {
      return NextResponse.json({ error: "Side must be FOR or AGAINST." }, { status: 400 });
    }

    const debate = await prisma.debate.findUnique({ where: { id: debateId } });
    if (!debate) return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    if (debate.status !== "COMPLETE") {
      return NextResponse.json({ error: "Cannot vote on an incomplete debate." }, { status: 400 });
    }

    const ip = getClientIp(request);
    const ipHash = hashIp(ip);

    const existingVote = await prisma.vote.findUnique({
      where: { debateId_ipHash: { debateId, ipHash } },
    });

    if (existingVote) {
      return NextResponse.json({ error: "You have already voted on this debate." }, { status: 409 });
    }

    await prisma.vote.create({ data: { debateId, side, ipHash } });

    const votes = await prisma.vote.findMany({ where: { debateId } });
    const forVotes = votes.filter((v) => v.side === "FOR").length;
    const againstVotes = votes.filter((v) => v.side === "AGAINST").length;

    return NextResponse.json({ voteCounts: { FOR: forVotes, AGAINST: againstVotes } });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
