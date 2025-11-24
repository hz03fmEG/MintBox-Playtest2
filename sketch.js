// ========================================================
// TOUCH CONTROLLED MINT GAME — CATCH THE FALLING CLOVES
// ========================================================

// Mint GIFs
let idleGif;
let movingGif;
let currentGif;

// Mint box position
let mintX;
let mintY;
let targetX;
let targetY;

let moveSpeed = 0.05;
let mintRotation = 0;
let mintScale = 1.2;

// Cloves
let cloves = [];
let cloveSpeed = 6;
let score = 0;
let cloveImg;

function preload() {
    idleGif = loadImage("idle_mint.gif");
    movingGif = loadImage("moving_mint.gif");
    cloveImg = loadImage("clove.png");
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    // start mint at bottom center
    mintX = width / 2;
    mintY = height - 150;

    // start target same place
    targetX = mintX;
    targetY = mintY;

    currentGif = idleGif;

    spawnClove();
}

function draw() {
    background(0);

    // --------------------------
    // MINT MOVEMENT
    // --------------------------
    let angleToTarget = atan2(targetY - mintY, targetX - mintX);

    mintX = lerp(mintX, targetX, moveSpeed);
    mintY = lerp(mintY, targetY, moveSpeed);

    mintRotation = angleToTarget;

    let distance = dist(mintX, mintY, targetX, targetY);

    if (distance > 5) {
        currentGif = movingGif;
    } else {
        currentGif = idleGif;
    }

    // --------------------------
    // DRAW MINT BOX
    // --------------------------
    push();
    translate(mintX, mintY);
    rotate(mintRotation);
    imageMode(CENTER);
    image(currentGif, 0, 0, 200 * mintScale, 200 * mintScale);
    pop();

    // --------------------------
    // UPDATE FALLING CLOVES
    // --------------------------
    for (let i = cloves.length - 1; i >= 0; i--) {
        let c = cloves[i];

        image(cloveImg, c.x, c.y, 60, 60);
        c.y += cloveSpeed;

        // Catch detection
        if (dist(c.x, c.y, mintX, mintY) < 80) {
            score++;
            cloves.splice(i, 1);
            spawnClove();
        }

        // Missed
        if (c.y > height + 50) {
            cloves.splice(i, 1);
            spawnClove();
        }
    }

    // --------------------------
    // UI
    // --------------------------
    fill(255);
    textSize(32);
    textAlign(LEFT, TOP);
    text("Score: " + score, 20, 20);
}

// ========================================================
// Spawn a falling clove
// ========================================================
function spawnClove() {
    cloves.push({
        x: random(50, width - 50),
        y: -40
    });
}

// ========================================================
// Touch controls — move mint box
// ========================================================
function touchStarted() {
    if (touches.length > 0) {
        targetX = touches[0].x;
        targetY = touches[0].y;
    }
    currentGif = movingGif;
    return false;
}

function touchMoved() {
    if (touches.length > 0) {
        targetX = touches[0].x;
        targetY = touches[0].y;
    }
    return false;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
