let socket;
const userStreams = {};

function setupWebSocket() {
    socket = new WebSocket('ws://localhost:8080/ws');
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'webcam') {
        // 어떤 데이터가 전달되었는지 확인하기 위해 콘솔에 출력
//        console.log(data);
            displayWebcamStream(data.userId, data.image);
        } else if (data.type === 'chat') {
            displayChatMessage(data.userId, data.message);
        } else if (data.type === 'openChat') {
            openChat(data.userId);
        } else if (data.type === 'warning') {
            handleWarning(data.count);
        } else if (data.type === 'warningImage') {
            displayWarningImage(data.image);
        }
    };
}

function openChat(userId) {
    const chatBox = document.getElementById('chat-box');
    chatBox.style.display = 'block';
    const chatHeader = document.querySelector('.chat-header');
    chatHeader.textContent = `Chat with User ${userId}`;
}

function displayWebcamStream(userId, image) {
    if (!userStreams[userId]) {
        const videoContainer = document.createElement('div');
        videoContainer.id = `user-${userId}`;
        videoContainer.classList.add('video-container');
        videoContainer.innerHTML = `
            <div class="text-wrapper">User ID: ${userId}</div>
            <img id="webcam-${userId}" class="video1" />
        `;
        document.querySelector('.admin-screen .overlap-group').appendChild(videoContainer);
        userStreams[userId] = true;
    }
    const videoElement = document.getElementById(`webcam-${userId}`);
    videoElement.src = image;
}

function displayChatMessage(userId, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = `User ${userId}: ${message}`;
    chatMessages.appendChild(messageElement);
}

document.getElementById('chat-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const message = event.target.value;
        const userId = event.target.dataset.userId;
        socket.send(JSON.stringify({ type: 'chat', userId, message }));
        event.target.value = '';
    }
});
function handleWarning(count) {
    captureWarningImage();
    const webcam = document.getElementById('.video1');

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
function increaseWarning() {
    warningCount++;
    handleWarning(warningCount);
}

setupWebSocket();