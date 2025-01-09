class ParticleSystem {
    constructor() {
        this.container = document.getElementById('tsparticles');
        this.currentSvg = null;
        this.settings = {
            is3D: true,
            particleCount: 200,
            particleColor: "#ff0000",
            colorAnimation: true,
            speed: 1,
            size: 2,
            enableLinks: true,
            linkColor: "#ffffff",
            linkDistance: 30,
            shape: "circle",
            opacity: 0.5,
            backgroundColor: "#000000",
            pattern: "none",
            orientation: 0,
            rotationSpeed: 0,
            directionAngle: 0,
            zoom: 2,
            shade: "none",
            patternSpeed: 1,
            patternScale: 1,
            blendMode: "normal",
            blur: 0
        };

        // Keep a global reference
        window.globalParticles = this;

        this.setupFileHandlers();
        this.bindControls();
        this.initializeParticles();
    }

    async initializeParticles() {
        // Set initial UI state
        this.updateControlsUI();
        // Initialize particles
        await this.updateParticles();
    }

    setupFileHandlers() {
        // SVG File Handler
        const svgFileInput = document.getElementById('svgFile');
        if (svgFileInput) {
            svgFileInput.addEventListener('change', async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                    try {
                        const svgText = await file.text();
                        await this.loadFromSVG(svgText);
                        console.log('SVG loaded successfully');
                    } catch (error) {
                        console.error('Error loading SVG:', error);
                    }
                }
            });
        }

        // Settings JSON File Handler
        const settingsFileInput = document.getElementById('settingsFile');
        if (settingsFileInput) {
            settingsFileInput.addEventListener('change', async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                    try {
                        const jsonText = await file.text();
                        const settings = JSON.parse(jsonText);
                        await this.loadSettings(settings);
                        console.log('Settings loaded successfully');
                    } catch (error) {
                        console.error('Error loading settings:', error);
                    }
                }
            });
        }
    }

    bindControls() {
        const controls = {
            'particleCount': { type: 'range', setting: 'particleCount' },
            'particleColor': { type: 'color', setting: 'particleColor' },
            'colorAnimation': { type: 'checkbox', setting: 'colorAnimation' },
            'speed': { type: 'range', setting: 'speed' },
            'size': { type: 'range', setting: 'size' },
            'opacity': { type: 'range', setting: 'opacity' },
            'backgroundColor': { type: 'color', setting: 'backgroundColor' },
            'enableLinks': { type: 'checkbox', setting: 'enableLinks' },
            'linkColor': { type: 'color', setting: 'linkColor' },
            'pattern': { type: 'select', setting: 'pattern' },
            'patternSpeed': { type: 'range', setting: 'patternSpeed' },
            'patternScale': { type: 'range', setting: 'patternScale' },
            'orientation': { type: 'range', setting: 'orientation' },
            'rotationSpeed': { type: 'range', setting: 'rotationSpeed' },
            'directionAngle': { type: 'range', setting: 'directionAngle' },
            'shape': { type: 'select', setting: 'shape' },
            'blendMode': { type: 'select', setting: 'blendMode' },
            'blur': { type: 'range', setting: 'blur' },
            'zoom': { type: 'range', setting: 'zoom' },
            'shade': { type: 'select', setting: 'shade' },
            'is3D': { type: 'checkbox', setting: 'is3D' }
        };

        Object.entries(controls).forEach(([id, control]) => {
            const element = document.getElementById(id);
            if (!element) return;

            const updateSetting = async () => {
                try {
                    let value;
                    if (control.type === 'checkbox') {
                        value = element.checked;
                    } else if (control.type === 'range') {
                        value = parseFloat(element.value);
                    } else {
                        value = element.value;
                    }

                    this.settings[control.setting] = value;
                    const display = document.getElementById(`${id}Value`);
                    if (display) {
                        display.textContent = value.toString();
                    }

                    await this.updateParticles();
                    console.log(`Updated ${control.setting} to:`, value);
                } catch (error) {
                    console.error(`Error updating ${control.setting}:`, error);
                }
            };

            if (control.type === 'checkbox') {
                element.addEventListener('change', updateSetting);
            } else {
                element.addEventListener('input', updateSetting);
            }
        });

        // Save settings button
        const saveButton = document.querySelector('button[onclick*="saveSettings"]');
        if (saveButton) {
            saveButton.removeAttribute('onclick');
            saveButton.addEventListener('click', () => this.saveSettings());
        }
    }

    async updateParticles() {
        try {
            const existingInstance = tsParticles.domItem(0);
            if (existingInstance) {
                await existingInstance.destroy();
            }

            await tsParticles.load('tsparticles', {
                fpsLimit: 60,
                fullScreen: {
                    enable: false,
                    zIndex: 0
                },
                particles: {
                    color: {
                        value: this.settings.particleColor,
                        animation: {
                            enable: this.settings.colorAnimation,
                            speed: 20,
                            sync: true
                        }
                    },
                    links: {
                        color: this.settings.linkColor,
                        distance: this.settings.linkDistance,
                        enable: this.settings.enableLinks,
                        opacity: 0.5,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: this.settings.speed,
                        direction: "none",
                        random: false,
                        straight: false,
                        outModes: {
                            default: "bounce"
                        }
                    },
                    number: {
                        value: this.settings.particleCount,
                        density: {
                            enable: true,
                            area: 800
                        }
                    },
                    opacity: {
                        value: this.settings.opacity,
                        animation: {
                            enable: true,
                            speed: 1,
                            sync: false
                        }
                    },
                    shape: {
                        type: this.settings.shape
                    },
                    size: {
                        value: this.settings.size
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
                polygon: this.currentSvg ? {
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
                    scale: this.settings.zoom,
                    type: "inline",
                    url: this.currentSvg,
                    position: {
                        x: 50,
                        y: 50
                    }
                } : undefined,
                background: {
                    color: this.settings.backgroundColor
                },
                detectRetina: true
            });
        } catch (error) {
            console.error('Error updating particles:', error);
        }
    }

    async loadFromSVG(svgString) {
        try {
            if (this.currentSvg) {
                URL.revokeObjectURL(this.currentSvg);
            }
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            this.currentSvg = URL.createObjectURL(blob);
            await this.updateParticles();
            console.log('SVG loaded successfully');
        } catch (error) {
            console.error('Error loading SVG:', error);
        }
    }

    async loadSettings(settings) {
        Object.assign(this.settings, settings);
        this.updateControlsUI();
        await this.updateParticles();
    }

    updateControlsUI() {
        Object.entries(this.settings).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (!element) return;

            if (element.type === 'checkbox') {
                element.checked = value;
            } else if (element.type === 'range' || element.type === 'number') {
                element.value = value;
                const display = document.getElementById(`${key}Value`);
                if (display) display.textContent = value;
            } else if (element.type === 'color') {
                element.value = value;
            } else if (element.tagName === 'SELECT') {
                element.value = value;
            }
        });
    }

    saveSettings() {
        const settings = {
            ...this.settings,
            svgData: this.currentSvg
        };
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'particle-settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getCurrentOptions() {
        return {
            fpsLimit: 60,
            fullScreen: {
                enable: false
            },
            particles: {
                color: {
                    value: this.settings.particleColor,
                    animation: {
                        enable: this.settings.colorAnimation,
                        speed: 20,
                        sync: true
                    }
                },
                links: {
                    color: this.settings.linkColor,
                    distance: this.settings.linkDistance,
                    enable: this.settings.enableLinks,
                    opacity: 0.5,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: this.settings.speed,
                    direction: "none",
                    random: false,
                    straight: false,
                    outModes: {
                        default: "bounce"
                    }
                },
                number: {
                    value: this.settings.particleCount,
                    density: {
                        enable: true,
                        area: 800
                    }
                },
                opacity: {
                    value: this.settings.opacity,
                    animation: {
                        enable: true,
                        speed: 1,
                        sync: false
                    }
                },
                shape: {
                    type: this.settings.shape
                },
                size: {
                    value: this.settings.size
                }
            },
            background: {
                color: this.settings.backgroundColor
            }
        };
    }
}