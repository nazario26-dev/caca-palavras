# Especificações Técnicas — Caça-Palavras Interativo

**Versão:** 1.0
**Stack:** HTML5 + CSS3 + JavaScript (ES6+), sem dependências externas
**Arquivos:** `index.html`, `style.css`, `script.js`

---

## 1. Arquitetura

Aplicação 100amente client-side (estática). Não há backend, banco de dados ou bibliotecas externas.

```
caca-palavras/
├── index.html      → estrutura e layout
├── style.css       → visual (tema escuro, animações, responsivo)
├── script.js       → toda a lógica do jogo
├── agentes.js      → definição dos agentes de desenvolvimento
├── PRD.md          → requisitos do produto
└── README.md       → instruções de uso
```

---

## 2. Módulos de `script.js`

| Módulo | Funções | Responsabilidade |
|---|---|---|
| Banco de palavras | `WORD_BANK`, `FILLER_LETTERS`, `DIRECTIONS` | Constantes: ~60 palavras pt-BR sem acento, letras de preenchimento com frequência aproximada do idioma, e os 8 vetores de direção `[linha, coluna]` |
| Geração | `pickWords()`, `createEmptyBoard()`, `canPlace()`, `placeWord()`, `buildBoard()`, `renderBoard()` | Sorteia palavras, posiciona nas 8 direções, preenche vazios e desenha no DOM |
| Seleção | `getCellFromEvent()`, `getCoordinates()`, `getLinePath()`, `paintSelection()`, `clearSelection()`, `lettersOf()`, `evaluateSelection()` | Captura arrasto, calcula linha reta e valida a palavra |
| Áudio | `playTone(acertou)` | Oscilador WebAudio: tom crescente (acerto) ou grave (erro) |
| UI auxiliar | `showToast()`, `formatTime()`, `startTimer()`, `endGame()`, `launchConfetti()`, `updateScore()` | Toasts, cronômetro, vitória e confete |
| Ciclo do jogo | `newGame()` | Reinicia tudo ao trocar dificuldade ou clicar em "Novo jogo" |

---

## 3. Algoritmos

### 3.1 Direções

Cada direção é um par `[dr, dc]` aplicado `i` vezes para a letra de índice `i`:

```
[0,1] direita        [0,-1] esquerda
[1,0] baixo          [-1,0] cima
[1,1] diagonal ↘     [-1,-1] diagonal ↖
[1,-1] diagonal ↙    [-1,1] diagonal ↗
```

Como o preenchimento é feito letra a letra no vetor, escrever a palavra de trás pra frente equivale a usar a direção oposta — **o jogo inverte a palavra automaticamente quando sorteia uma direção invertida**.

### 3.2 Posicionamento de palavra (`placeWord`)

1. Percorre até **250 tentativas** aleatórias de `(linha, coluna, direção)`.
2. `canPlace()` valida:
   - a palavra inteira cabe dentro dos limites da grade;
   - todas as células estão **livres** ou já contêm a **mesma letra** (sobreposição permitida).
3. Se conseguir, grava as letras e retorna `true`; senão `false`.

### 3.3 Construção da grade (`buildBoard`)

1. Quantidade de palavras por dificuldade: **10×10 → 8**, **13×13 → 11**, **16×16 → 14**.
2. Embaralha o banco (Fisher–Yates) e seleciona palavras com `tamanho ≤ gridSize`.
3. Tenta posicionar todas; **até 12 reinícios** da grade inteira até maximizar as colocadas.
4. Preenche células vazias com letras sorteadas de `FILLER_LETTERS` (com repetição — reflete frequência do português, reduzindo "ilhas" raras).
5. Resultado testado: **100% das palavras posicionadas** em todas as dificuldades.

### 3.4 Cálculo do caminho de seleção (`getLinePath`)

Dado o início `start` e o fim `end`:

```
dr = end.row - start.row
dc = end.col - start.col
válido se: dr == 0 || dc == 0 || |dr| == |dc|
```

