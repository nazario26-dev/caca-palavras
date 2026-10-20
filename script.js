/* =========================================================
   Caça-Palavras Interativo
   - palavras nas 8 direções (horizontal, vertical, diagonal)
   - pode estar escrita de trás pra frente
   - seleção com arrastar (mouse / toque)
   ========================================================= */

/* ---------------- banco de palavras (sem acentos) ---------------- */
const WORD_BANK = [
  "AMIZADE", "ANIMAL", "ARCOIRIS", "AREIA", "ARVORE", "BANDEIRA",
  "BORBOLETA", "CARNAVAL", "CASCATA", "CHUVA", "COELHO", "CORRENTE",
  "DESERTO", "ELEFANTE", "ESTRELA", "FANTASMA", "FLORESTA", "FOGO",
  "FRUTA", "GATO", "GIRAFA", "GOLFINHO", "ILHA", "JARDIM", "JOGADOR",
  "KOALA", "LAGOA", "LANTERNA", "LUA", "MACACO", "MAGIA", "MONTANHA",
  "MUSICA", "NUVEM", "ONCA", "ORIGAMI", "OCEANO", "PANTANAL",
  "PAPAGAIO", "PEDRA", "PRAIA", "PRESENTE", "QUEIJO", "RAPINA",
  "RECIFE", "SAUDADE", "SORRISO", "TARTARUGA", "TROVOADA", "UVA",
  "VENTO", "VIAGEM", "XICARA", "ZEBRA", "COMETA", "DOLFINHO",
  "ESPIRAL", "FADA", "GELO", "HISTORIA", "ILUMINA", "JANELA",
];

/* letras usadas para preencher os espaços vazios (frequência aproximada do português) */
const FILLER_LETTERS = "AAAAEEEEOOOOIIIIUUMSRRNTDLCPVGHBFJQXZÇÃÁÂÊÔ";

/* as 8 direções possíveis: [linha, coluna] */
const DIRECTIONS = [
  [0, 1], [1, 0], [1, 1], [1, -1],   // direita, baixo, diagonal ↘, diagonal ↙
  [0, -1], [-1, 0], [-1, -1], [-1, 1] // esquerda, cima, diagonal ↖, diagonal ↗
];

/* ---------------- estado ---------------- */
let gridSize = 13;
let wordsToFind = [];        // [{ word, found }]
let boardLetters = [];       // letras da grade
let boardFoundMask = [];     // células já marcadas como encontradas
let cellElements = [];       // elementos DOM
let selection = [];          // células selecionadas atualmente
let isSelecting = false;
let startCell = null;
let errorCount = 0;
let timerInterval = null;
let seconds = 0;
let gameOver = false;

/* ---------------- referências do DOM ---------------- */
const boardEl = document.getElementById("board");
const wordListEl = document.getElementById("wordList");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const errorsEl = document.getElementById("errors");
const messageEl = document.getElementById("message");
const toastEl = document.getElementById("toast");
const difficultyEl = document.getElementById("difficulty");
const newGameBtn = document.getElementById("newGame");

/* ============================ JOGO ============================ */

function pickWords(count) {
  const pool = [...WORD_BANK];
  // embaralha
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const chosen = [];
  for (const w of pool) {
    if (chosen.length >= count) break;
    if (w.length <= gridSize) chosen.push(w);
  }
  return chosen;
}

function createEmptyBoard() {
  boardLetters = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
}

function canPlace(word, row, col, dr, dc) {
  const endRow = row + dr * (word.length - 1);
  const endCol = col + dc * (word.length - 1);
  if (endRow < 0 || endRow >= gridSize || endCol < 0 || endCol >= gridSize) return false;

  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    const existing = boardLetters[r][c];
    if (existing !== null && existing !== word[i]) return false;
  }
  return true;
}

function placeWord(word) {
  const dirs = [...DIRECTIONS];
  // tenta em direções aleatórias
  for (let attempt = 0; attempt < 250; attempt++) {
    const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
    const row = Math.floor(Math.random() * gridSize);
    const col = Math.floor(Math.random() * gridSize);
    if (canPlace(word, row, col, dr, dc)) {
      for (let i = 0; i < word.length; i++) {
        boardLetters[row + dr * i][col + dc * i] = word[i];
      }
      return true;
    }
  }
  return false;
}

