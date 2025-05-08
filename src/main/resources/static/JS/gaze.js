let model;
const video = document.getElementById('webcam');

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

async function loadModel() {
    try {
        model = await tf.loadLayersModel('/resources/gaze_detector_model.json');
        console.log('Model loaded successfully');
    } catch (error) {
        console.error('Error loading model:', error);
    }
}

const userId = 'user1'; // Replace with the actual user ID

async function sendGazeData(data) {
    data.userId = userId;
    const response = await fetch('/gaze-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
}
async function detectGaze() {
    const predictions = await model.predict(tf.browser.fromPixels(video));
    const gazeOutside = predictions.some(prediction => prediction < 0.5);

    if (gazeOutside) {
        const canvas = document.createElement('warnings');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const capture = canvas.toDataURL('image/png');
        const time = new Date().toISOString();
        const warningcount = predictions.length;

        const data = { warningcount, time, capture };
        await sendGazeData(data);
    }
}

async function main() {
    try {
        await setupWebcam();
        await loadModel();
        setInterval(detectGaze, 1000); // 1초마다 시선 감지
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

main();