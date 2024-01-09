const video = document.getElementById("video");
const startButton = document.getElementById("startButton");

let isDetecting = false;
let faceDetectionInterval;

 // Laden van de modellen
 Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/weights"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/weights"), 
  faceapi.nets.faceLandmark68Net.loadFromUri("/weights"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/weights"), 
]).then(() => {
  startWebcam();
  startButton.textContent = "Start Detecting";
});

startButton.addEventListener("click", () => {
  if (!isDetecting) {
    startFaceDetection();
    startButton.textContent = "Stop Detecting";
  } else {
    stopFaceDetection();
    startButton.textContent = "Start Detecting";
  }

  isDetecting = !isDetecting;
});


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

function loadLabeledImages() {
  const labels = ["Data", "Milana", "Obama"];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`./labels/${label}/${i}.jpeg`);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

function startFaceDetection() {
  console.log("startFaceDetection");
  const labeledFaceDescriptors = loadLabeledImages();

  labeledFaceDescriptors.then((descriptors) => {
    const faceMatcher = new faceapi.FaceMatcher(descriptors);
    
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    // Speel de code af elke 100ms
    faceDetectionInterval = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizeDetections = faceapi.resizeResults(detections, displaySize);

      //Map de detection en vind de beste match
      const results = resizeDetections.map((d) => {
        return faceMatcher.findBestMatch(d.descriptor);
      });

      // Maak de canvas leeg
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      // Teken het detecteren gezicht
      results.forEach((result, index) => {
        const box = resizeDetections[index].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, { label: result });
        drawBox.draw(canvas);
      });
    }, 100);
  });
}

function stopFaceDetection() {
  console.log("stopFaceDetection");
  clearInterval(faceDetectionInterval);
  const canvas = document.querySelector('canvas');
  if (canvas) {
    document.body.removeChild(canvas);
  }
}