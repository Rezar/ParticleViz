# ParticleViz

An interactive web application that converts images into dynamic particle animations with customizable effects and export capabilities.

## Features

### Input Methods
- **Image Upload**: Drag & drop or select images to convert
- **Drawing Mode**: Create custom drawings with two modes:
  - Freehand drawing
  - Polygon drawing tool

### Particle Customization
- Color spectrum options (original, grayscale, random)
- Adjustable animation speed
- Configurable particle dispersion
- Control over particle count (100-5000)
- Multiple particle shapes (circle, square, star)
- Customizable particle size

### Canvas Controls
- Zoom in/out functionality
- Canvas recentering
- Panning/dragging

### Export Options
- Create GIF animations
- Export as HTML
- Device-specific sizing:
  - Desktop (1920x1080)
  - Mobile (375x667)
  - Smartwatch (320x320)

## Installation

1. Clone the repository:
```
git clone https://github.com/bryceschultz/image_to_particles
cd image_to_particles
```

2. Download live-server if you dont already have it
```
npm install -g live-server
```

## Usage

1. **Start the application**:
   - From the project root run
   ```
   live-server
   ```

2. **Input Methods**:
   - Upload an image by dragging and dropping or using the file selector
   - Switch to drawing mode to create custom images
   - Use polygon mode for precise shape creation

3. **Customize Animation**:
   - Adjust particle properties using the control panel
   - Experiment with different color modes
   - Fine-tune animation speed and dispersion

4. **Export**:
   - Click "Create GIF" to open export options
   - Choose export format (GIF/HTML)
   - Select target device dimensions
   - Wait for processing and download

## Acknowledgments

- [gif.js](https://github.com/jnordberg/gif.js) library for GIF creation
