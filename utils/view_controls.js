/**
 * ----------------------------------------------------------------------------
 * FILE:        view_controls.js
 * AUTHOR:      Bryce Schultz
 * DATE:        11/30/2024
 * DESCRIPTION:
 * This JavaScript file provides zooming, panning, and recentering functionality 
 * for a canvas-based particle simulation. Users can zoom in/out, drag to pan, 
 * and reset the view to its original state.
 *
 * FEATURES:
 * - Supports mouse wheel zooming with smooth transitions.
 * - Allows panning by clicking and dragging.
 * - Provides UI buttons for zooming and recentering the canvas.
 * - Ensures transformations persist correctly across zoom and pan actions.
 *
 * ----------------------------------------------------------------------------
 * USAGE:
 * Include this script in an HTML file with the following elements:
 * ```html
 * <button id="recenterCanvas">Recenter</button>
 * <button id="zoomIn">Zoom In</button>
 * <button id="zoomOut">Zoom Out</button>
 * <canvas id="drawingCanvas"></canvas>
 * <canvas id="particleCanvas"></canvas>
 * ```
 * 
 * Example Usage:
 * ```javascript
 * zoom(event, ctxParticle); // Zooms into the canvas
 * recenter(); // Resets zoom and pan
 * ```
 *
 * ----------------------------------------------------------------------------
 * REVISION HISTORY:
 *
 * ----------------------------------------------------------------------------
 */


const viewControls = document.getElementById('viewControls');
const recenterCanvas = document.getElementById('recenterCanvas');
const zoomIn = document.getElementById('zoomIn');
const zoomOut = document.getElementById('zoomOut');

let zoomScale = 1;

function zoom(event, context) {
    event.preventDefault();

    const zoom = event.deltaY < 0 ? 1.1 : 0.9;
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    // Update zoomScale
    zoomScale *= zoom;

    // Calculate new transform incorporating both zoom and pan
    context.setTransform(zoomScale, 0, 0, zoomScale, panX, panY);

    // Apply the zoom transformation around mouse position
    context.translate(mouseX, mouseY);
    context.scale(zoom, zoom);
    context.translate(-mouseX, -mouseY);

    // Redraw particles after zooming
    redrawParticles();
}

// Variables to track panning
let isPanning = false;
let startX = 0;
let startY = 0;
let panX = 0;
let panY = 0;

// Method to recenter the canvas
function recenter() {
    ctxDrawing.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to default
    ctxParticle.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to default
    zoomScale = 1; // Reset scale
    panX = 0;
    panY = 0;
    redrawParticles(); // Redraw particles after recentering
}

// Method to zoom in
function zoomInCanvas() {
    const zoomEvent = new WheelEvent('wheel', { deltaY: -1 });
    zoom(zoomEvent, ctxDrawing);
    zoom(zoomEvent, ctxParticle);
}

// Method to zoom out
function zoomOutCanvas() {
    const zoomEvent = new WheelEvent('wheel', { deltaY: 1 });
    zoom(zoomEvent, ctxDrawing);
    zoom(zoomEvent, ctxParticle);
}

// Method to start panning
function startPan(event) {
    if (!inParticleMode) return;
    isPanning = true;
    startX = event.clientX - panX;
    startY = event.clientY - panY;
}

// Method to stop panning
function stopPan() {
    if (!inParticleMode) return;
    isPanning = false;
    redrawParticles();
}

// Add event listeners for panning
drawingCanvas.addEventListener('mousedown', startPan);
drawingCanvas.addEventListener('mousemove', pan);
drawingCanvas.addEventListener('mouseup',stopPan);
drawingCanvas.addEventListener('mouseout', stopPan);

particleCanvas.addEventListener('mousedown', startPan);
particleCanvas.addEventListener('mousemove', pan);
particleCanvas.addEventListener('mouseup', stopPan);
particleCanvas.addEventListener('mouseout', stopPan);

// Event listeners for view controls
recenterCanvas.addEventListener('click', recenter);
zoomIn.addEventListener('click', zoomInCanvas);
zoomOut.addEventListener('click', zoomOutCanvas);
particleCanvas.addEventListener('wheel', (event) => zoom(event, ctxParticle));

// Modified pan function
function pan(event) {
    if (!isPanning) return;

    panX = event.clientX - startX;
    panY = event.clientY - startY;

    // Apply the complete transformation matrix
    ctxParticle.setTransform(zoomScale, 0, 0, zoomScale, panX, panY);
    ctxDrawing.setTransform(zoomScale, 0, 0, zoomScale, panX, panY);

    // Redraw particles during pan to prevent frozen state
    redrawParticles();
}

// Modified redrawParticles function
function redrawParticles() {
    ctxParticle.save();
    ctxParticle.setTransform(1, 0, 0, 1, 0, 0);
    
    ctxParticle.clearRect(
        -clearancePadding, 
        -clearancePadding, 
        particleCanvas.width + clearancePadding * 2, 
        particleCanvas.height + clearancePadding * 2
    );
    
    ctxParticle.restore();

    // Redraw particles with current transformation
    particlesArray.forEach(particle => particle.draw());
}

// Screen size detection and responsive messaging
const MIN_WIDTH = 1000;
const MIN_HEIGHT = 700;

const isScreenTooSmall = () => window.innerWidth < MIN_WIDTH || window.innerHeight < MIN_HEIGHT;

const handleScreenSize = () => {
    const existingWarning = document.getElementById('screen-size-warning');
    
    if (isScreenTooSmall()) {
        // Add a warning if there isn't one and the screen is too small
        if (!existingWarning) {
            const warning = document.createElement('div');
            warning.id = 'screen-size-warning';
            warning.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: #f8f9fa;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
                text-align: center;
                z-index: 9999;
            `;
            
            warning.innerHTML = `
                <h1 style="color: #1a1a1a;">ParticleViz</h1><br/><br/><br/>
                <h2 style="color: #1a1a1a; margin-bottom: 15px;">Desktop View Required</h2>
                <p style="color: #4a4a4a; max-width: 600px; line-height: 1.5;">
                    This application is optimized for desktop use and requires a screen size of at least 
                    ${MIN_WIDTH}x${MIN_HEIGHT} pixels. Please access from a larger screen for the best experience.
                </p>
            `;
            
            document.body.appendChild(warning);
        }
    } else if (existingWarning) {
        // If the screen is not too small and there is a warning we remove it
        existingWarning.remove();
    }
};

// Add event listener and perform initial screen size check
window.addEventListener('resize', handleScreenSize);
handleScreenSize();