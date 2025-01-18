// GIF Recording variables
let isRecording = false;
let recordingStartTime = 0;
let RECORDING_DURATION = 4; // Change to allow flexible duration
const createGIFButton = document.getElementById('createGIFButton');
const exportButton = document.getElementById('exportButton');
const recordingStatus = document.getElementById('recordingStatus');
const recordingTimer = document.getElementById('recordingTimer');
const progressBar = document.getElementById('progress-bar');
const modal = document.getElementById("exportModal");
const closeModal = document.getElementsByClassName("close")[0];

// Device-specific dimensions
const DEVICE_DIMENSIONS = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 667 },
  smartwatch: { width: 320, height: 320 }
};

// Update GIF initialization to match frame rate
function initializeGIF(width, height) {
  return new GIF({
    workers: 2,
    quality: 10,
    width: width,
    height: height,
    framerate: 60, // Match your animation framerate
    workerScript: './external_libraries/gif.worker.js'
  });
}


function getDimensions(device, originalWidth, originalHeight) {
  const aspectRatio = originalWidth / originalHeight;

  const targetDimensions = DEVICE_DIMENSIONS[device];
  if (!targetDimensions) {
    return { width: originalWidth, height: originalHeight };
  }

  // Special handling for smartwatch
  if (device === 'smartwatch') {
    const smartwatchSize = 320; // Smartwatch canvas size
    let width, height;

    if (aspectRatio > 1) {
      // Landscape orientation
      width = smartwatchSize;
      height = Math.round(width / aspectRatio);
    } else {
      // Portrait orientation
      height = smartwatchSize;
      width = Math.round(height * aspectRatio);
    }

    return {
      width,
      height,
      isSmartwatch: true,
      containerWidth: smartwatchSize,
      containerHeight: smartwatchSize
    };
  }

  // For other devices, maintain original aspect ratio
  const width = targetDimensions.width;
  const height = Math.round(width / aspectRatio);

  return { width, height };
}

  function startRecording() {
    if (isRecording) return;

    const durationInput = document.getElementById('durationInput').value;
    RECORDING_DURATION = parseInt(durationInput, 10); // Update duration
  
    const exportDevice = document.getElementById('exportDeviceSelect').value;
    const dimensions = getDimensions(
      exportDevice, 
      particleCanvas.width, 
      particleCanvas.height
    );
  
    // Initialize new GIF with correct dimensions
    window.gif = initializeGIF(
      dimensions.isSmartwatch ? dimensions.containerWidth : dimensions.width,
      dimensions.isSmartwatch ? dimensions.containerHeight : dimensions.height
    );
  
    isRecording = true;
    recordingStartTime = Date.now();
    exportButton.style.backgroundColor = '#dc2626';
    exportButton.textContent = 'Creating...';
    exportButton.disabled = true;
    recordingStatus.style.display = 'block';
    recordingTimer.textContent = 0; // Reset the recording timer
  
    // Update recording timer
    const updateTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
      recordingTimer.textContent = elapsed;
  
      if (elapsed >= RECORDING_DURATION) {
        clearInterval(updateTimer);
        startExporting();
      }
    }, 1000);
  
    captureFrames();
  }



let frameCount = 0;
let lastFrameTime = performance.now();
let frameRates = [];
const SAMPLE_SIZE = 60; // Number of frames to average
let measuredFPS = 60; // Default starting value

function updateFrameRate() {
  const currentTime = performance.now();
  const deltaTime = currentTime - lastFrameTime;
  const currentFPS = 1000 / deltaTime;

  frameRates.push(currentFPS);
  if (frameRates.length > SAMPLE_SIZE) {
    frameRates.shift();
  }

  // Calculate average FPS
  measuredFPS = frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length;

  lastFrameTime = currentTime;
  frameCount++;

  // Optional: Display current FPS (for debugging)
  if (frameCount % 10 === 0) { // Update display every 10 frames
    console.log(`Current FPS: ${Math.round(measuredFPS)}`);
  }
}

function captureFrames() {
  if (!isRecording) return;

  const exportDevice = document.getElementById('exportDeviceSelect').value;
  const dimensions = getDimensions(
    exportDevice,
    particleCanvas.width,
    particleCanvas.height
  );

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = dimensions.isSmartwatch ? dimensions.containerWidth : dimensions.width;
  tempCanvas.height = dimensions.isSmartwatch ? dimensions.containerHeight : dimensions.height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.fillStyle = colorPickerBackground.value;
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  if (dimensions.isSmartwatch) {
    // Calculate position to center the animation
    const x = Math.floor((dimensions.containerWidth - dimensions.width) / 2);
    const y = Math.floor((dimensions.containerHeight - dimensions.height) / 2);

    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    tempCtx.drawImage(particleCanvas, x, y, dimensions.width, dimensions.height);
  } else {
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    tempCtx.drawImage(particleCanvas, 0, 0, dimensions.width, dimensions.height);
  }

  // Use measured FPS for frame delay
  const frameDelay = 1000 / measuredFPS;

  gif.addFrame(tempCanvas, {
    delay: frameDelay,
    copy: true
  });

  const elapsed = (Date.now() - recordingStartTime) / 1000;
  if (elapsed <= RECORDING_DURATION) {
    requestAnimationFrame(captureFrames);
  } else {
    startExporting();
  }
}

