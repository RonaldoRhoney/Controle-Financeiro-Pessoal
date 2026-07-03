
# Plano de crescimento — Controle Financeiro

Você escolheu as 4 frentes. Elas são grandes e independentes, então proponho entregar em **4 fases sequenciais**, cada uma testável isoladamente. Confirme e eu já começo pela Fase 1.

Decisão-chave já tomada: **landing só para deslogados**, `/` continua sendo o dashboard para quem tem sessão.

---

## Fase 1 — Landing pública + Demo sem cadastro

**Objetivo:** transformar `/` em porta de entrada que converte visitantes.

- Novo componente `LandingPage` renderizado em `src/routes/index.tsx` quando não há sessão Supabase. Sessão ativa → dashboard atual (comportamento inalterado).
- Seções: hero com logo + tagline, 3 features (Voz, IA, Metas), screenshots reais do dashboard, prova social (contador de comentários da tabela `app_feedback`), CTA duplo "Criar conta grátis" e "Ver demonstração".
- Rota nova `/demo` com dashboard populado por dados fictícios em memória (sem gravar no banco). Banner topo: "Modo demo — [Criar conta grátis]".
- SEO: `head()` completo em `/` e `/demo` (title, description, og:title, og:description, og:image, canonical, JSON-LD WebApplication).
- Traduções pt-BR / en-US / es-ES para todo o conteúdo da landing.

## Fase 2 — Onboarding wizard + checklist

**Objetivo:** ativar o usuário nos primeiros 5 minutos.

- Novo campo `onboarding_completed` (boolean) em `profiles`.
- Componente `OnboardingWizard` (Dialog) que abre no primeiro login se `onboarding_completed = false`:
  1. Boas-vindas + escolha de idioma/moeda
  2. Registrar 1ª transação (formulário simplificado)
  3. Criar 1ª meta (opcional, com sugestões: Viagem, Reserva, Notebook)
- Checklist persistente no topo do dashboard (dispensável), calculado dinamicamente: perfil completo, 5+ transações, 1 meta, 1 categoria personalizada, convite enviado. Barra de progresso animada.

## Fase 3 — PWA + Streak + Resumo semanal

**Objetivo:** trazer o usuário de volta.

- **PWA instalável (manifest-only)**: `public/manifest.webmanifest`, ícones, `theme-color`, `apple-touch-icon` no `__root.tsx`. Sem service worker (evita quebrar preview).
- **Streak**: card no dashboard mostrando dias consecutivos com transação registrada. Cálculo via query nas transactions existentes (sem coluna nova). Ícone 🔥 + animação de milestone (7, 30, 100 dias).
- **Resumo semanal por e-mail**: server route `/api/public/hooks/weekly-summary` + `pg_cron` toda segunda 9h. Usa o Agente Reports já existente para gerar resumo e envia via Resend (pedir chave via `add_secret` na hora). Opt-in em Configurações.

## Fase 4 — Indicação + Cards compartilháveis

**Objetivo:** cada usuário traz outros.

- Nova tabela `referrals` (referrer_id, referred_id, created_at, rewarded) com RLS.
- Código de indicação único por usuário (deriva de `user.id`). Rota `/convite/$code` que preenche no signup.
- Página `/indicar` com link único, botões nativos de compartilhar (WhatsApp, Telegram, X, copiar), contador de convites aceitos.
- Gerador de cards de conquista: `<Canvas>` server-side gera PNG "Economizei R$ X este mês" ou "Meta atingida: Viagem 🎉" para baixar/compartilhar em stories.

---

## Nota técnica

- **Fases 1, 2 e 4** exigem migrações SQL (colunas `onboarding_completed`, `referral_code`; tabela `referrals`) — com GRANTs e RLS conforme padrão do projeto.
- **Fase 3 (e-mail semanal)** requer conta Resend (ou similar) — vou pedir a `RESEND_API_KEY` no início dessa fase.
- Toda UI nova respeita o design atual (glassmorphism + gradiente azul/roxo), i18n nos 3 idiomas, e agentes de IA existentes são reutilizados (não crio novos).
- Sem service worker, sem push notifications — apenas manifest para "adicionar à tela inicial".

---

**Aprova o plano e começo pela Fase 1?** Ou prefere que eu inverta a ordem (ex: PWA primeiro porque é rápido)?
