let video;
let poseNet;
let pose;

let start = 30;
let target = 100;
let diameter = start;
let light = 255;
let dark = 100;
let hueValue = light;
let lerpAmt = 0.3;
let state = "ascending";

let cols;
let rows;
let current;
let previous;

let dampening = 0.99;

function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.hide();

    poseNet = ml5.poseNet(video, modelReady);
    poseNet.on("pose", gotPoses);

    cols = width;
    rows =  height;
    console.log(width, height)
    current = new Array(cols).fill(0).map((n) => new Array(rows).fill(0));
    previous = new Array(cols).fill(0).map((n) => new Array(rows).fill(0));
}

function modelReady() {
    console.log("Model is ready");
}

function gotPoses(poses) {
    if (poses.length > 0) {
        pose = poses[0].pose;
    }
}

function draw() {
    background(0);
    image(video, 0, 0, width, height);
    video.hide();


    if (pose) {
        drawKeypoints();

        const leftWrist = pose.keypoints[9].position;
        const rightWrist = pose.keypoints[10].position;

        const distance = dist(
            leftWrist.x,
            leftWrist.y,
            rightWrist.x,
            rightWrist.y
        );

        circleSize = map(distance, 0, width, 10, 200);

        drawHand(leftWrist, "blue");
        drawHand(rightWrist, "blue");

        // Redondear las coordenadas de las muñecas y asegurar que estén dentro del rango del canvas
        const leftWristX = Math.min(Math.max(Math.round(leftWrist.x), 1), cols - 2);
        const leftWristY = Math.min(Math.max(Math.round(leftWrist.y), 1), rows - 2);
        const rightWristX = Math.min(Math.max(Math.round(rightWrist.x), 1), cols - 2);
        const rightWristY = Math.min(Math.max(Math.round(rightWrist.y), 1), rows - 2);

        previous[leftWristX][leftWristY] = 2500;
        previous[rightWristX][rightWristY] = 2500;
    }

    loadPixels();
    for (let i = 1; i < cols - 1; i++) {
        for (let j = 1; j < rows - 1; j++) {
            current[i][j] =
                (previous[i - 1][j] +
                    previous[i + 1][j] +
                    previous[i][j - 1] +
                    previous[i][j + 1]) /
                2 -
                current[i][j];
            current[i][j] = current[i][j] * dampening;

            let index = (i + j * cols) * 4;
            pixels[index + 0] = current[i][j];
            pixels[index + 1] = current[i][j];
            pixels[index + 2] = current[i][j];
        }
    }
    updatePixels();

    let temp = previous;
    previous = current;
    current = temp;
}


function drawKeypoints() {
    for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;

        fill(255, 0, 0);
        ellipse(x, y, 16, 16);
    }
}

function drawHand(hand, color) {
    if (state === "ascending") {
        diameter = lerp(diameter, target, lerpAmt);
        hueValue = lerp(hueValue, dark, lerpAmt);
    }

    if (state === "descending") {
        diameter = lerp(diameter, start, lerpAmt);
        hueValue = lerp(hueValue, light, lerpAmt);
    }

    fill(color);
    ellipse(hand.x, hand.y, diameter, diameter);
}
