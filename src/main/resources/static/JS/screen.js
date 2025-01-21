//'use strict';
//
//// On this codelab, you will be streaming only video (video: true).
//const mediaStreamConstraints = {
//  video: true,
//};
//
//
//const videoElements = [document.getElementById('video1')];
//
//// Local streams that will be reproduced on the video elements.
//let localStreams = [];
//
//// Handles success by adding the MediaStream to the video elements.
//function gotLocalMediaStream(mediaStream, index) {
//  localStreams[index] = mediaStream;
//  videoElements[index].srcObject = mediaStream;
//}
//
//// Handles error by logging a message to the console with the error message.
//function handleLocalMediaStreamError(error) {
//  console.log('navigator.getUserMedia error: ', error);
//}
//
//// Initializes media streams for each video element.
//videoElements.forEach((videoElement, index) => {
//  navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
//    .then((mediaStream) => gotLocalMediaStream(mediaStream, index))
//    .catch(handleLocalMediaStreamError);
//});
//
//
//
//function setupWebSocket() {
//    socket = new WebSocket('ws://localhost:8080/ws');
//    socket.onmessage = (event) => {
//        const data = JSON.parse(event.data);
//        if (data.type === 'alert') {
//            showAlert(data.message);
//        } else if (data.type === 'chat') {
//            openChat(data.userId);
//        }
//    };
//}
//
//function showAlert(message) {
//    const alertBox = document.getElementById('alert-box');
//    alertBox.textContent = message;
//    alertBox.style.display = 'block';
//    setTimeout(() => {
//        alertBox.style.display = 'none';
//    }, 5000);
//}
//
//function openChat(userId) {
//    const chatBox = document.getElementById('chat-box');
//    chatBox.style.display = 'block';
//    document.getElementById('chat-input').dataset.userId = userId;
//}
//
//document.getElementById('chat-input').addEventListener('keypress', (event) => {
//    if (event.key === 'Enter') {
//        const message = event.target.value;
//        const userId = event.target.dataset.userId;
//        socket.send(JSON.stringify({ type: 'chat', userId, message }));
//        event.target.value = '';
//    }
//});
//setupWebSocket();



//// Video element where stream will be placed.
//const localVideo = document.querySelector('video');
//
//// Local stream that will be reproduced on the video.
//let localStream;
//
//// Handles success by adding the MediaStream to the video element.
//function gotLocalMediaStream(mediaStream) {
//  localStream = mediaStream;
//  localVideo.srcObject = mediaStream;
//}
//
//// Handles error by logging a message to the console with the error message.
//function handleLocalMediaStreamError(error) {
//  console.log('navigator.getUserMedia error: ', error);
//}
//
//// Initializes media stream.
//navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
//  .then(gotLocalMediaStream).catch(handleLocalMediaStreamError);

'use strict';

const video = document.getElementById('webcam');
const canvas = document.getElementById('overlay');
const context = canvas.getContext('2d');
let warningCount = 0;

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

        drawEye(leftEye, 'blue');
        drawEye(rightEye, 'green');

        checkGazeOutOfBounds(leftEye, rightEye);
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

function drawEye(coordinates, color) {
    context.beginPath();
    context.arc(coordinates.x, coordinates.y, 5, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
}

function checkGazeOutOfBounds(leftEye, rightEye) {
    const leftBoundary = 200;
    const rightBoundary = canvas.width - 200;

    if ((leftEye.x < leftBoundary || rightEye.x > rightBoundary) && warningCount < 3) {
        warningCount++;
        showAlert(`경고 ${warningCount}회`);
        handleWarning(warningCount);
    }
}

function showAlert(message) {
    const warningMessage = document.getElementById('warning-message');
    warningMessage.textContent = message;
    warningMessage.style.display = 'block';
    setTimeout(() => {
        warningMessage.style.display = 'none';
    }, 3000);
}

function handleWarning(count) {
    const webcam = document.getElementById('webcam');

    if (count === 2) {
        webcam.classList.add('warning-border-2');
    } else if (count >= 3) {
        webcam.classList.remove('warning-border-2');
        webcam.classList.add('warning-border-3');
        document.body.classList.add('disabled');
    }
}

async function main() {
    await setupWebcam();
    setInterval(() => faceMesh.send({ image: video }), 1000); // 1초마다 시선 감지
}

main();