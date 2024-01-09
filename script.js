const video = document.getElementById("video");

// Laden van de modellen
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/weights"),
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

  video.addEventListener("play", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    // Speel de code af elke 100ms
    setInterval(async () =>{
      try {

      const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    } catch (error) {
      console.error("Error during face detection:", error);
    }
  }, 100);
  });