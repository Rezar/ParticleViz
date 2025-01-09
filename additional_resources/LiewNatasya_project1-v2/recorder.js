class RecordingController {
    constructor(particleSystem) {
        console.log('Initializing the Recorder Class')
        this.particleSystem = particleSystem;
    
        // Initialize files for validation
        this.loadedSvg = null; // Will hold the SVG file content
        this.loadedConfig = null; // Will hold the parsed JSON config
    
        // Default settings for recording
        this.settings = {
            frameRate: 60,
            duration: 5,
            quality: 0.8,
        };
    
        // Default HTML settings for container size and positioning
        this.htmlSettings = {
            containerSize: 'desktop',
            width: 1920,
            height: 1080,
            position: 'fixed',
            zIndex: -1,
        };
    
        // Add a reference to the validation button (for dynamic control)
        this.validateExportsButton = document.getElementById('validateExports');
    
        // Ensure controls are initialized after DOM is fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeControls());
        } else {
            this.initializeControls();
        }

        // Initialize UI with a slight delay to ensure DOM is ready
        setTimeout(() => {
            this.updateUI().catch(console.error);
        }, 0);
    }
    

    async updateUI() {
        console.log('Updating particle preview in RecordingController...');
    
        const previewContainer = document.getElementById('tsparticlesPreview');
        if (!previewContainer) {
            console.error('tsparticles preview container not found');
            return;
        }
    
        try {
            // Clear any existing particles
            const existingInstance = tsParticles.domItem(0);
            if (existingInstance) {
                await existingInstance.destroy();
            }
    
            // If we have loaded SVG and config from file upload, use those
            if (this.loadedSvg && this.loadedConfig) {
                const svgBlob = new Blob([this.loadedSvg], { type: 'image/svg+xml' });
                const svgUrl = URL.createObjectURL(svgBlob);
    
                await tsParticles.load('tsparticlesPreview', {
                    fpsLimit: 60,
                    fullScreen: {
                        enable: false,
                        zIndex: 0
                    },
                    particles: {
                        color: {
                            value: this.loadedConfig.particleColor,
                            animation: {
                                enable: this.loadedConfig.colorAnimation,
                                speed: 20,
                                sync: true
                            }
                        },
                        links: {
                            color: this.loadedConfig.linkColor,
                            distance: this.loadedConfig.linkDistance,
                            enable: this.loadedConfig.enableLinks,
                            opacity: 0.5,
                            width: 1
                        },
                        move: {
                            enable: true,
                            speed: this.loadedConfig.speed,
                            direction: "none",
                            random: false,
                            straight: false,
                            outModes: {
                                default: "bounce"
                            }
                        },
                        number: {
                            value: this.loadedConfig.particleCount,
                            density: {
                                enable: true,
                                area: 800
                            }
                        },
                        opacity: {
                            value: this.loadedConfig.opacity,
                            animation: {
                                enable: true,
                                speed: 1,
                                sync: false
                            }
                        },
                        shape: {
                            type: this.loadedConfig.shape
                        },
                        size: {
                            value: this.loadedConfig.size
                        }
                    },
                    interactivity: {
                        events: {
                            onHover: {
                                enable: true,
                                mode: "grab"
                            },
                            onClick: {
                                enable: true,
                                mode: "push"
                            }
                        },
                        modes: {
                            grab: {
                                distance: 140,
                                links: {
                                    opacity: 1
                                }
                            },
                            push: {
                                quantity: 4
                            }
                        }
                    },
                    polygon: {
                        draw: {
                            enable: true,
                            stroke: {
                                color: "#ffffff",
                                width: 0.5,
                                opacity: 0.1
                            }
                        },
                        inline: {
                            arrangement: "equidistant"
                        },
                        move: {
                            radius: 10
                        },
                        scale: this.loadedConfig.zoom,
                        type: "inline",
                        url: svgUrl,
                        position: {
                            x: 50,
                            y: 50
                        }
                    },
                    background: {
                        color: this.loadedConfig.backgroundColor
                    },
                    detectRetina: true
                });
            }
            // Otherwise, use the current particle system settings
            else if (this.particleSystem) {
                // Get the exact configuration from the particle system
                const options = this.particleSystem.getCurrentOptions();
                
                // Add polygon configuration if SVG exists
                if (this.particleSystem.currentSvg) {
                    options.polygon = {
                        draw: {
                            enable: true,
                            stroke: {
                                color: "#ffffff",
                                width: 0.5,
                                opacity: 0.1
                            }
                        },
                        inline: {
                            arrangement: "equidistant"
                        },
                        move: {
                            radius: 10
                        },
                        scale: this.particleSystem.settings.zoom,
                        type: "inline",
                        url: this.particleSystem.currentSvg,
                        position: {
                            x: 50,
                            y: 50
                        }
                    };
                }
    
                // Add interactivity settings
                options.interactivity = {
                    events: {
                        onHover: {
                            enable: true,
                            mode: "grab"
                        },
                        onClick: {
                            enable: true,
                            mode: "push"
                        }
                    },
                    modes: {
                        grab: {
                            distance: 140,
                            links: {
                                opacity: 1
                            }
                        },
                        push: {
                            quantity: 4
                        }
                    }
                };
    
                await tsParticles.load('tsparticlesPreview', options);
            }
    
        } catch (error) {
            console.error('Error updating preview:', error);
        }
    }
    
    updateSettings(settingId, value) {
        if (!this.settings) {
            this.settings = {
                frameRate: 60,
                duration: 5,
                quality: 0.8
            };
        }
    
        switch (settingId) {
            case 'recordingDuration':
                this.settings.duration = parseFloat(value);
                break;
            case 'frameRate':
                this.settings.frameRate = parseInt(value);
                break;
            case 'quality':
                this.settings.quality = parseFloat(value);
                break;
            default:
                console.warn(`Unknown setting: ${settingId}`);
        }
    
        // Update UI if display element exists
        const displayElement = document.getElementById(`${settingId}Value`);
        if (displayElement) {
            displayElement.textContent = value;
        }
    
        console.log(`Updated ${settingId} to:`, value);
    }

    initializeControls() {
        console.log('Initializing recording controls...');

        // Export controls
        const exportButtons = {
            'exportFrames': this.exportFrames.bind(this),
            'exportWebM': this.exportWebM.bind(this),
            'exportGIF': this.exportGIF.bind(this),  // Changed this line
            'exportMP4': this.exportMP4.bind(this),
            'exportHTML': this.exportHTML.bind(this),
        };
    
        // Bind export buttons
        Object.entries(exportButtons).forEach(([id, handler]) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', handler);
                console.log(`Bound ${id} button`);
            } else {
                console.warn(`Button with id ${id} not found`);
            }
        });
    
        // Recording settings
        const recordingInputs = {
            'recordingDuration': (value) => {
                this.settings.duration = parseInt(value);
                document.getElementById('recordingDurationValue').textContent = value;
            },
            'frameRate': (value) => {
                this.settings.frameRate = parseInt(value);
                document.getElementById('frameRateValue').textContent = value;
            },
            'quality': (value) => {
                this.settings.quality = parseFloat(value);
                document.getElementById('qualityValue').textContent = value;
            },
        };
    
        // Bind recording inputs
        Object.entries(recordingInputs).forEach(([id, handler]) => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => handler(e.target.value));
                console.log(`Bound ${id} input`);
            } else {
                console.warn(`Input with id ${id} not found`);
            }
        });
    
        // File input handlers
        const fileInputs = {
            'loadSVG': (file) => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    this.loadedSvg = e.target.result;
                    console.log('SVG loaded:', this.loadedSvg);
                    
                    // Update global particles with new SVG
                    if (window.globalParticles) {
                        try {
                            const blob = new Blob([this.loadedSvg], { type: 'image/svg+xml' });
                            window.globalParticles.currentSvg = URL.createObjectURL(blob);
                            await window.globalParticles.updateParticles();
                        } catch (error) {
                            console.error('Error updating particles with new SVG:', error);
                        }
                    }
                    
                    this.checkValidationState();
                };
                reader.readAsText(file);
            },
            'loadSettingConfigJSON': (file) => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        this.loadedConfig = JSON.parse(e.target.result);
                        console.log('Settings configuration JSON loaded:', this.loadedConfig);
                        
                        // Update global particles with new settings
                        if (window.globalParticles) {
                            Object.assign(window.globalParticles.settings, this.loadedConfig);
                            await window.globalParticles.updateParticles();
                        }
                        
                        this.checkValidationState();
                    } catch (error) {
                        console.error('Error loading settings:', error);
                    }
                };
                reader.readAsText(file);
            },
        };

        // Bind file inputs
        Object.entries(fileInputs).forEach(([id, handler]) => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', (e) => handler(e.target.files[0]));
                console.log(`Bound ${id} input`);
            } else {
                console.warn(`File input with id ${id} not found`);
            }
        });
    
        // Validate Exports Button
        const validateExportsButton = document.getElementById('validateExports');
        if (validateExportsButton) {
            validateExportsButton.addEventListener('click', () => {
                this.validateFiles();
            });
            console.log('Bound validateExports button');
        } else {
            console.warn('Validate exports button not found');
        }
    
        console.log('Recording controls initialized');
    }


    validateFiles() {
        if (this.loadedSvg && this.loadedConfig) {
            console.log('All required files are valid. Showing particle preview...');
            this.updateUI(); // Render the preview
        } else {
            alert('Please ensure both an SVG and a configuration JSON file are loaded.');
        }
    }
    
    
    
    checkValidationState() {
        const validateExportsButton = document.getElementById('validateExports');
        if (validateExportsButton) {
            if (this.loadedSvg && this.loadedConfig) {
                validateExportsButton.disabled = false;
                console.log('Validation complete: All files are loaded.');
            } else {
                validateExportsButton.disabled = true;
                console.log('Validation incomplete: Missing files.');
            }
        }
    }
    
    

    async handleSvgUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.loadedSvg = await file.text();
            console.log('SVG loaded successfully');
        }
    }

    async handleConfigUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const configText = await file.text();
            this.loadedConfig = JSON.parse(configText);
            console.log('Config loaded successfully');
        }
    }

    async initializeParticles() {
        if (!this.loadedSvg || !this.loadedConfig) {
            alert('Please upload both SVG and Config files first.');
            return;
        }

        const svgBlob = new Blob([this.loadedSvg], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const options = {
            ...this.loadedConfig,
            polygon: {
                draw: {
                    enable: true,
                    stroke: { width: 1, color: '#ffffff' }
                },
                enable: true,
                type: 'inline',
                move: { radius: 10 },
                scale: 1,
                url: svgUrl,
            }
        };

        const previewContainer = document.getElementById('tsparticlesPreview');
        if (!previewContainer) return;

        try {
            const existingInstance = tsParticles.domItem(0);
            if (existingInstance) await existingInstance.destroy();
            await tsParticles.load('tsparticlesPreview', options);
            console.log('Particles initialized in preview');
        } catch (error) {
            console.error('Error initializing particles:', error);
            alert('Failed to initialize particles');
        }
    }

    handleContainerSizeChange(event) {
        const value = event.target.value;
        const fixedInputs = document.getElementById('fixedSizeInputs');
        
        const sizes = {
            desktop: { width: 1920, height: 1080 },
            mobile: { width: 390, height: 844 },
            watch: { width: 184, height: 224 }
        };

        if (value === 'fixed') {
            fixedInputs?.classList.remove('hidden');
        } else {
            fixedInputs?.classList.add('hidden');
            const size = sizes[value];
            if (size) {
                this.htmlSettings.width = size.width;
                this.htmlSettings.height = size.height;
            }
        }
    }


    async exportHTML() {
        console.log("Starting exportHTML...");
    
        // Get current settings from global particles
        const currentSettings = window.globalParticles?.settings;
        if (!currentSettings) {
            alert("No particle settings found");
            return;
        }
    
        // Get SVG content dynamically from global particles or loadedSvg
        let svgString;
        if (this.loadedSvg) {
            // Use the uploaded SVG file
            svgString = this.loadedSvg;
        } else if (window.globalParticles?.currentSvg) {
            // Extract SVG content from globalParticles' current SVG URL
            const response = await fetch(window.globalParticles.currentSvg);
            if (!response.ok) {
                console.error("Failed to fetch SVG from global particles.");
                alert("Error fetching SVG content.");
                return;
            }
            svgString = await response.text();
        } else {
            alert("No SVG file found. Please upload or create an SVG first.");
            return;
        }
    
        // Particle configuration
        const particleConfig = {
            fpsLimit: 60,
            fullScreen: {
                enable: false,
                zIndex: 0,
            },
            particles: {
                color: {
                    value: currentSettings.particleColor,
                    animation: {
                        enable: currentSettings.colorAnimation,
                        speed: 20,
                        sync: true,
                    },
                },
                links: {
                    color: currentSettings.linkColor,
                    distance: currentSettings.linkDistance,
                    enable: currentSettings.enableLinks,
                    opacity: 0.5,
                    width: 1,
                },
                move: {
                    enable: true,
                    speed: currentSettings.speed,
                    direction: "none",
                    random: false,
                    straight: false,
                    outModes: {
                        default: "bounce",
                    },
                },
                number: {
                    value: currentSettings.particleCount,
                    density: {
                        enable: true,
                        area: 800,
                    },
                },
                opacity: {
                    value: currentSettings.opacity,
                    animation: {
                        enable: true,
                        speed: 1,
                        sync: false,
                    },
                },
                shape: {
                    type: currentSettings.shape,
                },
                size: {
                    value: currentSettings.size,
                },
            },
            interactivity: {
                events: {
                    onHover: {
                        enable: true,
                        mode: "grab",
                    },
                    onClick: {
                        enable: true,
                        mode: "push",
                    },
                },
                modes: {
                    grab: {
                        distance: 140,
                        links: {
                            opacity: 1,
                        },
                    },
                    push: {
                        quantity: 4,
                    },
                },
            },
            polygon: {
                draw: {
                    enable: true,
                    stroke: {
                        color: "#ffffff",
                        width: 0.5,
                        opacity: 0.1,
                    },
                },
                inline: {
                    arrangement: "equidistant",
                },
                move: {
                    radius: 10,
                },
                scale: currentSettings.zoom,
                type: "inline",
                url: null, // No URL required as we embed the SVG inline
                position: {
                    x: 50,
                    y: 18,
                },
            },
            background: {
                color: currentSettings.backgroundColor,
            },
            detectRetina: true,
        };
    
        // Generate HTML with embedded SVG
        const htmlContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Particle Animation</title>
        <link rel="stylesheet" href="styles.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/tsparticles/2.12.0/tsparticles.bundle.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/tsparticles@1.37.5/tsparticles.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/tsparticles-plugin-polygon-mask@1.37.5/tsparticles.plugin.polygonMask.min.js"></script>
    </head>
    <body>
        <div id="tsparticles"></div>
        <svg id="particleSvg" xmlns="http://www.w3.org/2000/svg" style="display: none;">${svgString}</svg>
        <script src="config.js"></script>
    </body>
    </html>`;
    
        const cssContent = `
    body {
        margin: 0;
        background: ${currentSettings.backgroundColor};
        overflow: hidden;
    }
    #tsparticles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }`;
    
        const jsConfigContent = `
    (async () => {
        console.log("Initializing particles...");
        const options = ${JSON.stringify(particleConfig, null, 2)};
        try {
            const svgElement = document.getElementById("particleSvg");
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);
            const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
            const svgUrl = URL.createObjectURL(svgBlob);
    
            options.polygon.url = svgUrl; // Assign dynamically created URL
    
            await tsParticles.load("tsparticles", options);
            console.log("Particles initialized successfully!");
        } catch (error) {
            console.error("Error initializing particles:", error);
        }
    })();`;
    
        // Create ZIP file
        const zip = new JSZip();
        zip.file("config.js", jsConfigContent);
        zip.file("styles.css", cssContent);
        zip.file("index.html", htmlContent);
    
        try {
            const zipBlob = await zip.generateAsync({ type: "blob" });
            this.downloadFile(zipBlob, "particle-animation.zip");
            console.log("ZIP file download initiated");
        } catch (error) {
            console.error("Error generating ZIP file:", error);
            alert("Failed to generate export files");
        }
    }
    
    
    
    async exportFrames() {
        const particlesCanvas = document.querySelector('#tsparticlesPreview canvas');
        if (!particlesCanvas) {
            alert('No canvas found. Please initialize particles first.');
            return;
        }
    
        // Create a temporary canvas to combine background and particles
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = particlesCanvas.width;
        tempCanvas.height = particlesCanvas.height;
        const ctx = tempCanvas.getContext('2d');
    
        // Get background color from tsParticles config
        const particlesInstance = tsParticles.domItem(0);
        const backgroundColor = particlesInstance?.options?.background?.color || '#000000';
    
        const frames = [];
        const totalFrames = Math.floor(this.settings.frameRate * this.settings.duration);
        const frameInterval = 1000 / this.settings.frameRate; // ms between frames
        const progress = this.showProgress('Capturing frames...', totalFrames);
    
        for (let i = 0; i < totalFrames; i++) {
            // Draw background
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Draw particles
            ctx.drawImage(particlesCanvas, 0, 0);
    
            // Convert to blob with quality setting
            const blob = await new Promise(resolve => {
                tempCanvas.toBlob(resolve, 'image/png', this.settings.quality);
            });
            frames.push(blob);
            progress.update(i + 1);
            
            // Wait for next frame interval
            await new Promise(resolve => setTimeout(resolve, frameInterval));
        }
    
        const zip = new JSZip();
        frames.forEach((blob, i) => {
            zip.file(`frame_${String(i).padStart(4, '0')}.png`, blob);
        });
    
        progress.message('Creating ZIP file...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        this.downloadFile(zipBlob, 'frames.zip');
        progress.complete();
        
        return frames;
    }

    async exportWebM() {
        const particlesCanvas = document.querySelector('#tsparticlesPreview canvas');
        if (!particlesCanvas) {
            alert('No canvas found. Please initialize particles first.');
            return;
        }
    
        // Create a temporary canvas for combining background and particles
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = particlesCanvas.width;
        tempCanvas.height = particlesCanvas.height;
        const ctx = tempCanvas.getContext('2d');
    
        // Get background color from tsParticles config
        const particlesInstance = tsParticles.domItem(0);
        const backgroundColor = particlesInstance?.options?.background?.color || '#000000';
    
        const progress = this.showProgress('Recording WebM...', 100);
        
        // Create a stream from the temporary canvas
        const stream = tempCanvas.captureStream();
        const recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: Math.floor(8000000 * this.settings.quality) // Adjust bitrate based on quality
        });
    
        const chunks = [];
        recorder.ondataavailable = e => chunks.push(e.data);
    
        // Start recording
        recorder.start(1000 / this.settings.frameRate); // Request data at frame rate intervals
    
        const startTime = Date.now();
        const duration = this.settings.duration * 1000;
        const frameInterval = 1000 / this.settings.frameRate;
        let lastDrawTime = 0;
    
        // Create a recording promise
        const recordingPromise = new Promise((resolve) => {
            function draw(timestamp) {
                // Check if enough time has passed for next frame
                if (timestamp - lastDrawTime >= frameInterval) {
                    // Draw background
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                    
                    // Draw particles
                    ctx.drawImage(particlesCanvas, 0, 0);
                    
                    lastDrawTime = timestamp;
                }
    
                const elapsed = Date.now() - startTime;
                if (elapsed < duration) {
                    progress.update((elapsed / duration) * 100);
                    requestAnimationFrame(draw);
                } else {
                    recorder.stop();
                    resolve();
                }
            }
    
            requestAnimationFrame(draw);
        });
    
        // Wait for recording to complete
        await recordingPromise;
    
        // Wait for the recorder to process chunks
        const blob = await new Promise(resolve => {
            recorder.onstop = () => {
                const webmBlob = new Blob(chunks, { type: 'video/webm' });
                resolve(webmBlob);
            };
        });
    
        this.downloadFile(blob, 'particles.webm');
        progress.complete();
        
        return blob;
    }

    async exportGIF() {
        const progress = this.showProgress('Creating GIF...', 100);
        try {
            // Calculate target frames based on settings
            const totalFrames = this.settings.frameRate * this.settings.duration;
            const frameSkip = Math.ceil(totalFrames / 100); // Limit to 100 frames max for stability
            const actualFrameRate = this.settings.frameRate / frameSkip;
            
            // Get frames from the exportFrames function
            const frames = await this.exportFrames();
            if (!frames || frames.length === 0) {
                throw new Error('No frames available for GIF export.');
            }
            progress.update(30);
    
            // Get canvas dimensions from the preview
            const particlesCanvas = document.querySelector('#tsparticlesPreview canvas');
            if (!particlesCanvas) {
                throw new Error('Canvas not found');
            }
    
            // Select frames with consistent interval
            const selectedFrames = frames.filter((_, index) => index % frameSkip === 0);
            const frameUrls = selectedFrames.map(frame => URL.createObjectURL(frame));
            
            progress.update(50);
    
            // Create GIF using the recording settings but with reduced frame count
            await new Promise((resolve, reject) => {
                gifshot.createGIF({
                    images: frameUrls,
                    gifWidth: particlesCanvas.width,
                    gifHeight: particlesCanvas.height,
                    interval: 1 / actualFrameRate, // Adjusted interval for reduced frames
                    numWorkers: 4,
                    quality: Math.floor(this.settings.quality * 10), // Convert quality (0-1) to gifshot range (1-10)
                    progressCallback: (captureProgress) => {
                        progress.update(50 + (captureProgress * 50));
                    }
                }, (result) => {
                    if (!result.error) {
                        const base64Data = result.image.split(',')[1];
                        const gifBlob = this.base64ToBlob(base64Data, 'image/gif');
                        this.downloadFile(gifBlob, 'particles.gif');
                        resolve();
                    } else {
                        reject(new Error(result.errorMsg));
                    }
    
                    // Cleanup frame URLs right after processing
                    frameUrls.forEach(url => URL.revokeObjectURL(url));
                });
            });
    
        } catch (error) {
            console.error('Error creating GIF:', error);
            alert('Failed to create GIF. Please try again.');
        } finally {
            progress.complete();
        }
    }
    
    // Helper function to convert base64 to Blob
    base64ToBlob(base64, type = 'image/gif') {
        const byteString = atob(base64);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        
        return new Blob([arrayBuffer], { type: type });
    }    
    

    async exportMP4() {
        const progress = this.showProgress('Creating MP4...', 100);
        try {
            const particlesCanvas = document.querySelector('#tsparticlesPreview canvas');
            if (!particlesCanvas) {
                throw new Error('Canvas not found');
            }
    
            // Create a temporary canvas with the current size
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = particlesCanvas.width;
            tempCanvas.height = particlesCanvas.height;
            const ctx = tempCanvas.getContext('2d');
    
            // Get background color from tsParticles config
            const particlesInstance = tsParticles.domItem(0);
            const backgroundColor = particlesInstance?.options?.background?.color || '#000000';
    
            // Setup MediaRecorder with high quality
            const stream = tempCanvas.captureStream(this.settings.frameRate);
            const recorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=h264',
                videoBitsPerSecond: 8000000 * this.settings.quality // Adjust bitrate based on quality
            });
    
            const chunks = [];
            recorder.ondataavailable = e => chunks.push(e.data);
    
            // Create recording promise
            const recordingPromise = new Promise((resolve) => {
                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/mp4' });
                    resolve(blob);
                };
            });
    
            // Start recording
            recorder.start();
    
            // Animation loop
            const startTime = Date.now();
            const duration = this.settings.duration * 1000;
            const frameInterval = 1000 / this.settings.frameRate;
            let lastDrawTime = 0;
    
            const animate = (timestamp) => {
                // Check if enough time has passed for next frame
                if (timestamp - lastDrawTime >= frameInterval) {
                    // Draw background
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                    
                    // Draw particles
                    ctx.drawImage(particlesCanvas, 0, 0);
                    
                    lastDrawTime = timestamp;
                }
    
                const elapsed = Date.now() - startTime;
                progress.update((elapsed / duration) * 100);
                
                if (elapsed < duration) {
                    requestAnimationFrame(animate);
                } else {
                    recorder.stop();
                }
            };
    
            requestAnimationFrame(animate);
    
            // Wait for recording to complete
            const videoBlob = await recordingPromise;
            this.downloadFile(videoBlob, 'particles.mp4');
    
        } catch (error) {
            console.error('Error creating MP4:', error);
            alert('Failed to create MP4. Please try again.');
        } finally {
            progress.complete();
        }
    }

    showProgress(message, total = 100) {
        const progressElement = document.createElement('div');
        progressElement.className = 'progress-indicator';
        progressElement.innerHTML = `
            ${message}<br>
            <progress value="0" max="${total}"></progress>
        `;
        document.body.appendChild(progressElement);
    
        return {
            update: (value) => {
                const progress = progressElement.querySelector('progress');
                if (progress) progress.value = value;
            },
            message: (msg) => {
                progressElement.innerHTML = `
                    ${msg}<br>
                    <progress value="0" max="${total}"></progress>
                `;
            },
            complete: () => {
                progressElement.remove();
            }
        };
        }
    

    downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    }

}
window.RecordingController = RecordingController;
