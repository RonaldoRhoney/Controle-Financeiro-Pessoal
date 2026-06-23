## Correções na tela "Transações" e Dashboard

### 1. Espaçamento inferior em listas com FAB
Em `src/routes/registros.tsx`, adicionar `pb-28` (≈112px) ao container raiz para que a última linha não fique atrás do botão flutuante (+) nem da barra inferior "Chat".

Aplicar o mesmo `pb-28` nas demais telas com listas longas + FAB/barra fixa: `src/routes/index.tsx`, `src/routes/metas.tsx`, `src/routes/relatorios.tsx`, `src/routes/cotacoes.tsx`, `src/routes/educacao.tsx`, `src/routes/configuracoes.tsx`, `src/routes/perfil.tsx`, `src/routes/ajuda.tsx`, `src/routes/feedback.tsx`, `src/routes/tips.tsx`.

### 2. Destaque do FAB
Em `src/components/finwise/FloatingActionMenu.tsx`, reforçar a sobreposição do botão (+):
- Trocar `bg-primary/90` por `bg-primary` (opacidade 100%).
- Adicionar `shadow-2xl` + ring mais visível, garantindo separação do conteúdo abaixo.

### 3. Cards "Total Entradas" e "Total Saídas" clicáveis no Dashboard
Em `src/routes/index.tsx`:
- Estender `Kpi` para aceitar `onClick?: () => void`. Quando presente, renderizar o `Card` com `role="button"`, `tabIndex=0`, `cursor-pointer`, `hover:scale-[1.02] active:scale-[0.98] transition-transform` e handler de teclado (Enter/Espaço).
- No card "Total Entradas": ao clicar, chamar `setFilters({ type: "entrada" })` e navegar para `/registros` via `useNavigate`. O período já é compartilhado via store (`filters.period`), garantindo consistência.
- No card "Total Saídas": idem com `setFilters({ type: "despesa" })`.
- Demais KPIs (Saldo, Gasto Médio, Maior Categoria) permanecem sem `onClick`.

### 4. Validação
Verificar build/TypeScript ao final. Não há mudanças de backend nem de lógica de negócio — apenas UI, navegação e filtro existente no store.
