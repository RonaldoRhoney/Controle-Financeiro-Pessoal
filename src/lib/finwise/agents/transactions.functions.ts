// AGENT 2 — Transactions Agent (category suggestion)
// ISOLATED: only reads transactions history (description + category). No goals/reports/balance.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runAgent, pickLang } from "./_shared";

const InputSchema = z.object({
  description: z.string().min(1).max(200),
  type: z.enum(["entrada", "despesa"]),
  availableCategories: z.array(z.object({ id: z.string(), name: z.string() })).min(1).max(60),
  language: z.string().optional(),
});

const SYSTEM = {
  "pt-BR": `Você é o Agente Transações. Sua única tarefa: receber uma descrição de lançamento e sugerir a melhor categoria.
Regras:
- Use o histórico do usuário para identificar padrões (ex: "Netflix" → Assinaturas).
- Responda SOMENTE com JSON no formato exato: {"categoryId":"<id>","confidence":0..1,"reason":"curta"}
- O categoryId DEVE ser um id da lista de categorias disponíveis. Se nenhuma servir, use o id que mais se aproxima e confidence baixa.
- Nunca invente ids. Nunca escreva texto fora do JSON.`,
  "en-US": `You are the Transactions Agent. Suggest the best category for a transaction description.
- Use the user's history to detect patterns (e.g. "Netflix" → Subscriptions).
- Reply ONLY with JSON: {"categoryId":"<id>","confidence":0..1,"reason":"short"}
- categoryId MUST be from the provided list. Never invent ids. No text outside JSON.`,
  "es-ES": `Eres el Agente Transacciones. Sugiere la mejor categoría.
- Usa el historial para detectar patrones.
- Responde SOLO con JSON: {"categoryId":"<id>","confidence":0..1,"reason":"corta"}
- categoryId DEBE ser de la lista. Nunca inventes ids. Sin texto fuera del JSON.`,
};

export type CategorySuggestion = {
  categoryId: string | null;
  confidence: number;
  reason: string;
};

export const suggestCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }): Promise<CategorySuggestion & { error?: string }> => {
    const { supabase } = context;
    const { data: hist } = await supabase
      .from("transactions")
      .select("description,category,type")
      .eq("type", data.type)
      .order("date", { ascending: false })
      .limit(200);

    // Quick local match: identical description in history wins, no AI call needed.
    const norm = (s: string) => s.toLowerCase().trim();
    const target = norm(data.description);
    const exact = (hist as any[] | null)?.find((h) => norm(h.description) === target && h.category);
    if (exact) {
      return { categoryId: exact.category, confidence: 0.95, reason: "histórico exato" };
    }
    const partial = (hist as any[] | null)?.find(
      (h) => h.category && (norm(h.description).includes(target) || target.includes(norm(h.description))),
    );
    if (partial && target.length >= 3) {
      return { categoryId: partial.category, confidence: 0.7, reason: "histórico similar" };
    }

    const ctx = `Categorias disponíveis (use somente estes ids):
${JSON.stringify(data.availableCategories)}

Histórico recente (descrição → categoria):
${JSON.stringify(((hist as any[] | null) ?? []).slice(0, 60).map((h) => ({ d: h.description, c: h.category })))}`;

    const lang = pickLang(data.language);
    const sys = SYSTEM[lang] ?? SYSTEM["pt-BR"];
    const res = await runAgent({
      systemPrompt: sys,
      contextBlock: ctx,
      userPrompt: `Descrição: "${data.description}" | Tipo: ${data.type}`,
      language: lang,
      agentTag: "Agent:Transactions",
    });

    if (res.error || !res.reply) {
      return { categoryId: null, confidence: 0, reason: "sem sugestão", error: res.error };
    }
    try {
      const m = res.reply.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : null;
      const ids = new Set(data.availableCategories.map((c) => c.id));
      if (parsed && typeof parsed.categoryId === "string" && ids.has(parsed.categoryId)) {
        return {
          categoryId: parsed.categoryId,
          confidence: Number(parsed.confidence) || 0.5,
          reason: String(parsed.reason || ""),
        };
      }
    } catch {}
    return { categoryId: null, confidence: 0, reason: "sem sugestão" };
  });
