## Objetivo
Remover a tela "Bancos" e substituí-la no menu por uma nova seção "Educação Financeira" com conteúdo informativo e disclaimer de conformidade (Resolução CVM nº 19/2021).

## 1. Remoção de "Bancos"
- Excluir `src/routes/bancos.tsx`.
- Remover entrada `{ to: "/bancos", key: "bancos", icon: Building2 }` de `src/components/finwise/AppSidebar.tsx` (e o import `Building2` se não for mais usado).
- Remover chaves `nav.bancos` e bloco `bancos.*` dos três arquivos de locale (`pt-BR.json`, `en-US.json`, `es-ES.json`).
- Conferir/limpar qualquer outra referência a `/bancos` ou ao módulo (busca por `bancos` no projeto). `routeTree.gen.ts` será regenerado automaticamente.

## 2. Nova rota `/educacao`
Criar `src/routes/educacao.tsx` com layout dark consistente, contendo:

**Cabeçalho**
- Título: "Educação Financeira"
- Subtítulo: "Conteúdo informativo para ampliar seu conhecimento sobre o mercado financeiro"

**Disclaimer (sticky no topo do conteúdo)**
- Card âmbar (`bg-amber-500/10 border-amber-500/40 text-amber-200`) com ícone `AlertTriangle`, posição `sticky top-0 z-10` para permanecer visível ao rolar.
- Texto exato fornecido pelo usuário citando Resolução CVM nº 19/2021.

**Seção "Conceitos básicos"**
Grid de cards estáticos (2 colunas em desktop, 1 no mobile), cada um com título e 2-3 frases neutras:
- Renda fixa e renda variável
- Tesouro Direto
- Corretoras de valores
- Diversificação de investimentos
- Riscos e volatilidade

**Seção "Para saber mais"**
- Texto introdutório indicado.
- Cards com nome/descrição/botão "Acessar" (`target="_blank" rel="noopener noreferrer"`):
  - B3 — https://www.b3.com.br
  - Nubank — https://www.nubank.com.br
  - Itaú — https://www.itau.com.br
  - Banco Inter — https://www.bancointer.com.br
  - Binance — https://www.binance.com (com aviso sobre criptoativos não regulamentados)
- Reutilizar as cores/iniciais dos bancos do mesmo padrão visual antes usado em Bancos (sem importar o arquivo removido — duplicar localmente os metadados necessários).
- Sem linguagem de recomendação.

**Integração TipsMoney**
- Card final: "Quer entender melhor seu perfil financeiro? Converse com o TipsMoney."
- Botão "Conversar com TipsMoney" usando `<Link to="/tips">`.

## 3. Menu
- Adicionar em `primaryLinks` (no lugar da entrada removida de Bancos) `{ to: "/educacao", key: "educacao", icon: GraduationCap }`.
- Adicionar `nav.educacao` nos três locales: pt-BR "Educação Financeira", en-US "Financial Education", es-ES "Educación Financiera".

## 4. Disclaimer no TipsMoney
- Em `src/lib/finwise/tips.functions.ts`, ajustar os três `SYSTEM_PROMPTS` para instruir o modelo a finalizar toda resposta sobre investimentos com a linha exata: `"Isto não é uma recomendação de investimento."` (e equivalentes em inglês/espanhol).
- Como reforço determinístico, anexar essa linha no servidor ao `reply` retornado quando o conteúdo mencionar termos de investimento (ex.: regex `/investi|renda fixa|renda variável|ações|tesouro|cripto|cdb|etf|fii/i`) e ela ainda não estiver presente.

## 5. Validação
- Rodar busca por `bancos` e `/bancos` para garantir zero referências remanescentes.
- Verificar que `routeTree.gen.ts` é regenerado sem `/bancos` e com `/educacao`.
- Conferir no preview que o disclaimer fica fixo no topo da nova tela e que o link do TipsMoney funciona.

## Arquivos afetados
- Criar: `src/routes/educacao.tsx`
- Excluir: `src/routes/bancos.tsx`
- Editar: `src/components/finwise/AppSidebar.tsx`, `src/lib/i18n/locales/{pt-BR,en-US,es-ES}.json`, `src/lib/finwise/tips.functions.ts`
