// Controls
const colorSelect = document.getElementById('colorSelect');
const speedRange = document.getElementById('speedRange');
const dispersionRangeInput = document.getElementById('dispersionRange');
const particleCountInput = document.getElementById('particleCount');
const sizeRange = document.getElementById('sizeRange');
const shapeSelect = document.getElementById('shapeSelect');
const animationEffectSelect = document.getElementById('animationEffect');
const particleOpacitySlider = document.getElementById('particleOpacity');
const linkOpacitySlider = document.getElementById('linkOpacity');
const linkNumberSlider = document.getElementById('linkNumber');
const colorPickerLinks = document.getElementById('linkColor');
const colorPickerBackground = document.getElementById('backgroundColor');
const rotationSlider = document.getElementById('rotationSlider');

// Animation variables
let particlesArray = [];
let particleSpeed = parseFloat(speedRange.value);
let particleShape = 'circle';
let particleCount = parseInt(particleCountInput.value);
let particleOpacity = 1;
let colorMode = 'original';
let backgroundColor = '#0f172a';
let lastImageData = null;
let animationId = null;
let particleSize = 2;
let dispersionRange = 50; // Default dispersion range
let inParticleMode = false;
let drawablePixels = []; // Store drawable pixels globally
let lastTime = 0;
const frameInterval = 1000 / 60; // target 60 fps
// Global rotation variables
let rotationAngle = 0;
let animationEffect = "";
let autoRotationSpeed = 1; // Degrees per frame
// link control variables
let linkNumber = 0;
let linkOpacity = 0.2;
let linkColor = '#FFFFFF';


// Event listener for Load Config - Natasya Liew
document.getElementById('loadConfigButton').addEventListener('click', () => {
    const loadConfigInput = document.getElementById('loadSettingConfigJSON');
    // Simulate a click on the hidden file input
    loadConfigInput.click();
});

// Handle file selection
document.getElementById('loadSettingConfigJSON').addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (!file) {
      alert('No file selected.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const config = JSON.parse(e.target.result);

            // Apply settings to the controls
            document.getElementById('colorSelect').value = config.colorMode || 'original';
            document.getElementById('speedRange').value = config.particleSpeed || 1;
            document.getElementById('dispersionRange').value = config.dispersionRange || 50;
            document.getElementById('particleCount').value = config.particleCount || 1000;
            document.getElementById('sizeRange').value = config.particleSize || 2;
            document.getElementById('shapeSelect').value = config.particleShape || 'circle';
            document.getElementById('animationEffect').value = config.animationEffect || 'none';
            document.getElementById('particleOpacity').value = config.particleOpacity || 1;
            document.getElementById('linkNumber').value = config.linkNumber || 0;
            document.getElementById('linkOpacity').value = config.linkOpacity || 0.1;
            document.getElementById('linkColor').value = config.linkColor || '#FFFFFF';
            document.getElementById('backgroundColor').value = config.backgroundColor || '#0f172a';

            // Update global variables
            particleSpeed = parseFloat(config.particleSpeed) || 1;
            dispersionRange = parseFloat(config.dispersionRange) || 50;
            particleCount = parseInt(config.particleCount, 10) || 1000;
            particleSize = parseFloat(config.particleSize) || 2;
            particleShape = config.particleShape || 'circle';
            animationEffect = config.animationEffect || 'none';
            colorMode = config.colorMode || 'original';
            particleOpacity = config.particleOpacity || 1;
            linkNumber = config.linkNumber || 0;
            linkOpacity = config.linkOpacity || 0.1;
            linkColor = config.linkColor || '#FFFFFF';
            backgroundColor = config.backgroundColor || '#0f172a';
            propogateBackgroundColorChanges(backgroundColor)

            // Recreate particles if image data exists
            if (lastImageData) {
                createParticlesFromImage(lastImageData);
            }
            alert('Config loaded successfully!');
        } catch (error) {
            alert('Invalid JSON configuration file.');
            console.error(error);
        }
    };

    reader.readAsText(file);
});

