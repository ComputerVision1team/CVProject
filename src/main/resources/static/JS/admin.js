let socket;

function setupWebSocket() {
    socket = new WebSocket('ws://localhost:8080/ws');
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'alert') {
            showAlert(data.message);
        } else if (data.type === 'chat') {
            openChat(data.userId);
        }
    };
}

function showAlert(message) {
    const alertBox = document.getElementById('alert-box');
    alertBox.textContent = message;
    alertBox.style.display = 'block';
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
}

function openChat(userId) {
    const chatBox = document.getElementById('chat-box');
    chatBox.style.display = 'block';
    document.getElementById('chat-input').dataset.userId = userId;
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