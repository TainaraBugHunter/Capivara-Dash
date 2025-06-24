// Arquivo script.js LIMPO e FUNCIONAL

let capivara, comidaImg, ovoImg, fundoImg;
let coracaoCheio, coracaoVazio;
let comidinhas = [];
let ovos = [];
let score = 0;
let displayedScore = 0;
let lives = 3;
let fase = 1;
let gameStarted = false;
let capivaraX, capivaraY;

let velocidadeCapivara = 8;
let velocidadeItens = 1;

let leftPressed = false;
let rightPressed = false;

let musicaFundo, somComida, somPerdeVida, somGameOver;

function preload() {
  capivara = loadImage('assets/capivara.png ');
  comidaImg = loadImage('assets/comida.png');
  ovoImg = loadImage('assets/ovo.png');
  fundoImg = loadImage('assets/fundo.jpeg');
  coracaoCheio = loadImage('assets/coracaoCheio.png');
  coracaoVazio = loadImage('assets/coracaoVazio.png');
  // Sons
  musicaFundo = loadSound('assets/fundo.mp3');
  somComida = loadSound('assets/comida.mp3');
  somPerdeVida = loadSound('assets/vida.mp3');
  somGameOver = loadSound('assets/gameover.mp3');
}

function setup() {
  let canvas = createCanvas(600, 500);
  canvas.parent('game-canvas');
  capivaraX = width / 2 - 35;
  capivaraY = height - 70;
  textFont('monospace');
}

function draw() {
  if (!gameStarted) return;

  image(fundoImg, 0, 0, width, height);

  if (leftPressed) capivaraX = max(0, capivaraX - velocidadeCapivara);
  if (rightPressed) capivaraX = min(width - 70, capivaraX + velocidadeCapivara);

  image(capivara, capivaraX, capivaraY, 70, 70);

  if (frameCount % 100 === 0) {
    let newX = random(width - 40);
    let distanciaMinima = 60;
    let sobrepoe = ovos.some(o => abs(o.x - newX) < distanciaMinima) ||
                   comidinhas.some(c => abs(c.x - newX) < distanciaMinima);
    if (!sobrepoe && random() < 0.5) comidinhas.push({ x: newX, y: 0 });

    newX = random(width - 40);
    sobrepoe = ovos.some(o => abs(o.x - newX) < distanciaMinima) ||
               comidinhas.some(c => abs(c.x - newX) < distanciaMinima);
    if (!sobrepoe && random() < 0.3) ovos.push({ x: newX, y: 0 });
  }

  for (let i = comidinhas.length - 1; i >= 0; i--) {
    let comida = comidinhas[i];
    comida.y += velocidadeItens;
    image(comidaImg, comida.x, comida.y, 40, 40);

    // Primeiro testa se pegou a comida
    if (collideRectRect(capivaraX, capivaraY, 70, 70, comida.x, comida.y, 40, 40)) {
      score += 10;
      comidinhas.splice(i, 1);
      somComida.play();
      updateFase();
      updateHUD();
      continue;
    }
    // Só testa se perdeu vida se NÃO pegou a comida
    else if (comida.y > height) {
      lives--;
      comidinhas.splice(i, 1);
      somPerdeVida.play();
      if (lives <= 0) gameOver();
      updateHUD();
    }
  }

  for (let i = ovos.length - 1; i >= 0; i--) {
    let ovo = ovos[i];
    ovo.y += velocidadeItens;
    image(ovoImg, ovo.x, ovo.y, 40, 40);

    if (collideRectRect(capivaraX, capivaraY, 70, 70, ovo.x, ovo.y, 40, 40)) {
      lives--;
      ovos.splice(i, 1);
      somPerdeVida.play();
      if (lives <= 0) gameOver();
      updateHUD();
    } else if (ovo.y > height) {
      ovos.splice(i, 1);
    }
  }

  updatePlacarAnimado();
  drawVidasEstiloCoracao(20, 20);
}

function updatePlacarAnimado() {
  if (displayedScore < score) {
    displayedScore += 2;
    if (displayedScore > score) displayedScore = score;
  }
}

function drawPlacarEstiloRoleta(x, y) {
  textSize(32);
  fill(0);
  textAlign(LEFT, TOP);
  text(`Pontos: ${nf(displayedScore, 4)}`, x, y);
}

function drawVidasEstiloCoracao(x, y) {
  let espacamento = 35;
  for (let i = 0; i < 3; i++) {
    let img = i < lives ? coracaoCheio : coracaoVazio;
    image(img, x + i * espacamento, y, 30, 30);
  }
}

function updateFase() {
  let novaFase = Math.floor(score / 100) + 1;
  if (novaFase > fase) {
    fase = novaFase;
    velocidadeCapivara += 0.5;
    velocidadeItens += 0.3;
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) leftPressed = true;
  if (keyCode === RIGHT_ARROW) rightPressed = true;
}

function keyReleased() {
  if (keyCode === LEFT_ARROW) leftPressed = false;
  if (keyCode === RIGHT_ARROW) rightPressed = false;
}

function startGame() {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-ui').style.display = 'flex';
  document.getElementById('game-over-popup').style.display = 'none';

  if (musicaFundo.isPlaying()) musicaFundo.stop();
  musicaFundo.loop();
  
  gameStarted = true;
  score = 0;
  displayedScore = 0;
  lives = 3;
  fase = 1;
  velocidadeCapivara = 8;
  velocidadeItens = 1;
  capivaraX = width / 2 - 35;
  capivaraY = height - 70;
  comidinhas = [];
  ovos = [];

  loop();
  updateHUD();
}

function restartGame() {
  startGame();
}

function gameOver() {
  noLoop();
  gameStarted = false;
  musicaFundo.stop();
  somGameOver.play();
  document.getElementById('final-score').innerText = score;
  document.getElementById('game-over-popup').style.display = 'block';
}

function updateHUD() {
  document.getElementById('hud-score').innerText = score;
  document.getElementById('hud-fase').innerText = fase;
}

function collideRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 &&
         y1 < y2 + h2 && y1 + h1 > y2;
}
