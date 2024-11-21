// Controls
const colorSelect = document.getElementById('colorSelect');
const speedRange = document.getElementById('speedRange');
const dispersionRangeInput = document.getElementById('dispersionRange');
const particleCountInput = document.getElementById('particleCount');
const sizeRange = document.getElementById('sizeRange');
const shapeSelect = document.getElementById('shapeSelect');
const animationEffect = document.getElementById('animationEffect');

// Animation variables
let particlesArray = [];
let particleSpeed = parseFloat(speedRange.value);
let particleShape = 'circle';
let particleCount = parseInt(particleCountInput.value);
let colorMode = 'original';
let lastImageData = null;
let animationId = null;
let particleSize = 2;
let dispersionRange = 50; // Default dispersion range
let inParticleMode = false;
let drawablePixels = []; // Store drawable pixels globally
let lastTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

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

// Global rotation variables
let rotationAngle = 0;
const rotationSlider = document.getElementById('rotationSlider');
let autoRotate = false;
let autoRotationSpeed = 1; // Degrees per frame


function animateParticles(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;
    
    if (deltaTime > frameInterval) {
        ctxParticle.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        
        // If auto-rotating, update the UI slider to match the current rotation
        if (autoRotate) {
            const currentRotation = (parseInt(rotationSlider.value) + autoRotationSpeed) % 360;
            rotationSlider.value = currentRotation;
            rotationAngle = currentRotation;
        }
        
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
animationEffect.addEventListener('change', (e) => {
    autoRotate = e.target.value === 'rotate';
    if (autoRotate) {
        // Disable the rotation slider when auto-rotating
        rotationSlider.disabled = true;
    } else {
        // Enable the rotation slider when not auto-rotating
        rotationSlider.disabled = false;
    }
});
// Start the animation
animationId = requestAnimationFrame(animateParticles);