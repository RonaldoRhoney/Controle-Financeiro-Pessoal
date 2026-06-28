// AGENT 4 — Education Agent (personalizes content order based on financial profile)
// ISOLATED: reads only aggregate profile (balance, debt-like flags, has goals?). Returns ordering + intro.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runAgent, pickLang } from "./_shared";

const TopicSchema = z.object({ id: z.string(), title: z.string() });
const InputSchema = z.object({
  topics: z.array(TopicSchema).min(2).max(20),
  language: z.string().optional(),
});

const SYSTEM = {
  "pt-BR": `Você é o Agente Educação Financeira. Recebe o PERFIL resumido do usuário e uma lista de tópicos educacionais.
Sua tarefa:
- Priorizar tópicos relevantes ao perfil (ex: saldo negativo → quitação antes de investimento).
- Escrever uma introdução curta (1-2 frases) explicando POR QUE essa ordem foi escolhida.
- Responder APENAS com JSON: {"intro":"...", "order":["<id>", "<id>", ...]}
- "order" deve conter TODOS os ids da lista, sem inventar novos.
Se mencionar investimentos na intro, finalize com "Isto não é uma recomendação de investimento."`,
  "en-US": `You are the Financial Education Agent. Reorder topics by user profile and write a 1-2 sentence intro.
- Reply ONLY with JSON: {"intro":"...","order":["<id>", ...]}
- "order" must contain ALL ids, no new ones.
- If you mention investments, end intro with "This is not an investment recommendation."`,
  "es-ES": `Eres el Agente Educación Financiera. Reordena los temas según el perfil y escribe una intro de 1-2 frases.
- Responde SOLO con JSON: {"intro":"...","order":["<id>", ...]}
- "order" debe contener TODOS los ids.
- Si mencionas inversiones, termina la intro con "Esto no es una recomendación de inversión."`,
};

export type EducationPersonalization = {
  intro: string;
  order: string[];
  error?: "rate_limited" | "payment_required" | "ai_error";
};

export const personalizeEducation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }): Promise<EducationPersonalization> => {
    const { supabase } = context;
    const [{ data: txs }, { data: goals }] = await Promise.all([
      supabase.from("transactions").select("type,amount").limit(500),
      supabase.from("savings_goals").select("id,target_amount,saved_amount").limit(50),
    ]);

    let income = 0, expense = 0;
    for (const t of ((txs as any[]) ?? [])) {
      const a = typeof t.amount === "string" ? parseFloat(t.amount) : t.amount;
      if (!Number.isFinite(a)) continue;
      if (t.type === "entrada") income += a; else expense += a;
    }
    const balance = income - expense;
    const goalCount = (goals as any[] | null)?.length ?? 0;
    const goalProgress = goalCount > 0
      ? ((goals as any[]).reduce((s, g) => s + Number(g.saved_amount) / Math.max(1, Number(g.target_amount)), 0) / goalCount)
      : 0;

    const profile = {
      balance: +balance.toFixed(2),
      income: +income.toFixed(2),
      expense: +expense.toFixed(2),
      negative_balance: balance < 0,
      has_goals: goalCount > 0,
      avg_goal_progress: +goalProgress.toFixed(2),
    };

    const ctx = `PERFIL do usuário: ${JSON.stringify(profile)}
TÓPICOS (id → título): ${JSON.stringify(data.topics)}`;

    const lang = pickLang(data.language);
    const sys = SYSTEM[lang] ?? SYSTEM["pt-BR"];
    const res = await runAgent({
      systemPrompt: sys,
      contextBlock: ctx,
      userPrompt: "Personalize agora.",
      language: lang,
      agentTag: "Agent:Education",
    });

    const fallback: EducationPersonalization = {
      intro: "",
      order: data.topics.map((t) => t.id),
      error: res.error,
    };

    if (res.error || !res.reply) return fallback;
    try {
      const m = res.reply.match(/\{[\s\S]*\}/);
      if (!m) return fallback;
      const parsed = JSON.parse(m[0]);
      const ids = new Set(data.topics.map((t) => t.id));
      const order: string[] = Array.isArray(parsed.order)
        ? parsed.order.filter((x: unknown) => typeof x === "string" && ids.has(x as string))
        : [];
      // append any missing topic ids so we always return all
      for (const t of data.topics) if (!order.includes(t.id)) order.push(t.id);
      return { intro: String(parsed.intro ?? ""), order };
    } catch {
      return fallback;
    }
  });