Se inválido → retorna apenas a célula inicial (seleção mínima). Se válido, caminha de `i = 0 até max(|dr|, |dc|)` somando `sign(dr)` e `sign(dc)`.

### 3.5 Validação (`evaluateSelection`)

1. Concatena as letras do caminho → `forward`.
2. Gera `backward` = `forward` invertido.
3. Procura nas palavras **não encontradas** se alguma casa com `forward` **ou** `backward` → **acerto**.
4. Qualquer outra coisa → **erro** (incrementa contador, aplica classe `error` por 320ms).

---

## 4. Modelo de dados

```js
wordsToFind = [{ word: "FLORESTA", found: false }, ...]
boardLetters = [["A","B",...], ...]        // gridSize × gridSize
boardFoundMask = [[false,true,...], ...]    // células já confirmadas
cellElements = [[HTMLElement,...], ...]     // referências ao DOM
selection = [{row, col}, ...]               // caminho atual
```

---

## 5. Interface (UI)

### 5.1 Layout

- **Topbar:** título, estatísticas (Tempo / Encontradas / Erros), select de dificuldade e botão "Novo jogo".
- **Principal:** grade de células + dica de uso.
- **Painel lateral:** lista de palavras, legenda de direções e área de mensagem de vitória.

### 5.2 Tokens de estilo (`:root`)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0a0e1a` | Fundo principal (azul-noite) |
| `--panel` | `rgba(255,255,255,.04)` | Cartões translúcidos |
| `--text` | `#e6ecff` | Texto principal |
| `--muted` | `#8b95b8` | Texto secundário |
| `--accent` | `#5eead4` | Turquesa (acertos, timer) |
| `--accent-2` | `#a78bfa` | Violeta (gradientes) |
| `--danger` | `#fb7185` | Erros |

### 5.3 Estados de célula

| Classe | Efeito |
|---|---|
| `.cell` | base escura com borda sutil |
| `.cell.selected` | gradiente turquesa/violeta, escala 1.06, glow |
| `.cell.found` | gradiente forte, permanente, animação `pop` |
| `.cell.error` | fundo vermelho translúcido, animação `shake` 320ms |

### 5.4 Animações

- `float` (18s): bolhas de fundo
- `pop` (0.35s): acerto na célula
- `shake` (0.3s): erro
- `slideIn` (0.3s): palavra riscada na lista
- `fall` (2.2–4.2s): confete da vitória (90 partículas)
- Toast: `transform` + `opacity`, some após 1.6s

---

## 6. Eventos

| Evento | Alvo | Ação |
|---|---|---|
| `pointerdown` | `#board` | Inicia seleção na célula |
| `pointermove` | `#board` | Estende a linha reta até a célula atual (usa `elementFromPoint` para suportar toque) |
| `pointerup` | `window` | Avalia a seleção |
| `pointercancel` | `window` | Cancela seleção |
| `click` | `#newGame` | Novo jogo |
| `change` | `#difficulty` | Novo jogo na dificuldade escolhida |
| `resize` | `window` | Redimensiona células sem regenerar a grade |

`touch-action: none` no `#board` impede o scroll de roubar o arrasto no mobile.

---

## 7. Áudio

WebAudio API: `OscillatorNode` (tipo `sine`) + `GainNode` com decaimento exponencial.

- **Acerto:** 520Hz → 880Hz em 150ms
- **Erro:** 220Hz → 140Hz em 180ms
- Volume: ganho 0.12 → 0.001 em 300ms. Tudo envolto em `try/catch` (áudio é opcional).

---

## 8. Performance e compatibilidade

- Sem bibliotecas externas; HTML/CSS/JS puro.
- Grade no máximo 16×16 = 256 células DOM (leve).
- Redimensionamento via cálculo de `sizePx = min(640, largura - 80) / gridSize`; fonte 45% da célula (mín. 11px).
- Usa `elementFromPoint`, `pointer events`, `AudioContext` — suportados em todos os navegadores modernos.