// Event listener for Save Config - Natasya Liew
document.getElementById('saveConfigButton').addEventListener('click', () => {
    const config = {
        colorMode: document.getElementById('colorSelect').value,
        particleSpeed: parseFloat(document.getElementById('speedRange').value),
        dispersionRange: parseFloat(document.getElementById('dispersionRange').value),
        particleCount: parseInt(document.getElementById('particleCount').value, 10),
        particleSize: parseFloat(document.getElementById('sizeRange').value),
        particleShape: document.getElementById('shapeSelect').value,
        animationEffect: document.getElementById('animationEffect').value,
        particleOpacity: parseFloat(document.getElementById('particleOpacity').value),
        linkNumber: parseFloat(document.getElementById('linkNumber').value),
        linkOpacity: parseFloat(document.getElementById('linkOpacity').value),
        linkColor: document.getElementById('linkColor').value,
        backgroundColor: document.getElementById('backgroundColor').value,
    };

    const jsonConfig = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonConfig], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'config.json';
    link.click();

    alert('Config saved successfully!');
});

// Optimized debounce with a shorter delay
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Separate function to collect drawable pixels
function collectDrawablePixels(imageData) {
    const imgWidth = imageData.width;
    const imgHeight = imageData.height;
    const data = imageData.data;
    const pixels = [];
    
    // Step through pixels with a stride for better performance
    const stride = 2; // Adjust this value based on image size
    for (let y = 0; y < imgHeight; y += stride) {
        for (let x = 0; x < imgWidth; x += stride) {
            const i = (y * imgWidth + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const alpha = data[i + 3];

            const isDrawnPixel = (
                Math.abs(r - 255) > 5 || 
                Math.abs(g - 255) > 5 || 
                Math.abs(b - 255) > 5
            ) && alpha > 128;

            if (isDrawnPixel) {
                pixels.push({
                    x: x,
                    y: y,
                    r: r,
                    g: g,
                    b: b,
                    alpha: alpha
                });
            }
        }
    }
    return pixels;
}

function createParticlesFromImage(imageData) {
    viewControls.style.display = 'block';
    particleCanvas.style.display = 'block';
    inParticleMode = true;
    particlesArray = [];
    hideDropzone();
    
    const imgWidth = imageData.width;
    const imgHeight = imageData.height;
    
    const scale = Math.min(
        particleCanvas.width / imgWidth,
        particleCanvas.height / imgHeight
    ) * 0.8;

    const offsetX = (particleCanvas.width - imgWidth * scale) / 2;
    const offsetY = (particleCanvas.height - imgHeight * scale) / 2;

    // Use cached drawable pixels if available, otherwise collect them
    if (!drawablePixels.length) {
        drawablePixels = collectDrawablePixels(imageData);
    }

    // Create a color cache for better performance
    const colorCache = new Map();

    if (drawablePixels.length > 0) {
        const numParticles = Math.min(particleCount, drawablePixels.length);
        const particles = new Array(numParticles);
        
        for (let i = 0; i < numParticles; i++) {
            const randomIndex = Math.floor(Math.random() * drawablePixels.length);
            const pixel = drawablePixels[randomIndex];
            
            // Use splice only when necessary to maintain pixel variety
            if (drawablePixels.length > numParticles * 2) {
                drawablePixels.splice(randomIndex, 1);
            }

            const x = pixel.x * scale + offsetX;
            const y = pixel.y * scale + offsetY;
            const z = Math.random() - 0.5; // Random z position for 3D effect
            
            // Use color caching
            const colorKey = `${pixel.r},${pixel.g},${pixel.b},${pixel.alpha}`;
            let color = colorCache.get(colorKey);
            
            if (!color) {
                switch (colorMode) {
                    case 'grayscale':
                        const gray = (pixel.r + pixel.g + pixel.b) / 3;
                        color = `rgba(${gray},${gray},${gray},${pixel.alpha / 255})`;
                        break;
                    case 'random':
                        color = `hsl(${Math.random() * 360},70%,50%)`;
                        break;
                    default:
                        color = `rgba(${pixel.r},${pixel.g},${pixel.b},${pixel.alpha / 255})`;
                }
                colorCache.set(colorKey, color);
            }
            
            particles[i] = new Particle(x, y, z, color);
        }
        
        particlesArray = particles;
    }

    // If we don't have enough drawable pixels, fill with particles at drawn positions
    if (particlesArray.length < particleCount && particlesArray.length > 0) {
        const originalLength = particlesArray.length;
        for (let i = originalLength; i < particleCount; i++) {
            // Clone a random existing particle's position
            const randomParticle = particlesArray[Math.floor(Math.random() * originalLength)];
            let color;
            switch (colorMode) {
                case 'grayscale':
                    color = randomParticle.color;
                    break;
                case 'random':
                    color = `hsl(${Math.random() * 360},70%,50%)`;
                    break;
                default:
                    color = randomParticle.color;
            }
            
            // Add some slight random offset to prevent exact overlapping
            const offsetRange = 2; // pixels
            const xOffset = (Math.random() - 0.5) * offsetRange;
            const yOffset = (Math.random() - 0.5) * offsetRange;
            
            particlesArray.push(new Particle(
                randomParticle.originalX + xOffset, 
                randomParticle.originalY + yOffset, 
                Math.random() - 0.5, // Random z position for 3D effect
                color
            ));
        }
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    const img = new Image();
    img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0, img.width, img.height);
        lastImageData = tempCtx.getImageData(0, 0, img.width, img.height);
        createParticlesFromImage(lastImageData);
    };
    img.src = URL.createObjectURL(file);
}

