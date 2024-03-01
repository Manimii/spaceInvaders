// mostrar pantalla de inicio al abrir la aplicación
window.onload = drawStartScreen;

// canvas
var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");

// variables para calcular frecuencia del monitor del usuario
var last_draw = Date.now();
var elapsed;
var fps;

// variables de la nave del jugador
var shipHeight = 30;
var shipWidth = 40;
var shipX = (canvas.width-shipWidth)/2
var shipY = canvas.height-shipHeight*4;
var shipPadding = 10;

// variables del disparo de la nave
var shotRadius = 5;
var shotX;
var shotY;

// booleanos que dicen que teclas se pulsan
var rightPressed = false;
var leftPressed = false;
var spacePressed = false;
var enterPressed = false;

// variables de los enemigos
var invaderCol = 11;
var invaderRow = 5;
var invaderWidth = 30;
var invaderHeight = 30;
var invaderPadding = 12;
var invaderOffsetTop = 50;
var invaderOffsetLeft = 95;
var invaderSpeed = 1000;

// variables de los disparos de los enemigos
var invaderShotX  = 0;
var invaderShotY = 0;
var invaderShot = false;

// crear enemigos
var invaders = [];

for (var i = 0; i < invaderCol; i++) {

    invaders[i] = [];

    for (var j = 0; j < invaderRow; j++) {

        invaders[i][j] = { x: 0, y: 0, status: 1 };
    }
}

// puntuación y vidas
var score = 0;
var lives = 3;

// indica la dirección en la que se están moviendo los enemigos
var movingRight = true;

// número de filas de enemigos eliminadas
var rowsDefeated = 0;

// interval para mover los enemigos y request animation para hacer el loop del juego
var interval;
var requestAnimation;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Muestra la puntuación actual
function drawScore()
{
    ctx.font = "16px Monospace";
    ctx.fillStyle = "#efefef";
    ctx.fillText("Score: "+score, 8, 20);
}

// Muestra la puntuación más alta
function drawHighScore()
{
    var highScore = localStorage.getItem("HighScore_SI");

    if (highScore == null) {
        highScore = 0;
    }

    var scoreDigits = highScore.toString().length; 

    ctx.font = "16px Monospace";
    ctx.fillStyle = "#efefef";
    ctx.fillText("High score: " + highScore, canvas.width-(15*scoreDigits)-150, 20);
}

// Muestra las vidas restantes
function drawLives()
{
    ctx.font = "16px Monospace";
    ctx.fillStyle = "#efefef";
    ctx.fillText("Lives: ", 8, canvas.height - 10);

    for (var i = 1; i <= lives; i++) {
        image = new Image();
        image.src = "sprites/ship.png";
        ctx.drawImage(image,(shipWidth + shipPadding)*i + 25, canvas.height-35, shipWidth, shipHeight);
    }
}

// Dibuja la linia verde de abajo
function drawLine()
{
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 40);
    ctx.lineTo(canvas.width, canvas.height - 40);
    ctx.strokeStyle = "#3Aff00";
    ctx.stroke();
}

// Dibuja la nave
function drawShip()
{
    image = new Image();
    image.src = "sprites/ship.png";
    ctx.drawImage(image,shipX, shipY, shipWidth, shipHeight);
}

// Dibuja los enemigos
function drawInvaders()
{
    // Si has eliminado a todos los enemigos, vuelven a aparecer
    if (rowsDefeated == invaderRow) {
        invaders = [];

        for (var i = 0; i < invaderCol; i++) {

            invaders[i] = [];

            for (var j = 0; j < invaderRow; j++) {

                invaders[i][j] = { x: 0, y: 0, status: 1 };
            }
        }

        invaderOffsetTop = 50;
        invaderOffsetLeft = 95;
    }


    for (var i = 0; i < invaderCol; i++) {

        for (var j = 0; j < invaderRow; j++) {

            if(invaders[i][j].status == 1) {

	            var invaderX = (i*(invaderWidth+invaderPadding))+invaderOffsetLeft;
	            var invaderY = (j*(invaderHeight+invaderPadding))+invaderOffsetTop;

	            invaders[i][j].x = invaderX;
	            invaders[i][j].y = invaderY;

                image = new Image();
                image.src = "sprites/invader.gif";
                ctx.drawImage(image, invaderX, invaderY, invaderWidth, invaderHeight);
                
	        }
        }
    }

    
}

