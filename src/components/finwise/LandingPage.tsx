import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Bot,
  Mic,
  Target,
  BarChart3,
  GraduationCap,
  Globe2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import rhoneyLogo from "@/assets/rhoneyinc-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";

/**
 * Landing page — public entry point for visitors without an account.
 * Kept as a self-contained component so `/` route can conditionally render
 * it before the authenticated Dashboard.
 */
export function LandingPage() {
  const { t } = useTranslation();
  const [feedbackCount, setFeedbackCount] = useState<number | null>(null);

  // Social proof: total public comments (best-effort, ignore errors)
  useEffect(() => {
    supabase
      .from("app_feedback")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => {
        if (typeof count === "number") setFeedbackCount(count);
      });
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-hidden text-foreground"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.16 0.08 260) 0%, oklch(0.14 0.10 280) 45%, oklch(0.18 0.13 305) 100%)",
      }}
    >
      {/* Ambient orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-float absolute -left-24 -top-24 h-80 w-80 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.78 0.17 165) 0%, transparent 70%)" }}
        />
        <div
          className="animate-float-slow absolute -right-40 top-1/3 h-[28rem] w-[28rem] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.72 0.15 210) 0%, transparent 70%)", animationDelay: "-4s" }}
        />
        <div
          className="animate-float absolute left-1/3 -bottom-40 h-96 w-96 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.65 0.20 305) 0%, transparent 70%)", animationDelay: "-8s" }}
        />
      </div>

      {/* Nav */}
      <header className="animate-slide-up relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img
            src={rhoneyLogo.url}
            alt="RhoneyInc"
            className="h-10 w-10 rounded-lg object-contain ring-1 ring-white/10"
          />
          <div className="hidden sm:block">
            <div className="text-sm font-semibold">{t("app.name")}</div>
            <div className="text-xs text-muted-foreground">by RhoneyInc</div>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">{t("landing.nav.signIn", "Entrar")}</Link>
          </Button>
          <Button asChild size="sm" className="transition-shadow hover:shadow-[0_0_24px_-4px_var(--primary)]">
            <Link to="/auth">{t("landing.nav.signUp", "Criar conta grátis")}</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <div className="animate-slide-up stagger-1 mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {t("landing.hero.badge", "Novo · com IA financeira")}
            </div>
            <h1 className="animate-slide-up stagger-2 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("landing.hero.title", "Assuma o controle do seu dinheiro.")}
              <span
                className="block bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent"
              >
                {t("landing.hero.titleAccent", "Sem planilha, sem estresse.")}
              </span>
            </h1>
            <p className="animate-slide-up stagger-3 mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
              {t(
                "landing.hero.subtitle",
                "Registre entradas e saídas por voz, receba insights com IA, defina metas e veja tudo em um dashboard claro. Grátis, em português.",
              )}
            </p>

            <div className="animate-slide-up stagger-4 mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild size="lg" className="w-full gap-2 transition-all hover:shadow-[0_0_32px_-6px_var(--primary)] hover:-translate-y-0.5 sm:w-auto">
                <Link to="/auth">
                  {t("landing.hero.ctaPrimary", "Criar conta grátis")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full gap-2 border-white/20 bg-white/5 transition-all hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto">
                <Link to="/demo">{t("landing.hero.ctaSecondary", "Ver demonstração")}</Link>
              </Button>
            </div>

            <div className="animate-slide-up stagger-5 mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground lg:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                {t("landing.hero.trust1", "Sem cartão de crédito")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                {t("landing.hero.trust2", "Seus dados são só seus")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-emerald-400" />
                {t("landing.hero.trust3", "PT · EN · ES")}
              </span>
            </div>
          </div>

          {/* Hero visual — stylized dashboard preview */}
          <div className="animate-scale-in stagger-3 relative">
            <div
              className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl"
              style={{ boxShadow: "0 30px 80px -20px oklch(0 0 0 / 0.6)" }}
            >
              <div
                className="rounded-xl p-5 text-white"
                style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 60%, #06B6D4 100%)" }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-widest text-white/80">
                  {t("landing.preview.balance", "Saldo atual · 30 dias")}
                </div>
                <div className="mt-2 text-4xl font-bold tabular-nums">R$ 4.287,50</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <PreviewKpi color="#10B981" label={t("landing.preview.income", "Entradas")} value="R$ 6.200" />
                <PreviewKpi color="#EF4444" label={t("landing.preview.expense", "Saídas")} value="R$ 1.912" />
                <PreviewKpi color="#3B82F6" label={t("landing.preview.daily", "Média diária")} value="R$ 63" />
                <PreviewKpi color="#8B5CF6" label={t("landing.preview.topCat", "Maior categoria")} value="Alimentação" />
              </div>
              <div className="mt-3 rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-emerald-500/10 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-violet-300">
                  <Bot className="h-3.5 w-3.5" /> Agente Dashboard
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  💡 {t("landing.preview.aiSample", "Seus gastos com delivery caíram 18% esta semana. Continue assim!")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("landing.features.title", "Tudo que uma planilha nunca deu.")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("landing.features.subtitle", "Ferramentas modernas para quem quer resultado, não trabalho manual.")}
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            delay={0}
            icon={<Mic className="h-5 w-5" />}
            color="#10B981"
            title={t("landing.features.voice.title", "Registro por voz")}
            desc={t("landing.features.voice.desc", "\"Gastei 45 reais no mercado\" — pronto. Sem digitar nada.")}
          />
          <Feature
            delay={60}
            icon={<Bot className="h-5 w-5" />}
            color="#8B5CF6"
            title={t("landing.features.ai.title", "IA que entende seu dinheiro")}
            desc={t("landing.features.ai.desc", "5 agentes especializados: insights, metas, educação e resumos mensais.")}
          />
          <Feature
            delay={120}
            icon={<Target className="h-5 w-5" />}
            color="#3B82F6"
            title={t("landing.features.goals.title", "Metas de verdade")}
            desc={t("landing.features.goals.desc", "Viagem, carro, reserva. Projeções mostram quando você chega lá.")}
          />
          <Feature
            delay={180}
            icon={<BarChart3 className="h-5 w-5" />}
            color="#F59E0B"
            title={t("landing.features.reports.title", "Relatórios mensais")}
            desc={t("landing.features.reports.desc", "Arquivo automático mês a mês, exportável em Excel.")}
          />
          <Feature
            delay={240}
            icon={<GraduationCap className="h-5 w-5" />}
            color="#EC4899"
            title={t("landing.features.education.title", "Educação financeira")}
            desc={t("landing.features.education.desc", "Conteúdo personalizado pelo seu perfil, com leitor por voz.")}
          />
          <Feature
            delay={300}
            icon={<Globe2 className="h-5 w-5" />}
            color="#06B6D4"
            title={t("landing.features.quotes.title", "Cotações ao vivo")}
            desc={t("landing.features.quotes.desc", "USD, EUR, GBP, BTC e ARS atualizados em tempo real.")}
          />
        </div>
      </section>

      {/* Social proof */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="animate-scale-in border-white/10 bg-white/5 backdrop-blur-xl transition-shadow hover:shadow-2xl">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:justify-around sm:text-left">
            <Stat value="100%" label={t("landing.stats.free", "Grátis para sempre")} />
            <Stat value="3" label={t("landing.stats.langs", "Idiomas suportados")} />
            <Stat
              value={feedbackCount != null ? String(feedbackCount) : "—"}
              label={t("landing.stats.feedback", "Comentários da comunidade")}
            />
          </CardContent>
        </Card>
      </section>

      {/* Final CTA */}
      <section className="animate-slide-up relative z-10 mx-auto max-w-4xl px-4 pb-20 pt-8 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("landing.finalCta.title", "Pronto para respirar aliviado no fim do mês?")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {t("landing.finalCta.subtitle", "Leva menos de 1 minuto para começar. Sem cartão, sem compromisso.")}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full gap-2 transition-all hover:shadow-[0_0_32px_-6px_var(--primary)] hover:-translate-y-0.5 sm:w-auto">
            <Link to="/auth">
              {t("landing.finalCta.button", "Começar agora — é grátis")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full border-white/20 bg-white/5 transition-all hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto">
            <Link to="/demo">{t("landing.hero.ctaSecondary", "Ver demonstração")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function PreviewKpi({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function Feature({ icon, color, title, desc, delay = 0 }: { icon: React.ReactNode; color: string; title: string; desc: string; delay?: number }) {
  return (
    <Card
      className="animate-slide-up border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-xl"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-5">
        <span
          className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-transform"
          style={{ backgroundColor: `${color}1F`, color }}
        >
          {icon}
        </span>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
