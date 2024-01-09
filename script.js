const video = document.getElementById("video");

// Laden van de modellen
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/weights"),
    faceapi.nets.ssdMobilenetv1.loadFromUri("/weights"), 
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

  //laden van fotos
  function loadLabeledImages() {
    const labels = ["Data", "Milana", "Obama"];
    return Promise.all(
      labels.map(async (label) => {
        const descriptions = [];
        for (let i = 1; i <= 2; i++) {
          // door alle fotos gaan
          const img = await faceapi.fetchImage(`./labels/${label}/${i}.jpeg`);
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
          descriptions.push(detections.descriptor);
        }
  
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  }

  video.addEventListener("play", async () => {
    console.log("play")
    const labeledFaceDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
    
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    // Speel de code af elke 100ms
    setInterval(async () => {
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
      const drawBox = new faceapi.draw.DrawBox(box, { label: result});
     //faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
      drawBox.draw(canvas);
    });
  }, 100);
});

  /*async function detectFaces() {
    const labeledFaceDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

    video.addEventListener("play", async () => {
      console.log("play")
      const canvas = faceapi.createCanvasFromMedia(video);
      document.body.append(canvas);

      const displaySize = { width: video.width, height: video.height };
      faceapi.matchDimensions(canvas, displaySize);

      // Speel de code af elke 100ms
      setInterval(async () => {
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
        const drawBox = new faceapi.draw.DrawBox(box, { label: result});
       faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
        drawBox.draw(canvas);
      });
    }, 100);
  });
  }*/

 /* video.addEventListener("play", () => {
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
  });*/