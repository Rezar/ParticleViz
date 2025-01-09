class SVGHandler {
    constructor(drawing) {
        this.currentSVG = null;
        this.is3D = false;
        this.depth = 50;
        this.drawing = drawing;
        this.bindEvents();
    }

    bindEvents() {
        const uploadInput = document.getElementById('svgUpload');
        const depthInput = document.getElementById('depthValue');
        const layerCountInput = document.getElementById('layerCount'); // Layer count control

        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => this.handleSVGUpload(e));
        }

        if (depthInput) {
            depthInput.addEventListener('input', (e) => {
                this.depth = parseInt(e.target.value);
                const display = document.getElementById('depthDisplay');
                if (display) {
                    display.textContent = this.depth;
                }
                if (this.is3D) {
                    this.convertTo3D(); // Regenerate layers on depth change
                }
            });
        }

        if (layerCountInput) {
            layerCountInput.addEventListener('input', (e) => {
                const display = document.getElementById('layerCountDisplay');
                display.textContent = e.target.value;
                if (this.is3D) {
                    this.convertTo3D(); // Regenerate layers on layer count change
                }
            });
        }
    }

    handleSVGUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (this.drawing) {
                    this.drawing.clearDrawing();
                }

                const text = e.target.result;
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(text, 'image/svg+xml');

                if (svgDoc.querySelector('parsererror')) {
                    throw new Error('Invalid SVG file');
                }

                this.currentSVG = svgDoc.documentElement;
                this.is3D = this.detectIf3D(svgDoc);
                this.displaySVG();

                const path = svgDoc.querySelector('path');
                if (path) {
                    this.extractPathPoints(path);
                }
            } catch (error) {
                console.error('Error loading SVG:', error);
                alert('Failed to load SVG file');
            }
        };
        reader.readAsText(file);
    }

    extractPathPoints(path) {
        const d = path.getAttribute('d');
        const points = [];
        const commands = d.match(/[A-Za-z][^A-Za-z]*/g);

        if (!commands) return;

        let currentX = 0;
        let currentY = 0;

        commands.forEach(cmd => {
            const type = cmd[0];
            const coords = cmd.slice(1).trim().split(/[\s,]+/).map(Number);

            switch (type.toUpperCase()) {
                case 'M':
                case 'L':
                    currentX = coords[0];
                    currentY = coords[1];
                    points.push({ x: currentX, y: currentY });
                    break;
                case 'Z':
                    break;
            }
        });

        if (this.drawing && points.length > 0) {
            this.drawing.points = points;
            this.drawing.redraw();
        }
    }

    displaySVG() {
        const preview = document.getElementById('svgPreview');
        if (!preview) return;

        preview.innerHTML = '';
        if (this.currentSVG) {
            preview.appendChild(this.currentSVG.cloneNode(true));
        }
    }

    create3DLayers(layerCount) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", `0 0 ${this.drawing.canvas.width} ${this.drawing.canvas.height}`);
        svg.setAttribute("width", this.drawing.canvas.width);
        svg.setAttribute("height", this.drawing.canvas.height);

        const layerDepth = this.depth / (layerCount - 1); // Depth between each layer
        const pointsPerLayer = this.drawing.points; // Points for each layer (assumed identical)

        let previousLayerPoints = [];
        for (let i = 0; i < layerCount; i++) {
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", this.drawing.generateSVGPath());
            path.setAttribute("fill", `rgba(255,255,255,${0.2 - i * 0.02})`);
            path.setAttribute("stroke", "#ffffff");

            // Position each layer by the calculated depth increment
            const yOffset = i * layerDepth;
            path.setAttribute("transform", `translate(0, ${yOffset})`);
            svg.appendChild(path);

            // Store layer points for connecting lines
            const layerPoints = pointsPerLayer.map(point => ({
                x: point.x,
                y: point.y + yOffset
            }));

            // Draw lines connecting to the previous layer if this is not the first layer
            if (previousLayerPoints.length > 0) {
                layerPoints.forEach((point, index) => {
                    const line = document.createElementNS(svgNS, "line");
                    line.setAttribute("x1", previousLayerPoints[index].x);
                    line.setAttribute("y1", previousLayerPoints[index].y);
                    line.setAttribute("x2", point.x);
                    line.setAttribute("y2", point.y);
                    line.setAttribute("stroke", "#ffffff");
                    line.setAttribute("stroke-opacity", "0.5");
                    svg.appendChild(line);
                });
            }

            // Update previousLayerPoints for the next iteration
            previousLayerPoints = layerPoints;
        }

        return svg;
    }

    convertTo3D() {
        const layerCount = parseInt(document.getElementById('layerCount').value, 10);
        if (!this.drawing?.points?.length || layerCount < 1) {
            alert('Please draw a shape first and ensure valid layer count');
            return;
        }

        this.currentSVG = this.create3DLayers(layerCount);
        this.is3D = true;
        this.drawing.is3D = true;
        this.displaySVG();
    }

    convertTo2D() {
        if (!this.drawing?.points?.length) {
            alert('No shape available');
            return;
        }

        const svg = this.drawing.createSVGElement();
        if (svg) {
            this.currentSVG = svg;
            this.is3D = false;
            this.drawing.is3D = false;
            this.displaySVG();
        }
    }

    updateSVGDepth() {
        if (!this.currentSVG || !this.is3D) return;

        const backPath = this.currentSVG.querySelectorAll('path')[1];
        if (backPath) {
            backPath.setAttribute("transform", `translate(0, ${this.depth})`);
        }
        this.displaySVG();
    }

    detectIf3D(svgDoc) {
        const paths = svgDoc.querySelectorAll('path');
        return paths.length > 1;
    }

    getSVGData() {
        if (!this.currentSVG && this.drawing) {
            this.currentSVG = this.drawing.is3D ?
                this.convertTo3D() :
                this.drawing.createSVGElement();
        }

        if (!this.currentSVG) return null;

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(this.currentSVG);
        return {
            svg: svgString,
            is3D: this.is3D,
            depth: this.depth
        };
    }

    saveSVG() {
        if (!this.currentSVG && this.drawing) {
            this.currentSVG = this.drawing.is3D ?
                this.convertTo3D() :
                this.drawing.createSVGElement();
        }

        if (!this.currentSVG) {
            alert('No shape to save');
            return;
        }

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(this.currentSVG);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `particle-shape-${this.is3D ? '3d' : '2d'}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
