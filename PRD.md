# PRD — Caça-Palavras Interativo

**Versão:** 1.0
**Data:** 20 de outubro de 2026
**Produto:** Site de caça-palavras em português, jogável no navegador (desktop e mobile)

---

## 1. Visão Geral

O produto é uma aplicação web de um jogo de caça-palavras gerado dinamicamente, com interface escura e moderna. O jogador deve encontrar palavras escondidas em uma grade de letras, podendo elas estar na horizontal, vertical, **diagonal** e **de trás pra frente**.

### 1.1 Objetivo
Entregar uma experiência de jogo simples, intuitiva e visualmente agradável, sem necessidade de cadastro, instalação ou backend.

### 1.2 Público-alvo
- Crianhas e jovens (uso educativo)
- Adultos que jogam casualmente (passatempo, quebra-cabeça)
- Professores que queiram usar em sala de aula (abrindo no navegador)

---

## 2. Metas do Produto

| Meta | Métrica |
|---|---|
| Facilidade de uso | Jogador entende a mecânica em menos de 30 segundos |
| Performance | Grade gera em menos de 200ms; roda fluido em celulares intermediários |
| Compatibilidade | Chrome, Firefox, Edge e Safari (últimas 2 versões) |
| Acessibilidade básica | Contraste adequado, uso possível apenas com teclado (futuro) |

---

## 3. Escopo

### 3.1 Funcionalidades (MVP — incluídas)

- **Geração automática da grade** a cada novo jogo, com palavras posicionadas nas 8 direções possíveis (horizontal, vertical e diagonais, em ambos os sentidos).
- **Seleção por arrasto** (mouse ou toque) sobre as letras, com linha reta válida apenas nas 8 direções.
- **Validação instantânea**: acerto (com destaque permanente + som) ou erro (animação de tremor + contador de erros).
- **Painel de palavras**: lista com as palavras a encontrar; as achadas são riscadas.
- **Estatísticas**: tempo de jogo, palavras encontradas (X/Y) e erros.
- **3 dificuldades**: Fácil (10×10), Médio (13×13), Difícil (16×16).
- **Novo jogo**: botão para reiniciar a qualquer momento.
- **Feedback de vitória**: mensagem com tempo e erros + efeito de confete.
- **Interface escura** com efeitos visuais sutis (glow, bolhas animadas ao fundo).
- **Responsividade**: layout adaptado a telas de celular e desktop.

### 3.2 Fora de escopo (versão atual)

- Cadastro, login, ranking ou salvamento de pontuações
- Multiplayer / compartilhamento
- Envio de palavras personalizadas pelo usuário
- Modo teclado/digitação
- Aplicativo nativo (é apenas site)

---

## 4. Requisitos de Usuário (Histórias)

- **HU-1:** Como jogador, quero arrastar o dedo/mouse sobre as letras para selecionar uma palavra.
- **HU-2:** Como jogador, quero que a seleção só aceite linhas retas (horizontal, vertical, diagonal).
- **HU-3:** Como jogador, quero ver as palavras encontradas riscadas na lista lateral.
- **HU-4:** Como jogador, quero escolher o tamanho da dificuldade antes de iniciar.
- **HU-5:** Como jogador, quero ver meu tempo, acertos e erros em tempo real.
- **HU-6:** Como jogador, quero receber uma mensagem de vitória quando terminar todas as palavras.
- **HU-7:** Como jogador, quero iniciar um novo jogo sem recarregar a página.

---

## 5. Requisitos Não Funcionais

| Categoria | Requisito |
|---|---|
| Performance | Geração da grade < 200ms; sem travamentos no arrasto |
| Disponibilidade | 100% client-side; funciona offline após o primeiro carregamento |
| Manutenibilidade | Código separado em HTML, CSS e JS; funções pequenas e documentadas |
| Segurança | Sem coleta de dados, sem dependências externas |
| Localização | Interface toda em português (pt-BR), palavras sem acento na grade |

---

## 6. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Grade cheia demais e palavra não cabe | Palavra ausente do jogo | 12 tentativas de regeneração + limite de palavras por tamanho |
| Seleção errada em toque (dedo grosse) | Frustração | Células maiores no mobile; erro apenas mostra tremor, não pune |
| Palavras repetidas visualmente (falso acerto) | Confusão | Marcação permanente das células já encontradas |

---

## 7. Roadmap futuro (v2)

1. Modo teclado: digitar a palavra selecionada
2. Palavras personalizadas (professor pode criar uma lista)
3. Ranking local (localStorage) com melhores tempos
4. Dicas ilimitadas (revelar a primeira letra de uma palavra)
5. Temas de cor alternativos