// control particles using the linkNumberSlider to dictate
// a distance threshold between particles. For example
// if the user has the slider all the way to the left
// at the 'None' side, the distance threshold is 0 therefore
// the distance between any two given particles will not & can not be under the
// distance threshold and no links will be rendered. However as the 
// slider value (therefore distance threshold) increases more pairs of 
// particles will meet the distance criteria and more links will
// be drawn
function drawParticleLinks() {
    if (linkNumber < 1) return;

    const maxDistance = linkNumber;
    const particleCount = particlesArray.length;

    ctxParticle.save();
    ctxParticle.translate(particleCanvas.width / 2, particleCanvas.height / 2);

    for (let i = 0; i < particleCount; i++) {
        const p1 = particlesArray[i];
        // Only check the next n particles to improve performance
        const checkLimit = Math.min(particleCount, i + 50);
        
        for (let j = i + 1; j < checkLimit; j++) {
            const p2 = particlesArray[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
                const opacity = (1 - distance / maxDistance) * linkOpacity;
                ctxParticle.beginPath();
                const r = parseInt(linkColor.slice(1, 3), 16);
                const g = parseInt(linkColor.slice(3, 5), 16);
                const b = parseInt(linkColor.slice(5, 7), 16);
                ctxParticle.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                ctxParticle.lineWidth = 1;
                ctxParticle.moveTo(p1.x, p1.y);
                ctxParticle.lineTo(p2.x, p2.y);
                ctxParticle.stroke();
            }
        }
    }

    ctxParticle.restore();
}

function animateParticles(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;
    
    if (deltaTime > frameInterval) {
        ctxParticle.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        
        // If auto-rotating, update the UI slider to match the current rotation
        if (animationEffect === "rotate") {
            const currentRotation = (parseInt(rotationSlider.value) + autoRotationSpeed) % 360;
            rotationSlider.value = currentRotation;
            rotationAngle = currentRotation;
        }

        drawParticleLinks();
        
        // Update and draw each particle
        particlesArray.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        lastTime = currentTime - (deltaTime % frameInterval);
    }
    
    animationId = requestAnimationFrame(animateParticles);
}

function zoom(event, canvas, context) {
    event.preventDefault();

    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    const wheel = event.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(wheel * 0.1);

    context.translate(mouseX, mouseY);
    context.scale(zoom, zoom);
    context.translate(-mouseX, -mouseY);

    scale *= zoom;

    redrawCanvas(canvas, context);
}

function redrawCanvas(canvas, context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'red';
    context.fillRect(10, 10, 100, 100);
}

