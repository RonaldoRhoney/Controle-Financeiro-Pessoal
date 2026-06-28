// AGENT 5 — Reports Agent (auto-summary of a single archived monthly report)
// ISOLATED: reads ONE monthly_reports row + (optional) previous month for comparison.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runAgent, pickLang } from "./_shared";

const InputSchema = z.object({
  reportId: z.number().int().positive(),
  language: z.string().optional(),
});

const SYSTEM = {
  "pt-BR": `Você é o Agente Relatórios. Recebe UM relatório mensal arquivado (e opcionalmente o mês anterior).
Gere um resumo executivo em 3-5 frases em português brasileiro, com:
- Total de entradas, saídas e saldo do mês.
- Comparativo com o mês anterior em %, quando disponível.
- Categoria que mais cresceu/caiu.
- Um destaque ou alerta final.
Sem listas longas, sem JSON. Se mencionar investimentos, finalize com "Isto não é uma recomendação de investimento."`,
  "en-US": `You are the Reports Agent. Summarize ONE archived monthly report (with prior month if available) in 3-5 sentences:
totals, % change vs prior month, biggest category move, and a closing highlight.
No long lists, no JSON. If mentioning investments, end with "This is not an investment recommendation."`,
  "es-ES": `Eres el Agente Informes. Resume UN informe mensual archivado (con mes anterior si existe) en 3-5 frases:
totales, % vs mes anterior, mayor cambio por categoría y un destaque final.
Sin listas largas, sin JSON. Si mencionas inversiones, termina con "Esto no es una recomendación de inversión."`,
};

export const summarizeReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: report } = await supabase
      .from("monthly_reports")
      .select("id,year,month,summary,transactions")
      .eq("id", data.reportId)
      .maybeSingle();

    if (!report) return { reply: "", error: "ai_error" as const };

    const r: any = report;
    // Previous month lookup (same user, scoped by RLS).
    const prevMonth = r.month === 1 ? 12 : r.month - 1;
    const prevYear = r.month === 1 ? r.year - 1 : r.year;
    const { data: prev } = await supabase
      .from("monthly_reports")
      .select("year,month,summary")
      .eq("year", prevYear)
      .eq("month", prevMonth)
      .maybeSingle();

    // Aggregate categories from this month's transactions snapshot
    const byCat: Record<string, number> = {};
    for (const t of (r.transactions as any[]) ?? []) {
      if (t?.type !== "despesa") continue;
      const a = typeof t.amount === "string" ? parseFloat(t.amount) : t.amount;
      if (!Number.isFinite(a)) continue;
      const k = t.categoryId || t.category || "sem_categoria";
      byCat[k] = (byCat[k] || 0) + a;
    }
    const topCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const ctx = `Relatório do mês ${r.year}-${String(r.month).padStart(2, "0")}:
${JSON.stringify(r.summary)}
Top categorias de despesa: ${JSON.stringify(topCats)}
Mês anterior (resumo, se houver): ${JSON.stringify((prev as any)?.summary ?? null)}`;

    const lang = pickLang(data.language);
    const sys = SYSTEM[lang] ?? SYSTEM["pt-BR"];
    return runAgent({
      systemPrompt: sys,
      contextBlock: ctx,
      userPrompt: "Gere o resumo executivo agora.",
      language: lang,
      agentTag: "Agent:Reports",
    });
  });
