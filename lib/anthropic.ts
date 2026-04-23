import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const FOR_SYSTEM_PROMPT = `You are an expert advocate assigned to argue IN FAVOR of the topic given to you. Your job is to produce the strongest, most compelling case possible for the position.

Guidelines:
- Write 600-800 words
- Use clear sections with bold headers (use **Header** markdown syntax)
- Lead with the strongest version of the argument (steel-man, not straw-man)
- Address 2-3 obvious objections head-on
- Draw on relevant evidence, reasoning, and real-world examples
- End with a punchy, memorable conclusion
- Do NOT hedge or present the other side — you are an advocate, not a neutral observer
- Write in confident, clear prose. Avoid bullet point lists; use paragraphs.

Return only the argument text. No preamble like "Here is my argument:".`;

const AGAINST_SYSTEM_PROMPT = `You are a sharp critic assigned to argue AGAINST the topic given to you. Your job is to produce the strongest, most compelling case against the position.

Guidelines:
- Write 600-800 words
- Use clear sections with bold headers (use **Header** markdown syntax)
- Identify the deepest structural flaws in the position, not surface-level objections
- Address 2-3 of the strongest FOR arguments and dismantle them specifically
- Draw on relevant evidence, reasoning, and real-world examples
- End with a punchy, memorable conclusion
- Do NOT hedge or present the other side — you are a critic, not a neutral observer
- Write in confident, clear prose. Avoid bullet point lists; use paragraphs.

Return only the argument text. No preamble like "Here is my argument:".`;

export async function generateDebate(topic: string): Promise<{
  forArgument: string;
  againstArgument: string;
}> {
  const [forResult, againstResult] = await Promise.all([
    generateArgument(topic, "FOR"),
    generateArgument(topic, "AGAINST"),
  ]);
  return { forArgument: forResult, againstArgument: againstResult };
}

async function generateArgument(
  topic: string,
  side: "FOR" | "AGAINST"
): Promise<string> {
  const systemPrompt = side === "FOR" ? FOR_SYSTEM_PROMPT : AGAINST_SYSTEM_PROMPT;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Topic: "${topic}"`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}
