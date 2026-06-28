// Shared low-level helper for agent calls.
// IMPORTANT: each agent passes its OWN systemPrompt and OWN context.
// This helper does not retain state between calls and does not share data across agents.

const DISCLAIMERS = {
  "pt-BR": "Isto não é uma recomendação de investimento.",
  "en-US": "This is not an investment recommendation.",
  "es-ES": "Esto no es una recomendación de inversión.",
} as const;

const INVESTMENT_PATTERN =
  /invest|renda fixa|renda variável|renda variavel|a[cç][oõ]es|tesouro|cripto|crypto|cdb|etf|fii|bond|stock|portfolio|portif[oó]lio|inversi[oó]n/i;

export type AgentLang = keyof typeof DISCLAIMERS;

export type AgentResult = {
  reply: string;
  error?: "rate_limited" | "payment_required" | "ai_error";
};

export async function runAgent(opts: {
  systemPrompt: string;
  contextBlock: string;
  userPrompt: string;
  language?: AgentLang;
  model?: string;
  agentTag: string;
}): Promise<AgentResult> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return { reply: "", error: "ai_error" };

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: opts.model ?? "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: opts.systemPrompt },
          { role: "system", content: opts.contextBlock },
          { role: "user", content: opts.userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error(`[${opts.agentTag}] gateway error`, res.status, txt);
      const code =
        res.status === 429
          ? "rate_limited"
          : res.status === 402
          ? "payment_required"
          : "ai_error";
      return { reply: "", error: code };
    }

    const payload = await res.json();
    let reply: string = payload?.choices?.[0]?.message?.content ?? "";
    const lang = (opts.language && opts.language in DISCLAIMERS ? opts.language : "pt-BR") as AgentLang;
    const disclaimer = DISCLAIMERS[lang];
    if (reply && INVESTMENT_PATTERN.test(reply) && !reply.includes(disclaimer)) {
      reply = `${reply.trimEnd()}\n\n${disclaimer}`;
    }
    return { reply };
  } catch (err) {
    console.error(`[${opts.agentTag}] crashed`, err);
    return { reply: "", error: "ai_error" };
  }
}

export function pickLang(input?: string): AgentLang {
  if (!input) return "pt-BR";
  if (input.startsWith("en")) return "en-US";
  if (input.startsWith("es")) return "es-ES";
  return "pt-BR";
}
