import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Fingerprint, Calendar, Tag, Repeat, Target, TrendingDown } from "lucide-react";
import { brl } from "@/lib/finwise/format";
import type { Category, Transaction } from "@/lib/finwise/types";

type Props = {
  transactions: Transaction[];
  categories: Category[];
  sampleSize?: number; // number of first records to analyze
};

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function SpendingPatternPanel({ transactions, categories, sampleSize = 20 }: Props) {
  const analysis = useMemo(() => {
    if (transactions.length < 3) return null;

    // Use the FIRST records (chronologically oldest) — reflects the initial pattern
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    const sample = sorted.slice(0, Math.min(sampleSize, sorted.length));
    const expenses = sample.filter((t) => t.type === "despesa");
    if (expenses.length < 3) return null;

    // Weekday distribution
    const wdCount = new Array(7).fill(0);
    expenses.forEach((t) => {
      const d = new Date(t.date + "T00:00:00");
      wdCount[d.getDay()]++;
    });
    const topWdIdx = wdCount.indexOf(Math.max(...wdCount));
    const topWdPct = Math.round((wdCount[topWdIdx] / expenses.length) * 100);

    // Category dominance
    const catMap = new Map<string, number>();
    expenses.forEach((t) => {
      const k = t.categoryId || "sem";
      catMap.set(k, (catMap.get(k) ?? 0) + t.amount);
    });
    const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
    const catRanked = Array.from(catMap.entries())
      .map(([id, v]) => ({
        id,
        name: categories.find((c) => c.id === id)?.name ?? "Sem categoria",
        color: categories.find((c) => c.id === id)?.color ?? "#64748b",
        value: v,
        pct: Math.round((v / totalExp) * 100),
      }))
      .sort((a, b) => b.value - a.value);
    const topCat = catRanked[0];

    // Average ticket + ticket profile
    const avgTicket = totalExp / expenses.length;
    const small = expenses.filter((t) => t.amount < avgTicket * 0.5).length;
    const large = expenses.filter((t) => t.amount > avgTicket * 1.5).length;
    const profile =
      large / expenses.length > 0.3
        ? { label: "Compras grandes ocasionais", detail: `${large} gastos acima da média` }
        : small / expenses.length > 0.5
        ? { label: "Muitos gastos pequenos", detail: `${small} gastos abaixo da média` }
        : { label: "Gastos equilibrados", detail: "Distribuição uniforme de valores" };

    // Frequency (tx per week over sample date range)
    const firstD = new Date(sample[0].date + "T00:00:00").getTime();
    const lastD = new Date(sample[sample.length - 1].date + "T00:00:00").getTime();
    const spanDays = Math.max(1, Math.round((lastD - firstD) / 86400000) + 1);
    const perWeek = (expenses.length / spanDays) * 7;

    // Income vs expense ratio
    const income = sample.filter((t) => t.type === "entrada").reduce((s, t) => s + t.amount, 0);
    const savings = income - totalExp;
    const savingsRate = income > 0 ? Math.max(0, Math.round((savings / income) * 100)) : null;

    return {
      count: expenses.length,
      totalExp,
      topWeekday: WEEKDAYS[topWdIdx],
      topWeekdayPct: topWdPct,
      topCat,
      avgTicket,
      profile,
      perWeek,
      savingsRate,
      catRanked: catRanked.slice(0, 3),
    };
  }, [transactions, categories, sampleSize]);

  if (!analysis) return null;

  return (
    <Card className="animate-fade-in border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Fingerprint className="h-4 w-4 text-cyan-500" />
          Seu padrão de gastos
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Análise local com base nos seus {analysis.count} primeiros registros de despesa.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric
            icon={<Calendar className="h-4 w-4 text-cyan-500" />}
            title="Dia mais ativo"
            value={analysis.topWeekday}
            hint={`${analysis.topWeekdayPct}% dos gastos caem neste dia`}
          />
          <Metric
            icon={<Tag className="h-4 w-4" style={{ color: analysis.topCat.color }} />}
            title="Categoria dominante"
            value={analysis.topCat.name}
            hint={`${analysis.topCat.pct}% do total · ${brl(analysis.topCat.value)}`}
          />
          <Metric
            icon={<TrendingDown className="h-4 w-4 text-blue-500" />}
            title="Ticket médio"
            value={brl(analysis.avgTicket)}
            hint={analysis.profile.label}
          />
          <Metric
            icon={<Repeat className="h-4 w-4 text-violet-500" />}
            title="Frequência"
            value={`${analysis.perWeek.toFixed(1)} gastos/semana`}
            hint={analysis.profile.detail}
          />
        </div>

        {analysis.catRanked.length > 1 && (
          <div className="space-y-2 rounded-lg border border-border/60 bg-background/40 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Onde seu dinheiro foi
            </p>
            {analysis.catRanked.map((c) => (
              <div key={c.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{c.pct}%</span>
                </div>
                <Progress value={c.pct} className="h-1.5" />
              </div>
            ))}
          </div>
        )}

        {analysis.savingsRate !== null && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
            <Target className="h-5 w-5 shrink-0 text-emerald-500" />
            <div className="text-xs">
              <p className="font-medium">
                Taxa de poupança inicial: <span className="text-emerald-500">{analysis.savingsRate}%</span>
              </p>
              <p className="text-muted-foreground">
                {analysis.savingsRate >= 20
                  ? "Excelente! Você começou guardando uma boa parte do que recebe."
                  : analysis.savingsRate >= 10
                  ? "Bom início — tente subir para 20% ajustando a categoria dominante."
                  : "Atenção: quase tudo que entrou saiu. Defina uma meta para inverter esse padrão."}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ icon, title, value, hint }: { icon: React.ReactNode; title: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="text-sm font-semibold tracking-tight">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
