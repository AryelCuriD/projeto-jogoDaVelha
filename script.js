// Seleciona o elemento que representa o quadro do jogo
const quadro = document.querySelector('.game-container');

// Contadores de vitórias
let vitoriasX = 0;
let vitoriasO = 0;

// Turno atual ("X" começa)
let turn = "X";

// Flags para saber se está jogando contra IA e qual a dificuldade
let contraIA = true;
let dificuldadeIA = "dificil"; // "facil" ou "dificil"

// Inicia o jogo, configurando o modo (IA ou 2 jogadores)
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

// Adiciona o ouvinte de eventos ao tabuleiro
function listenBoard() {
  quadro.addEventListener('click', comecarJogo);
}

// Lida com o clique em uma célula do jogo
function comecarJogo(e) {
  const idCaixa = e.target.id;
  if (!idCaixa || !idCaixa.startsWith("caixa-")) return;

  const caixa = document.getElementById(idCaixa);
  if (!caixa || caixa.textContent !== "" || caixa.classList.contains("bloqueado")) return;

  if (turn === "X") {
    caixa.textContent = "X";
    if (verificaEstado()) return;

    if (contraIA) {
      bloquearCaixas();
      setTimeout(() => {
        iaJoga(); 
        desbloquearCaixas();
      }, 300);
    } else {
      switchPlayer();
    }

  } else if (turn === "O" && !contraIA) {
    caixa.textContent = "O";
    if (verificaEstado()) return;
    switchPlayer();
  }
}

// IA faz uma jogada baseada na dificuldade
function iaJoga() {
  const caixas = getCaixas();
  let jogada = -1;

  if (dificuldadeIA === "dificil") {
    jogada = melhorJogada(caixas); // Usa algoritmo minimax
  } else {
    jogada = jogadaAleatoria(caixas); // Escolhe uma jogada aleatória
  }

  if (jogada !== -1) {
    const caixa = document.getElementById(`caixa-${jogada}`);
    caixa.textContent = "O";
    verificaEstado();
  }
}

// IA fácil: retorna uma jogada aleatória
function jogadaAleatoria(board) {
  const jogadasPossiveis = board.map((val, idx) => val === "" ? idx : null).filter(v => v !== null);
  if (jogadasPossiveis.length === 0) return -1;
  const indice = Math.floor(Math.random() * jogadasPossiveis.length);
  return jogadasPossiveis[indice];
}

// IA difícil: usa algoritmo minimax para jogar
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

// Função do algoritmo minimax para IA difícil
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

// Verifica se há um vencedor ou empate
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

// Verifica o estado atual do jogo (vitória ou empate)
function verificaEstado() {
  const caixas = getCaixas();
  const vencedor = getWinner(caixas);

  if (vencedor) {
    const mensagem = document.createElement('p');
    mensagem.textContent = vencedor === "empate" ? "Empate!" : `O jogador ${vencedor} venceu!`;
    mensagem.id = "mensagem-vencedor";
    mensagem.classList.add("texto-animado");
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

// Retorna um array com o conteúdo de cada caixa
function getCaixas() {
  const conteudo = [];
  for (let i = 0; i <= 8; i++) {
    const caixa = document.querySelector(`#caixa-${i}`);
    conteudo.push(caixa ? caixa.textContent || "" : "");
  }
  return conteudo;
}

// Troca o turno entre os jogadores
function switchPlayer() {
  turn = turn === "X" ? "O" : "X";
}

// Cria o tabuleiro com 9 caixas
function criarquadro() {
  for (let i = 0; i < 9; i++) {
    const caixa = document.createElement("div");
    caixa.className = "caixa";
    caixa.id = `caixa-${i}`;
    quadro.appendChild(caixa);
  }
}

// Impede que as caixas sejam clicadas
function bloquearCaixas() {
  const caixas = document.querySelectorAll('.caixa');
  caixas.forEach(caixa => {
    if (caixa.textContent === "") {
      caixa.classList.add("bloqueado");
    }
  });
}

// Libera as caixas para novos cliques
function desbloquearCaixas() {
  const caixas = document.querySelectorAll('.caixa');
  caixas.forEach(caixa => {
    caixa.classList.remove("bloqueado");
  });
}

// Exibe ou esconde os botões de dificuldade no menu
function mostrarDificuldades() {
  const botoes = document.getElementById("botoes-dificuldade");
  if (botoes.style.display === "block") {
    botoes.style.display = "none";
  } else {
    botoes.style.display = "block";
  }
}

// Volta para o menu principal recarregando a página
function voltarMenu() {
  location.reload();
}

// Atualiza o placar na tela de acordo com o modo de jogo
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

// Reinicia o jogo atual sem resetar o placar
function reiniciarJogo() {
  quadro.innerHTML = "";
  document.getElementById("botaoReiniciar").style.display = "none";

  // Remove mensagem de vitória
  const mensagemAnterior = document.getElementById("mensagem-vencedor");
  if (mensagemAnterior) {
    mensagemAnterior.remove();
  }

  turn = "X";
  criarquadro();
  listenBoard();
}