// Dibuja el disparo de la nave al apretar el botón.
function drawShot()
{
    ctx.beginPath();
    ctx.rect(shotX, shotY, 1,3);
    ctx.fillStyle = "#f0f0f0";
    ctx.fill();
    ctx.closePath();

    if (fps < 100) {
        shotY -= 10; // 60Hz
    } else {
        shotY -= 5; // 144Hz
    }
}

// Game loop
function draw()
{
    /*   calcular fps   */
    elapsed = Date.now() - last_draw;
    last_draw = Date.now();
    fps = 1000/elapsed;
    /*   calcular fps   */

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawShip();

    drawInvaders();

    drawScore();

    drawLine();

    drawHighScore();

    drawRandomShot();

    shipCollisionDetection();

    drawLives();

    if (lives == 0) {
        gameOver();
        return;
    }

    if (spacePressed) {
        drawShot();

        invadersCollisionDetection();

        if (shotY < 0) {
            spacePressed = false;
        }
    }


    if (rightPressed && shipX < canvas.width-shipWidth) {
        if (fps < 100) {
            shipX += 2; //60Hz
        
        } else {
            shipX += 1; //144Hz
        }

    } else if (leftPressed && shipX > 0) {
        if (fps < 100) {
            shipX -= 2; //60Hz
        
        } else {
            shipX -= 1; //144Hz
        }
    }

    requestAnimation = requestAnimationFrame(draw);
}

// Detección de colisiones con los enemigos y los disparos de la nave
function invadersCollisionDetection()
{
    for (var i = 0; i < invaderCol; i++) {

        for (var j = 0; j < invaderRow; j++) {

            var hit = invaders[i][j];

           if (hit.status == 1) {

                if (shotX > hit.x && shotX < hit.x+invaderWidth && shotY > hit.y && shotY < hit.y+invaderHeight){
                    hit.status = 0;
                    shotY = -1;
                    score += 25;

                    rowsDefeated = 0;

                     for (var r = invaderRow -1; r >= 0; r--) {
                        
                        var isDefeated = true;

                        for (var c = invaderCol - 1; c > 0; c--) {

                            var inv = invaders[c][r];

                            if (inv.status == 1) {
                                isDefeated = false;
                                break;
                            }
                        }

                        if (!isDefeated) {
                            break
                        }

                        rowsDefeated++;

                    } 

                }
            }
        }
    }
}

// Detección de colisiones de la nave con los disparos de los enemigos
function shipCollisionDetection()
{
    if (invaderShotX > shipX && invaderShotX < shipX + shipWidth && invaderShotY < shipY + shipHeight && invaderShotY > shipY) {
        
        lives--;

        shipX = (canvas.width-shipWidth)/2;
        shipY = canvas.height-shipHeight*4;

        invaderShot = false;

        invaderShotY = canvas.height + 1;
    }
}

// Mueve a los enemigos
function moveInvaders()
{
    if (movingRight) {
        invaderOffsetLeft += 20;
    
        if (invaderOffsetLeft == 155) {
            invaderOffsetTop += 20;
            movingRight = false;
        }

    } else {
        invaderOffsetLeft -= 20;

        if (invaderOffsetLeft == 55) {
            invaderOffsetTop += 20;
            movingRight = true;
        }

    }

    // Si los enemigos llegan a la nave, se termina el juego
    if (invaderOffsetTop >= (canvas.height-shipHeight*4) - ((invaderHeight+invaderPadding)*(invaderRow-rowsDefeated) - 1)) {
        gameOver();
    }

}

