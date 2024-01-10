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
  const labels = ["Einstein", "Milana", "Obama", "Kim", "Elon"];
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
const detectedPeople = new Set();

function startFaceDetection() {
  console.log("startFaceDetection");
  const labeledFaceDescriptors = loadLabeledImages();

  labeledFaceDescriptors.then((descriptors) => {
    const faceMatcher = new faceapi.FaceMatcher(descriptors);
    
    const canvas = faceapi.createCanvasFromMedia(video);
    const canvasContainer = document.querySelector(".video-item.canvas-container");

    canvasContainer.appendChild(canvas);
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
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

      const attendanceMessage = document.getElementById("attendanceMessage"); 

      // Teken het detecteren gezicht
      results.forEach((result, index) => {
        const box = resizeDetections[index].detection.box;
        
        const drawBox = new faceapi.draw.DrawBox(box, { label: result, fontsize: 50, boxColor: 'green', drawLabelOptions: { fontSize: 40, textColor: 'green' } });
        drawBox.draw(canvas);

        if (result._distance < 50) {
          // Display the label with the attendance message
          const label = result.label;
          if (!detectedPeople.has(label)) {
          const text = `${label} is attending the class`;
          // Display the text near the detected face
          attendanceMessage.innerHTML += `<p>${text}</p>`;
          detectedPeople.add(label);
        }
      }
      });
    }, 100);
  });
}

function stopFaceDetection() {
  console.log("stopFaceDetection");
  clearInterval(faceDetectionInterval);
  const canvas = document.querySelector('.video-item.canvas-container canvas');
  if (canvas) {
    canvas.parentNode.removeChild(canvas);
  }
  const attendanceMessage = document.getElementById("attendanceMessage");
  const stopMessage = document.createElement('p');
  stopMessage.textContent = 'Detecting complete';
  stopMessage.style.fontWeight = 'bold';  
  attendanceMessage.appendChild(stopMessage);
}