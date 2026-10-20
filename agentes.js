/* =========================================================
   agentes.js — Definição dos agentes de desenvolvimento
   do projeto Caça-Palavras Interativo

   Cada agente tem um papel, responsabilidades, arquivos que
   "cuida" e um método execute() que recebe o contexto do
   projeto e retorna um relatório do que faria/fez.

   Uso:
     import { obterAgente, executarAgente, AGENTES } from "./agentes.js";
     const dev = obterAgente("desenvolvedor-front");
     console.log(dev.execute({ tarefa: "ajustar layout" }));
   ========================================================= */

export const AGENTES = {
  /* ---------- 1. Product Manager ---------- */
  "product-manager": {
    nome: "Product Manager",
    emoji: "📋",
    papel: "Define o que será construído e prioriza o backlog.",
    responsabilidades: [
      "Escrever e manter o PRD.md atualizado",
      "Priorizar funcionalidades (MVP vs. roadmap)",
      "Validar histórias de usuário do jogador",
      "Definir critérios de aceite de cada tarefa",
    ],
    arquivos: ["PRD.md", "README.md"],
    execute(ctx = {}) {
      const tarefa = ctx.tarefa ?? "revisar requisitos";
      return {
        agente: "product-manager",
        tarefa,
        acoes: [
          `Revisar histórico de usuário relacionado a "${tarefa}"`,
          "Verificar se a tarefa está dentro do escopo do MVP",
          "Registrar decisão no PRD.md",
        ],
        saido: `Tarefa "${tarefa}" aprovada para desenvolvimento.`,
      };
    },
  },

  /* ---------- 2. UI/UX Designer ---------- */
  "designer-ui": {
    nome: "UI/UX Designer",
    emoji: "🎨",
    papel: "Cuida da interface escura, animações e experiência do jogador.",
    responsabilidades: [
      "Manter o tema escuro consistente (tokens em :root)",
      "Escolher cores, sombras e animações (pop, shake, confete)",
      "Garantir responsividade (desktop e mobile)",
      "Cuidar dos estados de célula: normal, selected, found, error",
    ],
    arquivos: ["style.css", "index.html"],
    execute(ctx = {}) {
      const tarefa = ctx.tarefa ?? "evoluir a interface";
      return {
        agente: "designer-ui",
        tarefa,
        acoes: [
          `Aplicar "${tarefa}" respeitando os tokens --accent, --accent-2, --danger`,
          "Testar contraste em fundo escuro (WCAG AA)",
          "Validar em 360px, 768px e 1440px de largura",
        ],
        saido: `Proposta visual para "${tarefa}" pronta em style.css.`,
      };
    },
  },

  /* ---------- 3. Desenvolvedor Front-end ---------- */
  "desenvolvedor-front": {
    nome: "Desenvolvedor Front-end",
    emoji: "💻",
    papel: "Implementa a mecânica do jogo em HTML/CSS/JS puro.",
    responsabilidades: [
      "Gerador da grade nas 8 direções (script.js)",
      "Seleção por arrasto com pointer events",
      "Validação de palavras (direto, invertido, diagonal)",
      "Cronômetro, placar, sons e confete",
    ],
    arquivos: ["script.js", "index.html", "style.css"],
    execute(ctx = {}) {
      const tarefa = ctx.tarefa ?? "implementar funcionalidade";
      return {
        agente: "desenvolvedor-front",
        tarefa,
        acoes: [
          `Implementar "${tarefa}" isolando a lógica em funções pequenas`,
          "Não adicionar dependências externas",
          "Manter o padrão: constantes no topo, estado, DOM, eventos, ciclo do jogo",
        ],
        saido: `Funcionalidade "${tarefa}" implementada em script.js.`,
      };
    },
  },

  /* ---------- 4. Engenheiro de QA ---------- */
  "qa-testador": {
    nome: "Engenheiro de QA",
    emoji: "🧪",
    papel: "Testa geração da grade, seleção e casos extremos.",
    responsabilidades: [
      "Validar que 100% das palavras são posicionadas em cada dificuldade",
      "Testar seleção diagonal, invertida e células sobrepostas",
      "Testar arrasto no toque (mobile) e com mouse",
      "Verificar fim de jogo, reinício e troca de dificuldade no meio do jogo",
    ],
    arquivos: ["script.js"],
    execute(ctx = {}) {
      const tarefa = ctx.tarefa ?? "rodar suíte de testes";
      return {
        agente: "qa-testador",
        tarefa,
        casosDeTeste: [
          "Grade 10×10 posiciona 8/8 palavras",
          "Grade 13×13 posiciona 11/11 palavras",
          "Grade 16×16 posiciona 14/14 palavras",
          "Palavra na diagonal ↗ invertida é aceita",
          "Seleção em L (não-reta) é ignorada",
          "Palavra já encontrada não conta 2x",
          "pointerup fora do board ainda encerra a seleção",
          "Trocar dificuldade zera tempo, erros e confete",
        ],
        saido: `Testes de "${tarefa}" concluídos.`,
      };
    },
  },

  /* ---------- 5. Especialista em Performance/Docs ---------- */
  "docs-performance": {
    nome: "Documentação & Performance",
    emoji: "📚",
    papel: "Mantém documentação e monitora desempenho.",
    responsabilidades: [
      "Atualizar ESPECIFICACOES.md e README.md",
      "Medir tempo de geração da grade (< 200ms)",
      "Monitorar número de nós DOM (máx. 256 células)",
      "Sugerir melhorias de acessibilidade",
    ],
    arquivos: ["ESPECIFICACOES.md", "README.md"],
    execute(ctx = {}) {
      const tarefa = ctx.tarefa ?? "documentar alterações";
      return {
        agente: "docs-performance",
        tarefa,
        acoes: [
          `Documentar "${tarefa}" em ESPECIFICACOES.md`,
          "Registrar métricas de performance da última medição",
          "Atualizar seção de roadmap se houver nova ideia",
        ],
        saido: `Documentação de "${tarefa}" atualizada.`,
      };
    },
  },
};

/* ---------------- utilidades ---------------- */

/** Retorna o agente pelo id, ou lança erro com os ids disponíveis. */
export function obterAgente(id) {
  const agente = AGENTES[id];
  if (!agente) {
    throw new Error(
      `Agente "${id}" não encontrado. Disponíveis: ${Object.keys(AGENTES).join(", ")}`
    );
  }
  return { ...agente, id };
}

/** Executa um agente com o contexto informado. */
export function executarAgente(id, ctx = {}) {
  return obterAgente(id).execute(ctx);
}

/** Lista simples de todos os agentes (para exibição). */
export function listarAgentes() {
  return Object.entries(AGENTES).map(([id, a]) => ({
    id,
    nome: a.nome,
    emoji: a.emoji,
    papel: a.papel,
    arquivos: a.arquivos,
  }));
}

/* ---------------- demo (execução direta) ---------------- */
if (typeof process !== "undefined" && process.argv[1]?.endsWith("agentes.js")) {
  console.log("🤖 Agentes do projeto Caça-Palavras:\n");
  for (const a of listarAgentes()) {
    console.log(`${a.emoji} [${a.id}] ${a.nome} — ${a.papel}`);
    console.log(`   arquivos: ${a.arquivos.join(", ")}\n`);
  }
  console.log("Exemplo de execução:", JSON.stringify(executarAgente("qa-testador"), null, 2));
}
