const video = document.getElementById("video");

// Laden van de modellen
Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri("/weights"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/weights"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/weights"),
  ]).then(startWebcam);
  

//Toegang krijgen tot camera
function startWebcam() {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: false,
      })
      .then((stream) => {
        video.srcObject = stream;
      })
      .catch((error) => {
        console.error(error);
      });
  }