function buildBoard() {
  const count = gridSize <= 10 ? 8 : gridSize <= 13 ? 11 : 14;
  const words = pickWords(count);

  let placed = [];
  for (let tries = 0; tries < 12 && placed.length < words.length; tries++) {
    createEmptyBoard();
    placed = [];
    for (const w of words) {
      if (placeWord(w)) placed.push(w);
    }
  }

  // preenche as células vazias com letras aleatórias
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (boardLetters[r][c] === null) {
        boardLetters[r][c] = FILLER_LETTERS[Math.floor(Math.random() * FILLER_LETTERS.length)];
      }
    }
  }

  wordsToFind = placed.map((w) => ({ word: w, found: false }));
  boardFoundMask = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
}

function renderBoard() {
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${gridSize}, minmax(0, 1fr))`;
  cellElements = [];

  const maxSize = Math.min(640, window.innerWidth - 80);
  const sizePx = Math.max(22, Math.floor(maxSize / gridSize));
  boardEl.style.width = `${sizePx * gridSize + 4 * (gridSize - 1)}px`;

  const fontSize = Math.max(11, Math.floor(sizePx * 0.45));

  for (let r = 0; r < gridSize; r++) {
    const rowEls = [];
    for (let c = 0; c < gridSize; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.style.width = `${sizePx}px`;
      cell.style.height = `${sizePx}px`;
      cell.style.fontSize = `${fontSize}px`;
      cell.textContent = boardLetters[r][c];
      boardEl.appendChild(cell);
      rowEls.push(cell);
    }
    cellElements.push(rowEls);
  }
}

function renderWordList() {
  wordListEl.innerHTML = "";
  for (const item of wordsToFind) {
    const li = document.createElement("li");
    li.textContent = item.word;
    li.dataset.word = item.word;
    if (item.found) li.classList.add("found");
    wordListEl.appendChild(li);
  }
  updateScore();
}

function updateScore() {
  const found = wordsToFind.filter((w) => w.found).length;
  scoreEl.textContent = `${found} / ${wordsToFind.length}`;
}

/* ============================ SELEÇÃO ============================ */

function getCellFromEvent(e) {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  return el && el.classList && el.classList.contains("cell") ? el : null;
}

function getCoordinates(cell) {
  return { row: +cell.dataset.row, col: +cell.dataset.col };
}

/* calcula a linha reta entre duas células (só aceita as 8 direções) */
function getLinePath(start, end) {
  const dr = end.row - start.row;
  const dc = end.col - start.col;

  const isStraight = dr === 0 || dc === 0;
  const isDiagonal = Math.abs(dr) === Math.abs(dc);
  if (!isStraight && !isDiagonal) return [start];

  const stepR = Math.sign(dr);
  const stepC = Math.sign(dc);
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const path = [];
  for (let i = 0; i <= steps; i++) {
    path.push({ row: start.row + stepR * i, col: start.col + stepC * i });
  }
  return path;
}

function paintSelection(path) {
  document.querySelectorAll(".cell.selected").forEach((c) => c.classList.remove("selected"));
  selection = path;
  for (const { row, col } of path) {
    if (!boardFoundMask[row][col]) {
      cellElements[row][col].classList.add("selected");
    }
  }
}

function clearSelection() {
  document.querySelectorAll(".cell.selected").forEach((c) => c.classList.remove("selected"));
  selection = [];
}

function lettersOf(path) {
  return path.map(({ row, col }) => boardLetters[row][col]).join("");
}

function evaluateSelection() {
  if (selection.length < 2) {
    clearSelection();
    return;
  }

  const forward = lettersOf(selection);
  const backward = [...forward].reverse().join("");

  const match = wordsToFind.find(
    (w) => !w.found && (w.word === forward || w.word === backward)
  );

  if (match) {
    match.found = true;
    for (const { row, col } of selection) {
      boardFoundMask[row][col] = true;
      const cell = cellElements[row][col];
      cell.classList.remove("selected");
      cell.classList.add("found");
    }
    const li = wordListEl.querySelector(`[data-word="${match.word}"]`);
    if (li) li.classList.add("found");
    updateScore();
    playTone(true);
    showToast(`✔ ${match.word} encontrada!`);

    if (wordsToFind.every((w) => w.found)) endGame();
  } else {
    playTone(false);
    for (const { row, col } of selection) {
      const cell = cellElements[row][col];
      cell.classList.remove("selected");
      if (!boardFoundMask[row][col]) {
        cell.classList.add("error");
        setTimeout(() => cell.classList.remove("error"), 320);
      }
    }
    errorCount++;
    errorsEl.textContent = errorCount;
  }

  selection = [];
}

/* ============================ EVENTOS ============================ */

boardEl.addEventListener("pointerdown", (e) => {
  if (gameOver) return;
  const cell = getCellFromEvent(e);
  if (!cell) return;
  e.preventDefault();
  isSelecting = true;
  startCell = getCoordinates(cell);
  paintSelection([startCell]);
});

boardEl.addEventListener("pointermove", (e) => {
  if (!isSelecting) return;
  e.preventDefault();
  const cell = getCellFromEvent(e);
  if (!cell) return;
  const current = getCoordinates(cell);
  if (current.row === selection[selection.length - 1]?.row &&
      current.col === selection[selection.length - 1]?.col) return;
  paintSelection(getLinePath(startCell, current));
});

function stopSelecting() {
  if (!isSelecting) return;
  isSelecting = false;
  evaluateSelection();
}

window.addEventListener("pointerup", stopSelecting);
window.addEventListener("pointercancel", () => {
  isSelecting = false;
  clearSelection();
});

/* ============================ ÁUDIO ============================ */

let audioCtx = null;
function playTone(success) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    const now = audioCtx.currentTime;
    if (success) {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    } else {
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
    }
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch (_) { /* áudio é opcional */ }
}

/* ============================ UI AUXILIAR ============================ */

let toastTimer = null;
function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1600);
}

function formatTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

function startTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  timerEl.textContent = formatTime(0);
  timerInterval = setInterval(() => {
    seconds++;
    timerEl.textContent = formatTime(seconds);
  }, 1000);
}

function endGame() {
  gameOver = true;
  clearInterval(timerInterval);
  messageEl.classList.remove("hidden");
  messageEl.innerHTML = `🎉 Parabéns!<br>Todas as palavras encontradas em <strong>${formatTime(seconds)}</strong> com ${errorCount} erro${errorCount === 1 ? "" : "s"}.`;
  showToast("🏆 Você venceu!");
  launchConfetti();
  playTone(true);
}

function launchConfetti() {
  const colors = ["#5eead4", "#a78bfa", "#f0abfc", "#fbbf24", "#f87171"];
  for (let i = 0; i < 90; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 2.2 + Math.random() * 2 + "s";
    piece.style.animationDelay = Math.random() * 0.7 + "s";
    piece.style.opacity = 0.6 + Math.random() * 0.4;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 5000);
  }
}

/* ============================ INÍCIO ============================ */

function newGame() {
  gridSize = parseInt(difficultyEl.value, 10);
  errorCount = 0;
  errorsEl.textContent = "0";
  gameOver = false;
  messageEl.classList.add("hidden");
  clearSelection();

  buildBoard();
  renderBoard();
  renderWordList();
  startTimer();
}

newGameBtn.addEventListener("click", newGame);
difficultyEl.addEventListener("change", newGame);
window.addEventListener("resize", () => {
  // reajusta o tamanho das células sem regenerar a grade
  const maxSize = Math.min(640, window.innerWidth - 80);
  const sizePx = Math.max(22, Math.floor(maxSize / gridSize));
  const fontSize = Math.max(11, Math.floor(sizePx * 0.45));
  boardEl.style.width = `${sizePx * gridSize + 4 * (gridSize - 1)}px`;
  cellElements.flat().forEach((cell) => {
    cell.style.width = `${sizePx}px`;
    cell.style.height = `${sizePx}px`;
    cell.style.fontSize = `${fontSize}px`;
  });
});

newGame();
