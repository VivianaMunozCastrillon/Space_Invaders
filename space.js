// Configuración del tablero
let tileSize = 32;
let rows = 16;
let columns = 16;

let board, context;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;

// Configuración de la nave
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = (tileSize * columns) / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;
let shipVelocityX = tileSize;

let ship = { x: shipX, y: shipY, width: shipWidth, height: shipHeight };

let shipImg = new Image();
shipImg.src = "./ship.png";

// Configuración de los aliens
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienVelocityX = 1;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienImg = new Image();
alienImg.src = "./alien.png";

// Configuración de las balas
let bulletArray = [];
let bulletVelocityY = -10;

let score = 0;
let gameOver = false;

window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    shipImg.onload = function () {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    };

    createAliens();
    requestAnimationFrame(update);

    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);

    // Controles táctiles
    document.getElementById("leftBtn").addEventListener("click", () => moveShip({ code: "ArrowLeft" }));
    document.getElementById("rightBtn").addEventListener("click", () => moveShip({ code: "ArrowRight" }));
    document.getElementById("shootBtn").addEventListener("click", () => shoot({ code: "Space" }));

    document.getElementById("leftBtn").addEventListener("touchstart", (e) => {
        e.preventDefault();
        moveShip({ code: "ArrowLeft" });
    });
    document.getElementById("rightBtn").addEventListener("touchstart", (e) => {
        e.preventDefault();
        moveShip({ code: "ArrowRight" });
    });
    document.getElementById("shootBtn").addEventListener("touchstart", (e) => {
        e.preventDefault();
        shoot({ code: "Space" });
    });

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
};

function update() {
    if (gameOver) return;
    requestAnimationFrame(update);

    context.clearRect(0, 0, board.width, board.height);

    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    for (let alien of alienArray) {
        if (alien.alive) {
            alien.x += alienVelocityX;
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;
                alienArray.forEach(al => al.y += alienHeight);
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);
            if (alien.y >= ship.y) gameOver = true; // Fin del juego
        }
    }

    for (let bullet of bulletArray) {
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        for (let alien of alienArray) {
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
                document.getElementById("score").innerText = "Score: " + score;
            }
        }
    }

    bulletArray = bulletArray.filter(b => !b.used && b.y > 0);

    if (alienCount == 0) {
        nextLevel();
    }

    if (gameOver) {
        displayGameOver();
    }
}

function moveShip(e) {
    if (gameOver) return;
    if (e.code === "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    } else if (e.code === "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX;
    }
}

function shoot(e) {
    if (gameOver) return;
    if (e.code === "Space") {
        bulletArray.push({
            x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false
        });
    }
}

function createAliens() {
    alienArray = [];
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            alienArray.push({
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            });
        }
    }
    alienCount = alienArray.length;
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function nextLevel() {
    score += alienColumns * alienRows * 100;
    alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
    alienRows = Math.min(alienRows + 1, rows - 4);
    alienVelocityX += alienVelocityX > 0 ? 0.2 : -0.2;
    createAliens();
}

function resizeCanvas() {
    let scale = Math.min(window.innerWidth / boardWidth, window.innerHeight / boardHeight);
    board.style.width = boardWidth * scale + "px";
    board.style.height = boardHeight * scale + "px";
}

function displayGameOver() {
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, board.width, board.height);
    context.fillStyle = "white";
    context.font = "40px Arial";
    context.fillText("Game Over", board.width / 2 - 100, board.height / 2);

    let restartBtn = document.createElement("button");
    restartBtn.textContent = "Reiniciar";
    restartBtn.style.position = "absolute";
    restartBtn.style.top = "50%";
    restartBtn.style.left = "50%";
    restartBtn.style.transform = "translate(-50%, -50%)";
    document.body.appendChild(restartBtn);

    restartBtn.addEventListener("click", restartGame);
}

function restartGame() {
    document.location.reload();
}
