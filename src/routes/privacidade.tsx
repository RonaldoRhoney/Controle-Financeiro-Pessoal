import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [{ title: "Política de Privacidade — Controle Financeiro" }] }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground">Controle Financeiro (FinWise) — RhoneyInc</p>
        </div>
      </header>

      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight">
        <p className="text-xs text-muted-foreground">Última atualização: julho de 2026</p>

        <h2>1. Quem somos</h2>
        <p>O <strong>Controle Financeiro</strong> (FinWise) é um app de gestão financeira pessoal desenvolvido pela RhoneyInc. Este documento explica quais dados coletamos, como usamos e com quem compartilhamos.</p>
        <p>Contato: <strong>rhoneyinc@gmail.com</strong></p>

        <h2>2. Quais dados coletamos</h2>
        <ul>
          <li>Dados de conta: nome, e-mail e senha (armazenada de forma criptografada pelo Supabase Auth)</li>
          <li>Dados financeiros que você cadastra: transações (data, tipo, categoria, descrição, valor), metas, relatórios mensais</li>
        </ul>
        <p>Não coletamos CPF, RG ou dados de saúde como campos estruturados. Se você descrever uma transação com informação sensível (ex.: "plano de saúde", "remédio"), esse texto fica salvo como parte da transação — evite incluir dados que não sejam necessários para identificar o gasto.</p>

        <h2>3. Uso de Inteligência Artificial</h2>
        <p>O recurso <strong>TipsMoney</strong> (chat de dicas financeiras) e os agentes de IA de cada módulo (dashboard, metas, relatórios, educação, transações) processam suas mensagens e um resumo dos seus dados financeiros usando um provedor de IA de terceiro, acessado através do <strong>Lovable AI Gateway</strong> (modelo <strong>Google Gemini</strong>).</p>
        <p>Dados enviados ao provedor de IA quando você usa esses recursos:</p>
        <ul>
          <li>O texto que você digita na conversa</li>
          <li>Um resumo agregado de entradas, saídas e saldo do período (valores e categorias, não descrições individuais)</li>
          <li>Resumos de relatórios mensais já arquivados</li>
        </ul>
        <p>Esses dados são enviados apenas no momento em que você usa o recurso de IA, processados para gerar a resposta, e não são usados pelo provedor para treinar modelos nem repassados a terceiros além do necessário para responder sua pergunta. Ao abrir um chat de IA pela primeira vez, mostramos um aviso explicando isso antes de você poder enviar mensagens.</p>

        <h2>4. Como usamos seus dados</h2>
        <ul>
          <li>Exibir seu painel financeiro, relatórios e metas</li>
          <li>Gerar dicas e respostas personalizadas via IA, quando você usa esse recurso</li>
          <li>Enviar link de redefinição de senha, quando solicitado</li>
          <li>Garantir a segurança da conta e prevenir uso indevido</li>
        </ul>

        <h2>5. Compartilhamento de dados</h2>
        <p>Não vendemos seus dados pessoais. Compartilhamos informações apenas com:</p>
        <ul>
          <li><strong>Supabase</strong> — infraestrutura de banco de dados e autenticação, com Row Level Security (cada usuário só acessa seus próprios dados)</li>
          <li><strong>Lovable AI Gateway / Google Gemini</strong> — apenas quando você usa um recurso de IA, e apenas os dados descritos na seção 3</li>
          <li><strong>Autoridades</strong> — somente quando exigido por lei ou ordem judicial</li>
        </ul>

        <h2>6. Seus direitos (LGPD — Lei 13.709/2018)</h2>
        <ul>
          <li>Acessar e exportar seus dados (Configurações → Exportar dados)</li>
          <li>Corrigir dados incompletos ou desatualizados</li>
          <li>Excluir sua conta e todos os seus dados permanentemente (Configurações → Excluir conta)</li>
          <li>Revogar consentimento de uso de IA a qualquer momento, simplesmente não usando o recurso</li>
        </ul>

        <h2>7. Retenção e exclusão</h2>
        <p>Seus dados são mantidos enquanto sua conta estiver ativa. Ao excluir sua conta, seu usuário de autenticação e todos os dados vinculados (perfil, transações, metas, relatórios) são apagados permanentemente e não podem ser recuperados.</p>

        <h2>8. Segurança</h2>
        <p>Usamos criptografia TLS em todas as comunicações, autenticação via Supabase Auth e Row Level Security no banco de dados, garantindo que cada usuário só acesse seus próprios dados financeiros.</p>

        <h2>9. Alterações nesta política</h2>
        <p>Esta política pode ser atualizada periodicamente para refletir mudanças no app ou na legislação. Mudanças significativas serão comunicadas dentro do app.</p>

        <p className="mt-8 text-sm">
          <Link to="/configuracoes" className="text-primary hover:underline">← Voltar para Configurações</Link>
        </p>
      </div>
    </div>
  );
}