function startExporting() {
  if (!isRecording) return;

  isRecording = false;
  exportButton.textContent = 'Processing...';
  recordingStatus.style.display = 'none';
  progressBar.style.display = 'block';
  progressBar.style.height = '20px';

  const exportFormatSelect = document.getElementById('exportFormatSelect');
  const exportDeviceSelect = document.getElementById('exportDeviceSelect');
  const exportFormat = exportFormatSelect.value;
  const exportDevice = exportDeviceSelect.value;

  const { width, height } = getDimensions(
    exportDevice,
    particleCanvas.width,
    particleCanvas.height
  );

  gif.on('progress', (p) => {
    progressBar.style.width = `${Math.round(p * 100)}%`;
  });

  gif.on('finished', (blob) => {
    if (exportFormat === 'gif') {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `particle-animation-${exportDevice}.gif`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'html') {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Particle Animation - ${exportDevice}</title>
            <style>
              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: ${colorPickerBackground.value};
              }
              .container {
                width: 100%;
                max-width: ${width}px;
                margin: auto;
              }
              img {
                width: 100%;
                height: auto;
                display: block;
              }
              @media (max-width: ${width}px) {
                .container {
                  width: 100%;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="${base64data}" alt="Particle Animation" width="${width}" height="${height}">
            </div>
          </body>
          </html>
        `;

        const blobHtml = new Blob([htmlContent], { type: 'text/html' });
        const htmlUrl = URL.createObjectURL(blobHtml);
        const a = document.createElement('a');
        a.href = htmlUrl;
        a.download = `particle-animation-${exportDevice}.html`;
        a.click();
        URL.revokeObjectURL(htmlUrl);
      };
    } else if (exportFormat === 'webm') {
      const wrapperCanvas = document.createElement('canvas');
      wrapperCanvas.width = width;
      wrapperCanvas.height = height;
      const wrapperCtx = wrapperCanvas.getContext('2d');

      function drawFrame() {
        wrapperCtx.fillStyle = colorPickerBackground.value;
        wrapperCtx.fillRect(0, 0, wrapperCanvas.width, wrapperCanvas.height);
        wrapperCtx.drawImage(particleCanvas, 0, 0);
        requestAnimationFrame(drawFrame);
      }
      drawFrame();

      const stream = wrapperCanvas.captureStream(30); // 30 FPS
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
        videoBitsPerSecond: 5000000,
      });

      const chunks = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = () => {
        const webmBlob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(webmBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `particle-animation-${exportDevice}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      recorder.start();
      setTimeout(() => recorder.stop(), RECORDING_DURATION * 1000);

    } else if (exportFormat === 'mp4') {
      const mimeType = MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : 'video/webm';

      const wrapperCanvas = document.createElement('canvas');
      wrapperCanvas.width = width;
      wrapperCanvas.height = height;
      const wrapperCtx = wrapperCanvas.getContext('2d');

      function drawFrame() {
        wrapperCtx.fillStyle = colorPickerBackground.value;
        wrapperCtx.fillRect(0, 0, wrapperCanvas.width, wrapperCanvas.height);
        wrapperCtx.drawImage(particleCanvas, 0, 0);
        requestAnimationFrame(drawFrame);
      }
      drawFrame();

      const stream = wrapperCanvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 5000000,
      });

      const chunks = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `particle-animation-${exportDevice}.${mimeType === 'video/mp4' ? 'mp4' : 'webm'}`;
        a.click();
        URL.revokeObjectURL(url);
      };

      recorder.start();
      setTimeout(() => recorder.stop(), RECORDING_DURATION * 1000);
    } else if (exportFormat === 'frames') {
      const exportDevice = document.getElementById('exportDeviceSelect').value;
      const dimensions = getDimensions(
        exportDevice, 
        particleCanvas.width, 
        particleCanvas.height
      );
    
      const zip = new JSZip();
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = dimensions.isSmartwatch ? dimensions.containerWidth : dimensions.width;
      frameCanvas.height = dimensions.isSmartwatch ? dimensions.containerHeight : dimensions.height;
      const frameCtx = frameCanvas.getContext('2d');
    
      let frameIndex = 0;
      const totalFrames = Math.floor(RECORDING_DURATION * measuredFPS);
      function saveFrame() {
        if (frameIndex >= totalFrames) {
          zip.generateAsync({ type: 'blob' }).then((content) => {
            const zipUrl = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = zipUrl;
            a.download = `frames-${exportDevice}.zip`;
            a.click();
            URL.revokeObjectURL(zipUrl);
          });
          return;
        }
        const delay = 1000 / measuredFPS;
    
        // Draw frame on temporary canvas with background color
        frameCtx.fillStyle = colorPickerBackground.value;
        frameCtx.fillRect(0, 0, frameCanvas.width, frameCanvas.height);

        if (dimensions.isSmartwatch) {
          const x = Math.floor((dimensions.containerWidth - dimensions.width) / 2);
          const y = Math.floor((dimensions.containerHeight - dimensions.height) / 2);
          frameCtx.drawImage(particleCanvas, x, y, dimensions.width, dimensions.height);
        } else {
          frameCtx.drawImage(particleCanvas, 0, 0, dimensions.width, dimensions.height);
        }

        frameCanvas.toBlob((blob) => {
          zip.file(`frame-${frameIndex + 1}.png`, blob);
          frameIndex++;
          setTimeout(saveFrame, delay);
        });
      }

      saveFrame(); // Start saving frames
    }


    // Reset UI
    exportButton.textContent = 'Export Now';
    exportButton.style.backgroundColor = '#2563eb';
    exportButton.disabled = false;
    progressBar.style.display = 'none';

    // Clean up
    gif.abort();
  });

  gif.render();
}

// Event listeners
createGIFButton.addEventListener('click', () => modal.style.display = "block");
exportButton.addEventListener('click', startRecording);

// When the user clicks on <span> (x), close the modal
closeModal.onclick = function () {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}