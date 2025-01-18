// Constants
const SCREEN_WIDTH = 800; // Adjust to your desired width
const SCREEN_HEIGHT = 600; // Adjust to your desired height

// HTML Canvas setup
console.log("run_particle.js is loaded")
const canvas = document.getElementById("particleCanvas");
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

console.log(`Canvas size: ${canvas.width}x${canvas.height}`);
const ctx = canvas.getContext("2d");
console.log("Canvas context initialized:", ctx);

// Particle group
const particleGroup = [];

// Spawn particles based on image
function spawnParticlesFromImage(image) {
    console.log("Spawning particles from image...");
    const imageCanvas = document.createElement("canvas");
    const imageCtx = imageCanvas.getContext("2d");

    // Set canvas size to match the screen
    imageCanvas.width = SCREEN_WIDTH;
    imageCanvas.height = SCREEN_HEIGHT;

    // Draw the image onto the canvas
    console.log("Drawing image onto the off-screen canvas");
    imageCtx.drawImage(image, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Retrieve image data from the canvas
    try {    
        const imageData = imageCtx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        console.log("Image data retrieved:", imageData);

    for (let x = 0; x < imageData.width; x += 8) {
        for (let y = 0; y < imageData.height; y += 8) {
            const index = (y * imageData.width + x) * 4;
            const r = imageData.data[index];
            const g = imageData.data[index + 1];
            const b = imageData.data[index + 2];
            const a = imageData.data[index + 3];

            // Skip black and white pixels
            if (a > 0 && !(r === 0 && g === 0 && b === 0) && !(r === 255 && g === 255 && b === 255)) {
                const pos = { x: x + Math.random() * 10 - 5, y: y + Math.random() * 10 - 5 };
                const color = [r, g, b];
                const speed = Math.random() * 10 + 10;
                const depth = Math.random() * 1 + 1;
                particleGroup.push(new Particle(pos, color, speed, depth));
            }
        }
    }
    console.log("Number of particles spawned:", particleGroup.length);
} catch (error) {
    console.error("Failed to retrieve image data:", error);
}

}

// Main loop
function mainLoop() {
    let lastTime = 0;

    function loop(timestamp) {
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        // Clear canvas
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        // Update and draw particles
        particleGroup.forEach(particle => {
            particle.update(ctx, dt);
        });

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

// Access the embedded image and start the simulation
const sourceImage = document.getElementById("sourceImage");

sourceImage.onload = () => {
    console.log("Source image loaded successfully:", sourceImage);
    spawnParticlesFromImage(sourceImage);
    mainLoop();
};
sourceImage.onerror = () => {
    console.error("Failed to load the source image. Check the file path:", sourceImage.src);
};
console.log("Image element source:", sourceImage.src);

