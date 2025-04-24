let paddle, ball, bricks = [];
let rows = 3, cols = 7;
let score = 0, lives = 3, level = 1;
let gameStarted = false;
let gamePaused = false;

function setup() {
  createCanvas(800, 600); 
  paddle = new Paddle();
  ball = new Ball();
  setupLevel(level);
}

function draw() {
  background(10, 50, 100);
  drawHUD();

  if (gamePaused) {
    fill(255, 0, 0);
    textAlign(CENTER);
    textSize(32);
    text("¡PAUSADO!", width / 2, height / 2 - 40);
    textSize(18);
    text("Presiona 'P' para reanudar", width / 2, height / 2);
    return;
  }

  if (!gameStarted) {
    if (lives <= 0) {
      showGameOver();
    } else {
      fill(255);
      textAlign(CENTER);
      textSize(18);
      text("Presiona ESPACIO para comenzar", width / 2, height / 2 - 40);
      textSize(14);
      text("Instrucciones:", width / 2, height / 2);
      text("Usa las flechas IZQUIERDA y DERECHA para mover la paleta", width / 2, height / 2 + 20);
      text("Presiona 'P' para PAUSAR el juego", width / 2, height / 2 + 40); 
    }
    return;
  }

  ball.update();
  ball.show();
  paddle.update();
  paddle.show();
  ball.checkPaddle(paddle);

  let remaining = 0;
  for (let brick of bricks) {
    if (brick.hp > 0) {
      brick.show();
      if (ball.checkBrick(brick)) {
        score += 10;
      }
      remaining++;
    }
  }

  if (remaining === 0) {
    level++;
    if (level > 3) {
      noLoop();
      showVictory();
      return;
    } else {
      setupLevel(level);
    }
  }

  if (ball.y - ball.r > height) {
    lives--;
    if (lives > 0) {
      resetBall();
    } else {
      gameStarted = false;
    }
  }
}

function drawHUD() {
  fill(255);
  textSize(14);
  text(`Puntaje: ${score}`, 40, 20);
  text(`Vidas: ${lives}`, width - 70, 20);
  text(`Nivel: ${level}`, width / 2 - 30, 20);
}

function showGameOver() {
  fill(255, 0, 0);
  textAlign(CENTER);
  textSize(32);
  text("perdiste", width / 2, height / 2 - 20);
  textSize(20);
  text("Puntaje final: " + score, width / 2, height / 2 + 10);
  text("Presiona ESPACIO para reiniciar", width / 2, height / 2 + 40);
}

function showVictory() {
  fill(0, 255, 0);
  textAlign(CENTER);
  textSize(32);
  text("ganaste", width / 2, height / 2 - 20);
  textSize(20);
  text("Puntaje final: " + score, width / 2, height / 2 + 10);
}

function keyPressed() {
  if (key === " ") {
    if (lives <= 0 || level > 3) {
      resetGame();
    }
    gameStarted = true;
  }

  if (key === "P" || key === "p") {
    gamePaused = !gamePaused;
  }
}

function setupLevel(lvl) {
  bricks = [];
  let extraRows = lvl === 2 ? 2 : lvl === 3 ? 4 : 0;
  rows = 3 + extraRows;
  cols = 7;
  let brickW = width / cols;
  let brickH = 20;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let x = c * brickW;
      let y = 50 + r * brickH;
      let hp = 1;
      let indestructible = false;

      if (lvl === 2 && r === 0 && c === 3) hp = 3;
      if (lvl === 3) {
        if ((r === 0 && (c === 2 || c === 4))) hp = 3;
        if (r === 0 && c === 3) indestructible = true;
      }

      bricks.push(new Brick(x, y, brickW, brickH, hp, indestructible));
    }
  }

  resetBall();
  if (lvl === 2) ball.speed = 6;
  else if (lvl === 3) ball.speed = 7;
  else ball.speed = 5;
}

function resetBall() {
  ball = new Ball();
}

function resetGame() {
  lives = 3;
  score = 0;
  level = 1;
  setupLevel(level);
  loop();
}

class Paddle {
  constructor() {
    this.w = 120; 
    this.h = 15;
    this.x = width / 2 - this.w / 2;
    this.y = height - 30;
    this.speed = 7;
  }

  update() {
    if (keyIsDown(LEFT_ARROW)) this.x -= this.speed;
    if (keyIsDown(RIGHT_ARROW)) this.x += this.speed;
    this.x = constrain(this.x, 0, width - this.w);
  }

  show() {
    fill(255, 255, 0); 
    rect(this.x, this.y, this.w, this.h, 10);
  }
}

class Ball {
  constructor() {
    this.r = 15; 
    this.reset();
  }

  reset() {
    this.x = width / 2;
    this.y = height / 2;
    this.speed = 5;
    this.xSpeed = this.speed;
    this.ySpeed = -this.speed;
  }

  update() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    if (this.x < this.r || this.x > width - this.r) this.xSpeed *= -1;
    if (this.y < this.r) this.ySpeed *= -1;
  }

  checkPaddle(p) {
    if (
      this.y + this.r >= p.y &&
      this.x > p.x &&
      this.x < p.x + p.w &&
      this.ySpeed > 0
    ) {
      this.ySpeed *= -1;
    }
  }

  checkBrick(b) {
    if (
      this.x > b.x &&
      this.x < b.x + b.w &&
      this.y - this.r < b.y + b.h &&
      this.y + this.r > b.y &&
      b.hp > 0
    ) {
      if (!b.indestructible) b.hp--;
      this.ySpeed *= -1;
      return true;
    }
    return false;
  }

  show() {
    fill(255, 0, 0); 
    ellipse(this.x, this.y, this.r * 2);
  }
}

class Brick {
  constructor(x, y, w, h, hp, indestructible = false) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.hp = hp;
    this.indestructible = indestructible;
  }

  show() {
    if (this.hp <= 0 && !this.indestructible) return;
    if (this.indestructible) fill(120);
    else if (this.hp === 3) fill(255, 0, 0);
    else if (this.hp === 2) fill(255, 165, 0);
    else fill(0, 255, 255);
    rect(this.x, this.y, this.w - 2, this.h - 2, 5);
  }
}
