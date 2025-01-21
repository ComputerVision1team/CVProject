'use strict';

// On this codelab, you will be streaming only video (video: true).
const mediaStreamConstraints = {
  video: true,
};


const videoElements = [document.getElementById('video1')];

// Local streams that will be reproduced on the video elements.
let localStreams = [];

// Handles success by adding the MediaStream to the video elements.
function gotLocalMediaStream(mediaStream, index) {
  localStreams[index] = mediaStream;
  videoElements[index].srcObject = mediaStream;
}

// Handles error by logging a message to the console with the error message.
function handleLocalMediaStreamError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

// Initializes media streams for each video element.
videoElements.forEach((videoElement, index) => {
  navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
    .then((mediaStream) => gotLocalMediaStream(mediaStream, index))
    .catch(handleLocalMediaStreamError);
});



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