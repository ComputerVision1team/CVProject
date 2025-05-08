'use strict';

const video = document.getElementById('webcam');
const warningMessage = document.getElementById('warning-message');
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
document.body.appendChild(canvas);

// MediaPipe Face Mesh 초기화
const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});
faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

// 웹캠 초기화
async function setupWebcam() {
    return new Promise((resolve, reject) => {
        const navigatorAny = navigator;
        navigator.getUserMedia = navigator.getUserMedia ||
            navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
            navigatorAny.msGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia(
                { video: true },
                stream => {
                    video.srcObject = stream;
                    video.addEventListener('loadeddata', () => resolve(), false);
                },
                error => reject(error)
            );
        } else {
            reject();
        }
    });
}

// 랜드마크 인덱스
const leftPupilIndices = [468, 469, 470, 471, 472];
const rightPupilIndices = [473, 474, 475, 476, 477];

function onResults(results) {
    if (!results.multiFaceLandmarks) {
        return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    for (const landmarks of results.multiFaceLandmarks) {
        const leftEye = getAverageCoordinates(landmarks, leftPupilIndices);
        const rightEye = getAverageCoordinates(landmarks, rightPupilIndices);

        drawLine(leftEye, rightEye);
    }
}

function getAverageCoordinates(landmarks, indices) {
    let x = 0, y = 0;
    for (const i of indices) {
        x += landmarks[i].x * video.videoWidth;
        y += landmarks[i].y * video.videoHeight;
    }
    return { x: x / indices.length, y: y / indices.length };
}

function drawLine(start, end) {
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.strokeStyle = 'red';
    context.lineWidth = 2;
    context.stroke();
}

async function main() {
    await setupWebcam();
    setInterval(() => faceMesh.send({ image: video }), 1000); // 1초마다 시선 감지
}

main();