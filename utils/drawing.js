// Document references
const particleCanvas = document.getElementById('particleCanvas');
const drawingCanvas = document.getElementById('drawingCanvas');
const inputModeSelect = document.getElementById('inputModeSelect');
const drawingControls = document.getElementById('drawingControls');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearCanvasBtn = document.getElementById('clearCanvas');
const convertDrawingBtn = document.getElementById('convertDrawing');
const drawingModeSwitch = document.getElementById('drawingModeSwitch'); // Polygon drawing mode switch button
const ctxDrawing = drawingCanvas.getContext('2d');
const ctxParticle = particleCanvas.getContext('2d');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let isPolygonMode = false;
let polygonVertices = [];

let mouseX = 0;
let mouseY = 0;

// Track the mouse position
particleCanvas.addEventListener('mousemove', (e) => {
    const rect = particleCanvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// Setup drawing canvas
function setupDrawingCanvas() {
    const width = Math.min(800, window.innerWidth - 400); // Account for controls
    const height = Math.min(600, window.innerHeight - 100);
    
    drawingCanvas.width = width;
    drawingCanvas.height = height;
    ctxDrawing.fillStyle = 'white';
    ctxDrawing.fillRect(0, 0, width, height);
}

// Drawing functions
function startDrawing(e) {
    if (isPolygonMode) {
        // In polygon mode, store the vertex
        const [x, y] = getDrawingCoordinates(e);
        polygonVertices.push({ x, y });
        drawPolygonPreview();
    } else {
        isDrawing = true;
        [lastX, lastY] = getDrawingCoordinates(e);
    }
}

function stopDrawing() {
    isDrawing = false;
}

function draw(e) {
    if (!isDrawing || isPolygonMode) return;

    const [x, y] = getDrawingCoordinates(e);
    
    ctxDrawing.beginPath();
    ctxDrawing.moveTo(lastX, lastY);
    ctxDrawing.lineTo(x, y);
    ctxDrawing.strokeStyle = colorPicker.value;
    ctxDrawing.lineWidth = brushSize.value;
    ctxDrawing.lineCap = 'round';
    ctxDrawing.stroke();
    
    [lastX, lastY] = [x, y];
}

function getDrawingCoordinates(e) {
    const rect = drawingCanvas.getBoundingClientRect();
    return [
        e.clientX - rect.left,
        e.clientY - rect.top
    ];
}

// Convert drawing to particles
function convertDrawingToParticles() {
    const imageData = ctxDrawing.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    lastImageData = imageData;
    createParticlesFromImage(imageData);
    drawingCanvas.style.display = 'none';
    drawingControls.classList.remove('active');
}

// Clear drawing canvas
function clearDrawingCanvas() {
    ctxDrawing.fillStyle = 'white';
    ctxDrawing.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    polygonVertices = []; // Clear polygon vertices when canvas is cleared
}

// Handle input mode changes
function handleInputModeChange() {
    const mode = inputModeSelect.value;
    if (mode === 'draw') {
        drawingCanvas.style.display = 'block';
        drawingControls.classList.add('active');
        setupDrawingCanvas();
    } else {
        drawingCanvas.style.display = 'none';
        drawingControls.classList.remove('active');
    }
}

// Switch between free drawing and polygon drawing
function toggleDrawingMode() {
    isPolygonMode = !isPolygonMode;
    polygonVertices = []; // Reset vertices when switching mode
    if (isPolygonMode) {
        drawingModeSwitch.textContent = "Polygon Mode: ON";
    } else {
        drawingModeSwitch.textContent = "Polygon Mode: OFF";
    }
}

// Draw a preview of the polygon as vertices are added
function drawPolygonPreview() {
    // Do not clear the entire canvas. Simply draw the polygon preview over the existing drawing.
    ctxDrawing.strokeStyle = colorPicker.value;
    ctxDrawing.lineWidth = brushSize.value;
    ctxDrawing.beginPath();

    for (let i = 0; i < polygonVertices.length; i++) {
        const { x, y } = polygonVertices[i];
        if (i === 0) {
            ctxDrawing.moveTo(x, y);
        } else {
            ctxDrawing.lineTo(x, y);
        }
    }
    ctxDrawing.stroke();
}

// Complete the polygon when double-clicking
function completePolygon() {
    if (polygonVertices.length > 2) {
        // Close the polygon by connecting the last point to the first
        ctxDrawing.lineTo(polygonVertices[0].x, polygonVertices[0].y);
        ctxDrawing.stroke();
        console.log("Polygon completed with vertices:", polygonVertices);
    }
    polygonVertices = []; // Clear vertices after completing the polygon
}

// Event listeners for drawing
drawingCanvas.addEventListener('mousedown', startDrawing);
drawingCanvas.addEventListener('mousemove', draw);
drawingCanvas.addEventListener('mouseup', stopDrawing);
drawingCanvas.addEventListener('mouseout', stopDrawing);
drawingCanvas.addEventListener('dblclick', completePolygon); // Handle polygon completion

// Event listeners for controls
inputModeSelect.addEventListener('change', handleInputModeChange);
clearCanvasBtn.addEventListener('click', clearDrawingCanvas);
convertDrawingBtn.addEventListener('click', convertDrawingToParticles);
drawingModeSwitch.addEventListener('click', toggleDrawingMode);

// Initialize drawing canvas
setupDrawingCanvas();

// Modify the existing window resize event listener
window.addEventListener('resize', () => {
    resizeCanvas();
    setupDrawingCanvas();
});

// Set canvas size to window size
function resizeCanvas() {
    const controlWidth = document.getElementById('controls').offsetWidth || 200; // Width of the controls
    particleCanvas.width = window.innerWidth - (controlWidth + 30);  // Adjust width based on the controls
    particleCanvas.height = window.innerHeight;  // Full height of the window

    // Position the canvas to the right of the controls
    particleCanvas.style.position = 'absolute';
    particleCanvas.style.left = `${controlWidth}px`;  // Set canvas to start right after controls
}

// Initial resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
