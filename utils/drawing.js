/**
 * ----------------------------------------------------------------------------
 * FILE:        drawing.js
 * AUTHOR:      Bryce Schultz
 * DATE:        11/30/2024
 * DESCRIPTION:
 * This JavaScript file handles drawing functionality for a web-based 
 * canvas drawing tool. Users can switch between freehand drawing and 
 * polygon drawing, save their drawings, and convert them into particles.
 *
 * FEATURES:
 * - Handles user input via mouse for freehand and polygon drawing.
 * - Provides undo, clear, and save options.
 * - Converts drawings to particles for advanced visualization.
 * - Supports URL-based input mode selection.
 *
 * ----------------------------------------------------------------------------
 * USAGE:
 * Include this script in an HTML file with the following elements:
 * ```html
 * <canvas id="drawingCanvas"></canvas>
 * <canvas id="particleCanvas"></canvas>
 * <input type="color" id="colorPickerBrush">
 * <input type="range" id="brushSize" min="1" max="10">
 * <button id="clearCanvas">Clear</button>
 * <button id="convertDrawing">Convert to Particles</button>
 * <button id="drawingModeSwitch">Toggle Drawing Mode</button>
 * <button id="saveImage">Save Image</button>
 * ```
 *
 * ----------------------------------------------------------------------------
 * REVISION HISTORY:
 * - 01/10/2025: Adding saving functionalities by Natasya Liew 
 *
 * ----------------------------------------------------------------------------
 */

const particleCanvas = document.getElementById('particleCanvas');
const drawingCanvas = document.getElementById('drawingCanvas');
const inputModeSelect = document.getElementById('inputModeSelect');
const drawingControls = document.getElementById('drawingControls');
const colorPickerBrush = document.getElementById('colorPickerBrush');
const brushSize = document.getElementById('brushSize');
const clearCanvasBtn = document.getElementById('clearCanvas');
const convertDrawingBtn = document.getElementById('convertDrawing');
const drawingModeSwitch = document.getElementById('drawingModeSwitch'); // Polygon drawing mode switch button
const ctxDrawing = drawingCanvas.getContext('2d');
const ctxParticle = particleCanvas.getContext('2d');
const saveImageButton = document.getElementById('saveImage');

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

// Event listener for Save Image button
saveImageButton.addEventListener('click', saveDrawingAsImage);

// Setup drawing canvas
function setupDrawingCanvas() {
    const width = Math.min(800, window.innerWidth - 400); // Account for controls
    const height = Math.min(600, window.innerHeight - 100);
    
    drawingCanvas.width = width;
    drawingCanvas.height = height;
    ctxDrawing.fillStyle = backgroundColor;
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
    ctxDrawing.strokeStyle = colorPickerBrush.value;
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
    hideDropzone();
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

// Save Drawing - Natasya Liew
function saveDrawingAsImage() {
    const dataURL = drawingCanvas.toDataURL('image/png'); 
    const link = document.createElement('a'); 
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.href = dataURL;
    link.download = `drawing-${timestamp}.png`; 
    link.click(); 

    // Show feedback
    alert('Drawing saved successfully!');
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
    ctxDrawing.strokeStyle = colorPickerBrush.value;
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

function getInputModeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('mode') || 'upload'; // Default to upload if no mode specified
}

function handleInputModeChange() {
    const mode = inputModeSelect.value;
    const newURL = new URL(window.location.href);
    newURL.searchParams.set('mode', mode);
    window.location.href = newURL.toString();
}

function initializeFromURL() {
    const mode = getInputModeFromURL();
    
    // Set the select element to match URL parameter
    inputModeSelect.value = mode;
    
    // Set up the appropriate view
    if (mode === 'draw') {
        drawingCanvas.style.display = 'block';
        drawingControls.classList.add('active');
        setupDrawingCanvas();
    } else {
        drawingCanvas.style.display = 'none';
        drawingControls.classList.remove('active');
    }
}


// Event listeners for drawing
drawingCanvas.addEventListener('mousedown', startDrawing);
drawingCanvas.addEventListener('mousemove', draw);
drawingCanvas.addEventListener('mouseup', stopDrawing);
drawingCanvas.addEventListener('mouseout', stopDrawing);
drawingCanvas.addEventListener('dblclick', completePolygon); // Handle polygon completion

// initialize input mode from url
document.addEventListener('DOMContentLoaded', initializeFromURL);

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
    const controlWidth = document.getElementById('particle-controls').offsetWidth || 200; // Width of the controls
    particleCanvas.width = window.innerWidth - (controlWidth + 30);  // Adjust width based on the controls
    particleCanvas.height = window.innerHeight;  // Full height of the window

    // Position the canvas to the right of the controls
    particleCanvas.style.position = 'absolute';
    particleCanvas.style.left = `${controlWidth}px`;  // Set canvas to start right after controls
}

// Initial resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
