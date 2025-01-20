'use strict';

// On this codelab, you will be streaming only video (video: true).
const mediaStreamConstraints = {
  video: true,
};


const videoElements = [document.getElementById('video1'), document.getElementById('video2')];

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