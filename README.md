# ParticleViz <img src="assets/icons/icon-removebg.png" alt="ParticleViz Icon" width="40" align="top">

An interactive web application that converts images into dynamic particle animations with customizable effects and export capabilities.

## Features

### Input Methods
- **Image Upload**: Drag & drop or select images to convert
- **Drawing Mode**: Create custom drawings with two modes:
  - Freehand drawing
  - Polygon drawing tool
    ![Polygon drawing mode on image](assets/documentation/Polygonmode_on.gif)

### Animation Effects
- 360 Rotation: auto rotate the particle visualization in a 360 degree loop
  ![360 Rotation image](assets/documentation/Rotation_Effect.gif)
- Randomized Depth & Circular XY Movement: allow particles to float between closer and farther depths while also travelling in a circular pattern along the XY plane
  ![Randomized Depth image](assets/documentation/RandomizedDepth.gif)

### Particle Customization
- Color spectrum options (original, grayscale, random)
- Control over particle: size, speed, dispersion, opacity, count (100 - 5000), shape (circle, square, star)

### Particle Link Customization
- Control over particle link: count, opacity, color
  ![Particle link Customization image](assets/documentation/ControloverParticleLinks.gif)

### Background Color Customization
- Control over animation background color

### Configuration Import & Export
Using the 'Load Config' and 'Save Config' buttons you can save and export the below customizations and reimport them when desired:
* particle color
* particle opacity
* particle speed
* particle dispersion
* particle count
* particle size
* particle shape
* animation effect
* particle link count
* particle link opacity
* particle link color
* animation background color

### Canvas Controls
- Zoom in/out functionality
- Canvas recentering
- Panning/dragging
  ![Canvas controls image](assets/documentation/canvas_control.gif)

### Export Options
- Export as GIF, HTML, WEBM, MP4, Frames
- Control over animation recording length
- Device-specific sizing:
  - Desktop (1920x1080)
  - Mobile (375x667)
  - Smartwatch (320x320)


## Access the App

The most recent release is available at https://github.com/Rezar/ParticleViz as an electron app. <br/>
The following architectures are currently supported:
- Linux ARM64
- Mac ARM64
- Windows


## Usage

1. **Access Methods**: 
    - Access the app via the above documented sources (currently only released as an electron app)

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
   - Choose export format (GIF/HTML/WEBM/MP4/Frames) and animation duration
   - Select target device dimensions
   - Wait for processing and download

## Running Locally & Contributing 

1. Clone the repository:
```
git clone https://github.com/Rezar/ParticleViz
cd ParticleViz
```

2. Download live-server if you dont already have it
```
npm install -g live-server
```
3. Run live server from the base of the repo
```
live-server
```

4. Make any changes to the code as you see fit.
5. Contributions are welcome! Please feel free to submit a Pull Request with your changes.

## Access the Web App (GitHub Pages)

You can access the latest version of **ParticleViz** as a web application via GitHub Pages:  
🔗 [ParticleViz GitHub Pages](https://rezar.github.io/ParticleViz/)

### **How to Use the Web App**
1. Open the web app using the link above.
2. Select an **input method**:
   - **Upload an image**: Drag & drop or select an image to convert into particles.
   - **Draw an image**: Switch to drawing mode and create custom shapes.
3. Customize your animation using the **control panel**:
   - Adjust **particle size, speed, dispersion, opacity, and shape**.
   - Modify **background color** and **animation effects**.
   - Configure **particle linking options**.
4. Use **canvas controls** to:
   - Zoom in/out.
   - Pan and recenter the canvas.
5. Export your animation:
   - Click "Create GIF" and choose an export format (**GIF, HTML, WEBM, MP4, Frames**).
   - Set animation duration and target **device size (Desktop, Mobile, Smartwatch)**.
   - Download your generated file.

### **Running Locally (Optional)**
If you want to run the web app locally:
```sh
git clone https://github.com/Rezar/ParticleViz
cd ParticleViz
python3 -m http.server 8000  # Start a local web server
```

## Acknowledgments

- [gif.js](https://github.com/jnordberg/gif.js) library for GIF creation
- [flaticon](https://www.flaticon.com/free-icons/particles) Logo
