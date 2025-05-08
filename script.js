const quadro = document.querySelector('.game-container');
let vitoriasX = 0;
let vitoriasO = 0;
let turn = "X";
let contraIA = true;
let dificuldadeIA = "dificil"; // "facil" ou "dificil"

function iniciarJogo(usandoIA, dificuldade = "dificil") {
  contraIA = usandoIA;
  dificuldadeIA = dificuldade;
  document.getElementById("menu").style.display = "none";
  document.getElementById("botaoVoltar").style.display = "block";
  document.getElementById("botaoReiniciar").style.display = "none";
  document.getElementById("titulo").style.display = "block";

  quadro.style.display = "grid";
  criarquadro();
  listenBoard();
  document.getElementById("placar").style.display = "flex";
  atualizarPlacar();
}

function listenBoard() {
  quadro.addEventListener('click', comecarJogo);
}

function comecarJogo(e) {
  const idCaixa = e.target.id;
  if (!idCaixa || !idCaixa.startsWith("caixa-")) return;

  const caixa = document.getElementById(idCaixa);
  if (!caixa || caixa.textContent !== "" || caixa.classList.contains("bloqueado")) return;

  if (turn === "X") {
    caixa.textContent = "X";

    if (verificaEstado()) return; // Verifica vitória depois de jogar
    
    if (contraIA) {
      bloquearCaixas();
      setTimeout(() => {
        iaJoga(); 
        desbloquearCaixas();
      }, 300);
    } else {
      switchPlayer(); // Só troca turno se for 2 jogadores
    }

  } else if (turn === "O" && !contraIA) {
    caixa.textContent = "O";

    if (verificaEstado()) return; // Verifica vitória depois de jogar
    switchPlayer(); // Troca turno
  }
}


// Joga com base na dificuldade
function iaJoga() {
  const caixas = getCaixas();

  let jogada = -1;
  if (dificuldadeIA === "dificil") {
    jogada = melhorJogada(caixas); // minimax
  } else {
    jogada = jogadaAleatoria(caixas); // aleatória
  }

  if (jogada !== -1) {
    const caixa = document.getElementById(`caixa-${jogada}`);
    caixa.textContent = "O";
    verificaEstado();
  }
}

// Modo fácil: pega uma jogada aleatória válida
function jogadaAleatoria(board) {
  const jogadasPossiveis = board.map((val, idx) => val === "" ? idx : null).filter(v => v !== null);
  if (jogadasPossiveis.length === 0) return -1;
  const indice = Math.floor(Math.random() * jogadasPossiveis.length);
  return jogadasPossiveis[indice];
}

// Modo difícil: minimax
function melhorJogada(board) {
  let melhorScore = -Infinity;
  let jogada = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      const score = minimax(board, 0, false);
      board[i] = "";
      if (score > melhorScore) {
        melhorScore = score;
        jogada = i;
      }
    }
  }

  return jogada;
}

function minimax(board, profundidade, isMaximizando) {
  const vencedor = getWinner(board);
  if (vencedor !== null) {
    const scores = { "X": -10, "O": 10, empate: 0 };
    return scores[vencedor];
  }

  if (isMaximizando) {
    let melhorScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        const score = minimax(board, profundidade + 1, false);
        board[i] = "";
        melhorScore = Math.max(score, melhorScore);
      }
    }
    return melhorScore;
  } else {
    let melhorScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        const score = minimax(board, profundidade + 1, true);
        board[i] = "";
        melhorScore = Math.min(score, melhorScore);
      }
    }
    return melhorScore;
  }
}

function getWinner(board) {
  const combs = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (const [a, b, c] of combs) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }

  if (board.every(pos => pos !== "")) return "empate";
  return null;
}

function verificaEstado() {
  const caixas = getCaixas();
  const vencedor = getWinner(caixas);

  if (vencedor) {
    const mensagem = document.createElement('p');
    mensagem.textContent = vencedor === "empate" ? "Empate!" : `O jogador ${vencedor} venceu!`;
    mensagem.id = "mensagem-vencedor";
    mensagem.classList.add("texto-animado"); // aplica a animação
    mensagem.style.fontSize = '100px';
    mensagem.style.textAlign = 'center';
    mensagem.style.marginTop = '-3000px';
    document.body.appendChild(mensagem);

    // Atualiza o placar
    if (vencedor === "X") {
      vitoriasX++;
    } else if (vencedor === "O") {
      vitoriasO++;
    }
    document.getElementById("botaoReiniciar").style.display = "block";
    atualizarPlacar();
    bloquearCaixas();
    quadro.removeEventListener('click', comecarJogo);
    return true;
  }

  return false;
}
  
function getCaixas() {
  const conteudo = [];
  for (let i = 0; i <= 8; i++) {
    const caixa = document.querySelector(`#caixa-${i}`);
    conteudo.push(caixa ? caixa.textContent || "" : "");
  }
  return conteudo;
}

function switchPlayer() {
  turn = turn === "X" ? "O" : "X";
}

function criarquadro() {
  for (let i = 0; i < 9; i++) {
    const caixa = document.createElement("div");
    caixa.className = "caixa";
    caixa.id = `caixa-${i}`;
    quadro.appendChild(caixa);
  }
}

function bloquearCaixas() {
  const caixas = document.querySelectorAll('.caixa');
  caixas.forEach(caixa => {
    if (caixa.textContent === "") {
      caixa.classList.add("bloqueado");
    }
  });
}

function desbloquearCaixas() {
  const caixas = document.querySelectorAll('.caixa');
  caixas.forEach(caixa => {
    caixa.classList.remove("bloqueado");
  });
}
function mostrarDificuldades() {
  const botoes = document.getElementById("botoes-dificuldade");
  if (botoes.style.display === "block") {
    botoes.style.display = "none";
  } else {
    botoes.style.display = "block";
  }
}

function voltarMenu() {
  location.reload();

}

function atualizarPlacar() {
  const esquerda = document.getElementById("contador-esquerda");
  const direita = document.getElementById("contador-direita");

  if (contraIA) {
    esquerda.textContent = "Jogador (X): " + vitoriasX;
    direita.textContent = "IA: " + vitoriasO;
  } else {
    esquerda.textContent = "Jogador 1: " + vitoriasX;
    direita.textContent = "Jogador 2: " + vitoriasO;
  }
}


function reiniciarJogo() {
  // Limpa o tabuleiro atual
  quadro.innerHTML = "";
  document.getElementById("botaoReiniciar").style.display = "none";
  const mensagemAnterior = document.getElementById("mensagem-vencedor");
  if (mensagemAnterior) {
    mensagemAnterior.remove();
  }
  // Reinicia o turno
  turn = "X";
  // Cria novamente o tabuleiro e ativa o jogo
  criarquadro();
  listenBoard();
}
