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

// ==============================================
// FACEMESH PARAMETERS
// ==============================================
let SHOW_VIDEO = true;
let SHOW_ALL_KEYPOINTS = false;
let TRACKED_KEYPOINT_INDEX = 1;  // 1 = nose tip
let CURSOR_SIZE = 30;
let CURSOR_COLOR = [255, 50, 50];
let KEYPOINT_SIZE = 3;

// ==============================================
// GLOBAL VARIABLES
// ==============================================
let cam;
let facemesh;
let faces = [];
let cursor;
let cameraReady = false;

let NosePositions;

// ==============================================
// PRELOAD
// ==============================================
function preload() {
    idleGif = loadImage("./idle_mint.gif");
    movingGif = loadImage("./moving_mint.gif");
    cloveImg = loadImage("./clove.png");
}

// ==============================================
// SETUP
// ==============================================
function setup() {
    NosePositions = {
        x: 0,
        y: 0,
        z: 0
    };
    
    // Initialize cursor object
    cursor = {
        x: 320,
        y: 240,
        z: 0
    };
    
    createCanvas(windowWidth, windowHeight);
  
    // Create camera: front-facing, mirrored
    let constraints = {
        video: {
            facingMode: 'user'  // 'user' = front camera
        },
        audio: false
    };
    
    cam = createCapture(constraints, videoReady);
    cam.size(640, 480);
    cam.hide();  // Hide default video element

    // start mint at bottom center
    mintX = width / 2;
    mintY = height - 150;

    // start target same place
    targetX = mintX;
    targetY = mintY;

    currentGif = idleGif;

    spawnClove();
}

// ==============================================
// VIDEO READY CALLBACK
// ==============================================
function videoReady() {
    cameraReady = true;
    
    // Configure ML5 FaceMesh AFTER camera is ready
    let options = {
        maxFaces: 1,
        refineLandmarks: false,
        runtime: 'mediapipe',
        flipHorizontal: false
    };
    
    // Create FaceMesh model
    facemesh = ml5.faceMesh(options, modelReady);
}

// ==============================================
// MODEL READY CALLBACK
// ==============================================
function modelReady() {
    console.log('FaceMesh model loaded!');
    // Start detection
    facemesh.detectStart(cam.elt, gotFaces);
}

// ==============================================
// GOT FACES CALLBACK
// ==============================================
function gotFaces(results) {
    faces = results;
}

// ==============================================
// DRAW LOOP
// ==============================================
function draw() {
    background(0);

    // Process face tracking and update cursor position
    if (faces.length > 0) {
        let face = faces[0];
        
        if (face.keypoints && face.keypoints.length > 0) {
            // Get nose tip keypoint (index 1)
            let noseKeypoint = face.keypoints[TRACKED_KEYPOINT_INDEX];
            
            if (noseKeypoint) {
                // Map keypoint to canvas coordinates
                let x, y, z;
                
                // Check if coordinates are normalized (0-1) or pixels
                if (noseKeypoint.x <= 1 && noseKeypoint.y <= 1) {
                    // Normalized coordinates
                    x = noseKeypoint.x * width;
                    y = noseKeypoint.y * height;
                } else {
                    // Pixel coordinates - scale to canvas
                    x = map(noseKeypoint.x, 0, cam.width, 0, width);
                    y = map(noseKeypoint.y, 0, cam.height, 0, height);
                }
                
                // Flip x coordinate for mirror effect
                x = width - x;
                z = noseKeypoint.z || 0;
                
                // Update cursor object
                cursor = { x, y, z };
                
                // Set mint target to nose position
                targetX = x;
            }
        }
    }

    // Share cursor position with other modules
    if (cursor) {
        NosePositions = {
            x: cursor.x,
            y: cursor.y,
            z: cursor.z
        };
    }

    // MINT MOVEMENT
    let angleToTarget = atan2(targetY - mintY, targetX - mintX);
    mintX = lerp(mintX, targetX, moveSpeed);
    mintRotation = angleToTarget;
    currentGif = dist(mintX, mintY, targetX, targetY) > 5 ? movingGif : idleGif;

    // DRAW MINT BOX
    push();
    translate(mintX, mintY);
    rotate(mintRotation);
    imageMode(CENTER);
    image(currentGif, 0, 0, 200 * mintScale, 200 * mintScale);
    pop();

    // Falling cloves
    for (let i = cloves.length - 1; i >= 0; i--) {
        let c = cloves[i];
        image(cloveImg, c.x, c.y, 60, 60);
        c.y += cloveSpeed;

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

    // UI
    fill(255);
    textSize(32);
    textAlign(LEFT, TOP);
    text("Score: " + score, 20, 20);

    // Show camera feed in corner
    if (SHOW_VIDEO && cameraReady) {
        image(cam, 0, 0, width/4, height/4);
    }
    
    // Draw cursor indicator
    if (cursor && faces.length > 0) {
        push();
        fill(CURSOR_COLOR[0], CURSOR_COLOR[1], CURSOR_COLOR[2], 150);
        noStroke();
        ellipse(cursor.x, cursor.y, 20, 20);
        pop();
    }
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
// Window Resize
// ========================================================
function windowResized() {
    resizeCanvas(640, 480);
}