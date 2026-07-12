# Controle Financeiro Pessoal · Workflows n8n

Conjunto de 7 workflows para automatizar e potencializar o app **Controle Financeiro (Controle Financeiro Pessoal)** usando **n8n + Supabase**.

## 📦 Como importar

1. Abra seu n8n → **Workflows** → **Import from File**.
2. Selecione cada arquivo `.json` desta pasta.
3. Ative um por um após configurar as credenciais.

## 🔐 Variáveis de ambiente necessárias

Configure em **Settings → Variables** do n8n (ou no `.env` da instância):

| Variável | Descrição |
|---|---|
| `SUPABASE_URL` | URL do projeto Supabase (ex: `https://xxx.supabase.co`) |
| `SUPABASE_KEY` | Service role key (⚠️ nunca exponha ao frontend) |
| `ANTHROPIC_API_KEY` | Chave da Claude API (workflow 3 — TipsMoney) |
| `ADMIN_EMAIL` | Email do administrador para relatórios |
| `GOOGLE_DRIVE_FOLDER_ID` | ID da pasta "Backups Controle Financeiro Pessoal" no Drive |
| `APP_URL` | URL de produção do app (ex: `https://fin-wise-scope.lovable.app`) |

## 🔌 Credenciais n8n

- **HTTP Header Auth** (`Supabase Service Role`) → `apikey` + `Authorization: Bearer {{SUPABASE_KEY}}`
- **SMTP / Gmail** para envio de email
- **Google Drive OAuth2** (workflow 7)

## 🗄️ Tabelas auxiliares (rodar no Supabase antes de ativar)

```sql
-- Limites por categoria (workflow 1)
create table if not exists public.limites_categoria (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  categoria text not null,
  valor_limite numeric not null check (valor_limite > 0),
  created_at timestamptz not null default now(),
  unique (user_id, categoria)
);

-- Log de emails enviados (workflow 2)
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  tipo text not null,
  destinatario text not null,
  status text not null,
  enviado_em timestamptz not null default now()
);

-- Histórico TipsMoney (workflow 3)
create table if not exists public.tipsmoney_historico (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  pergunta text not null,
  resposta text not null,
  created_at timestamptz not null default now()
);

-- Cotações (workflow 4)
create table if not exists public.cotacoes (
  moeda text primary key,
  valor_atual numeric not null,
  maxima numeric,
  minima numeric,
  variacao_pct numeric,
  atualizado_em timestamptz not null default now()
);
create table if not exists public.cotacoes_erros (
  id uuid primary key default gen_random_uuid(),
  fonte text not null,
  erro text not null,
  ocorrido_em timestamptz not null default now()
);

-- Log de erros dos workflows n8n (padrão)
create table if not exists public.n8n_error_logs (
  id uuid primary key default gen_random_uuid(),
  workflow_name text not null,
  error_message text not null,
  created_at timestamptz not null default now()
);
```

Habilite RLS em todas e conceda `GRANT ALL … TO service_role` (o n8n usa service role, então RLS não bloqueia).

## 🔁 Padrão de tratamento de erro

Cada workflow tem um **Error Trigger** vinculado que:

1. Insere em `n8n_error_logs`.
2. Consulta se o mesmo `workflow_name` falhou > 3× na última hora.
3. Se sim, envia email para `ADMIN_EMAIL`.

O workflow `_error-handler.json` centraliza essa lógica — importe **primeiro** e vincule aos demais em *Workflow Settings → Error Workflow*.

## 📋 Lista de workflows

| # | Arquivo | Trigger | Função |
|---|---|---|---|
| 0 | `_error-handler.json` | Error Trigger | Log central + alerta ADM |
| 1 | `01-alerta-orcamento.json` | Webhook | Alerta 80% / 100% do limite |
| 2 | `02-relatorio-mensal-email.json` | Cron dia 1º 08h | Email HTML com gráfico |
| 3 | `03-tipsmoney-pipeline.json` | Webhook | IA Claude com contexto real |
| 4 | `04-cotacoes-update.json` | Cron 60s (08h–22h) | AwesomeAPI + CoinGecko |
| 5 | `05-metas-progresso.json` | Cron seg 09h | Push de progresso de metas |
| 6 | `06-painel-adm-diario.json` | Cron 07h | Resumo diário ao ADM |
| 7 | `07-backup-supabase.json` | Cron dom 03h | Backup zip → Google Drive |