function propogateBackgroundColorChanges(selectedColor) {
    document.body.style.backgroundColor = selectedColor;
    ctxDrawing.fillStyle = selectedColor;
    ctxDrawing.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    // Calculate the lightness
    const lightness = hexToHSL(selectedColor)

    const dropzone = document.getElementById('dropzone');
    const dropzoneSvg = dropzone.querySelector('svg');
    const dropzoneText = dropzone.querySelector('.dropzone-text');
    const viewControls = document.getElementById('viewControls');
    const labels = viewControls.querySelectorAll('.control-label');
    const slider = document.getElementById('rotationSlider');
    const rotationValueDisplay = document.getElementById('rotationValueDisplay');
    const exportModal = document.getElementById('exportModal');
    const exportFormat = document.getElementById('exportFormatSelect');
    const exportDevice = document.getElementById('exportDeviceSelect');

    if (lightness < 70) {
        // If background is dark, make elements lighter
        dropzone.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        dropzoneSvg.style.stroke = 'rgba(255, 255, 255, 0.6)';
        dropzoneText.style.color = 'rgba(255, 255, 255, 0.8)';
        labels.forEach(label => label.style.color = 'rgba(255, 255, 255, 0.8)');
        slider.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        rotationValueDisplay.style.color = '#e2e8f0';
        drawingCanvas.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        exportModal.style.color = '#e2e8f0';
        exportFormat.classList.remove('dark-select');
        exportDevice.classList.remove('dark-select');
    } else {
        // If background is light, make elements darker
        dropzone.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        dropzoneSvg.style.stroke = 'rgba(0, 0, 0, 0.6)';
        dropzoneText.style.color = 'rgba(0, 0, 0, 0.8)';
        labels.forEach(label => label.style.color = 'rgba(0, 0, 0, 0.8)');
        slider.style.border = '1px solid #525252';
        rotationValueDisplay.style.color = '#525252';
        drawingCanvas.style.border = '2px solid #525252';
        exportModal.style.color = '#000';
        exportFormat.classList.add('dark-select');
        exportDevice.classList.add('dark-select');
    }
}

function hexToHSL(hex) {
    // Convert hex to RGB
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    // Find max and min values to get lightness
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let lightness = (max + min) / 2;

    // Return the lightness as a percentage
    return lightness * 100;
}

// Event listeners
fileInput.addEventListener('change', handleImageUpload);
colorSelect.addEventListener('change', (e) => {
    colorMode = e.target.value;
    if (lastImageData) {
        createParticlesFromImage(lastImageData);
    }
});
speedRange.addEventListener('input', (e) => {
    particleSpeed = parseFloat(e.target.value);
});
dispersionRangeInput.addEventListener('input', (e) => {
    dispersionRange = parseFloat(e.target.value);
});
particleCountInput.addEventListener('input', debounce((e) => {
    particleCount = parseInt(e.target.value);
    if (lastImageData) {
        createParticlesFromImage(lastImageData);
    }
}, 100)); // Reduced debounce time to 100ms
sizeRange.addEventListener('input', (e) => {
    particleSize = parseFloat(e.target.value);
});
shapeSelect.addEventListener('change', (e) => {
    particleShape = e.target.value;
});
rotationSlider.addEventListener('input', (e) => {
    rotationAngle = parseInt(e.target.value);
});
drawingCanvas.addEventListener('wheel', (event) => zoom(event, drawingCanvas, ctxDrawing));
particleCanvas.addEventListener('wheel', (event) => zoom(event, particleCanvas, ctxParticle));
animationEffectSelect.addEventListener('change', (e) => {
    animationEffect = e.target.value;
    if (animationEffect === "rotate") {
        // Disable the rotation slider when auto-rotating
        rotationSlider.disabled = true;
    } else {
        // Enable the rotation slider when not auto-rotating
        rotationSlider.disabled = false;
    }
});
particleOpacitySlider.addEventListener('input', (e) => {
    particleOpacity = parseFloat(e.target.value);
});
linkOpacitySlider.addEventListener('input', (e) => {
    linkOpacity = parseFloat(e.target.value);
});
linkNumberSlider.addEventListener('input', (e) => {
    linkNumber = parseFloat(e.target.value);
});
colorPickerLinks.addEventListener('input', (e) => {
    linkColor = e.target.value;
})
colorPickerBackground.addEventListener('input', (e) => {
    const selectedColor = e.target.value;
    backgroundColor = selectedColor;
    propogateBackgroundColorChanges(selectedColor);
});

// Start the animation
animationId = requestAnimationFrame(animateParticles);