// AGENT 3 — Goals Agent (projection + suggested monthly deposit)
// ISOLATED: reads ONE goal + its own deposit pace (savings_goals). No transactions/reports.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runAgent, pickLang } from "./_shared";

const InputSchema = z.object({
  goalId: z.number().int().positive(),
  language: z.string().optional(),
});

const SYSTEM = {
  "pt-BR": `Você é o Agente Metas. Sua única função: analisar UMA meta financeira e dizer ao usuário:
1) Projeção realista de quando ele atingirá a meta no ritmo atual.
2) Valor mensal sugerido para atingir no prazo (se houver prazo).
3) Uma dica curta e motivacional.
Responda em no máximo 3 frases curtas em português brasileiro. Sem JSON, sem listas.`,
  "en-US": `You are the Goals Agent. Analyze ONE goal and tell the user:
1) Realistic projection at current pace.
2) Suggested monthly deposit to hit the deadline.
3) One short motivational tip.
Max 3 short sentences. No JSON, no lists.`,
  "es-ES": `Eres el Agente Metas. Analiza UNA meta y dile al usuario:
1) Proyección al ritmo actual.
2) Aporte mensual sugerido para cumplir el plazo.
3) Un consejo motivador corto.
Máx 3 frases. Sin JSON, sin listas.`,
};

export const projectGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: goal } = await supabase
      .from("savings_goals")
      .select("id,title,category,target_amount,saved_amount,target_date,created_at")
      .eq("id", data.goalId)
      .maybeSingle();

    if (!goal) return { reply: "", error: "ai_error" as const };

    const g: any = goal;
    const target = Number(g.target_amount);
    const saved = Number(g.saved_amount);
    const remaining = Math.max(0, target - saved);
    const createdAt = new Date(g.created_at);
    const now = new Date();
    const monthsElapsed = Math.max(
      1 / 30,
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30),
    );
    const pacePerMonth = saved / monthsElapsed;
    const monthsToFinishAtPace = pacePerMonth > 0 ? remaining / pacePerMonth : Infinity;

    let monthsToDeadline: number | null = null;
    let suggestedMonthly: number | null = null;
    if (g.target_date) {
      const deadline = new Date(g.target_date + "T00:00:00");
      monthsToDeadline = Math.max(
        0.1,
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30),
      );
      suggestedMonthly = remaining / monthsToDeadline;
    }

    const ctx = `Meta única:
${JSON.stringify({
      title: g.title,
      target,
      saved,
      remaining: +remaining.toFixed(2),
      target_date: g.target_date,
      pace_per_month: +pacePerMonth.toFixed(2),
      months_to_finish_at_pace: Number.isFinite(monthsToFinishAtPace)
        ? +monthsToFinishAtPace.toFixed(1)
        : null,
      months_to_deadline: monthsToDeadline ? +monthsToDeadline.toFixed(1) : null,
      suggested_monthly_to_meet_deadline: suggestedMonthly ? +suggestedMonthly.toFixed(2) : null,
    })}`;

    const lang = pickLang(data.language);
    const sys = SYSTEM[lang] ?? SYSTEM["pt-BR"];
    return runAgent({
      systemPrompt: sys,
      contextBlock: ctx,
      userPrompt: "Gere a projeção e a sugestão agora.",
      language: lang,
      agentTag: "Agent:Goals",
    });
  });
