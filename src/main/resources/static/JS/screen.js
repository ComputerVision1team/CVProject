// src/main/resources/static/JS/screen.js

'use strict';

const video = document.getElementById('webcam');
const canvas = document.getElementById('overlay');
const context = canvas.getContext('2d');
let warningCount = 0;
let socket;
const warningImages = [];

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
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });

        video.srcObject = stream;
        await new Promise(resolve => video.onloadedmetadata = resolve);
        video.play();

//        console.log('Webcam initialized:', {
//            width: video.videoWidth,
//            height: video.videoHeight
//        });

        sendWebcamStream(); // 웹캠 스트림 전송 시작

        return true;
    } catch (error) {
        console.error('Webcam setup failed with modern API:', error);

        // Fallback to older getUserMedia method
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
                        video.addEventListener('loadeddata', () => {
                            video.play();
                            sendWebcamStream(); // 웹캠 스트림 전송 시작
                            resolve(true);
                        }, false);
                    },
                    error => {
                        console.error('Webcam setup failed with fallback method:', error);
                        reject(false);
                    }
                );
            } else {
                reject(false);
            }
        });
    }
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
        captureScreen(); // 화면 캡처 함수 호출
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
    captureWarningImage();
    const webcam = document.getElementById('webcam');

    if (count === 2) {
        webcam.classList.add('warning-border-2');
    } else if (count >= 3) {
        webcam.classList.remove('warning-border-2');
        webcam.classList.add('warning-border-3');
        document.body.classList.add('hidden-elements');
        document.getElementById('disqualified-message').style.display = 'block';
        document.getElementById('chat-box').style.display = 'block';
        document.getElementById('view-warning').style.display = 'block';
        openChat(); // 경고 3회 시 자동으로 채팅 열기
    }
}

function openChat() {
    const chatBox = document.getElementById('chat-box');
    chatBox.style.display = 'block';
    if (!socket) {
        setupWebSocket();
    }
    socket.send(JSON.stringify({ type: 'openChat', userId: '18010871' }));
}

function setupWebSocket() {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        socket = new WebSocket('ws://localhost:8080/ws');
        socket.onopen = () => {
            console.log('WebSocket connection established');
        };
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'chat') {
                displayChatMessage(data.userId, data.message);
            } else if (data.type === 'openChat') {
                openChat(data.userId);
            } else if (data.type === 'webcam') {
                displayWebcamStream(data.userId, data.image);
            } else if (data.type === 'warningImages') {
                warningImages.push(...data.images);
            } else if (data.type === 'captureData') {
                console.log('Capture data received:', data);
            } else if (data.type === 'warning') {
                increaseWarning();
            }
        };
        socket.onclose = () => {
            console.log('WebSocket connection closed, retrying...');
            setTimeout(setupWebSocket, 1000); // 1초 후 재연결 시도
        };
        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            socket.close();
        };
    }
}

function displayChatMessage(userId, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = `User ${userId}: ${message}`;
    chatMessages.appendChild(messageElement);
}

function sendMessage(event) {
    if (event.key === 'Enter') {
        const message = event.target.value;
        const userId = '18010871'; // 실제 사용자 ID로 변경
        socket.send(JSON.stringify({ type: 'chat', userId, message }));
        event.target.value = '';
    }
}

function sendWebcamStream() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    setInterval(() => {
        try {
            if (socket.readyState === WebSocket.OPEN) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL('image/jpeg');
                if (imageData && imageData !== 'data:,') {
                    socket.send(JSON.stringify({ type: 'webcam', image: imageData, userId: '18010871' }));
                } else {
                    console.warn('Captured image data is empty.');
                }
            } else {
                console.warn('WebSocket is not open. Skipping frame.');
            }
        } catch (error) {
            console.error('Error capturing or sending webcam stream:', error);
        }
    }, 1000 / 30); // 10 FPS
}

function captureScreen() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const screenshot = canvas.toDataURL('image/png');
    const timestamp = new Date().toISOString();

    // 서버로 캡처 데이터 전송
    sendCaptureData({ screenshot, timestamp, warningCount });
}

async function sendCaptureData(data) {
    try {
        const response = await fetch('/capture-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    } catch (error) {
        console.error('Error sending capture data:', error);
    }
}

function captureWarningImage() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/png');
    warningImages.push(image);
}

function viewWarningImages() {
    const warningImages = getWarningImages(); // 경고 이미지 가져오기
    if (warningImages.length > 0) {
        const imageWindow = window.open('', '_blank');
        warningImages.slice(-3).forEach((image, index) => {
            imageWindow.document.write(`<img src="${image}" alt="Warning ${index + 1}"><br>`);
        });
    } else {
        alert('No warning images available.');
    }
}

async function getWarningImages() {
    try {
        const response = await fetch('/warning-images', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const warningImages = await response.json();
            return warningImages;
        } else {
            console.error('Failed to fetch warning images:', response.statusText);
            return [];
        }
    } catch (error) {
        console.error('Error fetching warning images:', error);
        return [];
    }
}

function increaseWarning() {
    warningCount++;
    handleWarning(warningCount);
}

async function main() {
    await setupWebcam();
    setInterval(() => faceMesh.send({ image: video }), 700); // 0.7초마다 시선 감지
}

setupWebSocket();
sendWebcamStream();
main();