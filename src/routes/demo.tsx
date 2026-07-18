import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ArrowUpCircle, ArrowDownCircle, CalendarDays, PieChart as PieIcon, Sparkles, TrendingUp, Bot } from "lucide-react";
import { brl } from "@/lib/finwise/format";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demonstração — Controle Financeiro" },
      { name: "description", content: "Veja o Controle Financeiro em ação com dados de exemplo. Dashboard, IA e metas — sem precisar criar conta." },
      { property: "og:title", content: "Demonstração — Controle Financeiro" },
      { property: "og:description", content: "Explore o app sem cadastro: dashboard com IA, metas de economia e relatórios mensais." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://finwise.rhoneyinc.com/demo" },
    ],
    links: [{ rel: "canonical", href: "https://finwise.rhoneyinc.com/demo" }],
  }),
  component: DemoPage,
});

// Static demo data — never touches the database.
const DEMO = {
  balance: 4287.5,
  income: 6200,
  expense: 1912.5,
  daily: 63.75,
  topCat: { name: "Alimentação", total: 780 },
  categories: [
    { name: "Alimentação", color: "#10B981", total: 780 },
    { name: "Transporte", color: "#3B82F6", total: 420 },
    { name: "Lazer", color: "#8B5CF6", total: 310 },
    { name: "Casa", color: "#F59E0B", total: 260 },
    { name: "Outros", color: "#EC4899", total: 142.5 },
  ],
  spark: [82, 45, 90, 30, 65, 110, 55, 70, 40, 95, 60, 85, 50, 75],
  insights: [
    "🏆 Alimentação é sua maior categoria (41% dos gastos).",
    "📉 Média diária de saída: R$ 63,75 — dentro da meta de R$ 80.",
    "🔥 Pico de despesa em 15/03 (R$ 210).",
    "💡 Reduzir 10% em Alimentação libera R$ 78/mês para sua meta de viagem.",
  ],
};

function DemoPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="sticky top-0 z-40 border-b border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-violet-500/15 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="font-medium">{t("demo.banner.title", "Modo demonstração")}</span>
            <span className="hidden text-muted-foreground sm:inline">
              — {t("demo.banner.subtitle", "dados de exemplo, nada é salvo")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" /> {t("demo.banner.back", "Voltar")}
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-2">
              <Link to="/auth">
                {t("demo.banner.cta", "Criar conta grátis")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </header>

        {/* Balance */}
        <section className="mb-4">
          <Card
            className="overflow-hidden border-0 text-white"
            style={{
              background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 60%, #06B6D4 100%)",
              boxShadow: "0 20px 50px -20px #3B82F680",
            }}
          >
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-white/80">
                    {t("dashboard.kpi.currentBalance", "Saldo atual")} · {t("dashboard.period.30d")}
                  </p>
                  <div className="mt-2 text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">{brl(DEMO.balance)}</div>
                </div>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
                  <TrendingUp className="h-7 w-7" />
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* KPIs */}
        <section className="mb-6 grid grid-cols-2 gap-4">
          <DemoKpi color="#10B981" icon={<ArrowUpCircle className="h-5 w-5" />} label={t("dashboard.kpi.totalIn")} value={brl(DEMO.income)} />
          <DemoKpi color="#EF4444" icon={<ArrowDownCircle className="h-5 w-5" />} label={t("dashboard.kpi.totalOut")} value={brl(DEMO.expense)} />
          <DemoKpi color="#3B82F6" icon={<CalendarDays className="h-5 w-5" />} label={t("dashboard.kpi.avgDaily")} value={brl(DEMO.daily)} />
          <DemoKpi color="#8B5CF6" icon={<PieIcon className="h-5 w-5" />} label={t("dashboard.kpi.topCategory")} value={DEMO.topCat.name} sub={brl(DEMO.topCat.total)} />
        </section>

        {/* Categories + spark */}
        <section className="mb-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">{t("dashboard.charts.expensesByCategory")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {DEMO.categories.map((c) => {
                const pct = (c.total / DEMO.expense) * 100;
                return (
                  <div key={c.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium">{c.name}</span>
                      <span className="tabular-nums text-muted-foreground">{brl(c.total)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/50">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">{t("dashboard.charts.dailySpending")}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex h-[220px] items-end gap-1.5">
                {DEMO.spark.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-cyan-500 to-emerald-400 transition-all hover:opacity-80"
                    style={{ height: `${(v / 110) * 100}%` }}
                    title={`Dia ${i + 1}: R$ ${v}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* AI insights */}
        <section className="mb-6">
          <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="h-4 w-4 text-violet-500" /> Agente Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2">
                {DEMO.insights.map((i) => (
                  <li key={i} className="rounded-lg border border-border bg-muted/30 p-3 text-sm">{i}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Bottom CTA */}
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="text-lg font-semibold">{t("demo.footerCta.title", "Gostou do que viu?")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("demo.footerCta.subtitle", "Crie sua conta grátis e comece com seus próprios dados em menos de 1 minuto.")}
              </p>
            </div>
            <Button asChild size="lg" className="gap-2">
              <Link to="/auth">
                {t("demo.footerCta.button", "Criar conta grátis")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DemoKpi({ color, icon, label, value, sub }: { color: string; icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Card style={{ borderColor: `${color}40` }}>
      <CardContent className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium uppercase tracking-wide">{label}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${color}1A`, color }}>
            {icon}
          </span>
        </div>
        <div className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl" style={{ color }}>{value}</div>
        {sub && <div className="mt-1 text-xs font-medium tabular-nums" style={{ color }}>{sub}</div>}
      </CardContent>
    </Card>
  );
}
