const video = document.getElementById("video");

// Laden van de modellen
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/weights"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/weights"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/weights"), 
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
    faceapi.matchDimensions(canvas, {height: video.height, width: video.width});

    // Speel de code af elke 100ms
    setInterval(async () =>{
      try {

      const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()

      const resizeDetections = faceapi.resizeResults(detections, {height: video.height, width: video.width})

      console.log(detections)
      // Maak de canvas leeg
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      // Teken het detecteren gezicht
      faceapi.draw.drawDetections(canvas, resizeDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
      
    } catch (error) {
      console.error("Error during face detection:", error);
    }
  }, 100);
  });