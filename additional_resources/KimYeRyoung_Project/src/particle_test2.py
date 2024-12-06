import pygame
from math import sin, cos
from random import uniform

class Particle(pygame.sprite.Sprite):
    def __init__(self, groups, pos, color, speed, depth):
        super().__init__(groups)
        self.initial_pos = pygame.math.Vector2(pos)  # Store initial position
        self.pos = pygame.math.Vector2(pos)
        self.color = color
        self.speed = speed
        self.angle = 0  # Starting angle for movement pattern
        self.radius = 1  # Initial radius for spiral or other patterns
        self.depth = depth  # Depth attribute for 3D effect

        self.create_surf()

    def create_surf(self):
        """Create a circular shape for the particle with 3D depth effect."""
        radius = int(5 * (1 / (0.1 + self.depth)))  # Adjust radius based on depth
        adjusted_color = tuple(min(255, int(c * (1 / (0.1 + self.depth)))) for c in self.color)

        # Create a surface for the particle with transparency
        self.image = pygame.Surface((2 * radius, 2 * radius), pygame.SRCALPHA).convert_alpha()
        self.image.set_colorkey("black")

        # Draw the particle with the adjusted color and size
        pygame.draw.circle(self.image, adjusted_color, (radius, radius), radius)
        self.rect = self.image.get_rect(center=self.pos)

    def move_in_pattern(self, dt):
        """Move particles in a circular pattern, adjusting speed by depth."""
        self.angle += self.speed * dt * (1 / (0.5 + self.depth))  # Slower speed for farther particles

        # Base radius for circular movement pattern
        radius = 20 * (1 / (0.1 + self.depth))  # Adjust movement radius based on depth

        # Calculate new position using a circular pattern
        self.pos.x = self.initial_pos.x + radius * cos(self.angle)
        self.pos.y = self.initial_pos.y + radius * sin(self.angle)
        self.rect.center = self.pos

    def update(self, dt):
        self.move_in_pattern(dt)
