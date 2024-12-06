
# Particle Animation System

A web-based application for creating, visualizing, and exporting particle animations. This project combines drawing capabilities, particle system settings, and export options for seamless animation creation.

## Features

1. **Drawing and SVG Management**:
   - Draw custom shapes and convert them to SVGs.
   - Upload custom SVG files for particle visualization.
   - Convert 2D shapes to 3D with adjustable depth and layers.

2. **Particle Animation**:
   - Customize particle properties (count, color, size, speed, etc.).
   - Support for 3D particle effects.
   - Dynamic background and interactivity options.

3. **Export Options**:
   - Export particle animations as GIF, WebM, MP4, or HTML.
   - Frame-by-frame export for advanced editing.

4. **Responsive Layout**:
   - Optimized for desktop, mobile, and watch displays.

---

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Dependencies](#dependencies)
4. [Project Structure](#project-structure)
5. [License](#license)

---

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/particle-animation-system.git
   cd particle-animation-system
   ```

2. **Install Dependencies**:
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

3. **Run the Application**:
   Open `index.html` in a browser or use a local server (e.g., `Live Server` in VS Code).

---

## Usage

### Drawing & SVG
1. **Drawing Custom Shapes**:
   - Navigate to the "Drawing & SVG" tab.
   - Click "Start Drawing" and create shapes on the canvas.
   - Save shapes as SVG using the "Save SVG" button.

2. **Upload SVG**:
   - Use the "Upload SVG" option to load external SVGs for particle visualization.

3. **3D Conversion**:
   - Convert shapes to 3D with adjustable depth and layers.

### Particle Animation
1. **Settings**:
   - Adjust particle properties like count, color, size, and speed.
   - Enable interactivity (hover and click events).

2. **3D Visualization**:
   - Enable 3D mode for particle animations.

### Export
1. Validate SVG and JSON settings before export.
2. Choose the export format (HTML, GIF, WebM, or MP4).

---

## Dependencies

### Core Libraries
- [tsParticles](https://particles.js.org/) - Particle system rendering.
- [GIFShot](https://yahoo.github.io/gifshot/) - GIF creation.
- [WebM Media Recorder](https://github.com/webmproject/libwebm) - WebM video export.
- [JSZip](https://stuk.github.io/jszip/) - ZIP file creation.

---

## Project Structure

```
project-root/
│
├── index.html          # Main HTML file
├── styles.css          # Styling for the application
├── main.js             # App initialization
├── drawing.js          # Drawing canvas logic
├── svg_handler.js      # SVG upload and 3D conversion
├── particles.js        # Particle system customization
├── recorder.js         # Export and recording logic
├── package.json        # Project dependencies
├── package-lock.json   # Dependency tree
└── readme.md   # Readme file
```

---

### Link: https://www.loom.com/share/c46ede07cc2d4b8f8468a1cf7785ab04