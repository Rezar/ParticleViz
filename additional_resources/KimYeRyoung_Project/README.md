# particle-visualization
Generates particles from a 2D image, animating them with customizable, patterned movement for a dynamic visual effect.

## Features
- **Particle Generation from Image**: Creates particles based on the color values in an input image.
- **3D Depth Effect**: Simulates depth by adjusting particle size and speed based on distance from the viewer.
- **Export to Video and GIF**: Captures the animation and saves it as both an MP4 video and a GIF.

## Installation
```bash
pip install pygame
```
```bash
pip install pygame opencv-python pillow
```
## Usage
1. Place your desired input image in the project directory (adjust the image path if needed).
2. Run main_test2.py to start the visualization:
3. The application will:
   Display the particle animation in a Pygame window.
   Save the animation as particle_visualization.mp4 and particle_visualization.gif in the outputs
folder.

## File Structure
- **main_test2.py**: Main script for setting up and running the visualization. Manages frame capture for video and GIF export.
- **particle_test2.py**: Defines the Particle class, which handles particle properties, movement, and rendering.
- **constants.py**: Defines display constants (SCREEN_WIDTH and SCREEN_HEIGHT) used for setting up
the Pygame window.
- **outputs folder**: Stores the output MP4 video and GIF of the animation.