// Los enemigos disparan de manera aleatoria 
function drawRandomShot()
{
    if (!invaderShot) {
        var randomShot = Math.floor(Math.random() * 50) + 1;

        if (randomShot == 50) {
            invaderShot = true;

            invaderShotY = Math.floor(Math.random() * (invaderHeight+invaderPadding)*(invaderRow-rowsDefeated)) + invaderOffsetTop;
            invaderShotX = Math.floor(Math.random() * canvas.width);

        }
    } else {
        ctx.beginPath();
        ctx.rect(invaderShotX, invaderShotY, 1,5);
        ctx.fillStyle = "#f0f0f0";
        ctx.fill();
        ctx.closePath();
    
        if (fps < 100){
            invaderShotY += 7;// 60Hz

        } else {
            invaderShotY += 4; // 144Hz
        }

        if (invaderShotY > canvas.height) {
            invaderShot = false;
        }
    }

}

// Muestra la pantalla de inicio
function drawStartScreen() 
{
    writeText("Space Invaders", canvas.width/3, canvas.height/2.75, '#FFFFFF', 36);
    writeText("Press enter to play!", canvas.width/3.5, canvas.height/2, '#FFFFFF', 36);
}

// Muestra la pantalla de Game Over
function drawGameOverScreen()
{
    var count = 9;
    var countdown = setInterval(function(){
        if (count == 0) {
            location.reload();
        }
        ctx.clearRect(50, 50, canvas.width - 50, canvas.height - 130);
        console.log("debugging...");
        writeText("GAME OVER", canvas.width/3, canvas.height/4.50, '#FFFFFF', 36);
        writeText("Your Score: " + score, canvas.width/3, canvas.height/3, '#FFFFFF', 36);
        writeText("Highest Score: " + localStorage.getItem('HighScore_SI'), canvas.width/4, canvas.height/2.5, '#FFFFFF', 36);
        writeText(" Continue...?", canvas.width/3, canvas.height/2, '#FFFFFF', 36);
        writeText(count, canvas.width/2.1, canvas.height/1.5, '#FFFFFF', 72);
        count--;
    },1000);

}

// Función para escribir en canvas, pasandole el color y la fuente de la letra.
function writeText(text, x, y, color, fontSize) 
{
    if (typeof color !== 'undefined') ctx.fillStyle = color;
    if (typeof fontSize !== 'undefined') ctx.font = fontSize + 'px Arial';
    ctx.fillText(text, x, y);
}
  
// Detecta cuando presionas las teclas.
function keyDownHandler(e) 
{
    if(e.keyCode == 39 || e.keyCode == 68) { // ->, D
        rightPressed = true;

    } else if (e.keyCode == 37 || e.keyCode == 65) { // <-, A
        leftPressed = true;

    } else if (e.keyCode == 32 || e.keyCode == 77) { // Space, M

        if (!spacePressed) {
            spacePressed = true;
            shotX = shipX + shipWidth/2;
            shotY = canvas.height-shipHeight*4 - 10;
        }
    } else if (e.keyCode == 13) { // Enter

        if (!enterPressed) {
            startGame();

        }

        enterPressed = true;

    }

}

// Detecta cuando sueltas las teclas
function keyUpHandler(e) 
{
    if(e.keyCode == 39 || e.keyCode == 68) { // ->, D
        rightPressed = false;

    } else if (e.keyCode == 37 || e.keyCode == 65) { // <-, A
        leftPressed = false;
    }
}

// Empieza el loop del juego
function startGame(e) 
{
    draw();

    interval = setInterval(moveInvaders, invaderSpeed);
}

// Game Over. Se cancela el loop del juego, sale la pantalla de game over y se calcula el highscore
function gameOver()
{
    clearInterval(interval);
    window.cancelAnimationFrame(requestAnimation);

    drawGameOverScreen();

    if (localStorage.getItem('HighScore_SI') == null || localStorage.getItem('HighScore_SI') < score) {

        localStorage.setItem('HighScore_SI', score);
    } 
    
}