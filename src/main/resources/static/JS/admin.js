let socket;
const userStreams = {};

function setupWebSocket() {
    socket = new WebSocket('ws://localhost:8080/ws');
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'webcam') {
            displayWebcamStream(data.userId, data.image);
        } else if (data.type === 'chat') {
            displayChatMessage(data.userId, data.message);
        } else if (data.type === 'openChat') {
            openChat(data.userId);
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

setupWebSocket();