//'use strict';
//
//const video = document.getElementById('webcam');
//const canvas = document.getElementById('overlay');
//const context = canvas.getContext('2d');
//let warningCount = 0;
//let socket;
//
//// MediaPipe Face Mesh 초기화
//const faceMesh = new FaceMesh({
//    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
//});
//faceMesh.setOptions({
//    maxNumFaces: 1,
//    refineLandmarks: true,
//    minDetectionConfidence: 0.5,
//    minTrackingConfidence: 0.5
//});
//faceMesh.onResults(onResults);
//
//// 웹캠 초기화
//async function setupWebcam() {
//    return new Promise((resolve, reject) => {
//        const navigatorAny = navigator;
//        navigator.getUserMedia = navigator.getUserMedia ||
//            navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
//            navigatorAny.msGetUserMedia;
//        if (navigator.getUserMedia) {
//            navigator.getUserMedia(
//                { video: true },
//                stream => {
//                    video.srcObject = stream;
//                    video.addEventListener('loadeddata', () => resolve(), false);
//                },
//                error => reject(error)
//            );
//        } else {
//            reject();
//        }
//    });
//}
//
//// 랜드마크 인덱스
//const leftPupilIndices = [468, 469, 470, 471, 472];
//const rightPupilIndices = [473, 474, 475, 476, 477];
//
//function onResults(results) {
//    if (!results.multiFaceLandmarks) {
//        return;
//    }
//
//    context.clearRect(0, 0, canvas.width, canvas.height);
//    canvas.width = video.videoWidth;
//    canvas.height = video.videoHeight;
//
//    for (const landmarks of results.multiFaceLandmarks) {
//        const leftEye = getAverageCoordinates(landmarks, leftPupilIndices);
//        const rightEye = getAverageCoordinates(landmarks, rightPupilIndices);
//
//        drawEye(leftEye, 'blue');
//        drawEye(rightEye, 'green');
//
//        checkGazeOutOfBounds(leftEye, rightEye);
//    }
//}
//
//function getAverageCoordinates(landmarks, indices) {
//    let x = 0, y = 0;
//    for (const i of indices) {
//        x += landmarks[i].x * video.videoWidth;
//        y += landmarks[i].y * video.videoHeight;
//    }
//    return { x: x / indices.length, y: y / indices.length };
//}
//
//function drawEye(coordinates, color) {
//    context.beginPath();
//    context.arc(coordinates.x, coordinates.y, 5, 0, 2 * Math.PI);
//    context.fillStyle = color;
//    context.fill();
//}
//
//function checkGazeOutOfBounds(leftEye, rightEye) {
//    const leftBoundary = 250;
//    const rightBoundary = canvas.width - 250;
//
//    if ((leftEye.x < leftBoundary || rightEye.x > rightBoundary) && warningCount < 3) {
//        warningCount++;
//        showAlert(`경고 ${warningCount}회`);
//        handleWarning(warningCount);
//    }
//}
//
//function showAlert(message) {
//    const warningMessage = document.getElementById('warning-message');
//    warningMessage.textContent = message;
//    warningMessage.style.display = 'block';
//    setTimeout(() => {
//        warningMessage.style.display = 'none';
//    }, 3000);
//}
//
//function handleWarning(count) {
//    const webcam = document.getElementById('webcam');
//
//    if (count === 2) {
//        webcam.classList.add('warning-border-2');
//    } else if (count >= 3) {
//        webcam.classList.remove('warning-border-2');
//        webcam.classList.add('warning-border-3');
//        document.body.classList.add('disabled');
//    }
//}
//
//function openChat() {
//    const chatBox = document.getElementById('chat-box');
//    chatBox.style.display = 'block';
//    if (!socket) {
//        setupWebSocket();
//    }
//}
//
//function setupWebSocket() {
//    socket = new WebSocket('ws://localhost:8080/ws');
//    socket.onmessage = (event) => {
//        const chatMessages = document.getElementById('chat-messages');
//        const message = document.createElement('div');
//        message.textContent = event.data;
//        chatMessages.appendChild(message);
//    };
//
//    const chatInput = document.getElementById('chat-input');
//    chatInput.addEventListener('keypress', (event) => {
//        if (event.key === 'Enter') {
//            const message = chatInput.value;
//            socket.send(message);
//            chatInput.value = '';
//        }
//    });
//}
//
//document.getElementById('gesture-1').addEventListener('click', () => {
//    showAlert('응시자 장비 이슈');
//    openChat();
//});
//
//document.getElementById('gesture-2').addEventListener('click', () => {
//    showAlert('인터넷 연결 이슈');
//    openChat();
//});
//
//document.getElementById('gesture-3').addEventListener('click', () => {
//    showAlert('기타 이슈');
//    openChat();
//});
//
//async function main() {
//    await setupWebcam();
//    setInterval(() => faceMesh.send({ image: video }), 500); // 0.5초마다 시선 감지
//}
//
//main();

'use strict';

const video = document.getElementById('webcam');
const canvas = document.getElementById('overlay');
const context = canvas.getContext('2d');
let warningCount = 0;
let socket;

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
    const leftBoundary = 235;
    const rightBoundary = canvas.width - 235;

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

function openChat() {
    const chatBox = document.getElementById('chat-box');
    chatBox.style.display = 'block';
    if (!socket) {
        setupWebSocket();
    }
}

function setupWebSocket() {
    socket = new WebSocket('ws://localhost:8080/ws');
    socket.onmessage = (event) => {
        const chatMessages = document.getElementById('chat-messages');
        const message = document.createElement('div');
        message.textContent = event.data;
        chatMessages.appendChild(message);
    };

    const chatInput = document.getElementById('chat-input');
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const message = chatInput.value;
            socket.send(message);
            chatInput.value = '';
        }
    });
}

document.getElementById('gesture-1').addEventListener('click', () => {
    showAlert('응시자 장비 이슈');
    openChat();
});

document.getElementById('gesture-2').addEventListener('click', () => {
    showAlert('인터넷 연결 이슈');
    openChat();
});

document.getElementById('gesture-3').addEventListener('click', () => {
    showAlert('기타 이슈');
    openChat();
});

async function main() {
    await setupWebcam();
    setInterval(() => faceMesh.send({ image: video }), 700); // 0.5초마다 시선 감지
}

main();