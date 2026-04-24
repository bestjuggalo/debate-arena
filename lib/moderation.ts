import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function moderateTopic(topic: string): Promise<{
  approved: boolean;
  reason?: string;
}> {
  if (topic.trim().length < 10) return { approved: false, reason: "Topic is too short." };
  if (topic.trim().length > 500) return { approved: false, reason: "Topic exceeds maximum length." };

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      system: `You are a content moderator. Evaluate whether a debate topic is appropriate for a public platform.

Reject topics that:
- Target or demean specific individuals (not public figures in their public role)
- Request illegal content or advice
- Sexualize minors
- Promote violence against specific groups
- Are pure spam or gibberish

Approve topics that:
- Are genuinely controversial policy, ethical, or social questions
- Are intellectual or philosophical ideas
- Reference public figures in the context of their public actions or positions

Respond with JSON only: {"approved": true} or {"approved": false, "reason": "brief reason"}`,
      messages: [{ role: "user", content: `Topic: "${topic}"` }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "{}";
    try {
      return JSON.parse(text);
    } catch {
      return { approved: true };
    }
  } catch (error) {
    console.error("Moderation error:", error);
    return { approved: true };
  }
}
