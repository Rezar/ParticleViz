import pygame
import cv2
from PIL import Image
from random import randint, uniform
from constants import SCREEN_WIDTH, SCREEN_HEIGHT
from particle_test2 import Particle
import os

# Initialize Pygame
pygame.init()

# Set up display
display_surface = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT)) # Set up the display surface with the specified width and height for rendering the visualization
clock = pygame.time.Clock() # Initialize a clock to control the frame rate, ensuring consistent animation speed across devices

# Load image and extract pixel data
image_path = "/Users/yeryoungkim/Desktop/particle_env/input_image/image_2.jpg"
image = pygame.image.load(image_path).convert()
image = pygame.transform.scale(image, (SCREEN_WIDTH, SCREEN_HEIGHT))

# Create a sprite group to manage and update all particle instances collectively
particle_group = pygame.sprite.Group()

# Output paths
output_folder = "/Users/yeryoungkim/Desktop/particle_env/outputs"
os.makedirs(output_folder, exist_ok=True)
video_path = os.path.join(output_folder, "particle_visualization.mp4")
gif_path = os.path.join(output_folder, "particle_visualization.gif")

# Video Writer for MP4
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
fps = 30
video_writer = cv2.VideoWriter(video_path, fourcc, fps, (SCREEN_WIDTH, SCREEN_HEIGHT))

# Frames for GIF
frames_for_gif = []

def spawn_particles_from_image():
    for x in range(0, image.get_width(), 8): # Set step size to control particle density (larger values = fewer particles)

        for y in range(0, image.get_height(), 8):
            color = image.get_at((x, y))

            # Skip black and white pixels
            if color != pygame.Color("black") and color != pygame.Color("white"):
                particle_color = (color.r, color.g, color.b)
                pos = [x + randint(-10, 10), y + randint(-10, 10)]
                speed = uniform(10, 20)  # Adjust speed for visual effect
                
                # Assign a random depth value for 3D effect (closer particles have smaller depth)
                depth = uniform(1.0, 2.0)

                # Create and add particle to the group
                Particle(particle_group, pos, particle_color, speed, depth)

def main_loop():
    spawn_particles_from_image()  # Spawn particles based on the image once
    running = True
    while running:
        # Handle events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        # Clock update
        dt = clock.tick() / 1000

        # Display update
        display_surface.fill("black")
        particle_group.draw(display_surface)
        
        # Update particles
        particle_group.update(dt)

        # Capture the current display surface as a frame
        frame_data = pygame.surfarray.array3d(display_surface)
        frame_data = frame_data.swapaxes(0, 1)  # Convert to width x height format for OpenCV

        # Save frame to video
        video_writer.write(cv2.cvtColor(frame_data, cv2.COLOR_RGB2BGR))

        # Save frame for GIF
        gif_frame = Image.fromarray(frame_data)
        frames_for_gif.append(gif_frame)

        # Update display
        pygame.display.update()

    # Release video writer
    video_writer.release()

    # Save the frames as a GIF
    frames_for_gif[0].save(
        gif_path,
        save_all=True,
        append_images=frames_for_gif[1:],
        duration=int(1000 / fps),
        loop=0
    )

if __name__ == "__main__":
    main_loop()
    pygame.quit()

