class App {
    constructor() {
        // Initialize null properties first
        this.drawing = null;
        this.svgHandler = null;
        this.particles = null;
        this.recorder = null;

        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        try {
            console.log('Initializing app components...');
            
            // Initialize components in order
            this.initializeDrawing();
            this.initializeSVGHandler();
            this.initializeParticles();
            this.initializeRecorder();

            // Setup UI
            this.setupNavigation();
            this.setupDrawingControls();
            this.initializePages();

            console.log('App initialization complete');
        } catch (error) {
            console.error('Error during app initialization:', error);
        }
    }

    initializeDrawing() {
        try {
            this.drawing = new PolygonDrawing();
            console.log('Drawing component initialized');
        } catch (error) {
            console.error('Failed to initialize drawing:', error);
        }
    }

    initializeSVGHandler() {
        try {
            this.svgHandler = new SVGHandler(this.drawing);
            console.log('SVG handler initialized');
        } catch (error) {
            console.error('Failed to initialize SVG handler:', error);
        }
    }

    initializeParticles() {
        try {
            this.particles = new ParticleSystem(); // Instantiate ParticleSystem
            console.log('Particle system initialized');
            return this.particles; // Return the instance
        } catch (error) {
            console.error('Failed to initialize particles:', error);
            return null; // Return null if an error occurs
        }
    }
    

    initializeRecorder() {
        try {
            const particles = this.initializeParticles();
            this.recorder = new RecordingController(particles);
            this.setupExportControls();
            console.log('Recorder initialized');
        } catch (error) {
            console.error('Failed to initialize recorder:', error);
        }
    }

    setupNavigation() {
        try {
            const drawingBtn = document.getElementById('drawingBtn');
            const particlesBtn = document.getElementById('particlesBtn');
            const exportBtn = document.getElementById('exportBtn');

            if (drawingBtn) {
                drawingBtn.addEventListener('click', () => this.switchPage('drawing'));
            }
            if (particlesBtn) {
                particlesBtn.addEventListener('click', () => this.switchToParticles());
            }
            if (exportBtn) {
                exportBtn.addEventListener('click', () => this.switchPage('export'));
            }

            console.log('Navigation setup complete');
        } catch (error) {
            console.error('Error setting up navigation:', error);
        }
    }

    switchToParticles() {
        console.log('Switching to particles page...');
        this.switchPage('particles');
    
        if (this.svgHandler && this.particles) {
            const svgData = this.svgHandler.getSVGData();
            if (svgData && svgData.svg) {
                try {
                    const svgBlob = new Blob([svgData.svg], { type: 'image/svg+xml' });
                    const svgBlobURL = URL.createObjectURL(svgBlob);
                    
                    this.particles.currentSvg = svgBlobURL;
                    this.particles.updateParticles();
                    
                    console.log('Successfully loaded SVG into particles');
                } catch (error) {
                    console.error('Error loading SVG into particles:', error);
                }
            } else {
                console.error('No SVG data available to load into particles.');
            }
        }
    }

    setupDrawingControls() {
        try {
            const controls = {
                'startDrawingBtn': () => this.drawing?.startDrawing(),
                'clearDrawingBtn': () => this.drawing?.clearDrawing(),
                'convertTo3DBtn': () => this.svgHandler?.convertTo3D(),
                'convertTo2DBtn': () => this.svgHandler?.convertTo2D(),
                'saveSVGBtn': () => this.svgHandler?.saveSVG()
            };

            for (const [id, handler] of Object.entries(controls)) {
                const button = document.getElementById(id);
                if (button) {
                    button.addEventListener('click', () => {
                        try {
                            handler();
                        } catch (error) {
                            console.error(`Error in ${id} handler:`, error);
                        }
                    });
                }
            }

            console.log('Drawing controls setup complete');
        } catch (error) {
            console.error('Error setting up drawing controls:', error);
        }
    }

    setupExportControls() {
        if (!this.recorder) {
            console.error('Recorder not initialized');
            return;
        }
    
        // Container size handling
        const containerSize = document.getElementById('containerSize');
        if (containerSize) {
            containerSize.addEventListener('change', (e) => {
                const fixedInputs = document.getElementById('fixedSizeInputs');
                if (fixedInputs) {
                    fixedInputs.classList.toggle('hidden', e.target.value !== 'fixed');
                }
                this.recorder.updateHTMLSettings();
            });
        }
    
        // Export buttons
        const exportButtons = {
            'exportFrames': () => this.recorder.exportFrames(),
            'exportWebM': () => this.recorder.exportWebM(),
            'exportGIF': () => this.recorder.exportGIF(),
            'exportMP4': () => this.recorder.exportMP4(),
            'exportHTML': () => this.recorder.exportHTML()
        };
    
        Object.entries(exportButtons).forEach(([id, handler]) => {
            const button = document.getElementById(id);
            if (button) {
                button.onclick = handler;
            }
        });
    
        // Recording settings
        ['recordingDuration', 'frameRate', 'quality'].forEach(settingId => {
            const input = document.getElementById(settingId);
            const display = document.getElementById(`${settingId}Value`);
            
            if (input && display) {
                input.addEventListener('input', (e) => {
                    if (this.recorder) {
                        this.recorder.updateSettings(settingId, e.target.value);
                    }
                });
            }
        });
    }

    switchPage(pageId) {
        try {
            console.log(`Switching to page: ${pageId}`);
    
            // Hide all pages except exportPage to keep particles visible
            document.querySelectorAll('.page').forEach(page => {
                page.classList.add('hidden');
            });
    
            const selectedPage = document.getElementById(pageId + 'Page');
            if (selectedPage) {
                selectedPage.classList.remove('hidden');
            }
    
            // Page-specific logic
            switch (pageId) {
                case 'drawing':
                    this.drawing?.setupCanvas();
                    break;
                case 'particles':
                    this.particles?.updateParticles();
                    break;
                case 'export':
                    this.recorder?.updateUI(); // Show the current particle preview
                    break;
            }
    
            console.log('Page switch complete');
        } catch (error) {
            console.error('Error switching page:', error);
        }
    }
    
    

    initializePages() {
        try {
            // Start with drawing page
            this.switchPage('drawing');

            // Handle window resize
            window.addEventListener('resize', () => {
                try {
                    this.drawing?.setupCanvas();
                    this.particles?.updateParticles();
                } catch (error) {
                    console.error('Error handling resize:', error);
                }
            });

            // Make app instance globally available
            window.app = this;

            console.log('Pages initialized');
        } catch (error) {
            console.error('Error initializing pages:', error);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM loaded, initializing app...');
        window.app = new App();
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
});

// Global error handler
window.addEventListener('error', (error) => {
    console.error('Global error:', error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});