import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? "placeholder",
});

type MomentSuggestion = {
  score: number;
  reason: string;
  tag: "Essential" | "Recommended" | "Optional" | "Skip";
};

router.post("/ai/moment-suggestions", async (req, res) => {
  try {
    const { cultures, languages, moments } = req.body as {
      cultures: string[];
      languages: string[];
      moments: { id: string; label: string }[];
    };

    if (!Array.isArray(cultures) || !Array.isArray(moments) || moments.length === 0) {
      res.status(400).json({ error: "cultures and moments are required" });
      return;
    }

    const cultureList = cultures.length > 0 ? cultures.join(", ") : "multicultural (unspecified)";
    const languageList = languages && languages.length > 0 ? languages.join(", ") : "English";
    const momentList = moments.map(m => `- ${m.id}: ${m.label}`).join("\n");

    const prompt = `You are an expert multicultural wedding planner and DJ consultant.

A couple's backgrounds:
- Cultures: ${cultureList}
- Languages: ${languageList}

Score the relevance of each wedding moment for this couple. Consider their cultural traditions, typical ceremony structures, and music expectations.

Wedding moments to score:
${momentList}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "momentId": {
    "score": <number 1-10>,
    "reason": "<one concise sentence why>",
    "tag": "<Essential|Recommended|Optional|Skip>"
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: Record<string, MomentSuggestion> = {};

    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      res.status(500).json({ error: "Failed to parse AI response", raw });
      return;
    }

    res.json({ suggestions: parsed });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

export default router;
