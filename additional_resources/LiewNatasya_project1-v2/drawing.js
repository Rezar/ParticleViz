class PolygonDrawing {
    constructor() {
        // Initialize properties
        this.canvas = null;
        this.ctx = null;
        this.points = [];
        this.isDrawing = false;
        this.is3D = false;
        this.depth = 50;

        // Wait for DOM to be loaded before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.canvas = document.getElementById('drawingCanvas');
        if (!this.canvas) {
            console.error('Drawing canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.bindEvents();
    }

    setupCanvas() {
        if (!this.canvas || !this.ctx) return;
        
        const container = this.canvas.parentElement;
        if (!container) return;
        
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        if (this.points.length > 0) {
            this.redraw();
        }
    }

    bindEvents() {
        if (!this.canvas) return;

        // Bind methods to instance
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);

        // Add event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('dblclick', this.handleDoubleClick);
        window.addEventListener('resize', () => this.setupCanvas());
    }

    handleMouseDown(event) {
        if (!this.isDrawing) return;
        this.addPoint(event);
    }

    handleMouseMove(event) {
        if (!this.isDrawing || !this.points.length) return;
        this.drawPreview(event);
    }

    handleDoubleClick() {
        if (this.isDrawing && this.points.length >= 3) {
            this.completeDrawing();
        }
    }

    startDrawing() {
        this.isDrawing = true;
        this.points = [];
        this.is3D = false;
        if (this.canvas) {
            this.canvas.style.cursor = 'crosshair';
        }
        this.redraw();
    }

    completeDrawing() {
        if (this.points.length < 3) return;
        
        this.isDrawing = false;
        if (this.canvas) {
            this.canvas.style.cursor = 'default';
        }
        
        // Create initial 2D SVG
        const svg = this.createSVGElement();
        if (svg) {
            const preview = document.getElementById('svgPreview');
            if (preview) {
                preview.innerHTML = '';
                preview.appendChild(svg);
            }
        }
        
        // Update SVG handler if available
        if (window.app?.svgHandler) {
            window.app.svgHandler.currentSVG = svg;
            window.app.svgHandler.is3D = false;
        }
    }

    clearDrawing() {
        this.points = [];
        this.isDrawing = false;
        this.is3D = false;
        if (this.canvas) {
            this.canvas.style.cursor = 'default';
        }
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        const preview = document.getElementById('svgPreview');
        if (preview) {
            preview.innerHTML = '';
        }
        
        if (window.app?.svgHandler) {
            window.app.svgHandler.currentSVG = null;
            window.app.svgHandler.is3D = false;
        }
    }

    addPoint(event) {
        if (!this.isDrawing || !this.ctx) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if close to first point to complete shape
        if (this.points.length >= 3) {
            const firstPoint = this.points[0];
            const distance = Math.sqrt(
                Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2)
            );
            
            if (distance < 20) { // 20px threshold
                this.completeDrawing();
                return;
            }
        }
        
        this.points.push({ x, y });
        this.redraw();
    }

    drawPreview(event) {
        if (!this.ctx || !this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Draw current state
        this.redraw();

        // Draw preview line
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
        this.ctx.lineTo(x, y);
        if (this.points.length > 1) {
            this.ctx.lineTo(this.points[0].x, this.points[0].y);
        }
        this.ctx.stroke();
    }

    redraw() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.points.length === 0) return;

        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            this.ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        
        if (this.points.length > 2) {
            this.ctx.lineTo(this.points[0].x, this.points[0].y);
        }
        
        this.ctx.stroke();
    }

    getPoints() {
        return this.points;
    }

    generateSVGPath() {
        if (this.points.length < 3) return '';
        
        let path = `M ${this.points[0].x} ${this.points[0].y} `;
        for (let i = 1; i < this.points.length; i++) {
            path += `L ${this.points[i].x} ${this.points[i].y} `;
        }
        path += 'Z';
        return path;
    }

    createSVGElement() {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        const path = document.createElementNS(svgNS, "path");
        
        // Set SVG attributes
        svg.setAttribute("viewBox", `0 0 ${this.canvas.width} ${this.canvas.height}`);
        svg.setAttribute("width", this.canvas.width);
        svg.setAttribute("height", this.canvas.height);
        
        // Set path attributes
        path.setAttribute("d", this.generateSVGPath());
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#ffffff");
        path.setAttribute("stroke-width", "2");
        
        svg.appendChild(path);
        return svg;
    }

    to3D(depth = this.depth) {
        if (this.points.length < 3) return null;
        
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", `0 0 ${this.canvas.width} ${this.canvas.height}`);
        svg.setAttribute("width", this.canvas.width);
        svg.setAttribute("height", this.canvas.height);
        
        // Front face
        const frontPath = document.createElementNS(svgNS, "path");
        frontPath.setAttribute("d", this.generateSVGPath());
        frontPath.setAttribute("fill", "rgba(255,255,255,0.2)");
        frontPath.setAttribute("stroke", "#ffffff");
        
        // Back face
        const backPath = document.createElementNS(svgNS, "path");
        const backPathD = this.generateSVGPath()
            .split(' ')
            .map((val, i) => {
                if (i === 0) return 'M';
                if (isNaN(val)) return val;
                return parseFloat(val) + (i % 2 ? 0 : depth);
            })
            .join(' ');
        backPath.setAttribute("d", backPathD);
        backPath.setAttribute("fill", "rgba(255,255,255,0.1)");
        backPath.setAttribute("stroke", "#ffffff");
        
        // Add connecting lines
        this.points.forEach(point => {
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", point.x);
            line.setAttribute("y1", point.y);
            line.setAttribute("x2", point.x + depth);
            line.setAttribute("y2", point.y);
            line.setAttribute("stroke", "#ffffff");
            line.setAttribute("stroke-opacity", "0.5");
            svg.appendChild(line);
        });
        
        svg.appendChild(backPath);
        svg.appendChild(frontPath);
        return svg;
    }

    updateDepth(depth) {
        this.depth = depth;
        if (this.is3D) {
            const svg = this.to3D(depth);
            if (svg) {
                const preview = document.getElementById('svgPreview');
                preview.innerHTML = '';
                preview.appendChild(svg);
            }
        }
    }
}